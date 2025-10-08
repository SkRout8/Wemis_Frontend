// AllocateBarcode.jsx
import React, { useState, useMemo, useEffect, useCallback, useContext } from "react";
import { ChevronRight, ChevronLeft, AlertCircle, RefreshCw } from "lucide-react";
import axios from 'axios';
import ManufactureNavbar from "./ManufactureNavbar";
import toast, { Toaster } from "react-hot-toast";

// --- MOCK Context for Token Retrieval (Essential for compilation) ---
const UserAppContext = React.createContext({
  token: localStorage.getItem("token") || null,
  // Add other user context values as needed
});


// --- API Endpoints ---
const ELEMENT_DATA_API = "https://wemis-backend.onrender.com/manufactur/fetchElementData";
const AVAILABLE_BARCODES_API = "https://wemis-backend.onrender.com/manufactur/fetchAllBarCode";
const DISTRIBUTOR_API = "https://wemis-backend.onrender.com/manufactur/findDistributorUnderManufactur";
const OEM_API = "https://wemis-backend.onrender.com/manufactur/findOemUnderManufactur";
const DEALER_UNDER_DISTRIBUTOR_API = "https://wemis-backend.onrender.com/manufactur/findDelerUnderDistributor"; 
const DEALER_UNDER_OEM_API = "https://wemis-backend.onrender.com/manufactur/findDelerUnderOem"; 
const ALLOCATE_API = "https://wemis-backend.onrender.com/manufactur/AllocateBarCode";
const ALLOCATED_DATA_API = "https://wemis-backend.onrender.com/manufactur/fetchAllAllocatedBarcode";


// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-yellow-400 rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto w-full max-w-5xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-yellow-500 rounded-t-xl z-10 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-yellow-400">{title}</h3>
          <button
            onClick={onClose}
            className="text-yellow-300 hover:text-red-500 transition p-1 rounded-full hover:bg-gray-800"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- Mock/Static Data (Remaining) ---
const MOCK_OPTIONS = {
  countries: [
    { value: "US", label: "United States" },
    { value: "IN", label: "India" },
    { value: "UK", label: "United Kingdom" },
  ],
  statesByCountry: {
    US: [
      { value: "CA", label: "California" },
      { value: "TN", label: "Tennessee" },
    ],
    IN: [
      { value: "KA", label: "Karnataka" },
      { value: "OD", label: "Odisha" },
      { value: "MH", label: "Maharashtra" },
      { value: "DL", label: "Delhi" },
      { value: "TN", label: "Tamil Nadu" },
    ],
    UK: [
      { value: "ENG", label: "England" },
      { value: "SCT", label: "Scotland" },
    ],
  },
};

// --- Initial API Options State (Expanded with Hardcoded Voltage & NEW Dealers) ---
const INITIAL_API_OPTIONS = {
  elements: [],
  elementTypes: [],
  modelNos: [],
  partNos: [],
  distributors: [],
  oems: [],
  dealers: [], 
  // HARDCODED VOLTAGE OPTIONS
  voltages: [
    { value: "12V", label: "12V" },
    { value: "24V", label: "24V" },
    { value: "48V", label: "48V" },
    { value: "110V", label: "110V" },
    { value: "230V", label: "230V" },
  ],
  types: [
    { value: "NEW", label: "NEW" },
    { value: "USED", label: "USED" },
  ],
};

