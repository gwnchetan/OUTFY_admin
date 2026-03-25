import { db } from "../firebase/firebase_config";
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

/**
 * Get total count of users
 */
export const getTotalUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching total users:", error);
    throw error;
  }
};

/**
 * Get total count of products
 */
export const getTotalProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching total products:", error);
    throw error;
  }
};

/**
 * Get total count of orders and total revenue
 */
export const getOrderMetrics = async () => {
  try {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    
    let totalRevenue = 0;
    snapshot.forEach((doc) => {
      const order = doc.data();
      totalRevenue += order.totalAmount || 0;
    });

    return {
      totalOrders: snapshot.size,
      totalRevenue: totalRevenue,
    };
  } catch (error) {
    console.error("Error fetching order metrics:", error);
    throw error;
  }
};

/**
 * Get products with low stock (total stock < 10)
 */
export const getLowStockItems = async (limit_count = 3) => {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const lowStockItems = [];

    snapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      
      // Calculate total stock from sizes
      let totalStock = 0;
      if (product.sizes && product.sizes.length > 0) {
        totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
      } else {
        totalStock = product.stock || 0;
      }

      // Include items with stock < 10
      if (totalStock < 10 && totalStock > 0) {
        const sizeInfo = product.sizes && product.sizes.length > 0 
          ? `${product.sizes[0].label} • SKU: ${product.id.substring(0, 6).toUpperCase()}`
          : `SKU: ${product.id.substring(0, 6).toUpperCase()}`;

        lowStockItems.push({
          id: doc.id,
          name: product.name,
          sizeInfo: sizeInfo,
          stock: `${totalStock} Left`,
          stockCount: totalStock,
          imageURL: product.imageURLs && product.imageURLs.length > 0 ? product.imageURLs[0] : null,
        });
      }
    });

    // Sort by stock count (lowest first) and limit results
    return lowStockItems.sort((a, b) => a.stockCount - b.stockCount).slice(0, limit_count);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    throw error;
  }
};

/**
 * Get recent orders (latest 5)
 */
export const getRecentOrders = async (limit_count = 5) => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"), limit(limit_count));
    const snapshot = await getDocs(q);

    const orders = [];
    snapshot.forEach((doc) => {
      const order = doc.data();
      orders.push({
        id: doc.id,
        customer: order.customerName || "Unknown",
        orderNumber: `#${doc.id.substring(0, 6).toUpperCase()}`,
        amount: `$${(order.totalAmount || 0).toFixed(2)}`,
        status: order.status || "Pending",
        items: `${order.items ? order.items.length : 0} item${order.items && order.items.length !== 1 ? 's' : ''}`,
      });
    });

    return orders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw error;
  }
};

/**
 * Get recent signups (latest 5 users)
 */
export const getRecentSignups = async (limit_count = 5) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(limit_count));
    const snapshot = await getDocs(q);

    const signups = [];
    snapshot.forEach((doc) => {
      const user = doc.data();
      const createdAt = user.createdAt 
        ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt)
        : new Date();
      
      const timeAgo = getTimeAgo(createdAt);

      signups.push({
        id: doc.id,
        name: user.name || user.email?.split('@')[0] || "User",
        email: user.email || "N/A",
        type: "Customer",
        time: timeAgo,
      });
    });

    return signups;
  } catch (error) {
    console.error("Error fetching recent signups:", error);
    throw error;
  }
};

/**
 * Get percentage change (for display purposes)
 * This is a simple calculation - you can enhance based on actual data comparison
 */
export const getMetricsChange = async () => {
  try {
    // For now, return mock percentages
    // You can enhance this to calculate actual changes from historical data
    return {
      userChange: "+12.5%",
      productChange: "+2.4%",
      orderChange: "+4.8%",
      revenueChange: "+18.1%",
    };
  } catch (error) {
    console.error("Error calculating metrics change:", error);
    throw error;
  }
};

/**
 * Calculate time ago string (e.g., "5 mins ago", "2 hours ago")
 */
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};
