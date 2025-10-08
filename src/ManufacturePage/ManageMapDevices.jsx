import React, { useEffect, useState } from "react";
import axios from "axios";
import ManufactureNavbar from "./ManufactureNavbar";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Eye,
  FileText,
  File,
  Database,
  MapPin,
} from "lucide-react";

function ManageMapDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get("http://34.228.170.141:3000/devices");

        let rawData = Object.values(res.data);
        const filtered = rawData.filter((d) => d?.imei && d?.vehicleNo);

        setDevices(filtered);
      } catch (err) {
        console.error("Error fetching devices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Buttons with route mapping
  const actions = [
    { label: "Edit", icon: <Edit size={18} />, route: "/devices/edit" },
    { label: "View", icon: <Eye size={18} />, route: "/devices/view" },
    { label: "Certificates", icon: <FileText size={18} />, route: "/devices/certificates" },
    { label: "Documents", icon: <File size={18} />, route: "/devices/documents" },
    { label: "Data Log", icon: <Database size={18} />, route: "/devices/log" },
    { label: "Live Tracking", icon: <MapPin size={18} />, route: "/devices/live" },
  ];

  return (
    <div>
      <ManufactureNavbar />
      <div className="bg-black min-h-screen text-yellow-400 font-inter">
        {/* Header */}
        <header className="flex items-center justify-between bg-gradient-to-b from-black to-gray-900 px-6 py-4 shadow-lg">
          <div className="flex items-center space-x-3 text-yellow-400 text-lg font-semibold">
            <MapPin size={20} />
            <span>Manage Map Devices</span>
          </div>
          <button
            onClick={() => navigate("/devices/new")}
            className="flex items-center space-x-2 border border-yellow-400 rounded-lg px-4 py-2 text-yellow-400 text-sm font-medium hover:bg-yellow-400 hover:text-black transition"
            type="button"
          >
            <i className="fas fa-plus"></i>
            <span>Map New Device</span>
          </button> 
        </header>

        {/* Action Buttons - Centered */}
        <section className="bg-gray-900 bg-opacity-80 rounded-md mx-4 mt-6 p-6 text-center">
          <h2 className="text-yellow-400 font-semibold text-lg mb-4">
            Device Actions
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {actions.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => navigate(btn.route)}
                className="flex items-center space-x-2 border border-yellow-400 text-yellow-400 rounded-lg px-5 py-2 text-sm font-medium hover:bg-yellow-400 hover:text-black transition shadow-md"
                type="button"
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className="overflow-x-auto mt-6 mx-4 rounded-md max-w-full">
          {loading ? (
            <div className="text-center py-6 text-gray-400">Loading...</div>
          ) : devices.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No devices found.
            </div>
          ) : (
            <table className="w-full border-collapse text-gray-200 text-sm rounded-lg overflow-hidden shadow-md">
              <thead className="bg-yellow-400 text-black">
                <tr>
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Info</th>
                  <th className="py-3 px-4 text-left">Device No</th>
                  <th className="py-3 px-4 text-left">IMEI</th>
                  <th className="py-3 px-4 text-left">Vehicle No</th>
                  <th className="py-3 px-4 text-left">Network</th>
                  <th className="py-3 px-4 text-left">Speed</th>
                  <th className="py-3 px-4 text-left">Ignition</th>
                  <th className="py-3 px-4 text-left">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr
                    key={device.deviceId || index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                    } hover:bg-gray-700 transition`}
                  >
                    <td className="py-4 px-4 text-center">
                      <input type="checkbox" className="w-5 h-5" />
                    </td>
                    <td className="py-4 px-4">
                      <button
                        className="bg-yellow-400 text-black font-semibold rounded-md px-4 py-1 text-sm"
                        type="button"
                      >
                        Info
                      </button>
                    </td>
                    <td className="py-4 px-4 font-bold">{device.deviceId}</td>
                    <td className="py-4 px-4">{device.imei}</td>
                    <td className="py-4 px-4">{device.vehicleNo}</td>
                    <td className="py-4 px-4">{device.networkOperator || "N/A"}</td>
                    <td className="py-4 px-4">{device.speed} km/h</td>
                    <td className="py-4 px-4">
                      {device.ignition === "1" ? "ON" : "OFF"}
                    </td>
                    <td className="py-4 px-4">
                      {new Date(device.lastUpdate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default ManageMapDevices;
