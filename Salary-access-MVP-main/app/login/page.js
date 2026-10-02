"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const uid = cred.user.uid;

      // 🔐 Fetch role from Firestore
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        throw new Error("User role not found");
      }

      setUserRole(snap.data().role); // "employee" | "employer"
    } catch (err) {
      setError("Invalid credentials or role not assigned");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center text-white">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-10 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-gray-400 text-sm">
            Secure access to your salary account
          </p>
        </div>

        {!userRole && (
          <>
            <input
              type="email"
              placeholder="Work email"
              className="w-full bg-gray-800 border border-gray-600 px-4 py-3 rounded focus:outline-none focus:border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-800 border border-gray-600 px-4 py-3 rounded focus:outline-none focus:border-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <div className="border-t border-gray-700 pt-6" />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded font-semibold"
            >
              {loading ? "Verifying..." : "Authenticate"}
            </button>
          </>
        )}

        {/* 🔐 ROLE-BASED ACCESS */}
        {userRole === "employer" && (
          <a
            href="/employer/"
            className="block w-full text-center bg-black border border-gray-600 py-3 rounded font-medium"
          >
            Go to Employer Dashboard
          </a>
        )}

        {userRole === "employee" && (
          <a
            href="/employee/"
            className="block w-full text-center border border-gray-600 py-3 rounded font-medium text-gray-300"
          >
            Go to Employee Dashboard
          </a>
        )}

        <p className="text-xs text-gray-500 text-center">
          Powered by Firebase Authentication
        </p>
        <p className="text-xs text-gray-500 text-center">
          🔒 Secure authentication • Powered by Firebase
        </p>
      </div>
    </main>
  );
}