// --- Main Component ---
function AllocateBarcode() {
  // 1. Token Retrieval
  const { token: contextToken } = useContext(UserAppContext);
  const tkn = contextToken || localStorage.getItem("token");

  const [showModal, setShowModal] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingBarcodes, setIsLoadingBarcodes] = useState(false);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isLoadingDealers, setIsLoadingDealers] = useState(false); 
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocatedData, setAllocatedData] = useState([]);
  const [isLoadingAllocatedData, setIsLoadingAllocatedData] = useState(false);


  const [apiOptions, setApiOptions] = useState(INITIAL_API_OPTIONS);

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    selectionType: "Distributor",
    distributor: "",
    oem: "",
    dealer: "", // Dealer ID
    element: "",
    elementType: "",
    modelNo: "",
    voltage: "",
    partNo: "",
    type: "NEW",
  });

  const [availableBarcodes, setAvailableBarcodes] = useState([]);
  const [allocatedBarcodes, setAllocatedBarcodes] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedAllocated, setSelectedAllocated] = useState([]);

  // Filter states based on selected country
  const filteredStates = useMemo(() => {
    return MOCK_OPTIONS.statesByCountry[formData.country] || [];
  }, [formData.country]);

  // Clear state when country changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, state: "" }));
  }, [formData.country]);

  // ⬅️ HELPER FUNCTION to find the partner name by ID from the fetched options
  // This helper is crucial for displaying names instead of IDs in the table.
  const getPartnerName = useCallback((id, type) => {
    if (!id) return 'N/A';

    // The logic here attempts to search the currently loaded options for the name.
    // NOTE: This will only work perfectly if ALL partners (Distributor, OEM, Dealers)
    // are loaded in apiOptions *before* the allocated data is displayed.
    if (type === 'Distributor') {
        const distributor = apiOptions.distributors.find(d => d.value === id);
        return distributor ? distributor.label : id;
    }

    if (type === 'OEM') {
        const oem = apiOptions.oems.find(o => o.value === id);
        return oem ? oem.label : id;
    }

    // Since Dealers are fetched dynamically based on the selected partner in the modal,
    // the allocated data list might have dealer IDs not present in the current `apiOptions.dealers`.
    // For the list, we generally fallback to the ID or implement a separate lookup if necessary.
    if (type === 'Dealer') {
        const dealer = apiOptions.dealers.find(d => d.value === id);
        return dealer ? dealer.label : id;
    }

    return id;
  }, [apiOptions.distributors, apiOptions.oems, apiOptions.dealers]); 


  // --- API Fetch Allocated Barcode Data ---
  const fetchAllAllocatedData = useCallback(async () => {
    if (!tkn) {
      return;
    }
    setIsLoadingAllocatedData(true);
    try {
      const response = await axios.post(
        ALLOCATED_DATA_API,
        {},
        {
          headers: {
            Authorization: `Bearer ${tkn}`,
          },
        }
      );
      
      const rawData = response.data.allBarcodes || [];

      if (Array.isArray(rawData)) {
        setAllocatedData(rawData);
      } else {
        console.error("Allocated barcodes API did not return a valid array:", response.data);
        setAllocatedData([]);
      }

    } catch (error) {
      toast.error("Failed to load allocated barcode data.");
      console.error("Fetch allocated data error:", error.response?.data || error.message);
      setAllocatedData([]);
    } finally {
      setIsLoadingAllocatedData(false);
    }
  }, [tkn]);


  // --- API Fetch Element Data (Product Specs - excluding voltage) ---
  const fetchElementData = useCallback(async () => {
    if (!tkn) {
      return;
    }
    setIsLoadingOptions(true);
    try {
      const response = await axios.post(ELEMENT_DATA_API, {}, { headers: { Authorization: `Bearer ${tkn}` } });
      const rawData = response.data.elementData;
      const uniqueData = { elements: new Set(), elementTypes: new Set(), modelNos: new Set(), partNos: new Set() };
      if (Array.isArray(rawData)) {
        rawData.forEach(item => {
          if (item.elementName) uniqueData.elements.add(item.elementName);
          if (item.elementType) uniqueData.elementTypes.add(item.elementType);
          if (item.model_No) uniqueData.modelNos.add(item.model_No);
          if (item.device_Part_No) uniqueData.partNos.add(item.device_Part_No);
        });
      }
      setApiOptions(prev => ({
        ...prev,
        elements: Array.from(uniqueData.elements).map(v => ({ value: v, label: v })),
        elementTypes: Array.from(uniqueData.elementTypes).map(v => ({ value: v, label: v })),
        modelNos: Array.from(uniqueData.modelNos).map(v => ({ value: v, label: v })),
        partNos: Array.from(uniqueData.partNos).map(v => ({ value: v, label: v })),
      }));
    } catch (error) {
      toast.error("Failed to load product specification data.");
      console.error("Fetch element data error:", error.response?.data || error.message);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [tkn]);

  // --- API Fetch Available Barcodes ---
  const fetchAvailableBarcodes = useCallback(async () => {
    if (!tkn) {
      return;
    }
    setIsLoadingBarcodes(true);
    try {
      const response = await axios.post(
        AVAILABLE_BARCODES_API,
        {},
        {
          headers: {
            Authorization: `Bearer ${tkn}`,
          },
        }
      );
      const rawBarcodes = response.data.allBarCods;
      if (Array.isArray(rawBarcodes)) {
        const formattedBarcodes = rawBarcodes
          .map(item => ({
            id: item.barCodeNo,
            label: item.barCodeNo,
          }))
          .filter(b => b.id)
          .sort((a, b) => a.id.localeCompare(b.id));

        setAvailableBarcodes(formattedBarcodes);
      } else {
        console.error("Available barcodes API did not return a valid array:", rawBarcodes);
        setAvailableBarcodes([]);
      }
    } catch (error) {
      toast.error("Failed to load available barcodes.");
      console.error("Fetch barcodes error:", error.response?.data || error.message);
      setAvailableBarcodes([]);
    } finally {
      setIsLoadingBarcodes(false);
    }
  }, [tkn]);

  // --- API Fetch Partners (Distributors/OEMs) ---
  const fetchDistributors = useCallback(async () => {
    if (!tkn) return;
    setIsLoadingPartners(true);
    try {
      const response = await axios.post(DISTRIBUTOR_API, {}, { headers: { Authorization: `Bearer ${tkn}` } });
      const rawData = response.data.dist || response.data; 

      if (Array.isArray(rawData)) {
        const formattedDistributors = rawData
          .map(d => ({
            value: d._id,
            // Assuming Distributor list uses 'business_Name' or fallback to 'name'
            label: d.business_Name || d.name || d.userName || d._id
          }))
          .filter(d => d.value);

        setApiOptions(prev => ({ ...prev, distributors: formattedDistributors }));
      } else {
        setApiOptions(prev => ({ ...prev, distributors: [] }));
      }
    } catch (error) {
      toast.error("Failed to load distributors.");
      console.error("Fetch distributors error:", error.response?.data || error.message);
    } finally {
      setIsLoadingPartners(false);
    }
  }, [tkn]);

  const fetchOems = useCallback(async () => {
    if (!tkn) return;
    setIsLoadingPartners(true);
    try {
      const response = await axios.post(OEM_API, {}, { headers: { Authorization: `Bearer ${tkn}` } });
      const rawData = response.data.oem || response.data;

      if (Array.isArray(rawData)) {
        const formattedOems = rawData
          .map(o => ({
            value: o._id,
            label: o.business_Name || o.userName || o._id
          }))
          .filter(o => o.value);

        setApiOptions(prev => ({ ...prev, oems: formattedOems }));
      } else {
        setApiOptions(prev => ({ ...prev, oems: [] }));
      }
    } catch (error) {
      toast.error("Failed to load OEMs.");
      console.error("Fetch OEMs error:", error.response?.data || error.message);
    } finally {
      setIsLoadingPartners(false);
    }
  }, [tkn]);

  // ⬅️ CRITICAL FIX: API Fetch Dealers under the selected Partner
  const fetchDealers = useCallback(async (partnerId, partnerType) => {
    if (!tkn || !partnerId) {
      setApiOptions(prev => ({ ...prev, dealers: [] }));
      setFormData(prev => ({ ...prev, dealer: "" }));
      return;
    }
    
    setIsLoadingDealers(true);
    setApiOptions(prev => ({ ...prev, dealers: [] }));
    setFormData(prev => ({ ...prev, dealer: "" })); // Clear selected dealer

    const api = partnerType === 'Distributor' ? DEALER_UNDER_DISTRIBUTOR_API : DEALER_UNDER_OEM_API;
    
    // Payload uses 'distributorIde' or 'oemId'
    const payload = partnerType === 'Distributor' 
      ? { distributorIde: partnerId } 
      : {oemId: partnerId }; 
    
    try {
      const response = await axios.post(api, payload, { headers: { Authorization: `Bearer ${tkn}` } });
      
      // API response structure might vary, trying common keys
      const rawData = response.data.deler || response.data.dealers || response.data.oem || []; 

      if (Array.isArray(rawData)) {
        const formattedDealers = rawData
          .map(d => ({
            value: d._id,
            label: d.business_Name || d.userName || d._id
          }))
          .filter(d => d.value);

        setApiOptions(prev => ({ ...prev, dealers: formattedDealers }));
      } else {
        console.error(`Dealers API for ${partnerType} did not return a valid array:`, rawData);
        setApiOptions(prev => ({ ...prev, dealers: [] }));
      }
    } catch (error) {
      toast.error(`Failed to load Dealers for ${partnerType}.`);
      console.error(`Fetch dealers error for ${partnerType}:`, error.response?.data || error.message);
      setApiOptions(prev => ({ ...prev, dealers: [] }));
    } finally {
      setIsLoadingDealers(false);
    }
  }, [tkn]);


  // --- Initial Data Fetch Effect ---
  // Ensure all necessary options are fetched initially for the allocation form AND the table
  useEffect(() => {
    if (tkn) {
      fetchElementData();
      fetchAvailableBarcodes();
      fetchDistributors();
      fetchOems();
      fetchAllAllocatedData();
    }
  }, [tkn, fetchElementData, fetchAvailableBarcodes, fetchDistributors, fetchOems, fetchAllAllocatedData]);


  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // 1. Handle selectionType change
    if (name === "selectionType") {
      setFormData((prev) => ({
        ...prev,
        distributor: "",
        oem: "",
        dealer: "", // Clear dealer on partner type change
        selectionType: newValue,
      }));
      // Clear dealer options immediately
      setApiOptions((prev) => ({ ...prev, dealers: [] })); 
      setErrors((prev) => ({ ...prev, distributor: "", oem: "", dealer: "" }));
      return;
    }

    // 2. Handle partner change (distributor/oem)
    if (name === "distributor" || name === "oem") {
      // Clear dealer and its options when partner changes
      setFormData((prev) => ({ 
        ...prev, 
        [name]: newValue, 
        dealer: "" 
      }));
      setApiOptions((prev) => ({ ...prev, dealers: [] }));
      setErrors((prev) => ({ ...prev, [name]: "", dealer: "" }));
      return; 
    }
    
    // 3. Update all other fields
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // ⬅️ Effect to trigger dealer fetch when distributor or oem changes
  useEffect(() => {
    const partnerId = formData.selectionType === "Distributor" ? formData.distributor : formData.oem;
    const partnerType = formData.selectionType;

    if (partnerId) {
      // Only fetch if a partner ID is actually selected
      fetchDealers(partnerId, partnerType);
    } else {
      // Clear dealers if the selected partner ID is empty
      setApiOptions(prev => ({ ...prev, dealers: [] }));
      setFormData(prev => ({ ...prev, dealer: "" }));
    }
  }, [formData.distributor, formData.oem, formData.selectionType, fetchDealers]);


  // Define required fields for validation
  const requiredFields = useMemo(
    () => [
      "element", "elementType", "modelNo", "voltage", "partNo", "type",
    ],
    []
  );

  // Select multiple handler
  const handleSelectChange = (e, setSelectedState) => {
    const values = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => o.value);
    setSelectedState(values);
  };

  // Move forward
  const moveForward = () => {
    const selectedCodes = new Set(selectedAvailable);
    const itemsToMove = availableBarcodes.filter((bc) =>
      selectedCodes.has(bc.id)
    );

    setAvailableBarcodes((prev) =>
      prev.filter((bc) => !selectedCodes.has(bc.id))
    );
    setAllocatedBarcodes((prev) => [...prev, ...itemsToMove].sort((a, b) => a.id.localeCompare(b.id)));

    setSelectedAvailable([]);
  };

  // Move back
  const moveBack = () => {
    const selectedCodes = new Set(selectedAllocated);
    const itemsToMove = allocatedBarcodes.filter((bc) =>
      selectedCodes.has(bc.id)
    );

    setAllocatedBarcodes((prev) =>
      prev.filter((bc) => !selectedCodes.has(bc.id))
    );
    setAvailableBarcodes((prev) =>
      [...prev, ...itemsToMove].sort((a, b) => a.id.localeCompare(b.id))
    );

    setSelectedAllocated([]);
  };

  // --- ALLOCATE FUNCTION ---
  const handleAllocate = async () => {
    let newErrors = {};

    // 1. Validate required fields
    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required.";
    });

    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.dealer) newErrors.dealer = "Dealer is required.";

    let distributorId = "";
    let oemId = "";

    // 2. Validate conditional partner field and assign IDs
    if (formData.selectionType === "Distributor") {
      if (!formData.distributor) {
        newErrors.distributor = "Distributor is required.";
      } else {
        distributorId = formData.distributor;
      }
    } else if (formData.selectionType === "OEM") {
      if (!formData.oem) {
        newErrors.oem = "OEM is required.";
      } else {
        oemId = formData.oem;
      }
    }

    // 3. Final Error Check
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields.");
      return;
    }

    // Get the dynamically selected barcodes
    const selectedBarcodesArray = allocatedBarcodes.map((o) => o.id);

    if (selectedBarcodesArray.length === 0) {
       toast.error("Please allocate at least one barcode.");
       return;
    }

    // 4. Construct API Payload
    const payload = {
      country: formData.country,
      state: formData.state,
      checkBoxValue: formData.selectionType,
      distributor: formData.selectionType === "Distributor" ? distributorId : "",
      oem: formData.selectionType === "OEM" ? oemId : "",
      deler: formData.dealer, // This is the Dealer ID
      element: formData.element,
      elementType: formData.elementType,
      modelNo: formData.modelNo,
      Voltege: formData.voltage,
      partNo: formData.partNo,
      type: formData.type,
      barcodes: selectedBarcodesArray,
    };

    console.log("Allocation Payload (Dynamic Barcodes):", payload);

    // 5. Send data to the Allocation API
    setIsAllocating(true);
    try {
      const response = await axios.post(ALLOCATE_API, payload, {
        headers: {
          Authorization: `Bearer ${tkn}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message || `Allocation successful for ${selectedBarcodesArray.length} barcodes!`);
        setShowModal(false);

        // Reset fields after successful allocation
        setAllocatedBarcodes([]);
        setFormData((prev) => ({
          ...prev,
          distributor: "",
          oem: "",
          dealer: "",
          // Note: Keeping country/state/specs for potential quick re-allocation
        }));
        setApiOptions((prev) => ({ ...prev, dealers: [] })); // Clear dealer options
        // REFRESH TABLES AFTER SUCCESSFUL ALLOCATION
        fetchAvailableBarcodes();
        fetchAllAllocatedData();
      } else {
        // Handle server-side failure message
        toast.error(response.data.message || "Allocation failed. Please check server logs.");
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during allocation.";
      toast.error(errorMessage);
      console.error("Allocation error:", error.response?.data || error.message);
    } finally {
      setIsAllocating(false);
    }
  };

  const SelectField = ({ id, label, options, required = false, disabled = false, isPartner = false, isDealer = false }) => {
    const isError = !!errors[id];
    const isLoading = isPartner ? isLoadingPartners : (isDealer ? isLoadingDealers : isLoadingOptions); 

    return (
      <div className="flex-grow min-w-[200px]">
        <label
          htmlFor={id}
          className="block font-semibold text-sm text-yellow-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleChange}
          disabled={disabled || isLoading}
          className={`w-full p-2 border rounded-lg bg-gray-800 text-yellow-200 focus:ring-2 focus:ring-yellow-500 transition duration-150 ${isError ? "border-red-500" : "border-yellow-500"
            } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <option value="">
            {isLoading
              ? "Loading..."
              : `Select ${label}`
            }
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isError && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {errors[id]}
          </p>
        )}
      </div>
    );
  };

  const AllocationFormContent = (
    <div className="space-y-6">
      {/* Country and State Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SelectField
          id="country"
          label="Country"
          options={MOCK_OPTIONS.countries}
          required
        />
        <SelectField
          id="state"
          label="State"
          options={filteredStates}
          required
          disabled={!formData.country}
        />
      </div>

      {/* Selection Type Radio Group (Mutually Exclusive) */}
      <div className="bg-gray-800 p-4 border border-yellow-500 rounded-lg flex flex-wrap gap-6">
        <span className="text-yellow-300 font-semibold w-full block">Select Partner Type:</span>
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="selectionType"
            value="Distributor"
            checked={formData.selectionType === "Distributor"}
            onChange={handleChange}
            className="form-radio h-5 w-5 text-yellow-500 bg-gray-900 border-yellow-500 rounded-full focus:ring-yellow-400"
          />
          <span className="text-yellow-300">
            Distributor
          </span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="selectionType"
            value="OEM"
            checked={formData.selectionType === "OEM"}
            onChange={handleChange}
            className="form-radio h-5 w-5 text-yellow-500 bg-gray-900 border-yellow-500 rounded-full focus:ring-yellow-400"
          />
          <span className="text-yellow-300">
            OEM
          </span>
        </label>
      </div>

      {/* Partner/Dealer Fields */}
      <h4 className="text-xl font-bold text-yellow-400 border-b border-yellow-600 pb-2 mt-6">Partner Details {isLoadingPartners && "(Loading Partners...)"}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Conditional Partner Field */}
        {formData.selectionType === "Distributor" ? (
          <SelectField
            id="distributor"
            label="Distributor"
            options={apiOptions.distributors}
            required
            isPartner
            disabled={!formData.country || !formData.state}
          />
        ) : (
          <SelectField
            id="oem"
            label="OEM"
            options={apiOptions.oems}
            required
            isPartner
            disabled={!formData.country || !formData.state}
          />
        )}

         {/* Dealer is now DYNAMIC and dependent on selected partner */}
         <SelectField
          id="dealer"
          label={`Dealer (Under ${formData.selectionType})`}
          options={apiOptions.dealers} 
          required
          isDealer 
          // Disable if country/state aren't selected OR if the required partner isn't selected
          disabled={!formData.country || !formData.state || (formData.selectionType === "Distributor" && !formData.distributor) || (formData.selectionType === "OEM" && !formData.oem)}
        />
      </div>

      {/* Specs */}
      <h4 className="text-xl font-bold text-yellow-400 border-b border-yellow-600 pb-2 mt-6">Product Specifications {isLoadingOptions && "(Loading Data...)"}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SelectField id="element" label="Element" options={apiOptions.elements} required />
        <SelectField id="elementType" label="Element Type" options={apiOptions.elementTypes} required />
        <SelectField id="modelNo" label="Model No" options={apiOptions.modelNos} required />
        {/* Voltage uses hardcoded options */}
        <SelectField id="voltage" label="Voltage" options={apiOptions.voltages} required /> 
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SelectField id="partNo" label="Part No" options={apiOptions.partNos} required />
        <SelectField id="type" label="Type" options={apiOptions.types} required />
      </div>

      {/* Barcode Allocation */}
      <h4 className="text-xl font-bold text-yellow-400 border-b border-yellow-600 pb-2 mt-6">Barcode Selection</h4>
      <div className="bg-gray-800 p-4 border border-yellow-500 rounded-lg shadow-inner">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Available */}
          <div className="w-full md:w-5/12">
            <div className="font-bold text-yellow-300 mb-2">
              Available Barcodes ({availableBarcodes.length})
              {isLoadingBarcodes && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
            </div>
            <select
              multiple
              className="w-full h-48 p-3 border border-yellow-400 rounded-lg bg-gray-900 text-yellow-200 text-sm shadow-md"
              onChange={(e) => handleSelectChange(e, setSelectedAvailable)}
              value={selectedAvailable}
              disabled={isLoadingBarcodes}
            >
              {availableBarcodes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="w-full md:w-2/12 flex md:flex-col justify-center items-center gap-4">
            <button
              onClick={moveForward}
              disabled={selectedAvailable.length === 0}
              className="p-3 w-12 h-12 rounded-full bg-yellow-500 text-black hover:bg-yellow-600 disabled:bg-gray-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={moveBack}
              disabled={selectedAllocated.length === 0}
              className="p-3 w-12 h-12 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Allocated */}
          <div className="w-full md:w-5/12">
            <div className="font-bold text-yellow-300 mb-2">
              Allocated Barcodes (
              <span className="text-yellow-500">{allocatedBarcodes.length}</span>)
            </div>
            <select
              multiple
              className="w-full h-48 p-3 border border-yellow-400 rounded-lg bg-gray-900 text-yellow-200 text-sm shadow-md"
              onChange={(e) => handleSelectChange(e, setSelectedAllocated)}
              value={selectedAllocated}
            >
              {allocatedBarcodes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Confirm */}
      <div className="mt-6 pt-4 border-t border-yellow-500 text-right">
        <button
          onClick={handleAllocate}
          disabled={isAllocating}
          className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition disabled:bg-gray-600 disabled:text-gray-400"
        >
          {isAllocating ? "Allocating..." : "Confirm Allocation"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="font-inter min-h-screen bg-gray-950">
      <ManufactureNavbar />
      <Toaster position="top-right" /> {/* Toaster for notifications */}

      <div className="container max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-yellow-400">
            Barcode Management Overview
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Allocate Barcodes
          </button>
        </div>

        {/* Allocated Data Table */}
       <div className="bg-gray-900 p-8 rounded-xl shadow-lg border border-yellow-500">
            <div className="flex justify-between items-center mb-4 border-b border-yellow-600 pb-3">
                <h3 className="text-xl font-bold text-yellow-400">Allocated Barcodes List ({allocatedData.length})</h3>
                <button
                    onClick={fetchAllAllocatedData}
                    disabled={isLoadingAllocatedData}
                    className="p-2 text-yellow-300 hover:text-yellow-500 transition disabled:opacity-50"
                >
                    <RefreshCw className={isLoadingAllocatedData ? "animate-spin" : ""} size={20} />
                </button>
            </div>

            {isLoadingAllocatedData ? (
                <div className="text-center py-10 text-yellow-300">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Loading allocated data...
                </div>
            ) : allocatedData.length === 0 ? (
                <p className="text-yellow-300 text-center py-10">No barcodes have been allocated yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-yellow-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Barcode
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Product (Type/Model)
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Part No.
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Volts
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Partner Type
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Partner Name
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Dealer
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Location
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                    Allocated Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900 divide-y divide-yellow-800">
                            {allocatedData.map((item, index) => {
                                const partnerType = item.checkBoxValue;
                                const partnerId = partnerType === 'Distributor' ? item.allocatedDistributorId : item.allocatedOemId;

                                const partnerName = getPartnerName(partnerId, partnerType);
                                const dealerName = getPartnerName(item.allocatedDelerId, 'Dealer'); // Attempt to get dealer name
                                const barcode = Array.isArray(item.allocatedBarCode) ? item.allocatedBarCode[0] : (item.allocatedBarCode || 'N/A');
                                const statusColor = item.status === 'USED' ? 'text-red-400 font-bold' : 'text-green-400';
                                const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';

                                return (
                                    <tr key={index} className="hover:bg-gray-800 transition">
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-yellow-200">{barcode}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{`${item.elementType} / ${item.modelNo}`}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{item.partNo || 'N/A'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{item.Voltege || 'N/A'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{partnerType || 'N/A'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{partnerName}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{dealerName}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{`${item.state} (${item.country})`}</td>
                                        <td className={`px-3 py-3 whitespace-nowrap text-sm ${statusColor}`}>{item.status || 'ALLOCATED'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-yellow-300">{formattedDate}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Allocation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Allocate Barcodes to Partner/Dealer"
      >
        {AllocationFormContent}
      </Modal>
    </div>
  );
}

export default AllocateBarcode;