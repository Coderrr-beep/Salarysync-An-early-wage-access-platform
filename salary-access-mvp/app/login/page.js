"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          uid,
          email,
          role: "employer",
          createdAt: new Date(),
        });
      }

      const userData = (await getDoc(ref)).data();
      if (userData.role === "employee") router.push("/employee");
      else router.push("/employer");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        name,
        email,
        role,
        employerId: null,
        verificationStatus: "not_started",
        createdAt: new Date(),
      });

      if (role === "employee") router.push("/onboarding");
      else router.push("/employer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          SalarySync
        </motion.h1>

        <motion.p
          className="text-center text-gray-400 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Welcome back
        </motion.p>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {role === "employee" && (
            <motion.input
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            />
          )}

          <motion.input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <motion.div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg pr-14"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </motion.div>

          <motion.div className="flex gap-4 text-sm">
            <label>
              <input
                type="radio"
                checked={role === "employee"}
                onChange={() => setRole("employee")}
              />{" "}
              Employee
            </label>
            <label>
              <input
                type="radio"
                checked={role === "employer"}
                onChange={() => setRole("employer")}
              />{" "}
              Employer
            </label>
          </motion.div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <motion.button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-400 text-black py-3 rounded-lg font-semibold"
          >
            {loading ? "Loading..." : "Login"}
          </motion.button>

          <motion.button
            onClick={handleSignup}
            disabled={loading}
            className="w-full border border-gray-600 py-3 rounded-lg font-semibold"
          >
            Sign Up
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
