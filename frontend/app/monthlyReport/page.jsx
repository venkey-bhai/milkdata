"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../components/Navbar";

export default function MonthlyReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState([]);
 

  // 🔹 Fetch Report (fixed like buying report)
  const fetchReport = async () => {
    if (!month || !year) {
      setError("Please select month and year");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
           `http://127.0.0.1:8000/sales/monthly-sales?customer_name=${search}&month=${month}&year=${year}`
          //  `http://127.0.0.1:8000/sales/monthly-sales?month=${month}&year=${year}`
          // `http://127.0.0.1:8000/sales/monthly-sales?customer_name=&customer_no=&month=${month}&year=${year}`
      );

      const result = await res.json();

      setReport(result.data || []);
      setTotal(result.total_amount || 0);
    } catch (err) {
      setError("Failed to load report");
    } finally {
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

  // 🔹 Search Filter (FIXED like buying report style)
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

  // 🔹 Print
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
              Monthly Sales Report
            </h1>

            <button
              onClick={handlePrint}
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              🖨 Print Report
            </button>
          </div>

          {/* Filters */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">


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

              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="rounded-lg border p-3 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text" 
                placeholder="Customer Name"
                className="rounded-lg border p-3 focus:ring-2 focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                onClick={fetchReport}
                disabled={loading}
                className="rounded-lg border border-black bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-50"
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
          <div id="report-area" className="rounded-xl bg-white p-6 shadow-md">

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {monthName} {year} Sales Report
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div  id="invoice" className="overflow-x-auto bg-white p-6 shadow">

                <table className="w-full border-collapse text-sm">

                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                      <th className="border border-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                      <th className="border border-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="border border-slate-100 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReport.length > 0 ? (
                      filteredReport.map((item, index) => (
                        <tr key={item.id || index} className="border-t border-slate-100 even:bg-slate-50/60 hover:bg-slate-100/70 transition-colors">
                          <td className="border border-slate-100 px-4 py-3 text-slate-700">{index + 1}</td>
                          <td className="border border-slate-100 px-4 py-3 text-slate-900">{item.customer_name}</td>
                          <td className="border border-slate-100 px-4 py-3 text-slate-700">{item.bill_date}</td>
                          <td className="border border-slate-100 px-4 py-3 text-right font-semibold text-emerald-700">
                            {formatCurrency(item.total_amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="border border-slate-100 px-6 py-8 text-center text-slate-500">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>

                  <tfoot>
                    <tr className="bg-emerald-50 font-bold text-slate-800">
                      <td colSpan="3" className="border border-slate-100 px-4 py-3 text-right">
                        Grand Total
                      </td>
                      <td className="border border-slate-100 px-4 py-3 text-right text-emerald-700">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  </tfoot>

                </table>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}