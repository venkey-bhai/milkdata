"use client";

import { useState, useMemo } from "react";

import { useRouter } from "next/navigation";
import Sidebar from "../../components/Navbar";

export default function MonthlyBuyingReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch Report (Replace with your API)
  const fetchReport = async () => {
  if (!month || !year) {
    setError("Please select month and year");
    return;
  }

  setError("");
  setLoading(true);

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/monthly-buying?customer_name=${search}&month=${month}&year=${year}`
    );

    const result = await res.json();

    setReport(result.data || []);
    setLoading(false);
  } catch (err) {
    setError("Failed to load report");
    setLoading(false);
  }
};

  // 🔹 Month Name
  const monthName =
    month && year
      ? new Date(Number(year), Number(month) - 1).toLocaleString("default", {
          month: "long",
        })
      : "";

  // 🔹 Search Filter
  const filteredReport = useMemo(() => {
    if (!Array.isArray(report)) return [];
    return report.filter((row) =>
      row.customer_name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [report, search]);

  // 🔹 Grand Totals
  const grandLiters = filteredReport.reduce(
    (sum, row) => sum + Number(row.total_liters || 0),
    0
  );

  const grandAmount = filteredReport.reduce(
    (sum, row) => sum + Number(row.total_amount || 0),
    0
  );

  // 🔹 Currency Formatter
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  // 🔹 Print Function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <h1 className="text-3xl font-bold text-gray-800">
              Monthly Buying Report
            </h1>

            <button
              onClick={handlePrint}
              className="rounded-lg bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700"
            >
              🖨 Print Report
            </button>
          </div>

          {/* Filters */}
          <div className="rounded-xl bg-white p-6 shadow-md">
          
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Month */}
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border p-3 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Month</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              {/* Year */}
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="rounded-lg border p-3 focus:ring-2 focus:ring-blue-400"
              />

              {/* Search */}
              <input
                type="text"
                placeholder="Search by customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border p-3 focus:ring-2 focus:ring-blue-400"
              />

              {/* Button */}
              <button
                onClick={fetchReport}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Get Report"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-red-700 shadow">
              {error}
            </div>
          )}

          {/* Report */}
          <div
            id="report-area"
            className="rounded-xl bg-white p-6 shadow-md"
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {monthName} {year} Buying Report
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div id="invoice" className="bg-white p-6 shadow">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="border p-3 text-left">#</th>
                      <th className="border p-3 text-left">Customer No</th>
                      <th className="border p-3 text-left">Customer Name</th>
                      <th className="border p-3 text-left">Milk Type</th>
                      <th className="border p-3 text-right">Total Liters</th>
                      <th className="border p-3 text-right">Total Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReport.length > 0 ? (
                      filteredReport.map((row, index) => (
                        <tr
                          key={row.customer_no}
                          className="hover:bg-gray-50"
                        >
                          <td className="border p-3">{index + 1}</td>
                          <td className="border p-3">{row.customer_no}</td>
                          <td className="border p-3">
                            {row.customer_name}
                          </td>
                          <td className="border p-3">{row.milk_type}</td>
                          <td className="border p-3 text-right">
                            {row.total_liters}
                          </td>
                          <td className="border p-3 text-right font-medium text-green-700">
                            {formatCurrency(row.total_amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="border p-6 text-center text-gray-500"
                        >
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>

                  <tfoot>
                    <tr className="bg-green-100 font-bold text-gray-800">
                      <td colSpan="4" className="border p-3 text-right">
                        Grand Total
                      </td>
                      <td className="border p-3 text-right">
                        {grandLiters}
                      </td>
                      <td className="border p-3 text-right">
                        {formatCurrency(grandAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
}