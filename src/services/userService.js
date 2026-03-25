import { db } from "../firebase/firebase_config";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

/**
 * Fetch all users from Firestore
 * @returns {Promise<Array>} Array of user objects with id
 */
export const getUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

/**
 * Update user status (block/unblock/active)
 * @param {string} userId - The user ID to update
 * @param {string} status - New status (active, blocked, inactive)
 * @returns {Promise<void>}
 */
export const updateUserStatus = async (userId, status) => {
  if (!userId || !status) {
    throw new Error("User ID and status are required");
  }

  const validStatuses = ["active", "blocked", "inactive"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(",")}`);
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error(`Failed to update user status: ${error.message}`);
  }
};

/**
 * Delete user from Firestore
 * ⚠️ WARNING: Does NOT delete Firebase Auth account
 * Backend deletion requires Firebase Admin SDK
 * @param {string} userId - The user ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

/**
 * Get single user details
 * @param {string} userId - The user ID to fetch
 * @returns {Promise<Object>} User object with id
 */
export const getUserById = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", userId)));
    
    if (userDoc.empty) {
      throw new Error("User not found");
    }

    return {
      id: userDoc.docs[0].id,
      ...userDoc.docs[0].data(),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};
