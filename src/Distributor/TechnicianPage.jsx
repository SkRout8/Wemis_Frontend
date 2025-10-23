import React, { useState } from "react";
import { PlusCircle, User, Phone, Mail, Wrench, Trash2, Edit, X } from "lucide-react";
import DistributorNavbar from "./DistributorNavbar";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ADD_TECHNICIAN_API = "https://your-backend-api.com/technicians";

const TechnicianPage = () => {
  const [technicians, setTechnicians] = useState([
    {
      id: 1,
      name: "Ramesh Das",
      email: "ramesh@example.com",
      phone: "+91 9876543210",
      role: "Senior Technician",
    },
    {
      id: 2,
      name: "Suresh Patra",
      email: "suresh@example.com",
      phone: "+91 9876509876",
      role: "Technician",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    distributor: "",
    dealer: "",
    name: "",
    gender: "",
    email: "",
    phone: "",
    aadhar: "",
    dob: "",
    qualification: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      const response = await axios.post(ADD_TECHNICIAN_API, formData);
      setTechnicians((prev) => [...prev, response.data]);
      toast.success("Technician added successfully!");
      setIsModalOpen(false);
      setFormData({
        distributor: "",
        dealer: "",
        name: "",
        gender: "",
        email: "",
        phone: "",
        aadhar: "",
        dob: "",
        qualification: "",
      });
    } catch (error) {
      toast.error("Failed to add technician!");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <DistributorNavbar />

      <div className="min-h-screen bg-black text-yellow-400 px-4 py-8 md:px-8 -mt-[5px]">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-yellow-400/30 pb-4 mb-8 gap-4">
          <h1 className="text-2xl font-bold tracking-wide uppercase flex items-center gap-3">
            <Wrench className="text-yellow-400" /> Technician List
          </h1>
          <button
            className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-300 shadow hover:shadow-yellow-400 transition"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} /> Add Technician
          </button>
        </div>

        <div className="mb-2 text-yellow-300 italic text-base">
          It shows the list of technician and their details
        </div>

        <div className="overflow-x-auto bg-neutral-900 border border-yellow-400/20 rounded-lg shadow-lg">
          <table className="w-full text-sm text-left text-yellow-300">
            <thead className="bg-yellow-400 text-black uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Contact No</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {technicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-yellow-500 text-lg font-semibold">
                    No technicians found.
                  </td>
                </tr>
              ) : (
                technicians.map((tech, idx) => (
                  <tr key={tech.id} className="border-b border-yellow-400/10 hover:bg-yellow-400/10 transition">
                    <td className="px-5 py-3">{idx + 1}</td>
                    <td className="px-5 py-3 flex items-center gap-2">
                      <User size={16} /> {tech.name}
                    </td>
                    <td className="px-5 py-3 flex items-center gap-2">
                      <Mail size={16} />
                      <a
                        href={`mailto:${tech.email}`}
                        className="underline hover:text-yellow-500 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tech.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 flex items-center gap-2">
                      <Phone size={16} /> {tech.phone}
                    </td>
                    <td className="px-5 py-3">{tech.role}</td>
                    <td className="px-5 py-3 flex items-center justify-center gap-3">
                      <button className="p-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between text-yellow-300 text-sm">
          <div>
            Showing {technicians.length} {technicians.length === 1 ? "entry" : "entries"}
          </div>
          <div className="flex gap-2 items-center mt-2 md:mt-0">
            <button className="px-3 py-1 rounded border border-yellow-400/40 bg-neutral-900 text-yellow-400 font-semibold disabled:opacity-50" disabled>
              Previous
            </button>
            <span className="px-3 py-1 rounded border border-yellow-400/30 bg-yellow-400 text-black font-bold">
              1
            </span>
            <button className="px-3 py-1 rounded border border-yellow-400/40 bg-neutral-900 text-yellow-400 font-semibold">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-neutral-900 text-yellow-400 rounded-xl border border-yellow-400/30 shadow-2xl p-6 w-full max-w-lg relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-300 rounded-full focus:outline-none"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>
            <h2 className="text-center text-2xl font-bold mb-2 tracking-wide">Add New Technician</h2>
            <p className="mb-6 text-yellow-300 text-center">Fill all required fields <span className="text-yellow-400">*</span>.</p>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            >
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Distributor *</label>
                <input
                  type="text"
                  name="distributor"
                  value={formData.distributor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Dealer *</label>
                <input
                  type="text"
                  name="dealer"
                  value={formData.dealer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                >
                  <option value="">Select Option</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Email Id *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Mobile Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">Aadhar</label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-yellow-300 mb-1 font-medium">DOB</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-yellow-300 mb-1 font-medium">Qualification *</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-black text-yellow-400 border border-yellow-400/50 focus:outline-none focus:ring focus:ring-yellow-400 transition"
                  required
                />
              </div>
            </form>
            <div className="mt-6 flex flex-row-reverse justify-between gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition shadow"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition shadow"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TechnicianPage;
