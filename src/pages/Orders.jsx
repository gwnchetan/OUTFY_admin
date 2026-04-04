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

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statusFlow = [
  "order_placed",
  "departure",
  "arrived_city",
  "out_for_delivery",
  "delivered",
];

const statusLabel = (status) => {
  const labels = {
    order_placed: "Order Placed",
    departure: "Departure",
    arrived_city: "Arrived at Your City",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status || "Order Placed";
};

const toDateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value.seconds ? value.seconds * 1000 : value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

// Order Row Component
const OrderRow = ({ order, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const currentStatusIndex = statusFlow.indexOf(order.status || "order_placed");
  const canAdvanceStatus =
    currentStatusIndex >= 0 && currentStatusIndex < statusFlow.length - 1;

  const getStatusColor = (status) => {
    const colors = {
      order_placed: "#b45309",
      departure: "#2563eb",
      arrived_city: "#7c3aed",
      out_for_delivery: "#ea580c",
      delivered: "#10b981",
      cancelled: "#dc2626",
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

  const formattedDate = toDateLabel(order.createdAt || order.placedAt);

  const userName =
    order.shippingAddress?.fullName || order.userSnapshot?.name || "Unknown";
  const customerSubline =
    order.userSnapshot?.email || order.shippingAddress?.phone || "—";
  const totalAmount =
    order.pricing?.totalAmount ?? order.total ?? 0;
  const itemCount =
    order.itemCount ||
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
    0;

  return (
    <>
      <div className="order-row">
        <div className="order-info">
          <div className="order-header">
            <span className="order-id">#{order.id.substring(0, 8)}</span>
            <span className="customer-name">{userName}</span>
          </div>
          <span className="order-email">{customerSubline}</span>
        </div>

        <div className="order-items">
          <span className="item-count">{itemCount} items</span>
        </div>

        <span className="amount">{currencyFormatter.format(parseFloat(totalAmount || 0))}</span>

        <div className="status-control">
          <div className="status-badge" style={{ color: getStatusColor(order.status) }}>
            {statusLabel(order.status || "order_placed")}
          </div>

          {canAdvanceStatus && (
            <button
              className="btn-next-status"
              onClick={() => handleStatusChange(statusFlow[currentStatusIndex + 1])}
              disabled={isUpdating}
              title={`Update to ${statusLabel(statusFlow[currentStatusIndex + 1])}`}
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
                        {currencyFormatter.format(parseFloat(item.priceAtOrder || item.unitPrice || 0))}
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
                  <span>{currencyFormatter.format(parseFloat(order.pricing?.subtotal || order.subtotal || 0))}</span>
                </div>
                <div className="pricing-row">
                  <span>Delivery:</span>
                  <span>{currencyFormatter.format(parseFloat(order.pricing?.deliveryCharge || 0))}</span>
                </div>
                <div className="pricing-row">
                  <span>Tax:</span>
                  <span>{currencyFormatter.format(parseFloat(order.pricing?.tax || 0))}</span>
                </div>
                <div className="pricing-row total">
                  <span>Total:</span>
                  <span>{currencyFormatter.format(parseFloat(order.pricing?.totalAmount || order.total || 0))}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Shipping Address</h4>
              <div className="address-detail">
                <p>{order.shippingAddress?.fullName || "—"}</p>
                <p>{order.shippingAddress?.line1 || "—"}</p>
                {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.pincode}
                </p>
                <p>{order.shippingAddress?.phone || order.userSnapshot?.phone || "—"}</p>
              </div>
            </div>

            <div className="detail-section">
              <h4>Payment</h4>
              <div className="payment-detail">
                <div>
                  <span>Method:</span>
                  <strong>{order.payment?.label || order.payment?.method || "—"}</strong>
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
                      <span className="history-status">{statusLabel(entry.status)}</span>
                      <span className="history-time">{toDateLabel(entry.timestamp)}</span>
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
  const placedOrders = orders.filter((o) => o.status === "order_placed").length;
  const inTransitOrders = orders.filter((o) =>
    ["departure", "arrived_city", "out_for_delivery"].includes(o.status)
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.pricing?.totalAmount || order.total || 0),
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
              <p className="metric-label">Order Placed</p>
              <h3>{placedOrders}</h3>
              <small>Fresh new orders</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#8b5cf6" }}>
              <FiTrendingUp />
            </div>
            <div className="metric-content">
              <p className="metric-label">On the Way</p>
              <h3>{inTransitOrders}</h3>
              <small>Departure to doorstep</small>
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
            <div className="metric-icon" style={{ color: "#ef4444" }}>
              <FiAlertTriangle />
            </div>
            <div className="metric-content">
              <p className="metric-label">Cancelled</p>
              <h3>{cancelledOrders}</h3>
              <small>Stopped before delivery</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" style={{ color: "#ec4899" }}>
              <FiTrendingUp />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Revenue</p>
              <h3>{currencyFormatter.format(parseFloat(totalRevenue || 0))}</h3>
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

