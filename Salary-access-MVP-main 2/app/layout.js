import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "SalarySync",
  description: "Earned Wage Access for Viksit Bharat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Global Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
