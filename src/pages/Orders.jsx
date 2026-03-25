import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "./Orders.css";
import {
  FiPackage,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { getOrders, updateOrderStatusWithHistory } from "../services/orderService";

// Order Row Component
const OrderRow = ({ order, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const statuses = ["pending", "confirmed", "shipped", "delivered"];
  const currentStatusIndex = statuses.indexOf(order.status || "pending");

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    setError(null);

    try {
      await updateOrderStatusWithHistory(
        order.id,
        newStatus,
        order.statusHistory || []
      );
      onStatusUpdate(order.id, newStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = order.createdAt
    ? new Date(
        order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt
      ).toLocaleDateString()
    : "—";

  const userName = order.userSnapshot?.name || "Unknown";
  const totalAmount = order.pricing?.totalAmount || 0;
  const itemCount = order.items?.length || 0;

  return (
    <>
      <div className="order-row">
        <div className="order-info">
          <div className="order-header">
            <span className="order-id">#{order.id.substring(0, 8)}</span>
            <span className="customer-name">{userName}</span>
          </div>
          <span className="order-email">{order.userSnapshot?.email || "—"}</span>
        </div>

        <div className="order-items">
          <span className="item-count">{itemCount} items</span>
        </div>

        <span className="amount">${parseFloat(totalAmount).toFixed(2)}</span>

        <div className="status-control">
          <div className="status-badge" style={{ color: getStatusColor(order.status) }}>
            {order.status || "pending"}
          </div>

          {currentStatusIndex < statuses.length - 1 && (
            <button
              className="btn-next-status"
              onClick={() => handleStatusChange(statuses[currentStatusIndex + 1])}
              disabled={isUpdating}
              title={`Update to ${statuses[currentStatusIndex + 1]}`}
            >
              {isUpdating ? "..." : "→"}
            </button>
          )}
        </div>

        <span className="order-date">{formattedDate}</span>

        <button
          className="btn-expand"
          onClick={() => setIsExpanded(!isExpanded)}
          title="View details and history"
        >
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className="order-details">
          {error && <div className="order-error">⚠️ {error}</div>}

          <div className="order-details-grid">
            <div className="detail-section">
              <h4>Items</h4>
              <div className="items-list">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="item-detail">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                      <span className="item-price">
                        ${parseFloat(item.priceAtOrder).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span>No items</span>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h4>Pricing</h4>
              <div className="pricing-detail">
                <div className="pricing-row">
                  <span>Subtotal:</span>
                  <span>${parseFloat(order.pricing?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span>Delivery:</span>
                  <span>${parseFloat(order.pricing?.deliveryCharge || 0).toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span>Tax:</span>
                  <span>${parseFloat(order.pricing?.tax || 0).toFixed(2)}</span>
                </div>
                <div className="pricing-row total">
                  <span>Total:</span>
                  <span>${parseFloat(order.pricing?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Shipping Address</h4>
              <div className="address-detail">
                <p>{order.shippingAddress?.line1 || "—"}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            <div className="detail-section">
              <h4>Payment</h4>
              <div className="payment-detail">
                <div>
                  <span>Method:</span>
                  <strong>{order.payment?.method || "—"}</strong>
                </div>
                <div>
                  <span>Status:</span>
                  <strong>{order.payment?.status || "—"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="status-history">
            <h4>Status History</h4>
            <div className="history-timeline">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((entry, idx) => (
                  <div key={idx} className="history-entry">
                    <div
                      className="history-dot"
                      style={{ background: getStatusColor(entry.status) }}
                    />
                    <div className="history-content">
                      <span className="history-status">{entry.status}</span>
                      <span className="history-time">
                        {entry.timestamp
                          ? new Date(
                              entry.timestamp.seconds
                                ? entry.timestamp.seconds * 1000
                                : entry.timestamp
                            ).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="no-history">No status history</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main Orders Component
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    // Update local state without refetching
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusHistory: [
                { status: newStatus, timestamp: new Date() },
                ...(order.statusHistory || []),
              ],
              updatedAt: new Date(),
            }
          : order
      )
    );
  };

  // Calculate metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.pricing?.totalAmount || 0),
    0
  );

  return (
    <Layout>
      <div className="orders-page">
        <header className="orders-heading">
          <div>
            <h1>Orders</h1>
            <p>Manage customer orders, track shipments, and update order status.</p>
          </div>
        </header>

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#3b82f6" }}>
              <FiPackage />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Orders</p>
              <h3>{totalOrders}</h3>
              <small>All time</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#f59e0b" }}>
              <FiAlertTriangle />
            </div>
            <div className="metric-content">
              <p className="metric-label">Pending</p>
              <h3>{pendingOrders}</h3>
              <small>Awaiting confirmation</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#10b981" }}>
              <FiCheckCircle />
            </div>
            <div className="metric-content">
              <p className="metric-label">Delivered</p>
              <h3>{deliveredOrders}</h3>
              <small>Completed orders</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#8b5cf6" }}>
              <FiTrendingUp />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Revenue</p>
              <h3>${parseFloat(totalRevenue).toFixed(2)}</h3>
              <small>From all orders</small>
            </div>
          </article>
        </div>

        <section className="orders-main">
          <div className="orders-list-panel">
            <div className="orders-header">
              <h2>Order List</h2>
              <button onClick={fetchOrders} className="btn btn-secondary">
                Refresh
              </button>
            </div>

            <div className="orders-table-card">
              <div className="table-header-row">
                <span>ORDER & CUSTOMER</span>
                <span>ITEMS</span>
                <span>AMOUNT</span>
                <span>STATUS</span>
                <span>DATE</span>
                <span></span>
              </div>

              {loading ? (
                <div className="loading-state">Loading orders...</div>
              ) : error ? (
                <div className="error-state">
                  <p>⚠️ {error}</p>
                  <button onClick={fetchOrders} className="btn btn-primary">
                    Retry
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <p>No orders yet. Check back later!</p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}

              {orders.length > 0 && (
                <div className="orders-table-footer">
                  Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Orders;

