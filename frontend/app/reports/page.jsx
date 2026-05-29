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
          (!filters.customer_id ||
            String(report.customer_id) === String(filters.customer_id)) &&
          (!filters.customer_name ||
            report.customer_name === filters.customer_name) &&
          (!filters.session || report.session === filters.session) &&
          (!filters.total_liters ||
            String(report.total_liters) === filters.total_liters) &&
          (!filters.total_amount ||
            String(report.total_amount) === filters.total_amount) &&
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
        <h1 className="text-3xl font-bold mb-5">Monthly Reports</h1>

        {/* DATE FILTER */}
        <div className="mb-5 flex gap-4">
  {/* From Date */}
  <input
    type="date"
    value={selectedDate}
    onChange={handleDateChange}
    className="p-3 border rounded-lg"
  />

  {/* To Date */}
  <input
    type="date"
    value={endDate}
    onChange={(e) => {
      const v = e.target.value;
      setEndDate(v);
      fetchReports(selectedDate, v);
    }}
    className="p-3 border rounded-lg"
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
          <div className="bg-white p-5 rounded shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {["customer_id", "customer_name", "session", "total_liters", "total_amount", "date","action"].map(
                    (key) => (
                      <th className="p-2" key={key}>
                        {key === "action" ? (
                          <span>Action</span>
                        ) : (
                          <select
                            name={key}
                            value={filters[key]}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
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
                      <tr key={reportId ?? index} className="border-t hover:bg-gray-50">
                        <td className="p-3">{report.customer_id}</td>
                        <td className="p-3 font-medium">
                          {report.customer_name}
                        </td>
                        <td className="p-3">{report.session}</td>
                        <td className="p-3">{report.total_liters}</td>
                        <td className="p-3 text-green-600 font-semibold">
                          ₹{report.total_amount}
                        </td>
                        <td className="p-3">{report.date}</td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteReport(reportId)}
                            className="w-full bg-red-600 text-white p-3 rounded hover:bg-blue-700 transition"
                          >
                            delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-5 text-center text-gray-500"
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
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download CSV
          </a>

          <a
            href="http://127.0.0.1:8000/reports/excel"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download Excel
          </a>

          <a
            href="http://127.0.0.1:8000/reports/pdf"
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}