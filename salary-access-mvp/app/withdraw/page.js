"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedDonutChart, AnimatedBarChart } from "@/components/Charts";

export default function WithdrawPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* ---------------- AUTH & DATA ---------------- */

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setUserData(snap.data());
      }

      const q = query(
        collection(db, "withdrawals"),
        where("userId", "==", u.uid)
      );

      const unsubWithdrawals = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => d.data());
        setWithdrawals(list);
        setLoading(false);
      });

      return () => unsubWithdrawals();
    });

    return () => unsub();
  }, []);

  /* ---------------- CALCULATIONS ---------------- */

  if (!userData && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const monthlySalary = userData?.monthlySalary || 0;
  const daysWorked = userData?.daysWorked || 0;

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

  /* ---------------- WITHDRAW ---------------- */

  const handleWithdraw = async () => {
    setStatus("");

    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setStatus("❌ Enter a valid amount");
      return;
    }

    if (withdrawAmount > availableLimit) {
      setStatus("❌ Amount exceeds available limit");
      return;
    }

    try {
      setLoading(true);

      const repaymentDate = new Date();
      repaymentDate.setMonth(repaymentDate.getMonth() + 1);
      repaymentDate.setDate(1);

      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        employerId: userData.employerId,
        amount: withdrawAmount,
        fee: 20,
        repaymentDate,
        createdAt: serverTimestamp(),
      });

      setStatus(
        `✅ ₹${withdrawAmount} withdrawal successful. ₹20 fee applied. Repayment scheduled on ${repaymentDate.toDateString()}`
      );
      setAmount("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-8">
      <motion.div
        className="max-w-4xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Withdraw Salary
        </motion.h1>

        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col md:flex-row gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex-1">
            <p className="text-sm text-gray-400">Earned till date</p>
            <p className="text-2xl font-bold">₹{earnedSalary.toFixed(0)}</p>

            <p className="text-sm text-gray-400 mt-4">
              Available to withdraw
            </p>
            <p className="text-xl font-semibold text-green-400">
              ₹{availableLimit.toFixed(0)}
            </p>
          </div>

          <AnimatedDonutChart
            value={availableLimit}
            max={earnedSalary || 1}
            label="Available"
            color="#22c55e"
            secondaryColor="#1f2937"
          />
        </motion.div>

        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="number"
            placeholder="Enter amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 px-4 py-4 rounded-lg text-lg"
          />

          <motion.button
            onClick={handleWithdraw}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full bg-green-400 text-black py-4 rounded-lg font-semibold"
          >
            {loading ? "Processing..." : "Withdraw Now"}
          </motion.button>

          {status && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm p-3 rounded-lg ${
                status.includes("✅")
                  ? "text-green-400 bg-green-900/20 border border-green-700"
                  : "text-yellow-400 bg-yellow-900/20 border border-yellow-700"
              }`}
            >
              {status}
            </motion.p>
          )}
        </motion.div>

        {earnedSalary > 0 && (
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnimatedBarChart
              data={[
                { label: "Earned", value: earnedSalary, color: "#22c55e" },
                { label: "Withdrawn", value: totalWithdrawn, color: "#f59e0b" },
                { label: "Available", value: availableLimit, color: "#38bdf8" },
              ]}
              height={200}
            />
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
