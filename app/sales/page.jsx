"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from 'next/navigation';



export default function Sales() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  

  const [formData, setFormData] = useState({
    customer_name: "",
    bill_date: "",
    rate_perliter: "",
     session: "",
    items: [
      {
        product_name: "",
        quantity: "",
        rate: "",
      },
    ],
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;
  const router = useRouter();

  const getSessionValue = (row) => row.session ?? row.session_name ?? row.shift ?? "N/A";

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);

     const token = localStorage.getItem("token");

    //   let url = "http://127.0.0.1:8000/bills";

    //   const response = await fetch(`${API_URL}/sales/bills`
      const response = await fetch("http://127.0.0.1:8000/sales/sales-report", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log(data.data[0]);

      if (data.success) {
        setBills(data.data);
        setSales(data.data);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_name: "",
          quantity: "",
          rate: "",
        },
      ],
    });
  };

  const createBill = async (e) => {
    e.preventDefault();

    try {

        const token = localStorage.getItem("token");

      const payload = {
        customer_name: formData.customer_name,
        bill_date: formData.bill_date,
        rate_perliter: Number(formData.rate_perliter),
        session: formData.session,
        items: formData.items.map((item) => ({
          product_name: item.product_name,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      };

     const response = await fetch("http://127.0.0.1:8000/sales/create-bill",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log(data.data[0]);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create bill"
        );
      }

      alert("Bill created successfully");

      setFormData({
        customer_name: "",
        bill_date: "",
        session: "",
        // rate_perliter: "",
        items: [
          {
            product_name: "",
            quantity: "",
            rate: "",
          },
        ],
      });

      fetchBills();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/sales/bill/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBills();
      }
    } catch (error) {
      console.error(error);
    }
  };


  const deleteReport = async (bill_id) => {
  
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    try {
      console.log("Deleting bill id:", bill_id);
      const token = localStorage.getItem("token");

    const response = await fetch(
      `http://127.0.0.1:8000/sales/bill/${bill_id}`,
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
      <div className="p-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Sales Billing
          </h1>
        </div>
      {/* Create Bill Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <form onSubmit={createBill}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              name="customer_name"
              placeholder="Customer Name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <input
              type="date"
              name="bill_date"
              value={formData.bill_date}
              onChange={handleInputChange}
              required
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

             <select
              name="session"
              value={formData.session}
              onChange={handleInputChange}
              className="w-full p-3 border rounded"
              required
            >
              <option value="">Select Session</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div> 

          <h3 className="text-xl font-semibold mb-4">
            Bill Items
          </h3>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg p-4 bg-gray-50"
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={item.product_name}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "product_name",
                      e.target.value
                    )
                  }
                  required
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                  required
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "rate",
                      e.target.value
                    )
                  }
                  required
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border border-black bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              Add Item
            </button>

            <button
              type="submit"
              className="rounded-lg border border-black bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              Create Bill
            </button>
           </div>
        </form>
      </div>

      {/* Bills Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">
          All Bills
        </h2>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
  <thead>
    <tr className="bg-slate-50 text-left">
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Bill ID</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Customer</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Product</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Quantity</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Rate</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Amount</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Session</th>
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
    </tr>
  </thead>

  <tbody>
    {sales.map((row) => (
      <tr key={`${row.id}-${row.product_name}`} className="border-t border-slate-100 even:bg-slate-50/60 hover:bg-slate-100/70 transition-colors">
        <td className="px-4 py-3 text-slate-700">{row.id}</td>
        <td className="px-4 py-3 text-slate-900">{row.customer_name}</td>
        <td className="px-4 py-3 text-slate-700">{row.bill_date}</td>
        <td className="px-4 py-3 text-slate-700">{row.product_name}</td>
        <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
        <td className="px-4 py-3 text-slate-700">₹{row.rate}</td>
        <td className="px-4 py-3 text-slate-700">₹{row.amount}</td>
        <td className="px-4 py-3 text-slate-700">{getSessionValue(row)}</td>
        <td className="px-4 py-3 text-slate-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
              router.push(`/bill/?id=${row.id}&session=${encodeURIComponent(getSessionValue(row))}`)
              }
              className="rounded-md border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100"
            >
              View
            </button>
            <button
              onClick={() => deleteReport(row.id)}
              className="rounded-md border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          </div>
        )}
      </div>
    </div>
  </div>
);
}