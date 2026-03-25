import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebase_config";

// Multiple admin emails allowed
const ADMIN_EMAILS = ["csakre634@gmail.com", "admin@example.com"];

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;