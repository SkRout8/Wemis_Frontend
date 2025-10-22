import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Edit,
  Eye,
  FileText,
  File,
  Database,
  MapPin,
  X,
  Plus,
  Truck,
  User,
  Wrench,
  Clipboard,
  Package,
  CheckCircle,
  Hash,
  Upload,
} from 'lucide-react';

// Assuming ManufactureNavbar is defined in a separate file or included above.
import ManufactureNavbar from './ManufactureNavbar';

// --- Constants for Indian States (from search result) ---
const INDIAN_STATES = [
  { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
  { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
  { label: 'Assam', value: 'Assam' },
  { label: 'Bihar', value: 'Bihar' },
  { label: 'Chhattisgarh', value: 'Chhattisgarh' },
  { label: 'Goa', value: 'Goa' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Haryana', value: 'Haryana' },
  { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
  { label: 'Jharkhand', value: 'Jharkhand' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Kerala', value: 'Kerala' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Manipur', value: 'Manipur' },
  { label: 'Meghalaya', value: 'Meghalaya' },
  { label: 'Mizoram', value: 'Mizoram' },
  { label: 'Nagaland', value: 'Nagaland' },
  { label: 'Odisha', value: 'Odisha' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Sikkim', value: 'Sikkim' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Telangana', value: 'Telangana' },
  { label: 'Tripura', value: 'Tripura' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Uttarakhand', value: 'Uttarakhand' },
  { label: 'West Bengal', value: 'West Bengal' },
  { label: 'Andaman and Nicobar Islands (UT)', value: 'Andaman and Nicobar Islands' },
  { label: 'Chandigarh (UT)', value: 'Chandigarh' },
  { label: 'Dadra and Nagar Haveli and Daman & Diu (UT)', value: 'Dadra and Nagar Haveli and Daman & Diu' },
  { label: 'Delhi (NCT)', value: 'Delhi' },
  { label: 'Jammu and Kashmir (UT)', value: 'Jammu and Kashmir' },
  { label: 'Ladakh (UT)', value: 'Ladakh' },
  { label: 'Lakshadweep (UT)', value: 'Lakshadweep' },
  { label: 'Puducherry (UT)', value: 'Puducherry' },
];

// ----------------------------------------------------------------------
// --- Reusable Input Component (Unchanged) ---
// ----------------------------------------------------------------------
const FormInput = ({ label, type = 'text', name, value, onChange, required, options, min, max, placeholder, multiple = false }) => {
  const commonClasses = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-yellow-400 focus:border-yellow-400 transition duration-150 shadow-inner text-sm";
  const labelClasses = "block text-xs font-medium text-yellow-400 mb-1 flex items-center uppercase tracking-wider";

  let inputField;

  // Ensure default 'select' option is included if not for file/radio
  const selectOptions = useMemo(() => {
    if (type === 'select' && options) {
      // Prepend a "Select" option if the current value isn't set
      if (value === '' || !options.find(opt => opt.value === value)) {
        return [{ label: `Choose ${label}`, value: '' }, ...options];
      }
      return options;
    }
    return options;
  }, [type, options, value, label]);

  if (type === 'select' && options) {
    inputField = (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={commonClasses + " appearance-none cursor-pointer"}
        multiple={multiple}
      >
        {selectOptions.map((option, index) => (
          <option key={index} value={option.value || option.label} className="bg-slate-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'file') {
    inputField = (
      <input
        type="file"
        name={name}
        onChange={onChange}
        required={required}
        accept="image/png, image/jpeg, application/pdf"
        className={commonClasses + " file:mr-4 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 cursor-pointer"}
      />
    );
  } else if (type === 'radio') {
    inputField = (
      <div className="flex space-x-6 pt-1">
        {options.map((option, index) => (
          <label key={index} className="inline-flex items-center text-slate-200 text-sm">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              required={required}
              className="form-radio h-4 w-4 text-yellow-400 bg-slate-700 border-slate-500 focus:ring-yellow-400"
            />
            <span className="ml-2">{option.label}</span>
          </label>
        ))}
      </div>
    );
  } else {
    inputField = (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder || label}
        className={commonClasses}
      />
    );
  }

  return (
    <div className="relative">
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {inputField}
    </div>
  );
};

// ----------------------------------------------------------------------
// --- MapDeviceModal Component (Updated for API/Token/States) ---
// ----------------------------------------------------------------------
const MapDeviceModal = ({ isOpen, onClose, userToken = 'YOUR_AUTH_TOKEN_FROM_PARENT_COMPONENT' }) => {

  // --- API Configuration (PLACEHOLDERS - Update these) ---
  const BASE_URL = 'https://wemis-backend.onrender.com';
  const ENDPOINTS = {
    MAP_DEVICE: `${BASE_URL}/manufactur/manuFacturMAPaDevice`,
    GET_COUNTRIES: `${BASE_URL}/api/countries`, // Placeholder API endpoint
    GET_DISTRIBUTORS: `${BASE_URL}/api/distributors`, // Placeholder API endpoint
    GET_DEALERS: `${BASE_URL}/api/dealers`, // Placeholder API endpoint
    GET_TECHNICIANS: `${BASE_URL}/api/technicians`, // Placeholder API endpoint
  };

  // --- State for Modal Logic ---
  const [currentTab, setCurrentTab] = useState('device');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [documentFiles, setDocumentFiles] = useState({});

  // --- State for Dynamic Data ---
  const [apiCountries, setApiCountries] = useState([]);
  const [apiStates, setApiStates] = useState([]); // This will be dynamic for RFC/Customer states
  const [apiDistributors, setApiDistributors] = useState([]);
  const [apiDealers, setApiDealers] = useState([]);
  const [apiTechnicians, setApiTechnicians] = useState([]);

  // 1. Hook: initialFormData (useMemo)
  const initialFormData = useMemo(() => ({
    // RFC Info
    country: '', state: '', distributorName: '', delerName: '',
    // Device Info
    deviceType: '', deviceNo: '', voltage: '', elementType: '', batchNo: '',
    // SIM Info
    simNumber: '', iccid: '', networkOperator: '',
    // Vehicle Info
    VechileBirth: 'New', RegistrationNo: '', date: '', ChassisNumber: '', EngineNumber: '',
    VehicleType: '', MakeModel: '', ModelYear: '', InsuranceRenewDate: '', PollutionRenewdate: '',
    // Customer Info
    fullName: '', email: '', mobileNo: '', GstinNo: '', Customercountry: '',
    Customerstate: '', Customerdistrict: '', Rto: '', PinCode: '', CompliteAddress: '',
    AdharNo: '', PanNo: '',
    // Technician Info
    technicianNameSelect: '', technicianName: '', technicianEmail: '', technicianMobile: '',
    // Installation Detail
    InvoiceNo: '', VehicleKMReading: 0, DriverLicenseNo: '', MappedDate: '', NoOfPanicButtons: 0,
    // Packages
    Packages: '2 YEAR AIS 140 VLTD SUBSCRIPTION',
  }), []);

  // 2. Hook: formData (useState)
  const [formData, setFormData] = useState(initialFormData);

  // --- API Data Fetching Logic ---
  const authHeaders = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    
  }), [userToken]);
 

  // Function to fetch static/initial dropdown data
  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch Countries (using a mock for now, but keeping the API structure)
      // Mocking 'India' as the default country
      setApiCountries([{ label: 'India', value: 'India' }]);
      console.log(formData.state)

      // Fetch Distributors
      const distResponse = await axios.post("https://wemis-backend.onrender.com/manufactur/fetchDistributorOnBasisOfState", { state: formData.state }, authHeaders);
      console.log(distResponse.data.distributors)
      setApiDistributors(distResponse.data.distributors.map(d => ({ label: d.distributor, value: d.distributor })));
     
      setApiDealers([{ label: 'DUMMY_DEAL-A', value: 'DUMMY_DEAL-A' }, { label: 'DUMMY_DEAL-B', value: 'DUMMY_DEAL-B' }]);

      setApiTechnicians([{ label: 'Technician 1', value: 'TECH-1' }, { label: 'Technician 2', value: 'TECH-2' }]);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      setSubmissionMessage({ type: 'error', text: 'Failed to load dropdown data.' });
    }
  }, [authHeaders]); // Include authHeaders in dependency array

  // Effect to load initial data on modal open
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, fetchInitialData]);

  // Effect to handle Indian State Population
  useEffect(() => {
    // Both RFC State (state) and Customer State (Customerstate) should use this logic
    const isIndianCountry = formData.country === 'India' || formData.Customercountry === 'India';

    // Only set Indian states if India is selected in *either* country field
    if (isIndianCountry) {
      // Set the consolidated Indian states list
      setApiStates(INDIAN_STATES);
    } else {
      // If other countries are selected, you'd fetch their states or clear the list
      setApiStates([]);
    }

    // This effect runs whenever country or Customercountry changes
  }, [formData.country, formData.Customercountry]);

  // 6. Hook: Reset form when modal closes (useEffect)
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setDocumentFiles({});
      setSubmissionMessage(null);
      setCurrentTab('device'); // Reset tab
      setApiStates([]); // Clear states on close
    }
  }, [isOpen, initialFormData]);

  // 7. Hook: handleInputChange (useCallback)
  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const finalValue = (type === 'radio') ? value : ((type === 'number' && value !== '') ? Number(value) : value);

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
      // Logic to clear dependent fields if country/state changes
      ...(name === 'country' && { state: '' }),
      ...(name === 'Customercountry' && { Customerstate: '' }),
      ...(name === 'Customerstate' && { Customerdistrict: '' }),
    }));
  }, []);

  // 8. Hook: handleFileChange (useCallback)
  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setDocumentFiles(prev => ({
      ...prev,
      [name]: files[0],
    }));
  }, []);

  // 9. Hook: documentFields (useMemo - Unchanged)
  const documentFields = useMemo(() => ([
    { name: 'vehicleDoc', label: 'Vehicle Photo', required: true },
    { name: 'rcDoc', label: 'RC (Registration Certificate)', required: true },
    { name: 'deviceDoc', label: 'Device Installation Photo', required: true },
    { name: 'panCardDoc', label: 'Pan Card', required: true },
    { name: 'aadhaarCardDoc', label: 'Aadhaar Card', required: true },
    { name: 'invoiceDoc', label: 'Invoice', required: true },
    { name: 'signatureDoc', label: 'Signature', required: true },
    { name: 'panicButtonDoc', label: 'Panic Button with Sticker', required: true },
  ]), []);

  // 10. Hook: Static Options (useMemo - Updated to use fetched data)
  const countries = useMemo(() => [{ label: 'Choose Country', value: '' }, ...apiCountries], [apiCountries]);
  const statesOptions = useMemo(() => [{ label: 'Choose State', value: '' }, ...apiStates], [apiStates]);
  const distributorOptions = useMemo(() => [{ label: 'Select Distributor', value: '' }, ...apiDistributors], [apiDistributors]);
  const dealerOptions = useMemo(() => [{ label: 'Select Dealer', value: '' }, ...apiDealers], [apiDealers]);
  const technicianOptions = useMemo(() => [{ label: 'Select Technician', value: '' }, ...apiTechnicians], [apiTechnicians]);

  // Other static options
  const vehicleTypes = useMemo(() => [
    { label: 'Choose Vehicle Type', value: '' },
    { label: 'AUTO', value: 'AUTO' }, { label: 'BUS', value: 'BUS' },
    { label: 'TRUCK', value: 'TRUCK' }, { label: 'TAXI', value: 'TAXI' },
    { label: 'TRACTOR', value: 'TRACTOR' }, { label: 'TRAILER TRUCK', value: 'TRAILER TRUCK' },
  ], []);
  const deviceTypes = useMemo(() => [
    { label: 'Select Device Type', value: '' },
    { label: 'New', value: 'New' },
    { label: 'Renewal', value: 'Renewal' }
  ], []);
  const vehicleBirthOptions = useMemo(() => [
    { label: 'New', value: 'New' },
    { label: 'Old', value: 'Old' }
  ], []);
  const dummySelections = useMemo(() => [{ label: 'Select Option', value: '' }, { label: 'Option A', value: 'A' }], []); // For District/RTO

  const tabs = useMemo(() => [
    { id: 'device', label: 'Device & SIM', icon: Database, fields: ['deviceType', 'deviceNo', 'voltage', 'elementType', 'batchNo', 'simNumber', 'networkOperator', 'iccid'] },
    { id: 'vehicle', label: 'Vehicle Info', icon: Truck, fields: ['VechileBirth', 'RegistrationNo', 'date', 'ChassisNumber', 'EngineNumber', 'VehicleType', 'MakeModel', 'ModelYear', 'InsuranceRenewDate', 'PollutionRenewdate'] },
    { id: 'customer', label: 'Customer Info', icon: User, fields: ['fullName', 'email', 'mobileNo', 'GstinNo', 'Customercountry', 'Customerstate', 'Customerdistrict', 'Rto', 'PinCode', 'CompliteAddress', 'AdharNo', 'PanNo'] },
    { id: 'installation', label: 'Installation', icon: Wrench, fields: ['InvoiceNo', 'VehicleKMReading', 'DriverLicenseNo', 'MappedDate', 'NoOfPanicButtons', 'technicianNameSelect', 'technicianName', 'technicianEmail', 'technicianMobile'] },
    { id: 'documents', label: 'Documents', icon: Upload, fields: documentFields.map(f => f.name) },
  ], [documentFields]);












  const getTabStatus = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return 'incomplete';

    let isComplete = true;
    tab.fields.forEach(fieldName => {
      // Check for required fields in formData
      const formValue = formData[fieldName];

      // This is a simplified check for required text/select/number fields
      // A more robust solution would involve explicit validation for each field
      const isRequired = ['deviceType', 'deviceNo', 'simNumber', 'iccid', 'RegistrationNo', 'VehicleType', 'MakeModel', 'ModelYear', 'ChassisNumber', 'EngineNumber', 'fullName', 'mobileNo', 'AdharNo', 'PanNo', 'Customercountry', 'Customerstate', 'Customerdistrict', 'Rto', 'PinCode', 'CompliteAddress', 'technicianNameSelect', 'InvoiceNo', 'DriverLicenseNo', 'MappedDate'].includes(fieldName);

      if (isRequired) {
        if (typeof formValue === 'string' && formValue.trim() === '') {
          isComplete = false;
        } else if (typeof formValue === 'number' && (formValue === 0 || isNaN(formValue)) && fieldName !== 'VehicleKMReading') {
          isComplete = false;
        }
      }

      // Check for required document files
      const docField = documentFields.find(f => f.name === fieldName);
      if (docField && docField.required && !documentFiles[fieldName]) {
        isComplete = false;
      }
    });

    return isComplete ? 'complete' : 'incomplete';
  }, [formData, documentFiles, tabs, documentFields]);

  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1].id);
    }
  };

  // --- Submission Handler (Updated to pass Token) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final Tab check
    if (currentTab !== 'documents') {
      setSubmissionMessage({ type: 'error', text: 'Please review and complete all sections before submitting.' });
      setCurrentTab('documents');
      return;
    }

    // Check for required files
    const missingFiles = documentFields.filter(field => !documentFiles[field.name]);
    if (missingFiles.length > 0) {
      setSubmissionMessage({
        type: 'error',
        text: `Missing required documents: ${missingFiles.map(f => f.label).join(', ')}`
      });
      setTimeout(() => setSubmissionMessage(null), 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      const formDataToSend = new FormData();
      const simDetails = JSON.stringify({
        simNumber: formData.simNumber, iccid: formData.iccid, networkOperator: formData.networkOperator,
      });

      const dataMapping = {
        country: formData.country, state: formData.state, distributorName: formData.distributorName, delerName: formData.delerName,
        deviceType: formData.deviceType, deviceNo: formData.deviceNo, voltage: formData.voltage, elementType: formData.elementType, batchNo: formData.batchNo,
        simDetails: simDetails, VechileBirth: formData.VechileBirth, RegistrationNo: formData.RegistrationNo, date: formData.date,
        ChassisNumber: formData.ChassisNumber, EngineNumber: formData.EngineNumber, VehicleType: formData.VehicleType,
        MakeModel: formData.MakeModel, ModelYear: formData.ModelYear, InsuranceRenewDate: formData.InsuranceRenewDate, PollutionRenewdate: formData.PollutionRenewdate,
        fullName: formData.fullName, email: formData.email, mobileNo: formData.mobileNo, GstinNo: formData.GstinNo, Customercountry: formData.Customercountry,
        Customerstate: formData.Customerstate, Customerdistrict: formData.Customerdistrict, Rto: formData.Rto, PinCode: formData.PinCode,
        CompliteAddress: formData.CompliteAddress, AdharNo: formData.AdharNo, PanNo: formData.PanNo, Packages: formData.Packages,
        InvoiceNo: formData.InvoiceNo, VehicleKMReading: formData.VehicleKMReading, DriverLicenseNo: formData.DriverLicenseNo,
        MappedDate: formData.MappedDate, NoOfPanicButtons: formData.NoOfPanicButtons,
        technicianName: formData.technicianName, technicianEmail: formData.technicianEmail, technicianMobile: formData.technicianMobile,
      };

      // Append all form data
      Object.entries(dataMapping).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      // Append all document files
      Object.keys(documentFiles).forEach(key => {
        if (documentFiles[key]) {
          formDataToSend.append(key, documentFiles[key], documentFiles[key].name);
        }
      });

      // *** IMPORTANT: Passing the Authorization Token via Headers ***
      const response = await axios.post(ENDPOINTS.MAP_DEVICE, formDataToSend, authHeaders);

      console.log('Submission Success:', response.data);
      setSubmissionMessage({ type: 'success', text: response.data?.message || 'Device Mapping Submitted Successfully!' });

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Submission Error:', error.response || error);
      const errorText = error.response?.data?.message || error.message || 'An unexpected error occurred during submission.';
      setSubmissionMessage({ type: 'error', text: `Submission Failed: ${errorText}` });

      setTimeout(() => setSubmissionMessage(null), 7000);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Message Component
  const MessageBox = () => submissionMessage ? (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 mt-4 p-4 rounded-lg shadow-2xl z-[100] transition-opacity duration-300 ${submissionMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
      <p className="font-semibold">{submissionMessage.text}</p>
    </div>
  ) : null;

  if (!isOpen) return null;

  // Tab Content Renderer
  const renderTabContent = () => {
    switch (currentTab) {
      case 'device':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h4 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-yellow-500 mb-2 border-b border-slate-700 pb-2">Device Details</h4>
            <FormInput label="Device Type" name="deviceType" value={formData.deviceType} onChange={handleInputChange} required options={deviceTypes} type="select" />
            <FormInput label="Device No" name="deviceNo" value={formData.deviceNo} onChange={handleInputChange} required options={dummySelections} type="select" />
            <FormInput label="Batch No." name="batchNo" value={formData.batchNo} onChange={handleInputChange} placeholder="Enter Batch Number" />
            <FormInput label="Voltage" name="voltage" value={formData.voltage} onChange={handleInputChange} placeholder="Enter Voltage" />
            <FormInput label="Element Type" name="elementType" value={formData.elementType} onChange={handleInputChange} placeholder="Enter Element Type" />

            <h4 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-yellow-500 mt-4 mb-2 border-b border-slate-700 pb-2">SIM Details</h4>
            <FormInput label="SIM Number" name="simNumber" value={formData.simNumber} onChange={handleInputChange} required placeholder="Enter SIM Number" />
            <FormInput label="Network Operator" name="networkOperator" value={formData.networkOperator} onChange={handleInputChange} placeholder="Enter Network Operator" />
            <FormInput label="ICCID" name="iccid" value={formData.iccid} onChange={handleInputChange} required placeholder="Enter ICCID" />
          </div>
        );
      case 'vehicle':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormInput label="Vehicle Birth" name="VechileBirth" value={formData.VechileBirth} onChange={handleInputChange} required options={vehicleBirthOptions} type="radio" />
            <FormInput label="Vehicle Type" name="VehicleType" value={formData.VehicleType} onChange={handleInputChange} required options={vehicleTypes} type="select" />
            <FormInput label="Make & Model" name="MakeModel" value={formData.MakeModel} onChange={handleInputChange} required placeholder="e.g., TATA Ace" />
            <FormInput label="Registration No." name="RegistrationNo" value={formData.RegistrationNo} onChange={handleInputChange} required placeholder="e.g., MH12AB1234" />
            <FormInput label="Model Year" name="ModelYear" value={formData.ModelYear} onChange={handleInputChange} required type="number" min="1900" max={new Date().getFullYear()} placeholder="e.g., 2023" />
            <FormInput label="Chassis Number" name="ChassisNumber" value={formData.ChassisNumber} onChange={handleInputChange} required placeholder="Enter Chassis Number" />
            <FormInput label="Engine Number" name="EngineNumber" value={formData.EngineNumber} onChange={handleInputChange} required placeholder="Enter Engine Number" />
            <FormInput label="Insurance Renew date" name="InsuranceRenewDate" value={formData.InsuranceRenewDate} onChange={handleInputChange} type="date" />
            <FormInput label="Pollution Renew date" name="PollutionRenewdate" value={formData.PollutionRenewdate} onChange={handleInputChange} type="date" />
          </div>
        );
      case 'customer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h4 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-yellow-500 mb-2 border-b border-slate-700 pb-2">Customer Details</h4>
            <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="Enter Full Name" />
            <FormInput label="Mobile Number" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} required type="tel" placeholder="Enter Mobile Number" />
            <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Enter Email" />
            <FormInput label="Aadhaar Number" name="AdharNo" value={formData.AdharNo} onChange={handleInputChange} required placeholder="Enter Aadhaar Number" />
            <FormInput label="PAN Number" name="PanNo" value={formData.PanNo} onChange={handleInputChange} required placeholder="Enter PAN Number" />
            <FormInput label="GSTIN Number" name="GstinNo" value={formData.GstinNo} onChange={handleInputChange} placeholder="Enter GSTIN" />

            <h4 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-yellow-500 mt-4 mb-2 border-b border-slate-700 pb-2">Address & RTO Info</h4>
            <FormInput label="Country" name="Customercountry" value={formData.Customercountry} onChange={handleInputChange} required options={countries} type="select" />
            <FormInput label="State/Region" name="Customerstate" value={formData.Customerstate} onChange={handleInputChange} required options={statesOptions} type="select" />
            <FormInput label="District" name="Customerdistrict" value={formData.Customerdistrict} onChange={handleInputChange} required options={dummySelections} type="select" />
            <FormInput label="RTO Division" name="Rto" value={formData.Rto} onChange={handleInputChange} required options={dummySelections} type="select" />
            <FormInput label="Pin Code" name="PinCode" value={formData.PinCode} onChange={handleInputChange} required type="number" placeholder="Enter Pin Code" />
            <div className="md:col-span-2 lg:col-span-3">
              <FormInput label="Complete Address" name="CompliteAddress" value={formData.CompliteAddress} onChange={handleInputChange} required placeholder="Enter Complete Address" />
            </div>
          </div>
        );
      case 'installation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h4 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-yellow-500 mb-2 border-b border-slate-700 pb-2">Technician Info</h4>
            <FormInput label="Select Technician" name="technicianNameSelect" value={formData.technicianNameSelect} onChange={handleInputChange} required options={technicianOptions} type="select" />
            <FormInput label="Name" name="technicianName" value={formData.technicianName} onChange={handleInputChange} required placeholder="Technician Name" />
            <FormInput label="Email" name="technicianEmail" value={formData.technicianEmail} onChange={handleInputChange} required type="email" placeholder="Technician Email" />
            <FormInput label="Mobile" name="technicianMobile" value={formData.technicianMobile} onChange={handleInputChange} required type="tel" placeholder="Technician Mobile" />

            <h4 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-yellow-500 mt-4 mb-2 border-b border-slate-700 pb-2">Installation Details</h4>
            <FormInput label="Invoice No" name="InvoiceNo" value={formData.InvoiceNo} onChange={handleInputChange} required placeholder="Enter Invoice No" />
            <FormInput label="Vehicle KM Reading" name="VehicleKMReading" value={formData.VehicleKMReading} onChange={handleInputChange} required type="number" min="0" placeholder="Enter KM Reading" />
            <FormInput label="Driver License No" name="DriverLicenseNo" value={formData.DriverLicenseNo} onChange={handleInputChange} required placeholder="Enter Driver License No" />
            <FormInput label="Mapped Date" name="MappedDate" value={formData.MappedDate} onChange={handleInputChange} required type="date" />
            <FormInput label="No Of Panic Buttons" name="NoOfPanicButtons" value={formData.NoOfPanicButtons} onChange={handleInputChange} required type="number" min="0" placeholder="Number of Panic Buttons" />

            <div className="md:col-span-2 lg:col-span-3 pt-4">
              <h4 className="text-lg font-semibold text-yellow-500 mb-2 border-b border-slate-700 pb-2">Package</h4>
              <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-base font-extrabold text-white">2 YEAR AIS 140 VLTD SUBSCRIPTION</p>
                <p className="text-yellow-400 font-mono text-sm">₹3500.00 / 730 days</p>
              </div>
              <input type="hidden" name="Packages" value={formData.Packages} />
            </div>

          </div>
        );
      case 'documents':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-slate-400 mb-4 text-sm italic border-b border-slate-700 pb-2">
                * All listed documents are **required**. Supported file types: PNG, JPG, JPEG, PDF.
              </p>
            </div>
            {documentFields.map((field) => (
              <FormInput
                key={field.name}
                label={`${field.label} ${documentFiles[field.name] ? ' (Ready: ' + documentFiles[field.name].name + ')' : ''}`}
                name={field.name}
                onChange={handleFileChange}
                required={field.required}
                type="file"
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="relative bg-slate-800 w-full max-w-5xl rounded-xl shadow-2xl border border-yellow-400/30 max-h-[90vh] flex flex-col">
        <MessageBox />

        {/* Modal Header */}
        <header className="flex justify-between items-center p-6 rounded-t-xl border-b border-yellow-400/50 bg-slate-700/50">
          <h1 className="text-2xl font-extrabold text-yellow-400 flex items-center space-x-3">
            <MapPin size={24} />
            <span>Map New Device</span>
          </h1>
          <button
            onClick={onClose}
            className="text-yellow-400 hover:text-red-500 transition p-2 rounded-full hover:bg-slate-800"
          >
            <X size={24} />
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 bg-slate-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const status = getTabStatus(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold transition-all duration-200 ${currentTab === tab.id
                  ? 'border-b-4 border-yellow-400 text-yellow-400 bg-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {status === 'complete' && (
                  <CheckCircle size={14} className="text-green-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 overflow-y-auto flex-grow space-y-6">
            {/* RFC Details (Always visible, simplified for space) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-700">
              <FormInput label="Country" name="country" value={formData.country} onChange={handleInputChange} required options={countries} type="select" />
              <FormInput label="State" name="state" value={formData.state} onChange={handleInputChange} required options={statesOptions} type="select" />
              <FormInput label="Distributor" name="distributorName" value={formData.distributorName} onChange={handleInputChange} required options={distributorOptions} type="select" />
              <FormInput label="Dealer" name="delerName" value={formData.delerName} onChange={handleInputChange} required options={dealerOptions} type="select" />
            </div>

            {/* Tab Content */}
            {renderTabContent()}

          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-b-xl border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition shadow-md"
            >
              Cancel
            </button>

            {currentTab !== 'documents' && (
              <button
                type="button"
                onClick={goToNextTab}
                className="px-4 py-2 bg-yellow-400 text-black font-extrabold rounded-lg hover:bg-yellow-500 transition shadow-lg shadow-yellow-500/50 flex items-center space-x-2"
              >
                <span>Next Step</span>
                <Plus size={16} />
              </button>
            )}

            {currentTab === 'documents' && (
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-400 text-black font-extrabold rounded-lg hover:bg-yellow-500 transition shadow-lg shadow-yellow-500/50 disabled:opacity-50 flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Final Submit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// --- Main Component: ManufactureDashboard (Updated to pass token) ---
// ----------------------------------------------------------------------
function ManufactureDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // *** IMPORTANT: Placeholder for your actual token management ***
  // You would typically get this from your authentication context or localStorage
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoibWFudWZhY3R1cmVyIiwiaWF0IjoxNjcwNzMwMjYyfQ.Sg8NnL_6Q8T4x-wHwJtJ_Y7gK2QyV5Y4UoPz8';

  useEffect(() => {
    // Mock data loading
    const mockDevices = [
      { deviceId: 'DEV-001', imei: '123456789012345', vehicleNo: 'MH12AB1234', networkOperator: 'Vodafone', speed: 55, ignition: '1', lastUpdate: Date.now() - 300000 },
      { deviceId: 'DEV-002', imei: '123456789012346', vehicleNo: 'KA03CD5678', networkOperator: 'Airtel', speed: 0, ignition: '0', lastUpdate: Date.now() - 600000 },
      { deviceId: 'DEV-003', imei: '123456789012347', vehicleNo: 'UP45EF9012', networkOperator: 'Jio', speed: 82, ignition: '1', lastUpdate: Date.now() - 120000 },
      { deviceId: 'DEV-004', imei: '123456789012348', vehicleNo: 'TN37GH3456', networkOperator: 'Vodafone', speed: 40, ignition: '1', lastUpdate: Date.now() - 10000 },
      { deviceId: 'DEV-005', imei: '123456789012349', vehicleNo: 'RJ14IJ7890', networkOperator: 'Jio', speed: 10, ignition: '0', lastUpdate: Date.now() - 1000 },
    ];

    setTimeout(() => {
      setDevices(mockDevices);
      setLoading(false);
    }, 800);
  }, []);

  const actions = useMemo(() => ([
    { label: "Edit", icon: <Edit size={18} />, route: "/devices/edit" },
    { label: "View", icon: <Eye size={18} />, route: "/devices/view" },
    { label: "Certificates", icon: <FileText size={18} />, route: "/devices/certificates" },
    { label: "Documents", icon: <File size={18} />, route: "/devices/documents" },
    { label: "Data Log", icon: <Database size={18} />, route: "/devices/log" },
    { label: "Live Tracking", icon: <MapPin size={18} />, route: "/devices/live" },
  ]), []);

  return (
    <div className="relative min-h-screen bg-slate-900">
      <ManufactureNavbar />
      <div className="text-slate-200 font-sans">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-b from-slate-900 to-slate-800 px-4 md:px-6 py-6 shadow-2xl">
          <div className="flex items-center space-x-3 text-yellow-400 text-2xl font-extrabold mb-4 sm:mb-0">
            <MapPin size={28} />
            <span>Device Mapping Portal</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-yellow-400 rounded-xl px-5 py-3 text-black text-sm font-extrabold hover:bg-yellow-500 transition shadow-xl shadow-yellow-500/50 transform hover:scale-[1.02] w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            <span>Map New Device</span>
          </button>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Quick Actions */}
          <section className="bg-slate-800 rounded-xl mt-6 p-6 shadow-2xl border border-yellow-400/20 ring-1 ring-yellow-400/10">
            <h2 className="text-yellow-400 font-extrabold text-xl mb-6 text-center">
              Quick Actions
            </h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-4 bg-slate-700 rounded-lg text-slate-200 hover:bg-yellow-400 hover:text-black transition duration-200 cursor-pointer w-32 h-24 shadow-lg hover:shadow-yellow-500/50"
                >
                  {action.icon}
                  <span className="mt-2 text-xs font-semibold">{action.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Device List (Simplified) */}
          <section className="mt-8">
            <h2 className="text-yellow-400 font-extrabold text-xl mb-4">Mapped Devices</h2>
            {/* Table or list of devices here */}
            {loading ? (
              <p className="text-slate-400">Loading devices...</p>
            ) : (
              <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
                <p className="text-slate-300">Displaying {devices.length} mock devices. Actual device list implementation is needed here.</p>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* MapDeviceModal is rendered here */}
      <MapDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToken={AUTH_TOKEN} // Pass the token to the modal
      />
    </div>
  );
}

export default ManufactureDashboard;
// You can use the ManufactureDashboard component as the default export.
// For testing the modal in isolation, you can export MapDeviceModal, but typically you only export the main view.
export { MapDeviceModal, FormInput, ManufactureDashboard };