"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {

  const router = useRouter();

  useEffect(() => {

    const logoutUser = async () => {

      try {

        const token = localStorage.getItem("token");

        // Optional backend logout
        await fetch("http://127.0.0.1:8000/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      } catch (err) {

        console.log("Logout API error:", err);

      }

      // Clear frontend storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // Redirect to login
      router.push("/login");
    };

    logoutUser();

  }, [router]);

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white p-6 rounded shadow text-center">

        <h1 className="text-xl font-bold mb-2">
          Logging out...
        </h1>

        <p className="text-gray-500">
          Please wait
        </p>

      </div>

    </div>
  );
}