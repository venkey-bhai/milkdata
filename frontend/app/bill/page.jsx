'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BillDetailPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');

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
        console.log("API Response:", data);
        
        if (!data.success) {
          throw new Error(data.detail || 'Bill not found');
        }
        setBill(data.data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

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
          <p>Loading bill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl bg-white p-6 shadow" id="invoice">
        <h1 className="text-center text-2xl font-bold mb-4">SALES INVOICE</h1>

        <div className="mb-4">
          <p>
            <b>Customer:</b> {bill.customer_name}
          </p>
          <p>
            <b>Date:</b> {bill.bill_date}
          </p>
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
            {bill.items?.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{item.rate}</td>
                <td className="border p-2">{item.quantity * item.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4 font-bold text-lg">
          Total: ₹{bill.total_amount}
        </div>
      </div>
    </div>
  );
}
