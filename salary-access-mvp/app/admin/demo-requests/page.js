"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "demoRequests"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: d.data().status || "pending",
      }));

      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EMAIL VALIDATION (CRITICAL)
  const isValidEmail = (email) =>
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ FINAL ACCEPT / REJECT LOGIC (BULLETPROOF)
  const updateStatus = async (id, status) => {
    setActionLoading(id);

    try {
      // 1️⃣ Update demo request status
      await updateDoc(doc(db, "demoRequests", id), { status });

      if (status === "accepted") {
        const item = requests.find((r) => r.id === id);
        if (!item) throw new Error("Demo request not found");

        const employerId = `EMP-${Date.now().toString().slice(-5)}`;
        const auth = getAuth();

        let uid = null;
        let tempPassword = null;

        // 2️⃣ Create Auth user ONLY if email is valid
        if (isValidEmail(item.email)) {
          tempPassword = `SS@${Math.random()
            .toString(36)
            .slice(-8)}`;

          const userCred = await createUserWithEmailAndPassword(
            auth,
            item.email,
            tempPassword
          );

          uid = userCred.user.uid;
        }

        // 3️⃣ Create employer record (ALWAYS)
        await addDoc(collection(db, "employers"), {
          employerId,
          uid, // null if auth not created
          company: item.company,
          contactName: item.name,
          contactEmail: item.email,
          contactPhone: item.phone,
          size: item.size,
          status: "active",
          totalEmployees: 0,
          totalWithdrawn: 0,
          createdAt: serverTimestamp(),
        });

        // 4️⃣ Admin feedback
        if (uid) {
          alert(
            `Employer Created ✅\n\nEmail: ${item.email}\nPassword: ${tempPassword}`
          );
        } else {
          alert(
            `Employer Created ⚠️\n\nAuth NOT created due to invalid email.\nYou can fix email and create login later.`
          );
        }
      }

      // 5️⃣ Update UI
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Action failed. Check console.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white px-10 py-16">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Demo Requests</h1>
          <p className="text-gray-400 mt-1">
            Manage startup onboarding
          </p>
        </div>

        <Link
          href="/admin"
          className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          Admin Dashboard
        </Link>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <LoadingState />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.company}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {item.size} employees
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <Info label="Contact" value={item.name} />
                  <Info label="Email" value={item.email || "—"} />
                  <Info label="Phone" value={item.phone} />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    disabled={
                      item.status !== "pending" ||
                      actionLoading === item.id
                    }
                    onClick={() =>
                      updateStatus(item.id, "accepted")
                    }
                    className="flex-1 bg-green-500 text-black py-2 rounded-lg font-semibold disabled:opacity-40"
                  >
                    Accept
                  </button>

                  <button
                    disabled={
                      item.status !== "pending" ||
                      actionLoading === item.id
                    }
                    onClick={() =>
                      updateStatus(item.id, "rejected")
                    }
                    className="flex-1 bg-red-500 text-black py-2 rounded-lg font-semibold disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Requested on{" "}
                  {item.createdAt?.toDate
                    ? item.createdAt
                        .toDate()
                        .toLocaleString()
                    : "—"}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-400 text-black",
    accepted: "bg-green-500 text-black",
    rejected: "bg-red-500 text-black",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-semibold ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-56 bg-gray-900 border border-gray-700 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32">
      <h3 className="text-xl font-semibold">No demo requests</h3>
      <p className="text-gray-400 mt-2">
        Requests will appear here.
      </p>
    </div>
  );
}
