"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Navbar";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filters, setFilters] = useState({
    id: "",
    customer_id: "",
    customer_name: "",
    session: "",
    total_liters: "",
    total_amount: "",
    date: "",
  });

  // ================= FETCH REPORTS =================
  // Accept optional start and end dates. If both provided, query range; if only start provided, query that date.
  const fetchReports = async (startDate = "", endDate = "") => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      let url = "http://127.0.0.1:8000/reports";
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      } else if (startDate) {
        url += `?report_date=${startDate}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to fetch reports");
      }

      const dataArray = Array.isArray(result) ? result : result.data || [];
      const normalized = dataArray.map((report) => ({
        ...report,
        id: report.id ?? report.report_id ?? report.reportId ?? report._id ?? null,
      }));

      // Apply client-side date range filtering as a fallback (works even if backend lacks range support)
      let finalList = normalized;
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate + "T23:59:59") : null;
        finalList = normalized.filter((r) => {
          if (!r.date) return false;
          const rd = new Date(r.date);
          if (start && rd < start) return false;
          if (end && rd > end) return false;
          return true;
        });
      }

      setReports(finalList);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= DATE FILTER =================
  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);
    // pass both start and end so backend can handle range when endDate is set
    fetchReports(value, endDate);
  };

  // ================= TABLE FILTERS =================
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= SAFE FILTERING =================
  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => {
        return (
          (!filters.id ||
            String(report.id) === String(filters.id)) &&
          (!filters.customer_no ||
            String(report.customer_no) === String(filters.customer_no)) &&
          (!filters.customer_name ||
            report.customer_name === filters.customer_name) &&
          (!filters.session || report.session === filters.session) &&
          (!filters.total_liters ||
            String(report.total_liters) === filters.total_liters) &&
          (!filters.total_amount ||
            String(report.total_amount) === filters.total_amount) &&
          (!filters.milk_type ||
            report.milk_type === filters.milk_type) &&
          (!filters.date || report.date === filters.date)
        );
      })
    : [];

  const deleteReport = async (id) => {
  
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

    const response = await fetch(
      `http://127.0.0.1:8000/reports/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
      console.log(data);
      console.log(id);
    if (!response.ok) {
      throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        );
    }

    setReports((prev) =>
      prev.filter((report) => {
        const reportId = report.id ?? report.report_id ?? report.reportId ?? report._id;
        return String(reportId) !== String(id);
      })
    );
  } catch (err) {
    console.log(err);
    setError(err.message);
  }
};
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="p-10 flex-1">
        <h1 className="text-3xl font-bold mb-5 text-slate-900">Monthly Reports</h1>

        {/* DATE FILTER */}
        <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              const v = e.target.value;
              setEndDate(v);
              fetchReports(selectedDate, v);
            }}
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {["customer_no", "customer_name", "session", "total_liters", "total_amount", "milk_type", "date", "action"].map(
                    (key) => (
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600" key={key}>
                        {key === "action" ? (
                          <span>Action</span>
                        ) : (
                          <select
                            name={key}
                            value={filters[key]}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
                          >
                            <option value="">All {key}</option>

                            {[...new Set(reports.map((r) => r[key]))].map(
                              (val, i) => (
                                <option key={i} value={val}>
                                  {key === "total_amount" ? `₹${val}` : val}
                                </option>
                              )
                            )}
                          </select>
                        )}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, index) => {
                    const reportId = report.id ?? report.report_id ?? report.reportId ?? report._id;
                    return (
                      <tr key={reportId ?? index} className="border-t border-slate-100 even:bg-slate-50/60 hover:bg-slate-100/70 transition-colors">
                        <td className="px-4 py-3 text-slate-700">{report.customer_no}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {report.customer_name}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{report.session}</td>
                        
                        <td className="px-4 py-3 text-slate-700">{report.total_liters}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          ₹{report.total_amount}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{report.milk_type}</td>
                        <td className="px-4 py-3 text-slate-700">{report.date}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteReport(reportId)}
                            className="inline-flex items-center justify-center rounded-md bg-rose-100 px-1 py-0 text-xs font-semibold text-black-300 shadow-sm ring-1 ring-rose-100 transition hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* DOWNLOAD BUTTONS */}
        <div className="flex gap-4 mb-5 mt-6">
          <a
            href="http://127.0.0.1:8000/reports/csv"
            className="inline-flex items-center justify-center rounded-md border border-black bg-white px-2 py-0 text-sm font-semibold text-black transition hover:bg-orange-100"
          >
            Download CSV
          </a>

          <a
            href="http://127.0.0.1:8000/reports/excel"
            className="inline-flex items-center justify-center rounded-md border border-black bg-white px-2 py-0 text-sm font-semibold text-black transition hover:bg-pink-100"
          >
            Download Excel
          </a>

          <a
            href="http://127.0.0.1:8000/reports/pdf"
            className="inline-flex items-center justify-center rounded-md border border-black bg-white px-2 py-0 text-sm font-semibold text-black transition hover:bg-blue-100"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}