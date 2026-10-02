"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedPage() {
  const seedFirestore = async () => {
    await addDoc(collection(db, "employers"), {
      companyName: "Kanper Startup",
      employeesCount: 100,
      subscriptionActive: true,
    });

    await addDoc(collection(db, "employees"), {
      name: "Kanper",
      salary: 30000,
      earned: 12000,
      available: 5000,
    });

    alert("Firestore seeded successfully ✅");
  };

  return (
    <main className="min-h-screen bg-background text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
        <h1 className="text-xl font-bold mb-4">
          Step 9 – Seed Firestore
        </h1>

        <button
          onClick={seedFirestore}
          className="bg-white text-black px-6 py-3 rounded"
        >
          Seed Database
        </button>
      </div>
    </main>
  );
}
