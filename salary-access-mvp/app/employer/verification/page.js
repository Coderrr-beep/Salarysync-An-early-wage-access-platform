"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function EmployerVerificationPage() {
  const [employer, setEmployer] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ---------- AUTH ---------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, []);

  /* ---------- FETCH EMPLOYER ---------- */
  useEffect(() => {
    const fetchEmployer = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "employers"),
        where("uid", "==", user.uid)
      );

      const snap = await getDocs(q);
      if (!snap.empty) {
        setEmployer(snap.docs[0].data());
      }
    };

    fetchEmployer();
  }, []);

  /* ---------- FETCH PENDING EMPLOYEES ---------- */
  useEffect(() => {
    if (!employer) return;

    const q = query(
      collection(db, "users"),
      where("role", "==", "employee"),
      where("employerId", "==", employer.employerId),
      where("verificationStatus", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      setEmployees(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, [employer]);

  /* ---------- ACTION ---------- */
  const handleAction = async (id, status) => {
    await updateDoc(doc(db, "users", id), {
      verificationStatus: status,
      documentVerified: status === "approved",
      verifiedAt: new Date(),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading verification requests...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-10 py-12">
      {/* 🔙 BACK BUTTON (ONLY ADDITION) */}
      <button
        onClick={() => router.push("/employer")}
        className="mb-6 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:scale-105 transition"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-2">
        Employee Verification
      </h1>
      <p className="text-gray-400 mb-8">
        Review employees verified by AI
      </p>

      {employees.length === 0 ? (
        <p className="text-gray-400">
          No pending verification requests.
        </p>
      ) : (
        <div className="space-y-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{emp.email}</p>
                <p className="text-sm text-gray-400">
                  Salary: ₹{emp.monthlySalary}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleAction(emp.id, "approved")
                  }
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    handleAction(emp.id, "rejected")
                  }
                  className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
