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

        <h1 className="text-3xl font-bold mb-5">
          Customer Management
        </h1>

        {/* SEARCH + ADD BUTTON */}
        <div className="flex items-center justify-between mb-5">

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 p-3 border rounded-lg"
          />

          <button
            onClick={() => setShowAddCustomer(true)}
            className="ml-4 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
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
          <div className="bg-white p-5 rounded shadow overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Cus.No</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">address</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3">{customer.customer_no}</td>
                      <td className="p-3 font-medium">{customer.name}</td>
                      <td className="p-3">{customer.phone}</td>
                       <td className="p-3">{customer.address}</td>
                      <td className="p-3">
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
                            className="rounded bg-blue-500 px-1 py-1 text-white hover:bg-blue-600 disabled:opacity-50"
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
                       

                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-5 text-center text-gray-500"
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
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-green-600 text-white rounded"
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