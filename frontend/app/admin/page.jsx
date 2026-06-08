"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Navbar";

const parseResponseData = async (response) => {
  const contentType = response.headers.get("content-type") || "";

 

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeUsers = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export default function Admin() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= CREATE USER MODAL =================
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [creating, setCreating] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    console.log("Stored token:", token);
    

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/admin/users", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const data = await parseResponseData(response);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to fetch users");
      }

      setUsers(normalizeUsers(data));
    } catch (err) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE USER =================
  const createUser = async (e) => {
    e.preventDefault();

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username") || "";
      const adminUsername = window.prompt(
        "Enter admin username:",
        storedUsername
      );


    // Debug logs
    console.log("token:", token);
    console.log("adminUsername:", adminUsername);

      if (!token || !adminUsername) {
        router.push("/login");
        return;
      }

      const adminPassword = window.prompt(
        "Enter admin password:"
      );

       if (!adminUsername || !adminPassword) {
        setError("Admin credentials required");
        return;
      }


      const response = await fetch(
        `http://127.0.0.1:8000/admin/create-user?admin_username=${adminUsername}&admin_password=${adminPassword}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await parseResponseData(response);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to create user");
      }

      // RESET FORM
      setFormData({
        username: "",
        password: "",
        role: "user",
      });

      // CLOSE MODAL
      setShowModal(false);

      // REFRESH USERS
      fetchUsers();

    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

 

  // ================= DELETE USER =================
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username") || "";
      const adminUsername = window.prompt(
        "Enter admin username:",
        storedUsername
      );

      if (!token) {
        setError("Please log in again.");
        router.push("/login");
        return;
      }
      const adminPassword = window.prompt(
        "Enter admin password:"
      );

      if (!adminUsername || !adminPassword) {
        setError("Admin credentials required");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/admin/delete-user/${id}?admin_username=${encodeURIComponent(
          adminUsername
        )}&admin_password=${encodeURIComponent(adminPassword)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        
        }
      );

      const data = await parseResponseData(response);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));

    } catch (err) {
      setError(err.message || "Failed to delete user.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="p-10 flex-1">
          <h1 className="text-3xl font-bold mb-5">
            Admin Panel
          </h1>

          <div className="bg-white p-5 rounded shadow">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                User & Role Management
              </h2>

              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              >
                + Create User
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">
                {error}
              </div>
            )}

            {/* TABLE */}
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">ID</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-3">{user.id}</td>

                        <td className="p-3">
                          {user.username}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-white text-sm ${
                              user.role === "admin"
                                ? "bg-red-500"
                                : user.role === "milk_entry"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-5 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ================= MODAL ================= */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">

              <h2 className="text-2xl font-bold mb-5">
                Create User
              </h2>

              <form onSubmit={createUser} className="space-y-4">

                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                  className="w-full border p-3 rounded"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full border p-3 rounded"
                  required
                />

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                    })
                  }
                  className="w-full border p-3 rounded"
                >
                  <option value="user">User</option>
                 
                  <option value="admin">Admin</option>
                </select>

                <div className="flex justify-end gap-3 pt-3">

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>

                </div>
              </form>
            </div>  
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}