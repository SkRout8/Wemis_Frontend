import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- Configuration ---
const DISTRIBUTOR_API = 'https://wemis-backend.onrender.com/manufactur/fetchDistributorOnBasisOfState';
const DEALER_API = 'https://wemis-backend.onrender.com/manufactur/fetchdelerOnBasisOfDistributor'; 
const DEVICE_NO_API = 'https://wemis-backend.onrender.com/manufactur/fetchDeviceNoOnBasisOfDeler'; 
// UPDATED SUBMIT API
const SUBMIT_API = 'https://wemis-backend.onrender.com/manufactur/manuFacturMAPaDevice'; 
const PACKAGE_API = 'https://wemis-backend.onrender.com/manufactur/fetchSubScriptionPackages'; 

// Simple list of countries and states for the dropdowns
const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

// --- Component ---
function ManageMapDevices() {
  const initialFormData = {
    // Device and Vehicle Info
    country: 'India', 
    state: '',
    distributorName: '', // Stores distributor _id
    delerName: '', // Stores dealer name (or contact name/business name)
    deviceType: '',
    deviceNo: '', // This will store deviceSerialNo
    voltage: '',
    elementType: '',
    batchNo: '',
    simDetails: '', // Placeholder/legacy field
    
    VechileBirth: '',
    RegistrationNo: '',
    date: '', // Date of Mapping/Install
    ChassisNumber: '',
    EngineNumber: '',
    VehicleType: '',
    MakeModel: '',
    ModelYear: '',
    InsuranceRenewDate: '',
    PollutionRenewdate: '',
    VehicleKMReading: '', // Updated label
    DriverLicenseNo: '', // Updated label
    MappedDate: '', // Updated label
    NoOfPanicButtons: '', // Updated label

    // Customer Info
    fullName: '',
    email: '',
    mobileNo: '',
    GstinNo: '',
    Customercountry: 'India', // Updated label
    Customerstate: '', // Updated label
    Customerdistrict: '',
    Rto: '',
    PinCode: '',
    CompliteAddress: '',
    AdharNo: '',
    PanNo: '',
    
    // Package and Invoice Info
    Packages: '', // Stores the selected package _id
    InvoiceNo: '',

    // Documents (Files) - Field names MATCHING BACKEND KEYS
    Vechile_Doc: null, 
    Rc_Doc: null, 
    Pan_Card: null, // Note: using Pan_Card for Pan Card Document
    Device_Doc: null,
    Adhar_Card: null,
    Invious_Doc: null, // Note: using Invious_Doc for Invoice Document
    Signature_Doc: null, 
    Panic_Sticker: null, 
  };

  const [formData, setFormData] = useState(initialFormData);
  const [distributors, setDistributors] = useState([]);
  const [dealers, setDealers] = useState([]); 
  const [deviceNumbers, setDeviceNumbers] = useState([]); 
  const [mappedSims, setMappedSims] = useState([]); 
  const [packages, setPackages] = useState([]);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); 

  // --- Utility to reset dependent fields ---
  const resetDependentFields = () => {
    setMappedSims([]);
    return {
      deviceNo: '',
      simDetails: '',
    };
  }

  // --- FETCH SUBSCRIPTION PACKAGES ---
  const fetchPackages = useCallback(async () => {
    setPackagesLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.post(PACKAGE_API, {}, 
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setPackages(response.data.SubScriptionPackage || []); 

    } catch (error) {
      console.error('Error fetching packages:', error.response?.data || error.message);
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  // --- Fetch Distributors (Existing) ---
  const fetchDistributors = useCallback(async (selectedState) => {
    if (!selectedState) {
      setDistributors([]);
      return;
    }
    setLoading(true);
    setDistributors([]); 
    setFormData(prev => ({ ...prev, distributorName: '', delerName: '', ...resetDependentFields() }));

    try {
      const token = localStorage.getItem('token'); 
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.post(DISTRIBUTOR_API, 
        { state: selectedState }, 
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setDistributors(response.data.distributors || []); 

    } catch (error) {
      console.error('Error fetching distributors:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // --- Fetch Dealers (Existing) ---
  const fetchDealers = useCallback(async (selectedDistributorId) => {
    if (!selectedDistributorId) {
      setDealers([]);
      return;
    }
    setLoading(true);
    setDealers([]); 
    setFormData(prev => ({ ...prev, delerName: '', ...resetDependentFields() }));

    try {
      const token = localStorage.getItem('token'); 
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.post(DEALER_API, 
        { distributorId: selectedDistributorId }, 
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setDealers(response.data.delers || response.data.dealers || []); 
    } catch (error) {
      console.error('Error fetching dealers:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch Device Numbers (Existing) ---
  const fetchDeviceNumbers = useCallback(async (selectedDelerName) => {
    if (!selectedDelerName) {
      setDeviceNumbers([]);
      return;
    }
    setLoading(true);
    setDeviceNumbers([]);
    setFormData(prev => ({ ...prev, ...resetDependentFields() })); 

    try {
      const token = localStorage.getItem('token'); 
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.post(DEVICE_NO_API, 
        { delerName: selectedDelerName }, 
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setDeviceNumbers(response.data.devices || []);
      
    } catch (error) {
      console.error('Error fetching device numbers:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);


  // --- Effect Hooks ---
  useEffect(() => { fetchPackages(); }, [fetchPackages]); 
  useEffect(() => {
    if (formData.country === 'India' && formData.state) {
      fetchDistributors(formData.state);
    } else {
      setDistributors([]); 
    }
  }, [formData.state, formData.country, fetchDistributors]);
  useEffect(() => {
    if (formData.distributorName) {
      fetchDealers(formData.distributorName);
    } else {
      setDealers([]); 
    }
  }, [formData.distributorName, fetchDealers]);
  useEffect(() => {
    if (formData.delerName) {
      fetchDeviceNumbers(formData.delerName);
    } else {
      setDeviceNumbers([]); 
    }
  }, [formData.delerName, fetchDeviceNumbers]);


  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let newFormData = { ...formData };

    if (type === 'file') {
      // Use the name from the input, which matches the backend's expected field name
      newFormData[name] = files[0];
    } else {
      newFormData[name] = value;
    }

    // Reset dependent fields on change
    if (name === 'state') {
      newFormData.distributorName = '';
      newFormData.delerName = '';
      newFormData = { ...newFormData, ...resetDependentFields() };
      setDistributors([]);
      setDealers([]);
      setDeviceNumbers([]);
    }
    if (name === 'distributorName') {
      newFormData.delerName = '';
      newFormData = { ...newFormData, ...resetDependentFields() };
      setDealers([]);
      setDeviceNumbers([]);
    }
    if (name === 'delerName') {
      newFormData = { ...newFormData, ...resetDependentFields() };
      setDeviceNumbers([]);
    }

    // Logic to populate SIM fields when deviceNo is selected
    if (name === 'deviceNo') {
      if (value) {
        const selectedDevice = deviceNumbers.find(device => device.deviceSerialNo === value);
        if (selectedDevice && Array.isArray(selectedDevice.simDetails) && selectedDevice.simDetails.length > 0) {
          setMappedSims(selectedDevice.simDetails);
          const simSummary = selectedDevice.simDetails.map(sim => sim.simNo || sim.iccidNo).filter(Boolean).join(', ');
          newFormData.simDetails = simSummary;
        } else {
          setMappedSims([]);
          newFormData.simDetails = 'No SIM details found.';
        }
      } else {
        setMappedSims([]); 
        newFormData.simDetails = '';
      }
    }
    
    // Set Selected Package Details when package changes
    if (name === 'Packages') {
        if (value) {
            const packageId = value;
            const selectedPkg = packages.find(pkg => pkg._id === packageId);
            setSelectedPackageDetails(selectedPkg);
        } else {
            setSelectedPackageDetails(null);
        }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);
    
    const data = new FormData();

    // Append standard form data (excluding file inputs which are handled below)
    for (const key in formData) {
      if (formData[key] !== null && formData[key] instanceof File) {
        // Skip files here, handled below
        continue;
      }
      data.append(key, formData[key] || ''); 
    }
    
    // Append files separately (using the same keys as the formData state)
    // The keys Vechile_Doc, Rc_Doc, Pan_Card, etc. are already in the formData state
    // and match the backend upload.fields names.
    ['Vechile_Doc', 'Rc_Doc', 'Pan_Card', 'Device_Doc', 'Adhar_Card', 'Invious_Doc', 'Signature_Doc', 'Panic_Sticker'].forEach(fileKey => {
        if (formData[fileKey]) {
            data.append(fileKey, formData[fileKey]);
        }
    });

    // Append the dynamic arrays/objects as JSON strings
    if (mappedSims.length > 0) {
        data.append('simDetailsArray', JSON.stringify(mappedSims));
    }
    if (selectedPackageDetails) {
        data.append('fullPackageDetails', JSON.stringify(selectedPackageDetails));
    }


    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.post(SUBMIT_API, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // axios automatically sets 'Content-Type: multipart/form-data' for FormData
        },
      });

      console.log('API Response:', response.data);
      setSubmitStatus('success');
      setFormData(initialFormData); 
      setMappedSims([]); 
      setSelectedPackageDetails(null); 

    } catch (error) {
      console.error('Submission Error:', error.response?.data || error.message);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map state keys to display labels (for clarity in rendering)
  const getLabel = (key) => {
    const labels = {
        deviceType: 'Device Type',
        voltage: 'Voltage',
        elementType: 'Element Type',
        batchNo: 'Batch No',
        VechileBirth: 'Vehicle Birth',
        RegistrationNo: 'Registration No',
        date: 'Installation Date',
        ChassisNumber: 'Chassis Number',
        EngineNumber: 'Engine Number',
        VehicleType: 'Vehicle Type',
        MakeModel: 'Make & Model',
        ModelYear: 'Model Year',
        InsuranceRenewDate: 'Insurance Renew Date',
        PollutionRenewdate: 'Pollution Renew Date',
        VehicleKMReading: 'Vehicle KM Reading',
        DriverLicenseNo: 'Driver License No',
        MappedDate: 'Mapped Date',
        NoOfPanicButtons: 'No. Of Panic Buttons',
        fullName: 'Full Name',
        email: 'Email',
        mobileNo: 'Mobile No',
        GstinNo: 'GSTIN No',
        Customerdistrict: 'Customer District',
        Rto: 'RTO',
        PinCode: 'Pin Code',
        CompliteAddress: 'Complete Address',
        AdharNo: 'Adhar No',
        PanNo: 'Pan No',
        InvoiceNo: 'Invoice No',
    };
    return labels[key] || key; // Fallback to key if label not defined
  };

  // List of text/number inputs (using state keys)
  const textNumberInputs = [
    'deviceType','voltage','elementType','batchNo',
    'VechileBirth','RegistrationNo','date','ChassisNumber','EngineNumber','VehicleType','MakeModel','ModelYear','InsuranceRenewDate',
    'PollutionRenewdate','VehicleKMReading','DriverLicenseNo',
    'MappedDate','NoOfPanicButtons',
    'fullName','email','mobileNo','GstinNo','Customerdistrict','Rto','PinCode',
    'CompliteAddress','AdharNo','PanNo','InvoiceNo',
  ];
  
  // List of file inputs (using backend keys which are in formData state)
  const fileInputs = [
    { key: 'Vechile_Doc', label: 'Vehicle Document' }, 
    { key: 'Rc_Doc', label: 'RC Document' }, 
    { key: 'Pan_Card', label: 'Pan Card Document' }, 
    { key: 'Device_Doc', label: 'Device Document' }, 
    { key: 'Adhar_Card', label: 'Adhar Card Document' }, 
    { key: 'Invious_Doc', label: 'Invoice Document' }, 
    { key: 'Signature_Doc', label: 'Signature Document' }, 
    { key: 'Panic_Sticker', label: 'Panic Button Sticker' },
  ];
  
  // Renders the dynamic SIM card boxes (Existing)
  const renderSimInputs = () => {
    if (mappedSims.length === 0) {
        return (
            <div className="md:col-span-3 text-center py-4 text-gray-500 border border-dashed rounded-md">
                No SIM details found for the selected device.
            </div>
        );
    }

    return mappedSims.map((sim, index) => (
      <div key={index} className="md:col-span-1 border border-blue-300 p-4 rounded-lg bg-blue-50 shadow-inner">
        <h4 className="font-bold mb-3 text-blue-800">SIM Card {index + 1} Details</h4>
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Sim No</label>
            <input type="text" value={sim.simNo || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"/>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">ICCID No</label>
            <input type="text" value={sim.iccidNo || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"/>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Operator</label>
            <input type="text" value={sim.operator || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"/>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Validity Date</label>
            <input type="date" value={sim.validityDate ? new Date(sim.validityDate).toISOString().split('T')[0] : ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"/>
          </div>
        </div>
      </div>
    ));
  };
  
  // Renders the dedicated package detail box (Existing)
  const renderPackageDetailsBox = () => {
      if (!selectedPackageDetails) return null;
      
      const details = selectedPackageDetails;
      
      return (
          <div className="md:col-span-3 border border-green-500 p-5 rounded-lg bg-green-50 shadow-lg mt-4">
              <h4 className="text-xl font-bold mb-3 text-green-800">Selected Package Details: **{details.packageName || 'N/A'}**</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <PackageDetailItem label="Package Type" value={details.packageType} />
                  <PackageDetailItem label="Billing Cycle" value={details.billingCycle} />
                  <PackageDetailItem label="Renewal" value={details.renewal} />
                  <PackageDetailItem label="Price (₹)" value={details.price} />
                  <PackageDetailItem label="Description" value={details.description} />
                  <PackageDetailItem label="Created At" value={new Date(details.createdAt).toLocaleDateString()} />
              </div>
          </div>
      );
  };
  
  // Helper Component for Package Details
  const PackageDetailItem = ({ label, value }) => (
      <div className="border-b pb-2">
          <p className="font-semibold text-gray-600">{label}:</p>
          <p className="text-gray-800 break-words">{value || 'N/A'}</p>
      </div>
  );


  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-100 rounded-md shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">🛠️ Manage Map Devices</h2>
      
      {/* Loading & Status Messages */}
      {(loading || packagesLoading) && (
        <div className="text-center py-2 text-blue-600 font-semibold">
          Processing... Please wait.
        </div>
      )}
      {submitStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Form submitted successfully!</span>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Submission failed. Check console for details.</span>
        </div>
      )}

      {/* --- Form Section --- */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- Location Dropdowns (Existing) --- */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Country</label>
          <select name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option value="">Select Country</option>
            {COUNTRIES.map(c => (<option key={c.code} value={c.name}>{c.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">State</label>
          {formData.country === 'India' ? (
            <select name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option value="">Select State</option>
              {INDIA_STATES.map(state => (<option key={state} value={state}>{state}</option>))}
            </select>
          ) : (
            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter State/Province"/>
          )}
        </div>
        
        {/* --- Distributor Dropdown (Existing) --- */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Distributor Name</label>
          <select name="distributorName" value={formData.distributorName} onChange={handleChange} disabled={!formData.state || loading} className={`w-full px-3 py-2 border rounded-md bg-white ${!formData.state || loading ? 'opacity-50' : ''}`}>
            <option value="">
              {loading ? 'Loading Distributors...' : formData.state && distributors.length > 0 ? 'Select Distributor' : formData.state ? 'No Distributors Found' : 'Select State First'}
            </option>
            {distributors.map(dist => (<option key={dist._id} value={dist._id}>{dist.contact_Person_Name}</option>))}
          </select>
        </div>
        
        {/* --- Dealer Dropdown (Existing) --- */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Dealer Name</label>
          <select name="delerName" value={formData.delerName} onChange={handleChange} disabled={!formData.distributorName || loading} className={`w-full px-3 py-2 border rounded-md bg-white ${!formData.distributorName || loading ? 'opacity-50' : ''}`}>
            <option value="">
              {loading ? 'Loading Dealers...' : formData.distributorName && dealers.length > 0 ? 'Select Dealer' : formData.distributorName ? 'No Dealers Found' : 'Select Distributor First'}
            </option>
            {dealers.map(dealer => (<option key={dealer._id || dealer.mobile} value={dealer.name || dealer.business_Name}>{dealer.name || dealer.business_Name || 'Unknown Dealer'}</option>))}
          </select>
        </div>
        
        {/* --- Device Number Dropdown (Existing) --- */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Device No (Serial No)</label>
          <select name="deviceNo" value={formData.deviceNo} onChange={handleChange} disabled={!formData.delerName || loading} className={`w-full px-3 py-2 border rounded-md bg-white ${!formData.delerName || loading ? 'opacity-50' : ''}`}>
            <option value="">
              {loading ? 'Loading Device Nos...' : formData.delerName && deviceNumbers.length > 0 ? 'Select Device Number' : formData.delerName ? 'No Devices Found' : 'Select Dealer First'}
            </option>
            {deviceNumbers.map(device => (<option key={device.deviceSerialNo} value={device.deviceSerialNo}>{device.deviceSerialNo}</option>))}
          </select>
        </div>
        
        {/* --- Packages Dropdown (Existing) --- */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Packages</label>
          <select name="Packages" value={formData.Packages} onChange={handleChange} disabled={packagesLoading} className={`w-full px-3 py-2 border rounded-md bg-white ${packagesLoading ? 'opacity-50' : ''}`}>
            <option value="">
              {packagesLoading ? 'Loading Packages...' : packages.length > 0 ? 'Select Package' : 'No Packages Found'}
            </option>
            {packages.map(pkg => (<option key={pkg._id} value={pkg._id}>{pkg.packageName || pkg._id}</option>))}
          </select>
        </div>

        {/* --- PACKAGE DETAILS BOX (Existing) --- */}
        {renderPackageDetailsBox()}
        
        {/* --- Dynamic SIM Card Boxes Section (Existing) --- */}
        <div className="md:col-span-3 border-b pb-2 mb-4 mt-4">
            <h3 className="text-xl font-semibold text-blue-700">SIM Card Details (Auto-Populated)</h3>
        </div>
        
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {renderSimInputs()}
        </div>

        <div className="md:col-span-3 border-b pb-2 mt-4">
            <h3 className="text-xl font-semibold text-blue-700">Device, Vehicle & Customer Info</h3>
        </div>

        {/* --- Device Fields --- */}
        {['deviceType','voltage','elementType','batchNo'].map((field) => (
          <div key={field}>
            <label className="block mb-1 font-medium text-gray-700">{getLabel(field)}</label>
            <input type={field.toLowerCase().includes('number') ? 'number' : 'text'} name={field} value={formData[field]} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
        ))}

        {/* --- Customer Location Dropdowns (Corrected Labels) --- */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Customer Country</label>
          <select name="Customercountry" value={formData.Customercountry} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option value="">Select Country</option>
            {COUNTRIES.map(c => (<option key={`cust-${c.code}`} value={c.name}>{c.name}</option>))}
          </select>
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-gray-700">Customer State</label>
          {formData.Customercountry === 'India' ? (
            <select name="Customerstate" value={formData.Customerstate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option value="">Select State</option>
              {INDIA_STATES.map(state => (<option key={`cust-${state}`} value={state}>{state}</option>))}
            </select>
          ) : (
            <input type="text" name="Customerstate" value={formData.Customerstate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter State/Province"/>
          )}
        </div>
        
        {/* --- Other Text & Number Inputs (Corrected Labels) --- */}
        {textNumberInputs.filter(f => !['deviceType','voltage','elementType','batchNo'].includes(f)).map((field) => (
          <div key={field}>
            <label className="block mb-1 font-medium text-gray-700">{getLabel(field)}</label>
            <input
              type={field.toLowerCase().includes('email') ? 'email' :
                    field.toLowerCase().includes('date') || field.toLowerCase().includes('mapped') ? 'date' :
                    field.toLowerCase().includes('no') || field.toLowerCase().includes('reading') || field.toLowerCase().includes('adhar') || field.toLowerCase().includes('pan') || field.toLowerCase().includes('mobile') || field.toLowerCase().includes('pin') ? 'number' :
                    'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        ))}

        {/* --- File Inputs (Corrected Labels and Names) --- */}
        <div className="md:col-span-3 border-t pt-4 mt-4">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Document Uploads</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {fileInputs.map((file) => (
              <div key={file.key}>
                <label className="block mb-1 font-medium text-gray-700">{file.label}</label>
                <input
                  type="file"
                  name={file.key} // Matches backend field name
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            ))}
          </div>
        </div>


        <div className="md:col-span-3 mt-6">
          <button
            type="submit"
            disabled={loading || packagesLoading}
            className="w-full bg-blue-600 text-white px-3 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-150"
          >
            {loading || packagesLoading ? 'Submitting...' : '💾 Submit All Data'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ManageMapDevices;