"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmployersPage() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const q = query(
          collection(db, "employers"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // includes employerCode automatically
        }));

        setEmployers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, []);

  return (
    <main className="min-h-screen bg-background text-white px-10 py-16">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employers</h1>
          <p className="text-gray-400 mt-1">
            Onboarded startups using SalarySync
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
        ) : employers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employers.map((emp, index) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {emp.company}
                    </h3>

                    {/* 👇 EMPLOYER CODE ADDED */}
                    <p className="text-xs text-gray-400 mt-1">
                      Employer Code:{" "}
                      <span className="font-mono text-gray-200">
                        {emp.employerCode || "—"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Employer ID: {emp.employerId}
                    </p>
                  </div>

                  <StatusBadge status={emp.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <Info label="Contact" value={emp.contactName || "—"} />
                  <Info label="Email" value={emp.contactEmail || "—"} />
                  <Info
                    label="Employees"
                    value={emp.totalEmployees ?? 0}
                  />
                  <Info
                    label="Total Withdrawn"
                    value={`₹${emp.totalWithdrawn ?? 0}`}
                  />
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Onboarded on{" "}
                  {emp.createdAt?.toDate
                    ? emp.createdAt.toDate().toLocaleDateString()
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
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-green-500 text-black font-semibold">
      {status?.toUpperCase() || "ACTIVE"}
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
      <h3 className="text-xl font-semibold">No employers yet</h3>
      <p className="text-gray-400 mt-2">
        Accepted startups will appear here.
      </p>
    </div>
  );
}
