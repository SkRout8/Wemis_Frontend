import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Plus, X, Package, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ManufactureNavbar from "./ManufactureNavbar";
import { UserAppContext } from "../contexts/UserAppProvider";

// --- API Endpoints ---
const SUBSCRIPTION_CREATE_API =
  "https://wemis-backend.onrender.com/manufactur/createNewSubscription";
const FETCH_SUBSCRIPTIONS_API =
  "https://wemis-backend.onrender.com/manufactur/fetchAllSubscriptionPlans";

// --- Configuration ---
const BILLING_CYCLE_DAYS = [
  "3 days",
  "7 days",
  "30 days",
  "60 days",
  "90 days",
  "120 days",
  "150 days",
  "180 days",
  "210 days",
  "240 days",
  "270 days",
  "300 days",
  "330 days",
];

const PACKAGE_TYPES = ["TRACKER", "OFFERED"];

// --- Initial States ---
const initialSubscriptionState = {
  packageType: PACKAGE_TYPES[0],
  packageName: "",
  billingCycle: "",
  price: "",
  description: "",
  renewal: true,
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
};

function Subscription() {
  // --- Context & Token ---
  const { token: contextToken } = useContext(UserAppContext);
  const tkn = contextToken || localStorage.getItem("token");

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialSubscriptionState);
  const [message, setMessage] = useState("");
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // --- Fetch Subscriptions ---
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.post(FETCH_SUBSCRIPTIONS_API,
        {},
         {
        headers: {
          
          Authorization: `Bearer ${tkn}`,
        },
      });

      const fetchedData = res.data.allSubscription;
      console.log("Fetched Subscriptions:", fetchedData);

      if (Array.isArray(fetchedData)) {
        setSubscriptions(fetchedData);
      } else {
        console.error("Invalid data structure:", fetchedData);
        setSubscriptions([]);
        toast.error("Invalid data structure received from server.");
      }
    } catch (err) {
      toast.error("Failed to fetch subscriptions.");
      console.error("Fetch subscription error:", err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tkn) {
      fetchSubscriptions();
    } else {
      toast.error("No token found. Please login again.");
    }
  }, [tkn]);

  // --- Handle Form Changes ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMessage("");

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // --- Create Subscription ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!tkn) {
      setMessage("⚠️ Authentication token is missing.");
      return;
    }

    setSubmissionLoading(true);
    setMessage("Submitting subscription...");

    try {
      const res = await axios.post(SUBSCRIPTION_CREATE_API, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tkn}`,
        },
      });

      if (res.status === 200 || res.status === 201) {
        const result = res.data;
        toast.success("Subscription created successfully!");
        setMessage(
          `✅ Subscription created successfully! ID: ${
            result.subscriptionId || "N/A"
          }`
        );
        setFormData(initialSubscriptionState);
        fetchSubscriptions();
        setIsModalOpen(false);
      } else {
        setMessage(
          `❌ Creation failed: ${
            res.data?.message || "Server returned an error."
          }`
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create subscription.";
      console.error("Subscription Error:", error);
      setMessage(`❌ Submission failed: ${errorMessage}`);
      toast.error("Subscription submission failed.");
    } finally {
      setSubmissionLoading(false);
    }
  };

  // --- Filter Subscriptions ---
  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.packageType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isError = message.includes("❌") || message.includes("⚠️");

  return (
    <div className="bg-gray-900 min-h-screen">
      <Toaster position="top-right" />
      <ManufactureNavbar />

      <div className="p-6">
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 border-b border-gray-700 pb-3">
          Subscription Management
        </h1>

        {/* --- Top Bar --- */}
        <div className="flex justify-between items-center mb-6">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Package Name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 w-80 transition duration-150"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Create Button */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              setFormData(initialSubscriptionState);
              setMessage("");
            }}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition duration-150 shadow-lg"
          >
            <Plus size={20} /> Create Subscription
          </button>
        </div>

        {/* --- Subscription Table --- */}
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400 p-4 border-b border-gray-700 flex items-center gap-2">
            <Package size={20} /> Active Subscriptions
          </h2>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-6 text-center text-yellow-400">
                Loading subscriptions...
              </p>
            ) : filteredSubscriptions.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                No subscriptions found.
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Billing Cycle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Renewal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Created Date
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredSubscriptions.map((item) => (
                    <tr
                      key={item._id}
                      className="text-white hover:bg-gray-700/50 transition duration-100"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-yellow-300">
                        {item.packageName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.packageType || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400 font-mono">
                        ${(item.price ? item.price : 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.billingCycle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <span
                          className={`font-medium ${
                            item.renewal || item.renewalAutomatic
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                        >
                          {item.renewal || item.renewalAutomatic
                            ? "Automatic"
                            : "Manual"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-semibold ${
                            item.status === "Active"
                              ? "bg-green-900/50 text-green-400"
                              : "bg-red-900/50 text-red-400"
                          }`}
                        >
                          {item.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* --- Create Modal --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-8 rounded-xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-yellow-500 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl font-bold text-yellow-400">
                  Create New Subscription 💳
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-yellow-400 hover:bg-gray-800 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-white">
                {/* Package Name */}
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-800 border border-yellow-500/50 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                {/* Package Type */}
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">
                    Package Type *
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-800 border border-yellow-500/50 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  >
                    {PACKAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Cycle */}
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">
                    Billing Cycle *
                  </label>
                  <select
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-800 border border-yellow-500/50 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  >
                    {BILLING_CYCLE_DAYS.map((cycle) => (
                      <option key={cycle} value={cycle}>
                        {cycle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full p-3 rounded-lg bg-gray-800 border border-yellow-500/50 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                {/* Renewal Type */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-yellow-500/50">
                  <label
                    className="text-gray-300 font-medium cursor-pointer"
                    htmlFor="renewal-switch"
                  >
                    Renewal Type:{" "}
                    <span className="font-semibold text-yellow-300">
                      {formData.renewal ? "Automatic" : "Manual"}
                    </span>
                  </label>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="renewal"
                      checked={formData.renewal}
                      onChange={handleChange}
                      className="sr-only peer"
                      id="renewal-switch"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 rounded-lg bg-gray-800 border border-yellow-500/50 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-y"
                  ></textarea>
                </div>

                {/* Message */}
                {message && (
                  <p
                    className={`p-3 text-center rounded-md text-sm transition-all ${
                      isError
                        ? "bg-red-700/30 text-red-400 border border-red-500"
                        : "bg-green-700/30 text-green-400 border border-green-500"
                    }`}
                  >
                    {message}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submissionLoading}
                  className={`w-full py-3 px-4 rounded-lg font-bold shadow-md transition-all duration-300 ${
                    submissionLoading
                      ? "bg-yellow-300 text-black cursor-not-allowed opacity-70"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  {submissionLoading
                    ? "Processing..."
                    : "Create Subscription"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscription;
