"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("user"); // ✅ NEW
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= LOGIN FUNCTION =================
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const formData = new URLSearchParams();

      formData.append("username", username);
      formData.append("password", password);

      // ✅ Dynamic route based on dropdown
      const endpoint =
        role === "admin"
           ? "http://127.0.0.1:8000/admin/login"
           : "http://127.0.0.1:8000/login";
          // ? "https://gs75dhlh-8000.inc1.devtunnels.ms/admin/login"
          // : "https://gs75dhlh-8000.inc1.devtunnels.ms/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type":
             "application/x-www-form-urlencoded",  
        },
        body: formData,
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      // ================= STORE AUTH =================
      localStorage.setItem(
        "token",
        data.access_token
      );

      localStorage.setItem(
        "role",
        data.role
      );

      localStorage.setItem(
        "username",
        data.username
      );

      setSuccess("Login successful!");

      // ================= REDIRECT =================
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      console.log(err);
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow w-[350px]"
      >

        {/* ================= TITLE ================= */}
        <h1 className="text-2xl font-bold mb-5 text-center">
          {role === "admin"
            ? "Admin Login"
            : "User Login"}
        </h1>

        {/* ================= ROLE DROPDOWN ================= */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="user">
            User Login
          </option>

          <option value="admin">
            Admin Login
          </option>
        </select>

        {/* ================= ERROR ================= */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        {/* ================= SUCCESS ================= */}
        {success && (
          <div className="bg-green-100 text-green-600 p-2 mb-4 rounded text-sm">
            {success}
          </div>
        )}

        {/* ================= USERNAME ================= */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          autoComplete="username"
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="w-full border p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* ================= PASSWORD ================= */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM2 10a8 8 0 0111.955 6.656l-1.418-1.418A6 6 0 004.414 9.414l-1.418 1.418A7.963 7.963 0 002 10zm17.45-4.435a1 1 0 00-1.414-1.414l-14 14a1 1 0 101.414 1.414l14-14zM10 15a5 5 0 110-10 5 5 0 010 10z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* ================= LOGIN BUTTON ================= */}
        <button
          type="submit"
          className="w-full rounded-lg border border-black bg-white p-3 text-sm font-semibold text-black transition hover:bg-gray-100"
        >
          Login
        </button>

      </form>

    </div>
  );
}