"use client";

import Link from "next/link";

export default function Sidebar(){

  return(

    <div className="w-64 bg-blue-700 text-white min-h-screen p-5">

      <h1 className="text-2xl font-bold mb-10">

        Milk Buyer

      </h1>

        <ul className="space-y-4">

          <li><Link href="/dashboard">Dashboard</Link></li>

          <li><Link href="/customers">Customers</Link></li>

          <li><Link href="/milk-entry">Milk Entry</Link></li>

          <li><Link href="/reports">Reports</Link></li>

          <li><Link href="/admin">Admin</Link></li>

          <li><Link href="/logout">Logout</Link></li>
         

        </ul>

    </div>
  );
}