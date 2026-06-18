"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Navbar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);

  // ===== ADD CUSTOMER MODAL =====
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    customer_no: "",
    name: "",
    phone: "",
    address: "",
    milk_type: "",
    price_per_liter: ""
  });

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:8000/customers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch customers");
      }

      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD CUSTOMER =================
  const handleChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCustomer = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:8000/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCustomer)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add customer");
      }

      alert("Customer added successfully");

      setNewCustomer({
        customer_no: "",
        name: "",
        phone: "",
        address: "",
        milk_type: "",
        price_per_liter: ""
      });

      setShowAddCustomer(false);

      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= DELETE CUSTOMER =================
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure to delete this customer?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/customer/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        );
      }

      alert("Customer deleted successfully");
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= EDIT CUSTOMER =================
  const handleEdit = async (customer) => {
    const newName = prompt("Enter new customer name", customer.name);
    const newPhone = prompt("Enter new customer phone", customer.phone);
    const newcustomer_no = prompt("Enter new customer no", customer.customer_no);
    const newaddress = prompt("Enter new customer address", customer.address);

    if (!newName) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/customer/${customer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            customer_no: newcustomer_no,
            name: newName,
            phone: newPhone,
            address: newaddress,
            milk_type: customer.milk_type,
            price_per_liter: customer.price_per_liter,
            status: customer.status ?? (customer.is_active ? "active" : "inactive")
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Update failed");
      }

      alert("Customer updated successfully");
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (customer) => {
    const token = localStorage.getItem("token");
    const currentStatus =
      customer.status?.toString().toLowerCase() === "active" ||
      customer.is_active === true;
    const updatedStatus = currentStatus ? "inactive" : "active";

    setStatusUpdating(customer.id);

    try {
      const response = await fetch(
        // `http://127.0.0.1:8000/customer/${customer.id}`,
        `http://127.0.0.1:8000/customer/${customer.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            customer_no: customer.customer_no,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            milk_type: customer.milk_type,
            price_per_liter: customer.price_per_liter,
            status: updatedStatus,
            is_active: updatedStatus === "active"
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to update status");
      }

      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ================= FILTER =================
  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="p-10 flex-1">

        <h1 className="text-3xl font-bold mb-5 text-slate-900">
          Customer Management
        </h1>

        {/* SEARCH + ADD BUTTON */}
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          />

          <button
            onClick={() => setShowAddCustomer(true)}
            className="ml-4 inline-flex items-center justify-center rounded-lg border border-black bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
          >
            + Add Customer
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="p-5">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

            <table className="w-full border-collapse text-sm">

              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Cus.No</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Address</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-slate-100 even:bg-slate-50/60 hover:bg-slate-100/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-700">{customer.customer_no}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                      <td className="px-4 py-3 text-slate-700">{customer.phone}</td>
                       <td className="px-4 py-3 text-slate-700">{customer.address}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              customer.status?.toString().toLowerCase() === "active" ||
                              customer.is_active === true
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {customer.status
                              ? customer.status
                              : customer.is_active === true
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <button
                            onClick={() => handleToggleStatus(customer)}
                            disabled={statusUpdating === customer.id}
                            className="inline-flex w-fit items-center rounded-md border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusUpdating === customer.id
                              ? "Updating..."
                              : customer.status?.toString().toLowerCase() === "active" ||
                                customer.is_active === true
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                       

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                            className="inline-flex items-center justify-center rounded-md border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                            className="inline-flex items-center justify-center rounded-md border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        >
                          Delete
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
        )}
      </div>

      {/* ================= ADD CUSTOMER MODAL ================= */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-[400px]">

            <h2 className="text-xl font-bold mb-4">
              Add Customer
            </h2>

             <input
              name="customer_no"
              placeholder="customer_no"
              value={newCustomer.customer_no}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              name="name"
              placeholder="Name"
              value={newCustomer.name}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              name="phone"
              placeholder="Phone"
              value={newCustomer.phone}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              name="address"
              placeholder="Address"
              value={newCustomer.address}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              name="milk_type"
              placeholder="Milk Type"
              value={newCustomer.milk_type}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              name="price_per_liter"
              placeholder="Price per liter"
              value={newCustomer.price_per_liter}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setShowAddCustomer(false)}
                className="rounded-md border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleAddCustomer}
                className="rounded-md border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                Save
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}