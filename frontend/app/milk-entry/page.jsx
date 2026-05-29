"use client";

import { useState,useEffect } from "react";
import Sidebar from "../../components/Navbar";


export default function MilkEntry() {
 const [formData, setFormData] = useState({
  customer_no: "",
  date: new Date().toISOString().split("T")[0],
  session: "",
  liters: "",
  rate: ""
});

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= CUS NO FROP DOWN FUNC =================  
  useEffect(() => {
  fetch("http://localhost:8000/customers")
    .then((res) => res.json())
    .then((data) => setCustomers(data))
    .catch((err) => console.log(err));
}, []);

  // ================= SUBMIT MILK ENTRY =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:8000/milk-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
  customer_no: Number(formData.customer_no),
  date: formData.date,
  session: formData.session,
  liters: parseFloat(formData.liters),
  rate: parseFloat(formData.rate)
})
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save milk entry");
      }

      setMessage("Milk entry saved successfully!");

      // reset form
      setFormData({
        customer_no: "",
        date: new Date().toISOString().split("T")[0],
        liters: "",
        rate: 30
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="p-10 flex-1">

        <h1 className="text-3xl font-bold mb-5">
          Milk Entry
        </h1>

        <div className="bg-white p-6 rounded shadow max-w-2xl">

          {/* Success Message */}
          {message && (
            <div className="bg-green-100 text-green-600 p-3 mb-4 rounded">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <select
              name="customer_no"
              value={formData.customer_no}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            >
              <option value="">Select Customer</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.customer_no}
                >
                  {customer.customer_no} - {customer.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />

            <input
              type="number"
              name="liters"
              placeholder="Quantity (liters)"
              value={formData.liters}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />
            {/* <input
                type="text"
                name="session"
                placeholder="Morning / Evening"
                value={formData.session}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              /> */}

              <select
              name="session"
              value={formData.session}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            >
              <option value="">Select Session</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
            
            <input
              type="number"
              name="rate"
              placeholder="30"
              value={formData.rate}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700"
            >
              Save Entry
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}