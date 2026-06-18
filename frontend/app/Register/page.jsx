"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin"
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
  try {

    const response = await fetch(
      "http://127.0.0.1:8000/admin/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }
    );

    const data = await response.json();

    console.log("Backend response:", data);

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail)
      );
    console.log(err)  
    }

    setMessage("Admin registered successfully");

  } catch (err) {

    console.error(err);

    setMessage(err.message);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="bg-white p-8 rounded shadow w-[350px]">

        <h1 className="text-2xl font-bold mb-5 text-center">
          Admin Register
        </h1>

        {message && (
          <div className="bg-blue-100 text-blue-700 p-2 mb-4 rounded">
            {message}
          </div>
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full border p-3 mb-4 rounded"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-3 rounded pr-10"
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

        <button
          onClick={handleRegister}
          className="w-full rounded-lg border border-black bg-white p-3 text-sm font-semibold text-black transition hover:bg-gray-100"
        >
          Register
        </button>

        <button
          onClick={() => router.push("/login")}
          className="mt-4 w-full rounded-lg border border-black bg-white p-3 text-sm font-semibold text-black transition hover:bg-gray-100"
        >
          Login
        </button>

      </div>
    </div>
  );
}
