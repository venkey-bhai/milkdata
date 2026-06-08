"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Navbar";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalMilk: 0,
    monthlyRevenue: 0,
    totalBills: 0,
    totalSalesRevenue: 0,
  });

  const [sessionStats, setSessionStats] = useState({
    morning: {
      milk: 0,
      revenue: 0,
      bills: 0,
      salesRevenue: 0,
    },
    evening: {
      milk: 0,
      revenue: 0,
      bills: 0,
      salesRevenue: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // ================= API CALLS =================
      const [customersRes, reportsRes, salesRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/customers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://127.0.0.1:8000/reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://127.0.0.1:8000/sales/sales-report", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const customersData = await customersRes.json();
      const reportsData = await reportsRes.json();
      const salesData = await salesRes.json();

      // ================= SAFE DATA EXTRACTION =================
      const customers = Array.isArray(customersData)
        ? customersData
        : customersData.data || [];

      const reports = Array.isArray(reportsData)
        ? reportsData
        : reportsData.data || [];

      const sales = Array.isArray(salesData?.data)
        ? salesData.data
        : Array.isArray(salesData)
        ? salesData
        : [];

      // ================= CALCULATIONS =================
      const totalCustomers = customers.length;

      const totalMilk = reports.reduce(
        (sum, report) => sum + Number(report.total_liters || 0),
        0
      );

      const monthlyRevenue = reports.reduce(
        (sum, report) => sum + Number(report.total_amount || 0),
        0
      );

      // Get unique bills count
      const uniqueBills = sales && Array.isArray(sales) 
        ? new Set(sales.map((item) => item.id)).size 
        : 0;

      // Calculate total sales amount
      const totalSalesRevenue = sales && Array.isArray(sales)
        ? sales.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          )
        : 0;

      // ================= SESSION-WISE CALCULATIONS =================
      const morningMilk = reports
        .filter((r) => r.session && r.session.toLowerCase() === "morning")
        .reduce((sum, r) => sum + Number(r.total_liters || 0), 0);

      const eveningMilk = reports
        .filter((r) => r.session && r.session.toLowerCase() === "evening")
        .reduce((sum, r) => sum + Number(r.total_liters || 0), 0);

      const morningRevenue = reports
        .filter((r) => r.session && r.session.toLowerCase() === "morning")
        .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

      const eveningRevenue = reports
        .filter((r) => r.session && r.session.toLowerCase() === "evening")
        .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

      // Count morning/evening bills and calculate revenue
      const morningBills = sales && Array.isArray(sales)
        ? new Set(
            sales
              .filter((s) => s.session && s.session.toLowerCase() === "morning")
              .map((s) => s.id)
          ).size
        : 0;

      const eveningBills = sales && Array.isArray(sales)
        ? new Set(
            sales
              .filter((s) => s.session && s.session.toLowerCase() === "evening")
              .map((s) => s.id)
          ).size
        : 0;

      const morningSalesRevenue = sales && Array.isArray(sales)
        ? sales
            .filter((s) => s.session && s.session.toLowerCase() === "morning")
            .reduce((sum, s) => sum + Number(s.amount || 0), 0)
        : 0;

      const eveningSalesRevenue = sales && Array.isArray(sales)
        ? sales
            .filter((s) => s.session && s.session.toLowerCase() === "evening")
            .reduce((sum, s) => sum + Number(s.amount || 0), 0)
        : 0;

      // ================= UPDATE STATE =================
      setStats({
        totalCustomers,
        totalMilk,
        monthlyRevenue,
        totalBills: uniqueBills,
        totalSalesRevenue,
      });

      setSessionStats({
        morning: {
          milk: morningMilk,
          revenue: morningRevenue,
          bills: morningBills,
          salesRevenue: morningSalesRevenue,
        },
        evening: {
          milk: eveningMilk,
          revenue: eveningRevenue,
          bills: eveningBills,
          salesRevenue: eveningSalesRevenue,
        },
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="p-10 flex-1">

          <h1 className="text-3xl font-bold mb-8">
            Dashboard
          </h1>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 mb-5 rounded">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <p className="text-gray-600">Loading dashboard...</p>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* TOTAL CUSTOMERS */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Total Customers
                </h2>

                <p className="text-4xl font-bold text-blue-600">
                  {stats.totalCustomers}
                </p>
              </div>

              {/* TOTAL MILK */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Milk Collected
                </h2>

                <p className="text-4xl font-bold text-green-600">
                  {stats.totalMilk.toFixed(2)} L
                </p>
              </div>

              {/* MONTHLY REVENUE */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Monthly Revenue
                </h2>

                <p className="text-4xl font-bold text-purple-600">
                  ₹{stats.monthlyRevenue.toFixed(2)}
                </p>
              </div>

              {/* TOTAL BILLS */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Total Bills Sold
                </h2>

                <p className="text-4xl font-bold text-orange-600">
                  {stats.totalBills}
                </p>
              </div>

              {/* TOTAL SALES REVENUE */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Sales Revenue
                </h2>

                <p className="text-4xl font-bold text-red-600">
                  ₹{(stats.totalSalesRevenue || 0).toFixed(2)}
                </p>
              </div>

            </div>
          )}

 {/* ================= SESSION-WISE REPORTS ================= */}
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">
                      Session-Wise Reports
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* MORNING SESSION */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow">
                        <h3 className="text-xl font-bold text-orange-700 mb-4">
                          🌅 Morning Session
                        </h3>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Milk Collected</span>
                            <span className="text-lg font-semibold text-orange-600">
                              {sessionStats.morning.milk.toFixed(2)} L
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Milk Revenue</span>
                            <span className="text-lg font-semibold text-orange-600">
                              ₹{sessionStats.morning.revenue.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Bills Sold</span>
                            <span className="text-lg font-semibold text-orange-600">
                              {sessionStats.morning.bills}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sales Revenue</span>
                            <span className="text-lg font-semibold text-orange-600">
                              ₹{sessionStats.morning.salesRevenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* EVENING SESSION */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow">
                        <h3 className="text-xl font-bold text-purple-700 mb-4">
                          🌙 Evening Session
                        </h3>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Milk Collected</span>
                            <span className="text-lg font-semibold text-purple-600">
                              {sessionStats.evening.milk.toFixed(2)} L
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Milk Revenue</span>
                            <span className="text-lg font-semibold text-purple-600">
                              ₹{sessionStats.evening.revenue.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Bills Sold</span>
                            <span className="text-lg font-semibold text-purple-600">
                              {sessionStats.evening.bills}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sales Revenue</span>
                            <span className="text-lg font-semibold text-purple-600">
                              ₹{sessionStats.evening.salesRevenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                    </div>
      </div>
    </ProtectedRoute>
  );
}