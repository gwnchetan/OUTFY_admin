import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebase_config";

function Login() {
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            navigate("/dashboard");
          } else {
            // If they are logged in but not an admin, sign them out.
            await signOut(auth);
            setError("Unauthorized access. Only admin can login.");
          }
        } catch (err) {
          await signOut(auth);
          setError("Error verifying admin status.");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // The actual redirect and verification logic is now handled by the onAuthStateChanged listener above.
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Outfy Admin</h1>
        <p style={styles.subtitle}>Sign in to manage your store</p>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={styles.button}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}

export default Login;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f2f2f2"
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    width: "340px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#777",
    marginBottom: "24px"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer"
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "16px"
  }
}
