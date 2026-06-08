'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BillDetailPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`http://127.0.0.1:8000/sales/bill/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unable to load bill');
        }
        return res.json();
      })
      .then((data) => {
        if (!data.success) {
          throw new Error(data.detail || 'Bill not found');
        }
        setBill(data.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl bg-white p-6 shadow">
          <p>Loading bill...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl bg-white p-6 shadow">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl bg-white p-6 shadow">
          <p>No bill found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div id="invoice" className="bg-white p-6 shadow">
        <h1 className="text-center text-2xl font-bold mb-4">SALES INVOICE</h1>

        <div className="mb-4">
          <p><strong>Customer:</strong> {bill.customer_name}</p>
          <p><strong>Date:</strong> {bill.bill_date}</p>
          <p><strong>Rate per liter:</strong> ₹{bill.rate_perliter}</p>
        </div>

        <table className="w-full border">
          <thead> 
            <tr className="bg-gray-200">
              <th className="border p-2">Product</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items?.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">₹{item.rate}</td>
                <td className="border p-2">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4 font-bold text-lg">
          Total: ₹{bill.total_amount}
        </div>

        <button
          onClick={() => window.print()}
          className="mt-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 print:hidden"
        >
          Print Bill
        </button>
      </div>
    </div>
  </div>
  );
}
