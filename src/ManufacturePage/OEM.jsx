import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { UserAppContext } from "../contexts/UserAppProvider";
import { Link } from "react-router-dom";

import ManufactureNavbar from "./ManufactureNavbar";

function OEM() {
    const { token: contextToken } = useContext(UserAppContext);
    const tkn = contextToken || localStorage.getItem("token");

    const [oems, setOems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPassword, setShowPassword] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(false);

    // ✅ Fetch OEMs
    const fetchOEMs = async () => {
        try {
            const response = await axios.post(
                "https://wemis-backend.onrender.com/wlp/fetchOEM",
                {},
                { headers: { Authorization: `Bearer ${tkn}` } }
            );
            setOems(response.data.oems || []);
            console.log("OEMs:", response.data);
        } catch (err) {
            console.error("Error fetching OEMs:", err.response || err);
            toast.error("Failed to fetch OEMs");
        }
    };

    useEffect(() => {
        if (tkn) fetchOEMs();
    }, [tkn]);

    // ✅ Delete OEM
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the OEM!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.post(
                        "https://wemis-backend.onrender.com/wlp/deleteOEM",
                        { oemId: id },
                        {
                            headers: {
                                Authorization: `Bearer ${tkn}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (response.status === 200) {
                        toast.success("OEM deleted successfully");
                        setOems((prev) => prev.filter((o) => o._id !== id));
                    } else {
                        toast.error("Error deleting OEM");
                    }
                } catch (error) {
                    toast.error("Delete failed");
                    console.error("Delete error:", error);
                }
            }
        });
    };

    // ✅ Toggle Password Visibility
    const togglePassword = (id) => {
        setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // ✅ Handle Edit
    const handleEditClick = async (id) => {
        setLoadingEdit(true);
        try {
            const response = await axios.post(
                "https://wemis-backend.onrender.com/wlp/findOEMById",
                { oemId: id },
                { headers: { Authorization: `Bearer ${tkn}` } }
            );

            if (response.data?.oem) {
                setEditData(response.data.oem);
                setIsEditModalOpen(true);
            } else {
                toast.error("Failed to fetch OEM details");
            }
        } catch (err) {
            console.error("Fetch edit error:", err);
            toast.error("Error loading OEM details");
        } finally {
            setLoadingEdit(false);
        }
    };

    // ✅ Handle Save
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "https://wemis-backend.onrender.com/wlp/editOEM",
                { ...editData, oemId: editData._id },
                { headers: { Authorization: `Bearer ${tkn}` } }
            );

            if (response.status === 200) {
                toast.success("OEM updated successfully");
                setIsEditModalOpen(false);
                fetchOEMs();
            } else {
                toast.error("Update failed");
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Error saving changes");
        }
    };

    // ✅ Handle Change
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files.length > 0) {
            setEditData((prev) => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
        } else {
            setEditData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // ✅ Filter
    const filteredOEMs = oems.filter((o) =>
        [o.oem_Name, o.email, o.mobile_Number]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-black min-h-screen text-gray-200">
            <ManufactureNavbar />

            {/* Header */}
            <div className="flex justify-between items-center bg-yellow-600 text-black px-4 py-3 rounded-t-xl mt-10 shadow-lg">
                <h2 className="text-lg font-semibold">OEM Management</h2>

                <button className="bg-black border border-yellow-500 px-4 py-2 rounded-lg text-yellow-400 hover:bg-yellow-500 hover:text-black transition">
                    + Create OEM
                </button>

            </div>

            <p className="text-gray-400 text-sm px-4 py-2">
                This table shows the list of all registered OEMs and their details
            </p>

            {/* Search */}
            <div className="flex justify-between items-center p-4">
                <input
                    type="text"
                    placeholder="Search by name, email or mobile..."
                    className="border border-yellow-500 bg-black text-yellow-400 rounded px-3 py-1 text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-gray-900 shadow rounded-b-xl border border-yellow-500">
                <table className="min-w-full text-left border-collapse">
                    <thead className="bg-yellow-600 text-black">
                        <tr>
                            {["#", "Logo", "Name", "Email", "Mobile", "Business", "Password", "Actions"].map((h, i) => (
                                <th key={i} className="px-4 py-2 border border-gray-700">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOEMs.length > 0 ? (
                            filteredOEMs.map((o, index) => (
                                <tr key={o._id} className={`${index % 2 === 0 ? "bg-black" : "bg-gray-800"} border-t border-gray-700`}>
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">
                                        <img
                                            src={o.logo || "https://via.placeholder.com/40"}
                                            alt="Logo"
                                            className="w-10 h-10 rounded border border-yellow-500"
                                        />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-yellow-400">{o.oem_Name}</td>
                                    <td className="px-4 py-2 text-yellow-300">{o.email}</td>
                                    <td className="px-4 py-2">{o.mobile_Number}</td>
                                    <td className="px-4 py-2">{o.business_Name}</td>
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <span>
                                            {showPassword[o._id]
                                                ? o.mobile_Number || "N/A"
                                                : "•".repeat(o.mobile_Number?.length || 6)}
                                        </span>
                                        <button
                                            onClick={() => togglePassword(o._id)}
                                            className="text-yellow-400 hover:text-yellow-300"
                                        >
                                            {showPassword[o._id] ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(o._id)}
                                                className="bg-yellow-500 p-2 rounded text-black hover:bg-yellow-400 transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(o._id)}
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
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    No OEMs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-[700px] max-h-[90vh] overflow-y-auto border border-yellow-500">
                        <h2 className="text-xl font-bold text-yellow-400 mb-6">
                            Edit OEM Details
                        </h2>

                        {loadingEdit ? (
                            <p className="text-gray-300">Loading...</p>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-8">
                                {/* OEM Basic Info */}
                                <div>
                                    <label className="block mb-1">OEM Name *</label>
                                    <input
                                        type="text"
                                        name="oem_Name"
                                        value={editData.oem_Name || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-black border border-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-black border border-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Mobile *</label>
                                    <input
                                        type="text"
                                        name="mobile_Number"
                                        value={editData.mobile_Number || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-black border border-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Business *</label>
                                    <input
                                        type="text"
                                        name="business_Name"
                                        value={editData.business_Name || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-black border border-yellow-500"
                                    />
                                </div>

                                {/* Logo */}
                                <div>
                                    <label className="block mb-1">Logo</label>
                                    <input
                                        type="file"
                                        name="logo"
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-black border border-yellow-500"
                                    />
                                    {editData.logo && (
                                        <img
                                            src={editData.logo}
                                            alt="Logo"
                                            className="mt-2 w-24 h-24 rounded object-cover border border-yellow-500"
                                        />
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OEM;
