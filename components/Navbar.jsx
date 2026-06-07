"use client";

import Link from "next/link";

export default function Sidebar(){

  return(

    <div className="hidden md:block w-64 bg-blue-700 text-white fixed inset-y-0 left-0 top-0 z-40 p-5 overflow-y-auto"> 
      <h1 className="text-2xl font-bold mb-10">

        Milk Buyer

      </h1>

        <ul className="space-y-4">

          <li><Link href="/dashboard">Dashboard</Link></li>

          <li><Link href="/customers">Customers</Link></li>

          <li><Link href="/milk-entry">Milk Entry</Link></li>

          <li><Link href="/reports">Reports</Link></li>

          <li><Link href="/admin">Admin</Link></li>

          <li><Link href="/sales">Sales</Link></li>

          <li><Link href="/bill"></Link></li>

          <li><Link href="/monthlyReport">Monthly Sales Report</Link></li>

          <li><Link href="/monthlyBuyingReport">Monthly Buying Report</Link></li>


          <li><Link href="/logout">Logout</Link></li>

          
         

        </ul>

    </div>
  );
}