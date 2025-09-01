import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { UserAppContext } from "../contexts/UserAppProvider";
import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

function Wlplist() {
  const { token: contextToken } = useContext(UserAppContext);
  const tkn = contextToken || localStorage.getItem("token");

  const [wlps, setWlps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState({});

  // Fetch WLPs
  const fetchWlps = async () => {
    try {
      const response = await axios.post(
        "https://wemis-backend.onrender.com/admin/getAllWlp",
        {},
        { headers: { Authorization: `Bearer ${tkn}` } }
      );
      if (response.data?.wlps) {
        setWlps(response.data.wlps);
      }
    } catch (err) {
      console.error("Error fetching WLPs:", err.response || err);
      toast.error("Failed to fetch WLPs");
    }
  };

  useEffect(() => {
    if (tkn) fetchWlps();
  }, [tkn]);

  // Filter WLPs
  const filteredWlps = wlps.filter((wlp) =>
    [wlp.organizationName, wlp.email, wlp.mobileNumber]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Delete Handler
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the WLP permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            "https://wemis-backend.onrender.com/admin/deleteWlp",
            { wlpId: id },
            {
              headers: {
                Authorization: `Bearer ${tkn}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.status === 200) {
            toast.success("WLP deleted successfully");
            setWlps((prev) => prev.filter((wlp) => wlp._id !== id));
          } else {
            toast.error("Error deleting WLP");
          }
        } catch (error) {
          toast.error("Delete failed");
          console.error("Delete error:", error);
        }
      }
    });
  };

  // Toggle Password Visibility
  const togglePassword = (id) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 bg-black min-h-screen text-gray-200">
      <AdminNavbar />

      {/* Header Section */}
      <div className="flex justify-between items-center bg-yellow-600 text-black px-4 py-3 rounded-t-xl mt-36 shadow-lg">
        <h2 className="text-lg font-semibold">WLP Management</h2>
        <Link to={"/admin/createWlp"}>
          <button className="bg-black border border-yellow-500 px-4 py-2 rounded-lg text-yellow-400 hover:bg-yellow-500 hover:text-black transition">
            + Create WLP
          </button>
        </Link>
      </div>

      <p className="text-gray-400 text-sm px-4 py-2">
        This table shows the list of all registered WLPs and their details
      </p>

      {/* Search & Display Controls */}
      <div className="flex justify-between items-center p-4">
        <div>
          <label className="text-sm text-gray-400">Display</label>
          <select className="ml-2 border border-yellow-500 bg-black text-yellow-400 rounded px-2 py-1 text-sm">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <span className="text-sm ml-1">records per page</span>
        </div>
        <input
          type="text"
          placeholder="Search by name, email or mobile..."
          className="border border-yellow-500 bg-black text-yellow-400 rounded px-3 py-1 text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-gray-900 shadow rounded-b-xl border border-yellow-500">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-yellow-600 text-black">
            <tr>
              {[
                "#",
                "Logo",
                "Organization",
                "Email",
                "Mobile",
                "Country",
                "State",
                "Password",
                "Actions",
              ].map((h, i) => (
                <th key={i} className="px-4 py-2 border border-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredWlps.length > 0 ? (
              filteredWlps.map((wlp, index) => (
                <tr
                  key={wlp._id}
                  className={`${
                    index % 2 === 0 ? "bg-black" : "bg-gray-800"
                  } border-t border-gray-700`}
                >
                  <td className="px-4 py-2 border border-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-700">
                    <img
                      src={wlp.logo || "https://via.placeholder.com/40"}
                      alt="Logo"
                      className="w-10 h-10 rounded border border-yellow-500"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-yellow-400 border border-gray-700">
                    {wlp.organizationName}
                  </td>
                  <td className="px-4 py-2 text-yellow-300 border border-gray-700">
                    {wlp.email}
                  </td>
                  <td className="px-4 py-2 border border-gray-700">
                    {wlp.mobileNumber}
                  </td>
                  <td className="px-4 py-2 border border-gray-700">
                    {wlp.country}
                  </td>
                  <td className="px-4 py-2 border border-gray-700">
                    {wlp.state}
                  </td>
                  {/* Password Field */}
                  <td className="px-4 py-2 flex items-center gap-2 border-gray-700">
                    <span>
                      {showPassword[wlp._id]
                        ? wlp.mobileNumber || "N/A"
                        : "•".repeat(wlp.mobileNumber?.length || 6)}
                    </span>
                    <button
                      onClick={() => togglePassword(wlp._id)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      {showPassword[wlp._id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </td>


                   <td className="px-4 py-2  border border-gray-700">
                   <div className=" flex gap-2">
                     <button
                      onClick={() => toast.info("Edit functionality coming soon")}
                      className="bg-yellow-500 p-2 rounded text-black hover:bg-yellow-400 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(wlp._id)}
                      className="bg-red-500 p-2 rounded text-white hover:bg-red-400 transition"
                    >
                      <FaTrash />
                    </button>
                   </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No WLPs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Wlplist;
