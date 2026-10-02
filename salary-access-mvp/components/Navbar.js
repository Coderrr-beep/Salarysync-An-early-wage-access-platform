"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur bg-black/70 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* LEFT: BRAND */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
        >
          SalarySync
        </Link>

        {/* RIGHT: NAV */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-300 hover:text-white">
            Home
          </Link>

          <Link href="/about" className="text-gray-300 hover:text-white">
            About
          </Link>

          {!user ? (
            <Link
              href="/login"
              className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
            >
              Login
            </Link>
          ) : (
            <>
              

              <button
                onClick={handleLogout}
                className="border border-gray-600 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
