
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Navbar";


export default function LoanPage() {

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] =useState(false);
  const [error, setError] =useState("");
  const [selectedLoan, setSelectedLoan] =useState(null);
  const [customerNo,setCustomerNo] =    useState("");


  const [form, setForm] =
    useState({
      milk_sale_amount: "",
      deduct_amount: "",
    });
const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

  // Fetch Loans
  const fetchLoans = async () => { 
      setLoading(true);
      setError("");

      try {
        // const url = customerNo
        //   ? `${API}/loans/${customerNo}`
        //   : `${API}/loans`;

        const res =
          await fetch(`http://127.0.0.1:8000/loan`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

        if (!res.ok) {
          throw new Error();
        }

        const result = await res.json();

        setLoans(result || []);
      } catch (err) {
        console.error(err); 
        setError(
          "Failed to load loans"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Deduct Loan
  const deductLoan = async () => {
      if (!selectedLoan) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API}/${selectedLoan.id}/deduct`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            milk_sale_amount: Number(form.milk_sale_amount),
            deduct_amount: Number(form.deduct_amount),
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.detail || "Failed to update loan");
        }

        alert("Loan Updated Successfully");

        setSelectedLoan(null);
        setForm({
          milk_sale_amount: "",
          deduct_amount: "",
        });

        await fetchLoans();
      } catch (err) {
        console.error(err);
        const message = err?.message || "Failed to update loan";
        setError(message);
        alert(message);
      } finally {
        setLoading(false);
      }
    };

  const formatCurrency =
    (amount) =>
      new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
        }
      ).format(
        amount || 0
      );

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1 p-6">

        <div className="max-w-7xl mx-auto space-y-6">

          <div className="flex justify-between items-center">

            <h1 className="text-3xl font-bold text-gray-800">

              Loan Management

            </h1>

            <button
              onClick={
                fetchLoans
              }
              className="border border-black px-4 py-2 rounded hover:bg-gray-100"
            >
              Refresh
            </button>

          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded">
              {error}
            </div>
          )}
          <div className="bg-white rounded-xl shadow p-6">

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="p-4 text-center">
                        Customer
                      </th>
                      <th className="p-4 text-center">
                        Loan
                      </th>
                      <th className="p-4 text-center">
                        Deducted
                      </th>
                      <th className="p-4 text-center">
                        Balance
                      </th>
                      <th className="p-4 text-center">
                        Final Payable
                      </th>
                      <th className="p-4 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loans.length > 0 ? (
                     loans.map((loan) => (
                          <tr
                            key={
                              loan.id
                            }
                            className="border-b hover:bg-slate-50"
                          >
                            <td className="p-4 text-center">
                              {
                                loan.customer_no
                              }

                            </td>

                            <td className="p-4 text-center">
                              {formatCurrency(
                                loan.total_loan
                              )}
                            </td>

                            <td className="p-4 text-center">
                              {formatCurrency(
                                loan.deducted_amount
                              )}
                            </td>

                            <td className="p-4 text-center">
                              {formatCurrency(
                                loan.remaining_balance
                              )}
                            </td>

                            <td className="p-4 text-center">
                              {formatCurrency(
                                loan.final_payable
                              )}
                            </td>

                            <td className="p-4 text-center">
                              <button
                                onClick={() =>
                                  setSelectedLoan(
                                    loan
                                  )
                                }
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                              >
                                Deduct
                             </button>
                            </td>
                          </tr>
                        )
                     )
                    ) : (

                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-10 text-gray-500"
                        >
                          No Loan Records Found
                        </td>
                      </tr>
                    )}

                 </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLoan && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl w-[420px] p-6">

            <h2 className="text-xl font-bold mb-5">
              Deduct Loan
            </h2>

            <input
              type="number"
              placeholder="Milk Sale Amount"
              value={
                form.milk_sale_amount
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  milk_sale_amount:
                    e.target.value,
                })
              }
              className="w-full border rounded p-3 mb-4"
            />
            <input
              type="number"
              placeholder="Deduct Amount"
              value={
                form.deduct_amount
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  deduct_amount:
                    e.target.value,
                })
              }
              className="w-full border rounded p-3 mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={
                  deductLoan
                }
                disabled={
                  loading
                }
                className="bg-blue-600 text-white px-5 py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() =>
                  setSelectedLoan(
                    null
                  )
                }
                className="bg-gray-300 px-5 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

