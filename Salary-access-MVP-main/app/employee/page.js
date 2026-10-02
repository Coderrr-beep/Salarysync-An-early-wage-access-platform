"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  // Mock data (hackathon-safe)
  const monthlySalary = 30000;
  const earnedSalary = 18000;
  const availableSalary = 12000;
  const employerName = "Kanper Startup";

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    fetchWithdrawals();
    return () => unsub();
  }, []);

  const fetchWithdrawals = async () => {
    const snap = await getDocs(collection(db, "withdrawals"));
    const list = [];
    snap.forEach((doc) => list.push(doc.data()));
    setWithdrawals(list.slice(0, 3));
  };

  const handleWithdraw = async () => {
    setStatus("");

    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setStatus("❌ Enter a valid amount");
      return;
    }

    if (withdrawAmount > availableSalary) {
      setStatus("❌ Amount exceeds available balance");
      return;
    }

    try {
      await addDoc(collection(db, "withdrawals"), {
        amount: withdrawAmount,
        userId: user?.uid || "demo-user",
        createdAt: serverTimestamp(),
      });

      setStatus("✅ Withdrawal successful");
      setAmount("");
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          👋 Hello{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-gray-400 mt-1">
          Company: {employerName}
        </p>
      </div>

      {/* Salary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Monthly Salary" value={`₹${monthlySalary}`} />
        <StatCard title="Earned Till Date" value={`₹${earnedSalary}`} />
        <StatCard
          title="Available to Withdraw"
          value={`₹${availableSalary}`}
          highlight
        />
      </div>

      {/* Withdraw Section */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-2">
          Withdraw Salary
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          You can withdraw up to 50% of your earned salary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (₹)"
            className="flex-1 bg-gray-800 border border-gray-600 px-4 py-2 rounded text-white"
          />
          <button
            onClick={handleWithdraw}
            className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200"
          >
            Withdraw
          </button>
        </div>

        {status && (
          <p className="mt-3 text-sm text-yellow-400">
            {status}
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
            No withdrawals yet.
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
                  {w.createdAt ? "Recently" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">
          ℹ️ How Salary Access Works
        </h2>
        <p className="text-sm text-gray-400">
          Withdrawals are adjusted from your next salary cycle.
          No interest. No hidden charges.
        </p>
      </div>
    </div>
  );
}

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
