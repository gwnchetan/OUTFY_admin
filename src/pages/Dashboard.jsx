import Layout from "../components/Layout";
import "./Dashboard.css";
import { useState, useEffect } from "react";
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign } from "react-icons/fi";
import {
  getTotalUsers,
  getTotalProducts,
  getOrderMetrics,
  getLowStockItems,
  getRecentOrders,
  getRecentSignups,
  getMetricsChange,
} from "../services/dashboardService";

function Dashboard() {
  const [dateRange] = useState("Last 30 Days");
  const [stats, setStats] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          totalUsers,
          totalProducts,
          orderMetrics,
          lowStock,
          recentOrds,
          recentSgnups,
          metricsChange,
        ] = await Promise.all([
          getTotalUsers(),
          getTotalProducts(),
          getOrderMetrics(),
          getLowStockItems(3),
          getRecentOrders(5),
          getRecentSignups(5),
          getMetricsChange(),
        ]);

        // Build stats array with real data
        const statsData = [
          {
            id: 1,
            label: "Total Users",
            value: totalUsers.toLocaleString(),
            change: metricsChange.userChange,
            changeText: "from last month",
            icon: FiUsers,
          },
          {
            id: 2,
            label: "Total Products",
            value: totalProducts.toLocaleString(),
            change: metricsChange.productChange,
            changeText: "new products added",
            icon: FiPackage,
          },
          {
            id: 3,
            label: "Total Orders",
            value: orderMetrics.totalOrders.toLocaleString(),
            change: metricsChange.orderChange,
            changeText: "from last month",
            icon: FiShoppingCart,
          },
          {
            id: 4,
            label: "Total Revenue",
            value: `$${orderMetrics.totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
            change: metricsChange.revenueChange,
            changeText: "from last month",
            icon: FiDollarSign,
          },
        ];

        setStats(statsData);
        setLowStockItems(lowStock);
        setRecentOrders(recentOrds);
        setRecentSignups(recentSgnups);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#10b981";
      case "Processing":
        return "#f59e0b";
      case "Pending Payment":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <Layout>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Elena. Here's what's happening with your store today.</p>
          </div>
          <div className="date-filter">
            <select>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.id} className="stat-card">
                    <div className="stat-icon">
                      <IconComponent size={32} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">{stat.label}</p>
                      <h3 className="stat-value">{stat.value}</h3>
                      <p className="stat-change">
                        <span className="change-percent">{stat.change}</span>{" "}
                        <span className="change-text">{stat.changeText}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Low Stock Alerts */}
            <div className="alerts-section">
              <div className="section-header">
                <h2>Low Stock Alerts</h2>
                <a href="#" className="view-more">
                  View Inventory →
                </a>
              </div>
              <div className="alerts-grid">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="alert-card">
                      <div className="alert-image">
                        {item.imageURL ? (
                          <img src={item.imageURL} alt={item.name} />
                        ) : (
                          <FiPackage size={40} />
                        )}
                      </div>
                      <div className="alert-content">
                        <h4>{item.name}</h4>
                        <p className="item-size">{item.sizeInfo}</p>
                        <span className={`stock-badge stock-${item.stockCount}`}>
                          {item.stock}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">All items have healthy stock levels ✓</p>
                )}
              </div>
            </div>

            {/* Recent Orders & Signups */}
            <div className="bottom-section">
              {/* Recent Orders */}
              <div className="orders-section">
                <div className="section-header">
                  <h2>Recent Orders</h2>
                  <a href="#" className="view-more">
                    View All Orders →
                  </a>
                </div>
                <div className="orders-table">
                  <div className="table-header">
                    <div className="col col-customer">Customer</div>
                    <div className="col col-order">Order</div>
                    <div className="col col-amount">Amount</div>
                    <div className="col col-status">Status</div>
                  </div>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="table-row">
                        <div className="col col-customer">
                          <span className="order-icon">
                            <FiShoppingCart size={18} />
                          </span>
                          <div className="customer-info">
                            <p className="customer-name">{order.customer}</p>
                            <p className="order-items">{order.items}</p>
                          </div>
                        </div>
                        <div className="col col-order">{order.orderNumber}</div>
                        <div className="col col-amount">{order.amount}</div>
                        <div className="col col-status">
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getStatusColor(order.status)}20`,
                              color: getStatusColor(order.status),
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="table-row">
                      <p className="no-data">No recent orders</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Signups */}
              <div className="signups-section">
                <div className="section-header">
                  <h2>Recent Signups</h2>
                  <a href="#" className="view-more">
                    View All Users →
                  </a>
                </div>
                <div className="signups-list">
                  {recentSignups.length > 0 ? (
                    recentSignups.map((signup) => (
                      <div key={signup.id} className="signup-item">
                        <div className="signup-avatar">
                          {signup.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="signup-content">
                          <p className="signup-name">{signup.name}</p>
                          <p className="signup-email">{signup.email}</p>
                        </div>
                        <div className="signup-meta">
                          <p className="signup-type">{signup.type}</p>
                          <p className="signup-time">{signup.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="signup-item">
                      <p className="no-data">No recent signups</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;