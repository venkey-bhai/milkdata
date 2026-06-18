"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/milk-entry", label: "Milk Entry" },
  { href: "/reports", label: "Reports" },
  { href: "/admin", label: "Admin" },
  { href: "/sales", label: "Sales" },
  { href: "/monthlyReport", label: "Monthly Sales Report" },
  { href: "/monthlyBuyingReport", label: "Monthly Buying Report" },
  { href: "/loan", label: "Loan Management" },
  { href: "/logout", label: "Logout" }
];

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-blue-700 text-white md:fixed md:inset-y-0 md:left-0 md:w-64 md:z-40">
      <div className="flex items-center justify-between px-5 py-4 md:justify-center md:py-8">
        <h1 className="text-2xl font-bold">Milk Buyer</h1>
        <button
          type="button"
          className="md:hidden p-2 rounded-md border border-white/20 hover:bg-blue-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 011.06 0L12 9.94l4.66-4.72a.75.75 0 111.06 1.06L13.06 11l4.72 4.66a.75.75 0 11-1.06 1.06L12 12.06l-4.66 4.72a.75.75 0 11-1.06-1.06L10.94 11 6.22 6.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className={`${menuOpen ? "block" : "hidden"} md:block px-5 pb-10 md:pb-0`}>
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-2 py-1 hover:bg-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
