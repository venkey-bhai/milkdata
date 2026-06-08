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

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create bill"
        );
      }

      alert("Bill created successfully");

      setFormData({
        customer_name: "",
        bill_date: "",
        rate_perliter: "",
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

            {/* <input
              type="number"
              name="rate_perliter"
              placeholder="Rate Per Liter"
              value={formData.rate_perliter}
              onChange={handleInputChange}
              required
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            /> */}
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
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              Add Item
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
            >
              Create Bill
            </button>
           </div>
        </form>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">
          All Bills
        </h2>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
  <thead>
    <tr className="bg-gray-200">
      <th className="border px-4 py-2">Bill ID</th>
      <th className="border px-4 py-2">Customer</th>
      <th className="border px-4 py-2">Date</th>
      <th className="border px-4 py-2">Product</th>
      <th className="border px-4 py-2">Quantity</th>
      <th className="border px-4 py-2">Rate</th>
      <th className="border px-4 py-2">Amount</th>
      <th className="border px-4 py-2">Actions</th>
    </tr>
  </thead>

  <tbody>
    {sales.map((row) => (
      <tr key={`${row.id}-${row.product_name}`}>
        <td className="border px-4 py-2">{row.id}</td>
        <td className="border px-4 py-2">{row.customer_name}</td>
        <td className="border px-4 py-2">{row.bill_date}</td>
        <td className="border px-4 py-2">{row.product_name}</td>
        <td className="border px-4 py-2">{row.quantity}</td>
        <td className="border px-4 py-2">₹{row.rate}</td>
        <td className="border px-4 py-2">₹{row.amount}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => router.push(`/bill/${row.id}`)}
            className="mr-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            View
          </button>
          <button
            onClick={() => deleteReport(row.id)}
            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
          >
            Delete
          </button>
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