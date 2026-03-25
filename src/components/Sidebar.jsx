import { NavLink, useNavigate } from "react-router-dom"
import { auth } from "../firebase/firebase_config"
import "./Sidebar.css"

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "▦" },
  { path: "/users", label: "Users", icon: "👥" },
  { path: "/products", label: "Products", icon: "📦" },
  { path: "/orders", label: "Orders", icon: "🛒" },
  { path: "/analytics", label: "Analytics", icon: "📊" },
]

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await auth.signOut()
    navigate("/")
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">OUTFY</span>
        <span className="logo-sub">admin</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Sign out
      </button>
    </aside>
  )
}

export default Sidebar