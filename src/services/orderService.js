import { db } from "../firebase/firebase_config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

/**
 * Fetch all orders from Firestore
 * @returns {Promise<Array>} Array of order objects with id
 */
export const getOrders = async () => {
  try {
    const snapshot = await getDocs(collection(db, "orders"));
    return snapshot.docs
      .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      }))
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || a.placedAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || b.placedAt?.seconds || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
};

/**
 * Update order status and maintain status history
 * @param {string} orderId - The order ID
 * @param {string} newStatus - New status (pending | confirmed | shipped | delivered)
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const validStatuses = [
    "order_placed",
    "departure",
    "arrived_city",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  try {
    const orderRef = doc(db, "orders", orderId);

    // Create new status history entry
    await updateDoc(orderRef, {
      status: newStatus,
      statusHistory: [
        {
          status: newStatus,
          timestamp: Timestamp.now(),
        },
      ],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

/**
 * Update order with full history handling
 * @param {string} orderId - The order ID
 * @param {string} newStatus - New status
 * @param {Array} currentHistory - Current status history
 * @returns {Promise<void>}
 */
export const updateOrderStatusWithHistory = async (
  orderId,
  newStatus,
  currentHistory = []
) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const validStatuses = [
    "order_placed",
    "departure",
    "arrived_city",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);
    if (!orderSnapshot.exists()) {
      throw new Error("Order not found");
    }

    const persistedHistory = orderSnapshot.data()?.statusHistory || currentHistory;
    const sanitizedHistory = persistedHistory
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;

        const status = typeof entry.status === "string" ? entry.status : "";
        if (!status) return null;

        const rawTimestamp = entry.timestamp;
        let timestamp = Timestamp.now();

        if (rawTimestamp instanceof Timestamp) {
          timestamp = rawTimestamp;
        } else if (rawTimestamp?.seconds !== undefined) {
          timestamp = new Timestamp(rawTimestamp.seconds, rawTimestamp.nanoseconds || 0);
        } else if (rawTimestamp instanceof Date) {
          timestamp = Timestamp.fromDate(rawTimestamp);
        } else if (typeof rawTimestamp?.toDate === "function") {
          timestamp = Timestamp.fromDate(rawTimestamp.toDate());
        } else if (rawTimestamp) {
          const parsedDate = new Date(rawTimestamp);
          if (!Number.isNaN(parsedDate.getTime())) {
            timestamp = Timestamp.fromDate(parsedDate);
          }
        }

        return { status, timestamp };
      })
      .filter(Boolean);

    const newHistoryEntry = {
      status: newStatus,
      timestamp: Timestamp.now(),
    };

    const updatedHistory = [
      newHistoryEntry,
      ...sanitizedHistory.filter((entry) => entry.status !== newStatus),
    ];

    await updateDoc(orderRef, {
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};
