"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AiAdvisor from "@/components/AiAdvisor";
import {
  AnimatedDonutChart,
  AnimatedBarChart,
} from "@/components/Charts";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* ---------------- AUTH + DATA ---------------- */

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      const q = query(
        collection(db, "withdrawals"),
        where("userId", "==", u.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const unsubWithdrawals = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => d.data());
        setWithdrawals(list);
        setLoading(false);
      });

      return () => unsubWithdrawals();
    });

    return () => unsubAuth();
  }, []);

  /* ---------------- LOADING ---------------- */

  if (!userData || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading your salary dashboard...
      </div>
    );
  }

  /* ---------------- APPROVAL CHECK ---------------- */

  const isApproved =
    userData.verificationStatus === "approved" &&
    userData.documentVerified === true;

  /* ---------------- CALCULATIONS ---------------- */

  const monthlySalary = userData.monthlySalary || 30000;
  const daysWorked = userData.daysWorked || 0;
  const dailySalary = monthlySalary / 30;
  const earnedSalary = dailySalary * daysWorked;

  const totalWithdrawn = withdrawals.reduce(
    (sum, w) => sum + (w.amount || 0),
    0
  );

  const availableLimit = Math.max(
    earnedSalary * 0.5 - totalWithdrawn,
    0
  );

  const progressPercent = Math.min(
    (earnedSalary / monthlySalary) * 100,
    100
  );

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          👋 Hi, {user.email.split("@")[0]}
        </h1>
        <p className="text-gray-400">
          {userData.employerName || "Your Company"}
        </p>
      </div>

      {/* 🔒 Approval Banner (TEXT ONLY) */}
      {!isApproved && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-300">
            ⏳ Your documents are under employer review. Salary withdrawal
            will be enabled once approved.
          </p>
        </div>
      )}

      {/* Progress + charts */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2 text-gray-400">
              <span>Salary Earned</span>
              <span>
                ₹{earnedSalary.toFixed(0)} / ₹{monthlySalary}
              </span>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-sky-400 h-3 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {daysWorked} days worked · ₹{dailySalary.toFixed(0)}/day
            </p>
          </div>

          <AnimatedDonutChart
            value={earnedSalary}
            max={monthlySalary}
            label="Earned this month"
            color="#22c55e"
            secondaryColor="#1f2937"
          />
        </div>
      </div>

      {/* Stats + Enhanced bar chart */}
      <motion.div 
        className="grid lg:grid-cols-3 gap-6 mb-10 items-stretch"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard title="Monthly Salary" value={`₹${monthlySalary.toLocaleString()}`} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Earned Till Date"
              value={`₹${earnedSalary.toFixed(0)}`}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Available to Withdraw"
              value={`₹${availableLimit.toFixed(0)}`}
              highlight
            />
          </motion.div>
        </div>

        <motion.div 
          className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col gap-4 shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Your Month Overview
          </h3>
          <AnimatedBarChart
            data={[
              {
                label: "Earned",
                value: Math.round(earnedSalary),
                color: "#22c55e",
              },
              {
                label: "Withdrawn",
                value: Math.round(totalWithdrawn),
                color: "#f97316",
              },
              {
                label: "Limit",
                value: Math.round(availableLimit),
                color: "#38bdf8",
              },
            ]}
            height={160}
          />
        </motion.div>
      </motion.div>

      {/* Enhanced Analytics Bar Chart */}
      <motion.div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8 mb-10 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          Salary Analytics
        </h2>
        <AnimatedBarChart
          data={[
            {
              label: "Earned",
              value: Math.round(earnedSalary),
              color: "#22c55e",
            },
            {
              label: "Withdrawn",
              value: Math.round(totalWithdrawn),
              color: "#f59e0b",
            },
            {
              label: "Available",
              value: Math.round(availableLimit),
              color: "#38bdf8",
            },
            {
              label: "Monthly",
              value: Math.round(monthlySalary),
              color: "#6366f1",
            },
          ]}
          height={220}
        />
      </motion.div>

      {/* Withdraw CTA */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-2">
          Access Your Salary Early
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Withdraw up to 50% of earned salary · ₹20 flat fee · No interest
        </p>

        <button
          onClick={() => router.push("/withdraw")}
          disabled={!isApproved || availableLimit <= 0}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Withdraw Now
        </button>

        {!isApproved && (
          <p className="text-xs text-gray-500 mt-3">
            Waiting for employer approval
          </p>
        )}
      </div>

      {/* Recent Withdrawals */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Recent Withdrawals
        </h2>

        {withdrawals.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No withdrawals yet
          </p>
        ) : (
          <ul className="space-y-3">
            {withdrawals.map((w, i) => (
              <li
                key={i}
                className="flex justify-between bg-gray-800 px-4 py-2 rounded"
              >
                <span>₹{w.amount}</span>
                <span className="text-gray-400 text-sm">
                  Fee ₹{w.fee || 20}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🤖 AI FINANCIAL ADVISOR */}
      <AiAdvisor
        context={{
          monthlySalary,
          earnedSalary,
          availableLimit,
          daysWorked,
        }}
      />
    </main>
  );
}

/* ---------------- CARD ---------------- */

function StatCard({ title, value, highlight }) {
  return (
    <div
      className={`rounded-xl p-6 border ${
        highlight
          ? "bg-green-900/20 border-green-700"
          : "bg-gray-900 border-gray-700"
      }`}
    >
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}
