"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AnimatedDonutChart,
  AnimatedBarChart,
} from "@/components/Charts";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    size: "",
  });

  return (
    <main className="min-h-screen bg-background text-white overflow-hidden">
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-10 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
          >
            SalarySync
          </motion.div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition">
              About Us
            </Link>
            <Link
              href="/login"
              className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <div className="h-20" />

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-10 py-28 grid md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Your salary,
            <br />
            <span className="text-green-400">available every day</span>
          </h1>

          <p className="text-gray-400 mt-6 max-w-lg text-lg leading-relaxed">
            SalarySync lets employees access the money they’ve already earned.
            No loans. No interest. Zero employer risk.
          </p>

          <div className="mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(true)}
              className="bg-white text-black px-8 py-4 rounded-xl font-semibold shadow-xl"
            >
              Request Demo
            </motion.button>

            <p className="text-sm text-gray-500 mt-4">
              Built for startups & SMEs • Auto-settled on payday
            </p>
          </div>
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />

          <div className="relative bg-white text-black rounded-2xl p-8 shadow-2xl">
            <h3 className="font-semibold text-lg mb-6">Employee Snapshot</h3>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <AnimatedDonutChart
                value={12000}
                max={30000}
                label="Earned this month"
                color="#22c55e"
                secondaryColor="#e5e7eb"
              />

              <div className="flex-1 space-y-3 text-sm">
                <Row label="Monthly Salary" value="₹30,000" />
                <Row label="Earned till date" value="₹12,000" highlight />
                <Row label="Available now" value="₹5,000" />

                <div className="mt-4">
                  <AnimatedBarChart
                    data={[
                      { label: "Earned", value: 12, color: "#22c55e" },
                      { label: "Balance", value: 18, color: "#3b82f6" },
                      { label: "Withdrawn", value: 5, color: "#f97316" },
                    ]}
                    maxValue={30}
                  />
                </div>
              </div>
            </div>

            <button
              disabled
              className="mt-8 w-full bg-black text-white py-3 rounded-lg opacity-80 cursor-not-allowed"
            >
              Withdraw (Demo)
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Flat ₹20 fee • No interest • No debt
            </p>
          </div>
        </motion.div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="border-t border-gray-800 py-20">
        <div className="max-w-5xl mx-auto px-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Why SalarySync?</h2>
          <p className="text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Payroll runs monthly, but life runs daily. SalarySync bridges this
            gap by turning salary into a real-time stream — empowering workers
            without pushing them into debt.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Feature title="Zero Interest" desc="Access your own earned money" />
            <Feature title="Real-Time Sync" desc="Instant balance updates" />
            <Feature title="Employer Safe" desc="No cash-flow impact" />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-10 py-10 text-sm text-gray-400">
          <p className="text-white font-semibold">SalarySync</p>
          <p className="mt-2">
            Team: Kanishk, Aryan, Manya, Paresha, Animish
          </p>
          <p className="mt-2">📞 2354677285</p>
          <p>✉️ GFG@gmail.com</p>
          <p className="mt-4 text-xs text-gray-500">
            Hackathon MVP • FinTech for Viksit Bharat
          </p>
        </div>
      </footer>

      {/* ================= DEMO MODAL ================= */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white text-black rounded-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-6">Request a Demo</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);

                try {
                  await addDoc(collection(db, "demoRequests"), {
                    ...form,
                    createdAt: serverTimestamp(),
                  });

                  alert("Demo request submitted successfully ✅");

                  setForm({
                    company: "",
                    name: "",
                    email: "",
                    phone: "",
                    size: "",
                  });
                  setOpen(false);
                } catch (err) {
                  console.error(err);
                  alert("Something went wrong. Try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
              {["company", "name", "email", "phone"].map((field) => (
                <input
                  key={field}
                  required
                  type={field === "email" ? "email" : "text"}
                  placeholder={
                    field === "company"
                      ? "Company Name"
                      : field === "name"
                      ? "Your Name"
                      : field === "email"
                      ? "Work Email"
                      : "Phone Number"
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                />
              ))}

              <select
                required
                className="w-full border rounded-lg px-4 py-3"
                value={form.size}
                onChange={(e) =>
                  setForm({ ...form, size: e.target.value })
                }
              >
                <option value="">Company Size</option>
                <option>1–20</option>
                <option>21–50</option>
                <option>51–200</option>
                <option>200+</option>
              </select>

              <button
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ===== Helper Components ===== */

function Row({ label, value, highlight }) {
  return (
    <div
      className={`flex justify-between ${
        highlight ? "text-green-600 font-medium" : ""
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}
