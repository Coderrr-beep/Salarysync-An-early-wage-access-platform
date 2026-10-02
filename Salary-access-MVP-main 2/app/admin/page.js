"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedDonutChart, AnimatedBarChart } from "@/components/Charts";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    demoRequests: 0,
    acceptedEmployers: 0,
    activeEmployers: 0,
    totalWithdrawn: 0,
    revenue: 0,
  });

  const [recentEmployers, setRecentEmployers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      /* ================= DEMO REQUESTS ================= */
      const demoSnap = await getDocs(
        query(collection(db, "demoRequests"), orderBy("createdAt", "desc"))
      );

      const demoRequests = demoSnap.docs.map((d) => d.data());
      const accepted = demoRequests.filter(
        (r) => r.status === "accepted"
      ).length;

      /* ================= EMPLOYERS ================= */
      const employerSnap = await getDocs(
        query(collection(db, "employers"), orderBy("createdAt", "desc"))
      );

      const employers = employerSnap.docs.map((d) => d.data());
      const activeEmployers = employers.filter(
        (e) => e.status === "active"
      ).length;

      /* ================= USERS (EMPLOYEES) ================= */
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((d) => d.data());

      const employees = users.filter(
        (u) => u.role === "employee" && u.employerId
      );

      const employeesPerEmployer = {};
      employees.forEach((emp) => {
        employeesPerEmployer[emp.employerId] =
          (employeesPerEmployer[emp.employerId] || 0) + 1;
      });

      const employeeRevenue = Object.values(employeesPerEmployer).reduce(
        (sum, count) => sum + count * 500,
        0
      );

      /* ================= WITHDRAWALS ================= */
      const withdrawalSnap = await getDocs(collection(db, "withdrawals"));
      const withdrawals = withdrawalSnap.docs.map((d) => d.data());

      const totalWithdrawn = withdrawals.reduce(
        (sum, w) => sum + (w.amount || 0),
        0
      );

      const transactionRevenue = withdrawals.length * 20;

      setStats({
        demoRequests: demoRequests.length,
        acceptedEmployers: accepted,
        activeEmployers,
        totalWithdrawn,
        revenue: transactionRevenue + employeeRevenue,
      });

      setRecentEmployers(employers.slice(0, 5));
      setRecentRequests(demoRequests.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white px-10 py-16">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">
            SalarySync platform overview
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/demo-requests" className="adminBtn">
            Demo Requests
          </Link>
          <Link href="/admin/employers" className="adminBtn">
            Employers
          </Link>
        </div>
      </div>

      {/* KPI + CHARTS */}
      <motion.div
        className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6 items-stretch"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lg:col-span-2 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Demo Requests", value: stats.demoRequests },
            { title: "Accepted Startups", value: stats.acceptedEmployers },
            { title: "Active Employers", value: stats.activeEmployers },
            {
              title: "Total Withdrawn",
              value: `₹${stats.totalWithdrawn.toLocaleString()}`,
            },
            {
              title: "Platform Revenue",
              value: `₹${stats.revenue.toLocaleString()}`,
            },
          ].map((item) => (
            <KPI key={item.title} title={item.title} value={item.value} />
          ))}
        </div>

        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-sm font-semibold text-gray-200">
            Platform Snapshot
          </h2>

          <div className="flex items-center gap-4">
            <AnimatedDonutChart
              value={stats.acceptedEmployers}
              max={Math.max(
                stats.demoRequests || 1,
                stats.acceptedEmployers || 1
              )}
              label="Demo → Active conversion"
              color="#22c55e"
              secondaryColor="#1f2937"
            />

            <div className="flex-1">
              <AnimatedBarChart
                data={[
                  { label: "Demo", value: stats.demoRequests, color: "#38bdf8" },
                  { label: "Active", value: stats.activeEmployers, color: "#22c55e" },
                  {
                    label: "Revenue (k)",
                    value: Math.round(stats.revenue / 1000),
                    color: "#f97316",
                  },
                ]}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* TABLES */}
      <div className="max-w-7xl mx-auto mt-14 grid lg:grid-cols-2 gap-10">
        <Section title="Recent Employers">
          {loading ? (
            <Loader />
          ) : recentEmployers.length === 0 ? (
            <Empty />
          ) : (
            recentEmployers.map((e, i) => (
              <div key={i} className="text-sm text-gray-300">
                {e.company}
              </div>
            ))
          )}
        </Section>

        <Section title="Recent Demo Requests">
          {loading ? (
            <Loader />
          ) : recentRequests.length === 0 ? (
            <Empty />
          ) : (
            recentRequests.map((r, i) => (
              <Row
                key={i}
                left={r.company}
                right={r.status?.toUpperCase() || "PENDING"}
              />
            ))
          )}
        </Section>
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ title, value }) {
  return (
    <motion.div
      className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm text-gray-400">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-300">{left}</span>
      <span className="font-medium">{right}</span>
    </div>
  );
}

function Loader() {
  return <div className="h-20 bg-gray-800 rounded-lg animate-pulse" />;
}

function Empty() {
  return <p className="text-sm text-gray-500">No data available</p>;
}
