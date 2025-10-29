import React, { useState, useEffect, useCallback } from 'react';
import { X, Menu, MapPin, Package, FileText, User, Smartphone } from 'lucide-react';
import ManufactureNavbar from './ManufactureNavbar';
import DeviceMapreport from './DeviceMapreport';

// --- Configuration ---
const DISTRIBUTOR_API = 'https://wemis-backend.onrender.com/manufactur/fetchDistributorOnBasisOfState';
const DEALER_API = 'https://wemis-backend.onrender.com/manufactur/fetchdelerOnBasisOfDistributor';
const DEVICE_NO_API = 'https://wemis-backend.onrender.com/manufactur/fetchDeviceNoOnBasisOfDeler';
const SUBMIT_API = 'https://wemis-backend.onrender.com/manufactur/manuFacturMAPaDevice';
const PACKAGE_API = 'https://wemis-backend.onrender.com/manufactur/fetchSubScriptionPackages';

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

// --- Main Component ---
function DeviceMappingDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initialFormData = {
    country: 'India',
    state: '',
    distributorName: '',
    delerName: '',
    deviceType: '',
    deviceNo: '',
    voltage: '',
    elementType: '',
    batchNo: '',
    simDetails: '',
    VechileBirth: '',
    RegistrationNo: '',
    date: '',
    ChassisNumber: '',
    EngineNumber: '',
    VehicleType: '',
    MakeModel: '',
    ModelYear: '',
    InsuranceRenewDate: '',
    PollutionRenewdate: '',
    VehicleKMReading: '',
    DriverLicenseNo: '',
    MappedDate: '',
    NoOfPanicButtons: '',
    fullName: '',
    email: '',
    mobileNo: '',
    GstinNo: '',
    Customercountry: 'India',
    Customerstate: '',
    Customerdistrict: '',
    Rto: '',
    PinCode: '',
    CompliteAddress: '',
    AdharNo: '',
    PanNo: '',
    Packages: '',
    InvoiceNo: '',
    Vechile_Doc: null,
    Rc_Doc: null,
    Pan_Card: null,
    Device_Doc: null,
    Adhar_Card: null,
    Invious_Doc: null,
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

  const resetDependentFields = () => {
    setMappedSims([]);
    return {
      deviceNo: '',
      simDetails: '',
    };
  }

  const fetchPackages = useCallback(async () => {
    setPackagesLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch(PACKAGE_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setPackages(data.SubScriptionPackage || []);

    } catch (error) {
      console.error('Error fetching packages:', error.message);
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  }, []);

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

      const response = await fetch(DISTRIBUTOR_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state: selectedState })
      });

      const data = await response.json();
      setDistributors(data.distributors || []);

    } catch (error) {
      console.error('Error fetching distributors:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

      const response = await fetch(DEALER_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ distributorId: selectedDistributorId })
      });

      const data = await response.json();
      setDealers(data.delers || data.dealers || []);
    } catch (error) {
      console.error('Error fetching dealers:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

      const response = await fetch(DEVICE_NO_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delerName: selectedDelerName })
      });

      const data = await response.json();
      console.log(data.devices)
      setDeviceNumbers(data.devices || []);

    } catch (error) {
      console.error('Error fetching device numbers:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let newFormData = { ...formData };

    if (type === 'file') {
      newFormData[name] = files[0];
    } else {
      newFormData[name] = value;
    }

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

    const logData = {};
    for (const key in formData) {
      if (formData[key] !== null && formData[key] instanceof File) {
        logData[key] = formData[key].name;
      } else {
        logData[key] = formData[key];
      }
    }
    logData.mappedSims = mappedSims;
    logData.selectedPackageDetails = selectedPackageDetails;
    console.log("--- Data Before Submission ---");
    console.log(logData);
    console.log("----------------------------");

    for (const key in formData) {
      if (formData[key] !== null && formData[key] instanceof File) {
        continue;
      }

      if (key === 'simDetails') {
        continue;
      }

      data.append(key, formData[key] || '');
    }

    ['Vechile_Doc', 'Rc_Doc', 'Pan_Card', 'Device_Doc', 'Adhar_Card', 'Invious_Doc', 'Signature_Doc', 'Panic_Sticker'].forEach(fileKey => {
      if (formData[fileKey]) {
        data.append(fileKey, formData[fileKey]);
      }
    });

    console.log(mappedSims)
    if (mappedSims.length > 0) {
      data.append('simDetails', JSON.stringify(mappedSims));
    } else {
      data.append('simDetails', JSON.stringify([]));
    }

    
    console.log("--- FormData Keys Being Sent to API ---");
    for (const pair of data.entries()) {
      const value = pair[1];
      if (typeof value === 'object' && value !== null && 'name' in value) {
        console.log(pair[0], ':', value.name, '(File)');
      } else {
        console.log(pair[0], ':', String(value).substring(0, 50) + (String(value).length > 50 ? '...' : ''));
      }
    }
    console.log("---------------------------------------");

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch(SUBMIT_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data
      });

      const result = await response.json();
      console.log('API Response:', result);
      setSubmitStatus('success');
      setFormData(initialFormData);
      setMappedSims([]);
      setSelectedPackageDetails(null);

    } catch (error) {
      console.error('Submission Error:', error.message);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

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
    return labels[key] || key;
  };

  const textNumberInputs = [
    'deviceType', 'voltage', 'elementType', 'batchNo',
    'VechileBirth', 'RegistrationNo', 'date', 'ChassisNumber', 'EngineNumber', 'VehicleType', 'MakeModel', 'ModelYear', 'InsuranceRenewDate',
    'PollutionRenewdate', 'VehicleKMReading', 'DriverLicenseNo',
    'MappedDate', 'NoOfPanicButtons',
    'fullName', 'email', 'mobileNo', 'GstinNo', 'Customerdistrict', 'Rto', 'PinCode',
    'CompliteAddress', 'AdharNo', 'PanNo', 'InvoiceNo',
  ];

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

  const renderSimInputs = () => {
    if (mappedSims.length === 0) {
      return (
        <div className="md:col-span-3 text-center py-6 text-yellow-400 border-2 border-dashed border-yellow-500/30 rounded-lg bg-black/20">
          No SIM details found for the selected device.
        </div>
      );
    }

    return mappedSims.map((sim, index) => (
      <div key={index} className="md:col-span-1 border-2 border-yellow-500 p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 shadow-lg backdrop-blur-sm">
        <h4 className="font-bold mb-4 text-yellow-400 flex items-center gap-2 text-lg">
          <Smartphone size={20} />
          SIM Card {index + 1}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-yellow-300/80">Sim No</label>
            <input type="text" value={sim.simNo || ''} readOnly className="w-full px-3 py-2.5 border border-yellow-500/30 rounded-lg bg-black/40 text-yellow-100 focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-yellow-300/80">ICCID No</label>
            <input type="text" value={sim.iccidNo || ''} readOnly className="w-full px-3 py-2.5 border border-yellow-500/30 rounded-lg bg-black/40 text-yellow-100 focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-yellow-300/80">Operator</label>
            <input type="text" value={sim.operator || ''} readOnly className="w-full px-3 py-2.5 border border-yellow-500/30 rounded-lg bg-black/40 text-yellow-100 focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-yellow-300/80">Validity Date</label>
            <input type="date" value={sim.validityDate ? new Date(sim.validityDate).toISOString().split('T')[0] : ''} readOnly className="w-full px-3 py-2.5 border border-yellow-500/30 rounded-lg bg-black/40 text-yellow-100 focus:outline-none focus:border-yellow-500" />
          </div>
        </div>
      </div>
    ));
  };

  const renderPackageDetailsBox = () => {
    if (!selectedPackageDetails) return null;

    const details = selectedPackageDetails;

    return (
      <div className="md:col-span-3 border-2 border-yellow-500 p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 shadow-2xl mt-6 backdrop-blur-sm">
        <h4 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
          <Package size={24} />
          Selected Package: {details.packageName || 'N/A'}
        </h4>
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

  const PackageDetailItem = ({ label, value }) => (
    <div className="border-b border-yellow-500/20 pb-2">
      <p className="font-semibold text-yellow-300/70 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-yellow-100 break-words mt-1">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div>
      <ManufactureNavbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">

        {/* Navbar */}
        <nav className="bg-black/90 backdrop-blur-md border-b-2 border-yellow-500 sticky top-0  shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <MapPin className="text-yellow-400" size={32} />
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  WEMIS Device Mapping
                </span>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 flex items-center gap-2"
                >
                  <MapPin size={20} />
                  Map New Device
                </button>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Menu size={28} />
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-black/95 border-t border-yellow-500/30">
              <div className="px-4 py-4">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MapPin size={20} />
                  Map New Device
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


          <DeviceMapreport />
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-2xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b-2 border-yellow-500 p-6 flex justify-between items-center z-10">
                <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
                  <MapPin size={32} />
                  Map New Device
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <X size={32} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {(loading || packagesLoading) && (
                  <div className="text-center py-3 text-yellow-400 font-semibold bg-yellow-500/10 rounded-lg mb-4 border border-yellow-500/30">
                    Processing... Please wait.
                  </div>
                )}
                {submitStatus === 'success' && (
                  <div className="bg-green-500/20 border-2 border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> Form submitted successfully!</span>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="bg-red-500/20 border-2 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> Submission failed. Check console for details.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Location Dropdowns */}
                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Country</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors">
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => (<option key={c.code} value={c.name}>{c.name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">State</label>
                    {formData.country === 'India' ? (
                      <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors">
                        <option value="">Select State</option>
                        {INDIA_STATES.map(state => (<option key={state} value={state}>{state}</option>))}
                      </select>
                    ) : (
                      <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500" placeholder="Enter State/Province" />
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Distributor Name</label>
                    <select name="distributorName" value={formData.distributorName} onChange={handleChange} disabled={!formData.state || loading} className={`w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors ${!formData.state || loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="">
                        {loading ? 'Loading Distributors...' : formData.state && distributors.length > 0 ? 'Select Distributor' : formData.state ? 'No Distributors Found' : 'Select State First'}
                      </option>
                      {distributors.map(dist => (<option key={dist._id} value={dist._id}>{dist.contact_Person_Name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Dealer Name</label>
                    <select name="delerName" value={formData.delerName} onChange={handleChange} disabled={!formData.distributorName || loading} className={`w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors ${!formData.distributorName || loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="">
                        {loading ? 'Loading Dealers...' : formData.distributorName && dealers.length > 0 ? 'Select Dealer' : formData.distributorName ? 'No Dealers Found' : 'Select Distributor First'}
                      </option>
                      {dealers.map(dealer => (<option key={dealer._id || dealer.mobile} value={dealer.name || dealer.business_Name}>{dealer.name || dealer.business_Name || 'Unknown Dealer'}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Device No (Serial No)</label>
                    <select name="deviceNo" value={formData.deviceNo} onChange={handleChange} disabled={!formData.delerName || loading} className={`w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors ${!formData.delerName || loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="">
                        {loading ? 'Loading Device Nos...' : formData.delerName && deviceNumbers.length > 0 ? 'Select Device Number' : formData.delerName ? 'No Devices Found' : 'Select Dealer First'}
                      </option>
                      {deviceNumbers.map(device => (<option key={device.deviceSerialNo} value={device.deviceSerialNo}>{device.deviceSerialNo}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Packages</label>
                    <select name="Packages" value={formData.Packages} onChange={handleChange} disabled={packagesLoading} className={`w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors ${packagesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="">
                        {packagesLoading ? 'Loading Packages...' : packages.length > 0 ? 'Select Package' : 'No Packages Found'}
                      </option>
                      {packages.map(pkg => (<option key={pkg._id} value={pkg._id}>{pkg.packageName || pkg._id}</option>))}
                    </select>
                  </div>

                  {renderPackageDetailsBox()}

                  <div className="md:col-span-3 border-b-2 border-yellow-500/20 pb-2 mb-4 mt-6">
                    <h3 className="text-2xl font-semibold text-yellow-400 flex items-center gap-2">
                      <Smartphone size={24} />
                      SIM Card Details (Auto-Populated)
                    </h3>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {renderSimInputs()}
                  </div>

                  <div className="md:col-span-3 border-b-2 border-yellow-500/20 pb-2 mt-6">
                    <h3 className="text-2xl font-semibold text-yellow-400 flex items-center gap-2">
                      <FileText size={24} />
                      Device, Vehicle & Customer Info
                    </h3>
                  </div>

                  {['deviceType', 'voltage', 'elementType', 'batchNo'].map((field) => (
                    <div key={field}>
                      <label className="block mb-2 font-medium text-yellow-300">{getLabel(field)}</label>
                      <input
                        type={field.toLowerCase().includes('number') ? 'number' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors placeholder-yellow-600/50"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Customer Country</label>
                    <select name="Customercountry" value={formData.Customercountry} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors">
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => (<option key={`cust-${c.code}`} value={c.name}>{c.name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-yellow-300">Customer State</label>
                    {formData.Customercountry === 'India' ? (
                      <select name="Customerstate" value={formData.Customerstate} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors">
                        <option value="">Select State</option>
                        {INDIA_STATES.map(state => (<option key={`cust-${state}`} value={state}>{state}</option>))}
                      </select>
                    ) : (
                      <input type="text" name="Customerstate" value={formData.Customerstate} onChange={handleChange} className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors placeholder-yellow-600/50" placeholder="Enter State/Province" />
                    )}
                  </div>

                  {textNumberInputs.filter(f => !['deviceType', 'voltage', 'elementType', 'batchNo'].includes(f)).map((field) => (
                    <div key={field}>
                      <label className="block mb-2 font-medium text-yellow-300">{getLabel(field)}</label>
                      <input
                        type={field.toLowerCase().includes('email') ? 'email' :
                          field.toLowerCase().includes('date') || field.toLowerCase().includes('mapped') ? 'date' :
                            field.toLowerCase().includes('no') || field.toLowerCase().includes('reading') || field.toLowerCase().includes('adhar') || field.toLowerCase().includes('pan') || field.toLowerCase().includes('mobile') || field.toLowerCase().includes('pin') ? 'number' :
                              'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors placeholder-yellow-600/50"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-3 border-t-2 border-yellow-500/20 pt-6 mt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-yellow-400 flex items-center gap-2">
                      <FileText size={24} />
                      Document Uploads
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {fileInputs.map((file) => (
                        <div key={file.key}>
                          <label className="block mb-2 font-medium text-yellow-300">{file.label}</label>
                          <input
                            type="file"
                            name={file.key}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-yellow-500/30 rounded-lg bg-black/60 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-3 mt-8">
                    <button
                      type="submit"
                      disabled={loading || packagesLoading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 flex items-center justify-center gap-3"
                    >
                      {loading || packagesLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileText size={24} />
                          Submit All Data
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceMappingDashboard