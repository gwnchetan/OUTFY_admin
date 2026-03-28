import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "./Products.css";
import { FiPlus, FiUpload, FiArchive, FiBox, FiAlertTriangle, FiSearch, FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
import { getProducts, addProduct, deleteProduct, updateProduct, uploadImage, deleteImage, PRODUCT_CATEGORIES } from "../services/productService";

// Product Form Modal (Add & Edit)
const ProductFormModal = ({ isOpen, onClose, onSubmit, isLoading, product = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    target: "unisex",
    sizes: [],
    imageURLs: [],
    tags: [],
    isActive: true,
  });
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImageName, setUploadingImageName] = useState("");
  const [imageURLInput, setImageURLInput] = useState("");
  const [selectedSizesToAdd, setSelectedSizesToAdd] = useState([]);
  const [newSizeStock, setNewSizeStock] = useState("");
  const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
  // Generate a temporary ID for organizing image uploads when adding new products
  const [tempUploadId] = useState(() => `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        target: product.target || "unisex",
        sizes: product.sizes || [],
        imageURLs: product.imageURLs || [],
        tags: product.tags || [],
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        target: "unisex",
        sizes: [],
        imageURLs: [],
        tags: [],
        isActive: true,
      });
    }
    setSelectedSizesToAdd([]);
    setNewSizeStock("");
    setError(null);
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      for (const file of files) {
        setUploadingImageName(file.name);
        // Use product ID if editing, otherwise use temp ID for organizing uploads
        const uploadId = product?.id || tempUploadId;
        const imageURL = await uploadImage(file, uploadId);
        setFormData((prev) => ({
          ...prev,
          imageURLs: [...prev.imageURLs, imageURL],
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
      setUploadingImageName("");
    }
  };

  const removeImage = async (index) => {
    const imageURL = formData.imageURLs[index];
    
    try {
      // Only delete from Storage if it's a Firebase Storage URL (contains firebasestorage)
      if (imageURL.includes("firebasestorage")) {
        await deleteImage(imageURL);
      }
      setFormData((prev) => ({
        ...prev,
        imageURLs: prev.imageURLs.filter((_, i) => i !== index),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddImageURL = () => {
    if (!imageURLInput.trim()) {
      setError("Please enter an image URL");
      return;
    }

    // Validate URL format
    try {
      new URL(imageURLInput);
    } catch (err) {
      setError("Invalid URL format");
      return;
    }

    // Add URL to imageURLs array
    setFormData((prev) => ({
      ...prev,
      imageURLs: [...prev.imageURLs, imageURLInput.trim()],
    }));
    setImageURLInput("");
    setError(null);
  };

  const handleAddSize = () => {
    if (selectedSizesToAdd.length === 0) {
      setError("Please select at least one size before adding stock");
      return;
    }

    const stock = parseInt(newSizeStock) || 0;
    if (stock < 0) {
      setError("Stock cannot be negative");
      return;
    }

    const newSizes = selectedSizesToAdd.filter(
      (size) => !formData.sizes.some((existing) => existing.label.toLowerCase() === size.toLowerCase())
    );

    if (newSizes.length === 0) {
      setError("Selected sizes already exist");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        ...newSizes.map((label) => ({ label, stock })),
      ],
    }));
    setSelectedSizesToAdd([]);
    setNewSizeStock("");
    setError(null);
  };

  const handleRemoveSize = (index) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSize = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index
          ? { ...size, [field]: field === "stock" ? parseInt(value) || 0 : value }
          : size
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(formData, product?.id);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        target: "unisex",
        sizes: [],
        imageURLs: [],
        tags: [],
        isActive: true,
      });
      setImageURLInput("");
      setSelectedSizesToAdd([]);
      setNewSizeStock("");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? "Edit Product" : "Add New Product"}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group form-group-full">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Essential Oversized Hoodie"
              required
            />
          </div>

          <div className="form-group form-group-full">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description..."
              rows="2"
            />
          </div>

          <div className="form-group form-group-full">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Target *</label>
              <select
                name="target"
                value={formData.target}
                onChange={handleChange}
                required
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
            </div>
          </div>

          {/* Sizes Management Section */}
          <div className="form-group form-group-full sizes-management">
            <label>Product Sizes & Stock</label>
            <div className="sizes-input-group">
              <div className="size-checkbox-group">
                <span className="size-radio-label">Sizes</span>
                <div className="size-radio-options">
                  {SIZE_OPTIONS.map((size) => (
                    <label key={size} className={`size-option ${selectedSizesToAdd.includes(size) ? "selected" : ""}`}>
                      <input
                        type="checkbox"
                        name="productSize"
                        value={size}
                        checked={selectedSizesToAdd.includes(size)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedSizesToAdd((prev) =>
                            prev.includes(value)
                              ? prev.filter((item) => item !== value)
                              : [...prev, value]
                          );
                        }}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
              <input
                type="number"
                placeholder="Stock"
                value={newSizeStock}
                onChange={(e) => setNewSizeStock(e.target.value)}
                min="0"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="btn btn-secondary"
              >
                Add Size
              </button>
            </div>

            {/* Sizes List */}
            {formData.sizes.length > 0 && (
              <div className="sizes-list">
                {formData.sizes.map((size, idx) => (
                  <div key={idx} className="size-item">
                    <input
                      type="text"
                      value={size.label}
                      onChange={(e) => handleUpdateSize(idx, "label", e.target.value)}
                      placeholder="Size label"
                      className="size-label-input"
                    />
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) => handleUpdateSize(idx, "stock", e.target.value)}
                      placeholder="Stock"
                      min="0"
                      className="size-stock-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="btn btn-danger-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* isActive Toggle */}
          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
              />
              <span>Product is Active</span>
            </label>
          </div>

          {/* Image Upload Section */}
          <div className="form-group form-group-full">
            <label>Product Images</label>
            
            {/* Method 1: Upload from Computer */}
            <div className="image-upload-area">
              <input
                type="file"
                id="image-input"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: "none" }}
              />
              <label htmlFor="image-input" className="upload-label">
                <FiUpload size={20} />
                <span>
                  {uploadingImage ? `Uploading ${uploadingImageName}...` : "Click to upload images"}
                </span>
                <small>JPG, PNG, WebP, GIF (Max 5MB each)</small>
              </label>
            </div>

            {/* Method 2: Add Image URL */}
            <div className="image-url-section">
              <p className="image-option-label">OR</p>
              <div className="image-url-input-group">
                <input
                  type="text"
                  placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                  value={imageURLInput}
                  onChange={(e) => setImageURLInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddImageURL()}
                />
                <button
                  type="button"
                  onClick={handleAddImageURL}
                  className="btn btn-secondary"
                  disabled={!imageURLInput.trim()}
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview */}
            {formData.imageURLs.length > 0 && (
              <div className="image-gallery">
                {formData.imageURLs.map((imageURL, idx) => (
                  <div key={idx} className="image-item">
                    <img src={imageURL} alt={`Preview ${idx}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(idx)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-muted">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Product Row Component
const ProductRow = ({ product, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total stock from sizes
  const getTotalStock = () => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const getStatus = () => {
    const totalStock = getTotalStock();
    if (totalStock === 0) return "Out of stock";
    if (totalStock < 10) return "Low stock";
    return product.isActive ? "Published" : "Inactive";
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(product.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const status = getStatus();
  const statusColor = {
    "Published": "#10b981",
    "Low stock": "#f59e0b",
    "Out of stock": "#ef4444",
    "Inactive": "#6b7280",
  }[status] || "#6b7280";

  const createdDate = product.createdAt
    ? new Date(product.createdAt.seconds ? product.createdAt.seconds * 1000 : product.createdAt).toLocaleDateString()
    : "—";

  const formatINR = (value) => {
    if (value === undefined || value === null || value === "") return "—";
    const number = parseFloat(value);
    if (Number.isNaN(number)) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(number);
  };

  const totalStock = getTotalStock();

  return (
    <>
      <tr>
        <td className="col-product">
          <div className="product-col product-name">
            <div className="product-image-thumb">
              {product.imageURLs && product.imageURLs.length > 0 ? (
                <img src={product.imageURLs[0]} alt={product.name} />
              ) : (
                <div className="product-placeholder">
                  <FiBox size={24} />
                </div>
              )}
            </div>
            <div>
              <p>{product.name}</p>
              <small>#{product.id.substring(0, 8)}</small>
            </div>
          </div>
        </td>
        <td className="col-category">{product.category}</td>
        <td className="col-price">{formatINR(product.price)}</td>
        <td className="col-stock">
          <div className="sizes-breakdown">
            {product.sizes && product.sizes.length > 0 ? (
              <div className="size-badges">
                {product.sizes.map((size, idx) => (
                  <span key={idx} className="size-badge">
                    {size.label}: {size.stock}
                  </span>
                ))}
              </div>
            ) : (
              <span>{totalStock}</span>
            )}
          </div>
        </td>
        <td className="col-status">
          <span style={{ color: statusColor, fontWeight: 600 }}>{status}</span>
        </td>
        <td className="col-added">{createdDate}</td>
        <td className="col-actions">
          <div className="product-actions-cell">
            <button
              className="btn-action btn-edit"
              onClick={() => onEdit(product)}
              title="Edit product"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              className="btn-action btn-delete"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete product"
            >
              {isDeleting ? "..." : <FiTrash2 size={16} />}
            </button>
          </div>
        </td>
      </tr>
      {error && (
        <tr className="product-error-row">
          <td colSpan="7">⚠️ {error}</td>
        </tr>
      )}
    </>
  );
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (formData, productId) => {
    setIsSubmitting(true);
    try {
      if (productId) {
        // Update
        await updateProduct(productId, formData);
      } else {
        // Add
        await addProduct(formData);
      }
      await fetchProducts();
      setShowFormModal(false);
      setEditingProduct(null);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      throw err;
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingProduct(null);
  };

  // Helper function to get total stock from product
  const getTotalStock = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
    }
    return product.stock || 0;
  };

  // Calculate metrics from products
  const totalProducts = products.length;
  const lowStock = products.filter((p) => {
    const total = getTotalStock(p);
    return total > 0 && total < 10;
  }).length;
  const outOfStock = products.filter((p) => getTotalStock(p) === 0).length;

  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map((p) => p.category))].sort();

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="products-page">
        <header className="products-heading">
          <div>
            <h1>Products</h1>
            <p>Manage inventory, pricing, status, and product details for the OUTFY catalog.</p>
          </div>
          <div className="products-actions">
            <button className="btn btn-muted">
              <FiUpload /> Export
            </button>
            <button className="btn btn-muted">
              <FiBox /> Bulk Actions
            </button>
            <button className="btn btn-primary" onClick={handleAddProduct}>
              <FiPlus /> Add Product
            </button>
          </div>
        </header>

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#10b981" }}>
              <FiBox />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Products</p>
              <h3>{totalProducts}</h3>
              <small>{filteredProducts.length} matching your search</small>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#f59e0b" }}>
              <FiAlertTriangle />
            </div>
            <div className="metric-content">
              <p className="metric-label">Low stock</p>
              <h3>{lowStock}</h3>
              <small>Need restock soon</small>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#ef4444" }}>
              <FiArchive />
            </div>
            <div className="metric-content">
              <p className="metric-label">Out of stock</p>
              <h3>{outOfStock}</h3>
              <small>No inventory available</small>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#60a5fa" }}>
              <FiUpload />
            </div>
            <div className="metric-content">
              <p className="metric-label">Sync Status</p>
              <h3>Live</h3>
              <small>Connected to Firebase</small>
            </div>
          </article>
        </div>

        <section className="products-main">
          <div className="products-list-panel">
            <div className="table-toolbar">
              <div className="toolbar-filters">
                <div className="search-field">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button className="btn btn-muted">Columns</button>
              </div>
            </div>

            <div className="product-table-card">
              <table className="product-table">
                <thead>
                  <tr>
                    <th className="col-product">PRODUCT</th>
                    <th className="col-category">CATEGORY</th>
                    <th className="col-price">PRICE</th>
                    <th className="col-stock">STOCK</th>
                    <th className="col-status">STATUS</th>
                    <th className="col-added">DATE</th>
                    <th className="col-actions">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">
                        <div className="loading-state">Loading products...</div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7">
                        <div className="error-state">
                          <p>⚠️ {error}</p>
                          <button onClick={fetchProducts} className="btn btn-primary">
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-state">
                          <p>
                            {searchTerm
                              ? "No products match your search"
                              : "No products yet. Click 'Add Product' to get started."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onDelete={handleDeleteProduct}
                        onEdit={handleEditProduct}
                      />
                    ))
                  )}
                </tbody>
              </table>

              <div className="product-table-footer">
                Showing {filteredProducts.length} of {totalProducts} products
              </div>
            </div>
          </div>
        </section>

        <ProductFormModal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          onSubmit={handleAddOrUpdate}
          isLoading={isSubmitting}
          product={editingProduct}
        />
      </div>
    </Layout>
  );
}

export default Products;