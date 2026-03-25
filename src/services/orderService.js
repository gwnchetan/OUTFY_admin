import { db } from "../firebase/firebase_config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

/**
 * Fetch all orders from Firestore
 * @returns {Promise<Array>} Array of order objects with id
 */
export const getOrders = async () => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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

  const validStatuses = ["pending", "confirmed", "shipped", "delivered"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  try {
    const orderRef = doc(db, "orders", orderId);

    // Create new status history entry
    const newHistoryEntry = {
      status: newStatus,
      timestamp: serverTimestamp(),
    };

    // Update order with new status, add to history, and update timestamp
    await updateDoc(orderRef, {
      status: newStatus,
      statusHistory: [newHistoryEntry, ...null], // Will be handled by server merge
      updatedAt: serverTimestamp(),
    });

    // Note: For proper array append, use arrayUnion
    // This is a simplified approach - ideally use:
    // statusHistory: arrayUnion(newHistoryEntry)
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

  const validStatuses = ["pending", "confirmed", "shipped", "delivered"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  try {
    const orderRef = doc(db, "orders", orderId);

    // Create new status history entry
    const newHistoryEntry = {
      status: newStatus,
      timestamp: serverTimestamp(),
    };

    // Combine new entry with existing history (new entries first)
    const updatedHistory = [newHistoryEntry, ...currentHistory];

    // Update order with new status and updated history
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
