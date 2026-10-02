"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-10 py-20 max-w-5xl mx-auto">
      <motion.h1 
        className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        About SalarySync
      </motion.h1>

      <motion.p 
        className="text-gray-300 mb-8 leading-relaxed text-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        SalarySync is a financial wellness platform that modernizes the Indian
        payroll system by enabling Earned Wage Access (EWA). It allows employees
        to access their accrued salary in real time — anytime during the month —
        without loans or interest.
      </motion.p>

      <section className="space-y-8">
        {[
          {
            emoji: "🚨",
            title: "The Problem",
            text: "Payroll is monthly, but expenses are daily. This liquidity mismatch forces employees to rely on predatory loans during emergencies.",
            delay: 0.3,
          },
          {
            emoji: "💡",
            title: "Our Solution",
            text: "SalarySync treats salary as a real-time stream. Employees can safely withdraw a portion of what they have already earned, with a flat fee and zero interest.",
            delay: 0.4,
          },
          {
            emoji: "⚙️",
            title: "Technology",
            text: "Built using Next.js, Firebase, and Google Cloud-ready architecture, SalarySync provides real-time syncing, secure authentication, and AI-powered financial guidance.",
            delay: 0.5,
          },
          {
            emoji: "🌱",
            title: "Vision",
            text: "Our mission is to reduce financial stress and build the financial infrastructure for a more resilient and inclusive workforce in India.",
            delay: 0.6,
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.delay, duration: 0.5 }}
            whileHover={{ scale: 1.02, borderColor: "#22c55e" }}
          >
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span>{item.emoji}</span>
              {item.title}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {item.text}
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
