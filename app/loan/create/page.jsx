'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Navbar';

export default function CreateLoanPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  const [formData, setFormData] = useState({
    customer_no: '',
    total_loan: '',
  });

  const [report, setReport] = useState([]);
  const [reportCustomerNo, setReportCustomerNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Create Loan
  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      if (!formData.customer_no || !formData.total_loan) {
        throw new Error('Please fill all fields');
      }

      if (Number(formData.total_loan) < 0) {
        throw new Error('Loan cannot be negative');
      }

      const response = await fetch(`${API}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_no: formData.customer_no,
          total_loan: Number(formData.total_loan),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to create loan');
      }

      setSuccess(`Loan created successfully! ID: ${result.data.id}`);
      setFormData({
        customer_no: '',
        total_loan: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to create loan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Loan Report
  const handleGetReport = async (e) => {
    e.preventDefault();
    setLoadingReport(true);
    setError('');
    setReport([]);

    try {
      if (!reportCustomerNo) {
        throw new Error('Please enter customer number');
      }

      const response = await fetch(
        `${API}/report/${reportCustomerNo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch report');
      }

      setReport(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-600">Loan Management</h1>
            <p className="text-gray-600 mt-2">Create and manage loans</p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Loan Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Create New Loan
              </h2>

              <form onSubmit={handleCreateLoan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Number
                  </label>
                  <input
                    type="number"
                    name="customer_no"
                    value={formData.customer_no}
                    onChange={handleChange}
                    placeholder="Enter customer number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Loan Amount
                  </label>
                  <input
                    type="number"
                    name="total_loan"
                    value={formData.total_loan}
                    onChange={handleChange}
                    placeholder="Enter total loan amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {loading ? 'Creating...' : 'Create Loan'}
                </button>
              </form>
            </div>

            {/* Loan Report Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                View Loan Report
              </h2>

              <form onSubmit={handleGetReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Number
                  </label>
                  <input
                    type="number"
                    value={reportCustomerNo}
                    onChange={(e) => setReportCustomerNo(e.target.value)}
                    placeholder="Enter customer number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingReport}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  {loadingReport ? 'Loading...' : 'Get Report'}
                </button>
              </form>
            </div>
          </div>

          {/* Loan Report Table */}
          {report.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Loan Report for Customer {reportCustomerNo}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Loan ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Milk Sale Amount
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Deducted Amount
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Remaining Balance
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Final Payable
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((item) => (
                      <tr key={item.loan_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{item.loan_id}</td>
                        <td className="px-4 py-3 text-gray-700">₹{item.milk_sale}</td>
                        <td className="px-4 py-3 text-gray-700">₹{item.deducted}</td>
                        <td className="px-4 py-3 text-gray-700">₹{item.remaining}</td>
                        <td className="px-4 py-3 text-gray-700 font-semibold">
                          ₹{item.final_payable}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
