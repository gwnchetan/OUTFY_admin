import { db, storage } from "../firebase/firebase_config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Constants
export const PRODUCT_CATEGORIES = [
  "Hoodies",
  "T-Shirts",
  "Tops",
  "Bottoms",
  "Pants",
  "Jeans",
  "Shorts",
  "Outerwear",
  "Jackets",
  "Blazers",
  "Knitwear",
  "Sweaters",
  "Skirts",
  "Shirts"
];

const sanitizeProductData = (productData) => ({
  name: productData.name.trim(),
  description: productData.description || "",
  price: parseFloat(productData.price),
  category: productData.category,
  target: productData.target,
  sizes: productData.sizes || [],
  tags: productData.tags || [],
  imageURLs: productData.imageURLs || [],
  isActive: productData.isActive !== undefined ? productData.isActive : true,
});

/**
 * Fetch all products from Firestore
 * @returns {Promise<Array>} Array of product objects with id
 */
export const getProducts = async () => {
  try {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

/**
 * Add a new product to Firestore
 * @param {Object} productData - Product data object
 * @returns {Promise<Object>} Created product with id
 */
export const addProduct = async (productData) => {
  // Validate required fields
  const requiredFields = ["name", "price", "category", "target"];
  for (const field of requiredFields) {
    if (!productData[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Validate sizes if provided
  if (productData.sizes && productData.sizes.length > 0) {
    for (const size of productData.sizes) {
      if (!size.label || size.stock === undefined) {
        throw new Error("Each size must have a label and stock amount");
      }
    }
  }

  const price = parseFloat(productData.price);
  if (isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number greater than 0");
  }

  const validTargets = ["men", "women", "kids", "unisex"];
  if (!validTargets.includes(productData.target)) {
    throw new Error(`Target must be one of: ${validTargets.join(", ")}`);
  }

  // Validate category
  if (!PRODUCT_CATEGORIES.includes(productData.category)) {
    throw new Error(`Invalid category selected`);
  }

  try {
    const productPayload = sanitizeProductData(productData);
    const docRef = await addDoc(collection(db, "products"), {
      ...productPayload,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...productPayload,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error(`Failed to add product: ${error.message}`);
  }
};

/**
 * Update an existing product
 * @param {string} productId - The product ID to update
 * @param {Object} productData - Updated product data
 * @returns {Promise<void>}
 */
export const updateProduct = async (productId, productData) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Validate required fields
  const requiredFields = ["name", "price", "category", "target"];
  for (const field of requiredFields) {
    if (!productData[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Validate sizes if provided
  if (productData.sizes && productData.sizes.length > 0) {
    for (const size of productData.sizes) {
      if (!size.label || size.stock === undefined) {
        throw new Error("Each size must have a label and stock amount");
      }
    }
  }

  const price = parseFloat(productData.price);
  if (isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number greater than 0");
  }

  const validTargets = ["men", "women", "kids", "unisex"];
  if (!validTargets.includes(productData.target)) {
    throw new Error(`Target must be one of: ${validTargets.join(", ")}`);
  }

  // Validate category
  if (!PRODUCT_CATEGORIES.includes(productData.category)) {
    throw new Error(`Invalid category selected`);
  }

  try {
    const productRef = doc(db, "products", productId);
    const productPayload = sanitizeProductData(productData);
    await updateDoc(productRef, {
      ...productPayload,
      originalPrice: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

/**
 * Delete a product from Firestore
 * @param {string} productId - The product ID to delete
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file
 * @param {string} productId - Product ID for organizing storage
 * @returns {Promise<string>} Download URL
 */
export const uploadImage = async (file, productId) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }

  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${productId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, `products/${filename}`);

    // Upload file to Firebase Storage
    await uploadBytes(storageRef, file);

    // Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageURL - Download URL of the image
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageURL) => {
  try {
    // Extract the path from the download URL
    const url = new URL(imageURL);
    const filePath = decodeURIComponent(
      url.pathname.split('/o/')[1].split('?')[0]
    );
    
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};
