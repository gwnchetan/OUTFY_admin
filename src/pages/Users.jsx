/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { getUsers, updateUserStatus, deleteUser } from "../services/userService";
import "./Users.css";

// User Details Panel Component
const UserDetailsPanel = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="user-details-overlay" onClick={onClose}>
      <div className="user-details-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>User Details</h2>
        <div className="details-content">
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{user.name || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{user.email || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">{user.phone || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className={`status-badge status-${user.status}`}>
              {user.status || "Active"}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Joined:</span>
            <span className="value">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Row Component
const UserRow = ({ user, onDelete, onBlockUnblock, onViewDetails }) => {
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);
  const [isUpdatingLocal, setIsUpdatingLocal] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;

    setIsDeletingLocal(true);
    setError(null);
    try {
      await onDelete(user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeletingLocal(false);
    }
  };

  const handleStatusChange = async () => {
    setIsUpdatingLocal(true);
    setError(null);
    try {
      const newStatus = user.status === "blocked" ? "active" : "blocked";
      await onBlockUnblock(user.id, newStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdatingLocal(false);
    }
  };

  return (
    <>
      <tr className={`user-row status-${user.status}`}>
        <td>{user.name || "—"}</td>
        <td>{user.email || "—"}</td>
        <td>
          <span className={`status-badge status-${user.status}`}>
            {user.status || "active"}
          </span>
        </td>
        <td className="actions-cell">
          <button
            className="btn-view"
            onClick={() => onViewDetails(user)}
            title="View user details"
          >
            View
          </button>
          <button
            className={`btn-status ${user.status === "blocked" ? "btn-unblock" : "btn-block"}`}
            onClick={handleStatusChange}
            disabled={isUpdatingLocal}
            title={user.status === "blocked" ? "Unblock user" : "Block user"}
          >
            {isUpdatingLocal
              ? "..."
              : user.status === "blocked"
                ? "Unblock"
                : "Block"}
          </button>
          <button
            className="btn-delete"
            onClick={handleDelete}
            disabled={isDeletingLocal}
            title="Delete user permanently"
          >
            {isDeletingLocal ? "..." : "Delete"}
          </button>
        </td>
      </tr>
      {error && (
        <tr className="error-row">
          <td colSpan="4" className="error-message">
            ⚠️ {error}
          </td>
        </tr>
      )}
    </>
  );
};

// Main Users Page Component
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Users Management</h1>
        <button
          className="btn-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={fetchUsers} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found. Start by adding users to your Firestore database.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onDelete={handleDeleteUser}
                  onBlockUnblock={handleUpdateStatus}
                  onViewDetails={setSelectedUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserDetailsPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

export default UsersPage;
