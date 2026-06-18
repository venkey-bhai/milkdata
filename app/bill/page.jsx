'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function EditBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    bill_date: '',
    rate_perliter: '',
    session: '',
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- FETCH BILL ----------------
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const id = searchParams.get("id");
        console.log("ID from searchParams:", id);
        
        if (!id) {
          console.log("No ID found in URL");
          setLoading(false);
          setError("No bill ID provided");
          return;
        }
        
        console.log("Fetching bill with ID:", id);
        const res = await fetch(`http://127.0.0.1:8000/sales/bill/${id}`);
        const data = await res.json();
        
        console.log("API Response:", data);

        const bill = data.data;

        setFormData({
          customer_name: bill.customer_name || '',
          bill_date: bill.bill_date || '',
          rate_perliter: bill.rate_perliter || 0,
          session: bill.session || '',
          items: bill.items || [],
        });

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching bill:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBill();
  }, [searchParams]);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product_name: '', quantity: 0, rate: 0 },
      ],
    });
  };

  // ---------------- UPDATE BILL ----------------
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/sales/bill/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      console.log(JSON.stringify(formData, null, 2));
      if (data.success) {
        alert('Bill updated successfully');
        router.push('/sales');
      } else {
        alert('Update failed');
      }
    } catch (err) {
      console.log(err);
    }

    setSaving(false);
  };

  // ---------------- PRINT ----------------
  const handlePrint = () => {
    window.print();
  };

  // ---------------- UI ----------------
  if (loading) return <p className="p-5">Loading...</p>;
  if (error) return <p className="p-5 text-red-600">Error: {error}</p>;

 return (
  <div className="min-h-screen bg-slate-100 py-8 px-4">

    {/* Invoice Container */}
    <div
      id="invoice"
      className="max-w-4xl mx-auto bg-white shadow border p-8 print:shadow-none print:border-none"
    >

      {/* Hide while printing */}
      <div className="no-print mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Edit Bill
        </h1>
        <p className="text-gray-500">
          Update customer billing details
        </p>
      </div>

      <form onSubmit={handleSave}>

        {/* Customer Section */}
        <div className="grid grid-cols-3 gap-6 mb-8 print:grid-cols-2">

          <div>
            <label className="block text-sm font-semibold mb-2 no-print">
              Customer Name
            </label>

            <input
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded no-print"
            />

            {/* Print */}
            <p className="hidden print:block font-semibold">
              Customer: {formData.customer_name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 no-print">
              Bill Date
            </label>

            <input
              type="date"
              name="bill_date"
              value={formData.bill_date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded no-print"
            />

            <p className="hidden print:block">
              Date: {formData.bill_date}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 no-print">
              Session
            </label>

            <select
              name="session"
              value={formData.session}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded no-print"
            >
              <option>Morning</option>
              <option>Evening</option>
            </select>

            <p className="hidden print:block">
              Session: {formData.session}
            </p>
          </div>
        </div>

        {/* Print Title */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-3xl font-bold">
            SALES INVOICE
          </h1>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border">

          <thead>
            <tr className="bg-gray-100">

              <th className="border p-2">
                Product
              </th>

              <th className="border p-2">
                Qty
              </th>

              <th className="border p-2">
                Rate
              </th>

              <th className="border p-2">
                Amount
              </th>

            </tr>
          </thead>

         <tbody>
  {formData.items.map((item, index) => (
    <tr key={index}>

      {/* Product */}
      <td className="border p-2">
        <input
          value={item.product_name}
          onChange={(e) =>
            handleItemChange(
              index,
              "product_name",
              e.target.value
            )
          }
          className="w-full print:hidden"
        />

        <div className="hidden print:block">
          {item.product_name}
        </div>
      </td>

      {/* Quantity */}
      <td className="border p-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            handleItemChange(
              index,
              "quantity",
              e.target.value
            )
          }
          className="w-full print:hidden"
        />

        <div className="hidden print:block">
          {item.quantity}
        </div>
      </td>

      {/* Rate */}
      <td className="border p-2">
        <input
          type="number"
          value={item.rate}
          onChange={(e) =>
            handleItemChange(
              index,
              "rate",
              e.target.value
            )
          }
          className="w-full print:hidden"
        />

        <div className="hidden print:block">
          ₹{item.rate}
        </div>
      </td>

      {/* Amount */}
      <td className="border p-2">
        ₹{Number(item.quantity || 0) * Number(item.rate || 0)}
      </td>

    </tr>
  ))}
</tbody>
        </table>

        {/* Total */}
        <div className="text-right mt-4 font-bold text-lg">
          Total: ₹
          {formData.items.reduce(
            (sum, item) =>
              sum + item.quantity * item.rate,
            0
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8 no-print">

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            {saving
              ? "Saving..."
              : "Save"}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Print
          </button>

        </div>

      </form>

    </div>

  </div>
);
}