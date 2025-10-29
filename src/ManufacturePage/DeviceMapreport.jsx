import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { 
    Zap, AlertTriangle, Edit, Eye, FileText, Folder, HardDrive, MapPin, Loader2, Info, X, 
    Truck, Key, Phone, Mail, DollarSign, Calendar, UploadCloud, Link, Download 
} from "lucide-react"; 
// Assuming the path to your UserAppContext is correct
import { UserAppContext } from "../contexts/UserAppProvider"; 

// Import jsPDF for client-side PDF generation
import { jsPDF } from 'jspdf'; 

// ====================================================================
//                             0. HELPER COMPONENTS
// ====================================================================

// --- New Pulsing Dot Loader Component ---
const PulsingDotLoader = ({ text = "Loading data..." }) => (
    <div className="flex flex-col items-center justify-center p-8">
        <div className="flex space-x-2 justify-center items-center">
            <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-4 w-4 bg-indigo-500 bg-opacity-70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-4 w-4 bg-indigo-500 bg-opacity-50 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-300">{text}</p>
    </div>
);


const DetailItem = ({ icon: Icon, label, value, isDocument = false }) => {
    const isLink = isDocument && typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'));

    return (
        <div className="flex items-start py-2 border-b border-gray-700/50">
            <Icon size={18} className="text-indigo-400 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-grow">
                <p className="text-xs font-medium text-gray-400 uppercase leading-none">{label}</p>
                {isLink ? (
                    <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-yellow-400 hover:text-yellow-300 transition underline truncate max-w-full inline-block"
                        title={value}
                    >
                        View Document <Link size={14} className="inline ml-1" />
                    </a>
                ) : (
                    <p className="text-sm font-semibold text-gray-100 break-words">{value || "N/A"}</p>
                )}
            </div>
        </div>
    );
};

// --- Helper component for a SIM Card item (Sidebar View) ---
const SimDetailItem = ({ sim, index }) => (
    <div className="bg-gray-700/70 p-4 rounded-lg shadow-xl border border-gray-600/50">
        <h4 className="text-yellow-400 font-bold mb-2 flex items-center">
            <Phone size={16} className="mr-2 text-indigo-400" /> SIM Slot {index + 1}
        </h4>
        <div className="space-y-1 text-sm">
            <p><span className="font-medium text-gray-300">Operator:</span> <span className="text-gray-200">{sim.operator || "N/A"}</span></p>
            <p><span className="font-medium text-gray-300">SIM No:</span> <span className="text-gray-200">{sim.simNo || "N/A"}</span></p>
            <p><span className="font-medium text-gray-300">Validity:</span> <span className="text-gray-200">{sim.validityDate || "N/A"}</span></p>
        </div>
    </div>
);

// --- The Main Device Details Sidebar (Unchanged) ---
const DeviceDetailsModal = ({ device, onClose, loading }) => {
    // Data Structure for mapping all your fields (sections)
    const sections = [
        { 
            title: "Customer & Contact Information", 
            icon: Info, 
            fields: [
                { label: "Full Name", key: "fullName", icon: Info },
                { label: "Mobile No.", key: "mobileNo", icon: Phone },
                { label: "Email", key: "email", icon: Mail },
                { label: "Dealer/Technician Name", key: "delerName", icon: Key },
                { label: "GSTIN No.", key: "GstinNo", icon: DollarSign },
                { label: "Pan No.", key: "PanNo", icon: FileText },
                { label: "Aadhaar No.", key: "AdharNo", icon: FileText },
                { label: "Driver License No.", key: "DriverLicenseNo", icon: FileText },
            ]
        },
        { 
            title: "Vehicle & Registration Details", 
            icon: Truck, 
            fields: [
                { label: "Registration No.", key: "RegistrationNo", icon: Truck },
                { label: "RTO", key: "Rto", icon: MapPin },
                { label: "Vehicle Type", key: "VehicleType", icon: Truck },
                { label: "Make/Model", key: "MakeModel", icon: Truck },
                { label: "Chassis Number", key: "ChassisNumber", icon: Key },
                { label: "Engine Number", key: "EngineNumber", icon: Key },
                { label: "Model Year", key: "ModelYear", icon: Calendar },
                { label: "Vehicle Birth", key: "VechileBirth", icon: Calendar },
                { label: "KM Reading", key: "VehicleKMReading", icon: MapPin },
            ]
        },
        { 
            title: "Device & Installation Details", 
            icon: Key, 
            fields: [
                { label: "Device No.", key: "deviceNo", icon: Key },
                { label: "Device Type", key: "deviceType", icon: Key },
                { label: "Element Type", key: "elementType", icon: Key },
                { label: "Voltage", key: "voltage", icon: Key },
                { label: "No. of Panic Buttons", key: "NoOfPanicButtons", icon: Key },
                { label: "Mapped Date", key: "MappedDate", icon: Calendar },
                { label: "Batch No.", key: "batchNo", icon: Key },
            ]
        },
        { 
            title: "Policy & Document Renewal Dates", 
            icon: Calendar, 
            fields: [
                { label: "Insurance Renew Date", key: "InsuranceRenewDate", icon: Calendar },
                { label: "Pollution Renew Date", key: "PollutionRenewdate", icon: Calendar },
                { label: "Invoice No.", key: "InvoiceNo", icon: FileText },
                { label: "Date (Submission)", key: "date", icon: Calendar },
            ]
        },
        { 
            title: "Address Information", 
            icon: MapPin, 
            fields: [
                { label: "Complete Address", key: "CompliteAddress", icon: MapPin },
                { label: "Pincode", key: "PinCode", icon: MapPin },
                { label: "State", key: "Customerstate", icon: MapPin },
                { label: "District", key: "Customerdistrict", icon: MapPin },
                { label: "Country", key: "Customercountry", icon: MapPin },
            ]
        },
        { 
            title: "Documents (Uploads)", 
            icon: UploadCloud, 
            fields: [
                { label: "RC Document", key: "RcDocument", icon: FileText, isDocument: true },
                { label: "Aadhaar Card", key: "AdharCardDocument", icon: FileText, isDocument: true },
                { label: "Pan Card", key: "PanCardDocument", icon: FileText, isDocument: true },
                { label: "Device Document", key: "DeviceDocument", icon: FileText, isDocument: true },
                { label: "Invoice Document", key: "InvoiceDocument", icon: FileText, isDocument: true },
                { label: "Panic Button w/ Sticker", key: "PanicButtonWithSticker", icon: FileText, isDocument: true },
                { label: "Signature Document", key: "SignatureDocument", icon: FileText, isDocument: true },
                { label: "Vehicle ID Document", key: "VechileIDocument", icon: FileText, isDocument: true },
            ]
        }
    ];

    if (!device && !loading) return null;
    const hasError = device && device.error;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-60 transition-opacity" onClick={onClose}></div>
            
            {/* Sidebar Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-2xl transform transition-transform duration-500 ease-in-out translate-x-0">
                    <div className="h-full flex flex-col bg-gray-800 shadow-2xl overflow-y-auto">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center sticky top-0 bg-gray-800 z-10 shadow-lg">
                            <h3 className="text-xl font-bold text-yellow-400 flex items-center">
                                {loading ? 'Fetching Details...' : hasError ? 'Error' : `Detailed Report: ${device.deviceNo || 'N/A'}`}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <PulsingDotLoader text="Loading device data..." /> 
                        ) : hasError ? (
                            <div className="p-6 text-red-400">
                                <AlertTriangle className="inline-block mr-2" />
                                <p className="font-medium text-lg">{device.error}</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6 flex-grow">
                                
                                {/* SIM Details Section */}
                                {device.simDetails && device.simDetails.length > 0 && (
                                    <div className="bg-gray-900/50 p-4 rounded-xl shadow-inner border border-indigo-700/50">
                                        <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center">
                                            <Phone size={18} className="mr-3" /> SIM Card Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {device.simDetails.map((sim, i) => (
                                                <SimDetailItem key={i} sim={sim} index={i} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Dynamic Sections (Main Data) */}
                                {sections.map((section, index) => (
                                    <div key={index} className="bg-gray-900/50 p-4 rounded-xl shadow-inner border border-gray-700/50">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center border-b border-gray-700 pb-2">
                                            <section.icon size={18} className="mr-3 text-indigo-400" /> {section.title}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                            {section.fields.map((field, fIndex) => (
                                                <DetailItem 
                                                    key={fIndex}
                                                    icon={field.icon}
                                                    label={field.label}
                                                    value={device[field.key]} 
                                                    isDocument={field.isDocument}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ====================================================================
//                             1. CERTIFICATE MODAL COMPONENT (NEW)
// ====================================================================

const CertificateModal = ({ isOpen, onClose, deviceNo, onDownload, isDownloading }) => {
    // State to hold the values from the dropdowns (as seen in the screenshot)
    const [certificateOptions, setCertificateOptions] = useState({
        copyType: 'Customer Copy', // Matches first dropdown
        letterHead: 'Leather Head', // Matches second dropdown
        allow: 'Allow',             // Matches third dropdown
        certificateType: 'Installation' // Matches fourth dropdown
    });

    const handleChange = (e) => {
        setCertificateOptions(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleDownloadClick = () => {
        // Pass the deviceNo and selected options to the parent component's download function
        onDownload(deviceNo, certificateOptions);
    };

    if (!isOpen) return null;

    // Define Dropdown Options
    const copyTypeOptions = ['Customer Copy', 'Dealer Copy', 'Manufacturer Copy'];
    const letterHeadOptions = ['Leather Head', 'Plain Paper'];
    const allowOptions = ['Allow', 'Restrict'];
    const certificateTypeOptions = ['Installation', 'Renewal', 'Transfer'];


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-60 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 relative">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-yellow-400 flex items-center">
                            <FileText size={20} className="mr-2" /> Certificates
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-700">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content/Form */}
                    <div className="p-6 space-y-4">
                        
                        <div className="space-y-1">
                            <label htmlFor="copyType" className="block text-sm font-medium text-gray-300">Copy Type</label>
                            <select 
                                id="copyType"
                                name="copyType"
                                value={certificateOptions.copyType}
                                onChange={handleChange}
                                className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition duration-150"
                            >
                                {copyTypeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-1">
                            <label htmlFor="letterHead" className="block text-sm font-medium text-gray-300">Letter Head</label>
                            <select 
                                id="letterHead"
                                name="letterHead"
                                value={certificateOptions.letterHead}
                                onChange={handleChange}
                                className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition duration-150"
                            >
                                {letterHeadOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-1">
                            <label htmlFor="allow" className="block text-sm font-medium text-gray-300">Allow</label>
                            <select 
                                id="allow"
                                name="allow"
                                value={certificateOptions.allow}
                                onChange={handleChange}
                                className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition duration-150"
                            >
                                {allowOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-1">
                            <label htmlFor="certificateType" className="block text-sm font-medium text-gray-300">Certificate</label>
                            <select 
                                id="certificateType"
                                name="certificateType"
                                value={certificateOptions.certificateType}
                                onChange={handleChange}
                                className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition duration-150"
                            >
                                {certificateTypeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer/Action */}
                    <div className="p-6 border-t border-gray-700 flex justify-end">
                        <button 
                            onClick={handleDownloadClick} 
                            disabled={isDownloading}
                            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg 
                                ${isDownloading 
                                    ? 'bg-indigo-700 text-gray-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/50'
                                }`}
                        >
                            {isDownloading ? (
                                <><Loader2 size={18} className="animate-spin" /> Downloading...</>
                            ) : (
                                <><Download size={18} /> Download</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ====================================================================
//                             2. PDF GENERATION LOGIC (UPDATED)
// ====================================================================

// PDF generation logic now accepts selected options
const generateCertificatePDF = (doc, deviceData, options) => {
    let y = 15;
    const margin = 15;
    const lineHeight = 8;
    const pageHeight = doc.internal.pageSize.height;

    const checkPageBreak = (requiredSpace) => {
        if (y + requiredSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
            return true;
        }
        return false;
    };
    
    // --- Title & Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(`Device ${options.certificateType} Certificate`, margin, y);
    y += 10;

    // Subtitle based on selected options
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Copy Type: ${options.copyType} | Letter Head: ${options.letterHead} | Access: ${options.allow}`, margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Device ID: ${deviceData.deviceNo || 'N/A'}`, margin, y);
    doc.text(`Customer: ${deviceData.fullName || 'N/A'}`, doc.internal.pageSize.width - margin, y, { align: 'right' });
    y += 5;
    
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(margin, y, doc.internal.pageSize.width - margin, y);
    y += 5;
    
    // 1. Print SIM Details
    checkPageBreak(deviceData.simDetails ? deviceData.simDetails.length * 8 + 15 : 10);
    
    if (deviceData.simDetails && deviceData.simDetails.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(50, 70, 150); // Indigo
        doc.text("SIM Card Information", margin, y);
        y += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        deviceData.simDetails.forEach((sim, i) => {
            const simText = `Slot ${i + 1} | Operator: ${sim.operator || 'N/A'} | SIM No: ${sim.simNo || 'N/A'} | Validity: ${sim.validityDate || 'N/A'}`;
            doc.text(simText, margin + 5, y);
            y += 5;
        });
        y += 4;
    }
    
    // 2. Print Dynamic Sections
    const sections = [
        { 
            title: "Customer & Contact Information", 
            fields: [
                { label: "Full Name", key: "fullName" }, { label: "Mobile No.", key: "mobileNo" },
                { label: "Email", key: "email" }, { label: "Dealer/Technician Name", key: "delerName" },
                { label: "GSTIN No.", key: "GstinNo" }, { label: "Pan No.", key: "PanNo" },
                { label: "Aadhaar No.", key: "AdharNo" }, { label: "Driver License No.", key: "DriverLicenseNo" },
            ]
        },
        { 
            title: "Vehicle & Registration Details", 
            fields: [
                { label: "Registration No.", key: "RegistrationNo" }, { label: "RTO", key: "Rto" },
                { label: "Vehicle Type", key: "VehicleType" }, { label: "Make/Model", key: "MakeModel" },
                { label: "Chassis Number", key: "ChassisNumber" }, { label: "Engine Number", key: "EngineNumber" },
                { label: "Model Year", key: "ModelYear" }, { label: "Vehicle Birth", key: "VechileBirth" },
                { label: "KM Reading", key: "VehicleKMReading" },
            ]
        },
        { 
            title: "Device & Installation Details", 
            fields: [
                { label: "Device No.", key: "deviceNo" }, { label: "Device Type", key: "deviceType" },
                { label: "Element Type", key: "elementType" }, { label: "Voltage", key: "voltage" },
                { label: "No. of Panic Buttons", key: "NoOfPanicButtons" }, { label: "Mapped Date", key: "MappedDate" },
                { label: "Batch No.", key: "batchNo" }, { label: "Distributor Name ID", key: "distributorName" },
                { label: "Manufacturer ID", key: "manufacturId" },
            ]
        },
        { 
            title: "Policy & Document Renewal Dates", 
            fields: [
                { label: "Insurance Renew Date", key: "InsuranceRenewDate" }, { label: "Pollution Renew Date", key: "PollutionRenewdate" },
                { label: "Invoice No.", key: "InvoiceNo" }, { label: "Date (Submission)", key: "date" },
            ]
        },
        { 
            title: "Address Information", 
            fields: [
                { label: "Complete Address", key: "CompliteAddress" }, { label: "Pincode", key: "PinCode" },
                { label: "State", key: "Customerstate" }, { label: "District", key: "Customerdistrict" },
                { label: "Country", key: "Customercountry" },
            ]
        },
        { 
            title: "Documents (Uploads) - Links", 
            fields: [
                { label: "RC Document Link", key: "RcDocument" }, { label: "Aadhaar Card Link", key: "AdharCardDocument" },
                { label: "Pan Card Link", key: "PanCardDocument" }, { label: "Device Document Link", key: "DeviceDocument" },
                { label: "Invoice Document Link", key: "InvoiceDocument" }, { label: "Panic Button w/ Sticker Link", key: "PanicButtonWithSticker" },
                { label: "Signature Document Link", key: "SignatureDocument" }, { label: "Vehicle ID Document Link", key: "VechileIDocument" },
            ]
        }
    ];

    sections.forEach(section => {
        const numFields = section.fields.length;
        const sectionHeight = Math.ceil(numFields / 2) * lineHeight * 1.5 + 15;
        checkPageBreak(sectionHeight);

        // Section Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(150, 80, 0);
        doc.text(section.title, margin, y);
        y += 4;
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(margin, y, doc.internal.pageSize.width - margin, y);
        y += 3;
        
        // Fields in two columns
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        
        const columnWidth = (doc.internal.pageSize.width - 2 * margin) / 2;
        const labelWidth = 40;
        const valueWidth = columnWidth - labelWidth - 2;

        for (let i = 0; i < numFields; i += 2) {
            const field1 = section.fields[i];
            const field2 = section.fields[i + 1];
            let currentY = y;

            // Left Column
            doc.setFont('helvetica', 'bold');
            doc.text(`${field1.label}:`, margin, currentY);
            doc.setFont('helvetica', 'normal');
            
            const value1 = String(deviceData[field1.key] || "N/A");
            const splitText1 = doc.splitTextToSize(value1, valueWidth);
            doc.text(splitText1, margin + labelWidth, currentY);
            const height1 = splitText1.length * 4;

            // Right Column
            let height2 = 0;
            if (field2) {
                doc.setFont('helvetica', 'bold');
                doc.text(`${field2.label}:`, margin + columnWidth, currentY);
                doc.setFont('helvetica', 'normal');
                
                const value2 = String(deviceData[field2.key] || "N/A");
                const splitText2 = doc.splitTextToSize(value2, valueWidth);
                doc.text(splitText2, margin + columnWidth + labelWidth, currentY);
                height2 = splitText2.length * 4;
            }
            
            y += Math.max(height1, height2) + 2; 
            checkPageBreak(lineHeight);
        }
        y += 4;
    });
    
    // --- Footer/Disclaimer ---
    checkPageBreak(15);
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, y, doc.internal.pageSize.width - margin, y);
    y += 5;
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
    doc.text(`This document is based on the data available in the system at the time of generation.`, doc.internal.pageSize.width - margin, y, { align: 'right' });
    
    // Save PDF
    doc.save(`${options.certificateType}_Certificate_${deviceData.deviceNo}.pdf`);
};

// ====================================================================
//                             3. MAIN COMPONENT (DeviceMapreport)
// ====================================================================

function DeviceMapreport() {
    const [mapDevices, setMapDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeviceIds, setSelectedDeviceIds] = useState([]); 
    const { token: contextToken } = useContext(UserAppContext);
    const selectAllRef = useRef(null);

    // State for View Sidebar
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalDeviceDetails, setModalDeviceDetails] = useState(null);
    const [modalLoading, setModalLoading] = useState(false); // For View Details API call

    // State for Certificate Modal (NEW)
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
    const [isPdfDownloading, setIsPdfDownloading] = useState(false); // For PDF generation loading

    const isSingleDeviceSelected = selectedDeviceIds.length === 1;

    // --- Action Button Component (Unchanged) ---
    const ActionButton = ({ icon: Icon, label, onClick, isCertificate = false }) => {
        const isDisabled = !isSingleDeviceSelected;
        const tooltip = 'Select exactly one device to perform this action.';

        const baseClasses = "px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg";
        
        let enabledClasses = "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/50 focus:ring-4 focus:ring-indigo-500/50";
        if (isCertificate) {
             enabledClasses = "bg-yellow-500 text-gray-900 hover:bg-yellow-600 hover:shadow-yellow-500/50 focus:ring-4 focus:ring-yellow-500/50";
        }
        
        const disabledClasses = "bg-gray-700 text-gray-400 cursor-not-allowed shadow-inner";

        return (
            <button
                className={`${baseClasses} ${isDisabled ? disabledClasses : enabledClasses}`}
                onClick={isDisabled ? null : onClick}
                disabled={isDisabled}
                title={isDisabled ? tooltip : label}
            >
                <Icon size={18} />
                {label}
            </button>
        );
    };
    // -------------------------------------------------------------------------

    // --- API Fetch Function for Single Device View (Updated State) ---
    const fetchDeviceDetails = async (deviceId, setDetailsState, setLoadingState) => {
        const selectedDevice = mapDevices.find(device => device._id === deviceId);

        if (!selectedDevice || !selectedDevice.deviceNo) {
            alert("Error: Could not find Device Number for the selected item.");
            return null;
        }
        
        const deviceNoToFetch = selectedDevice.deviceNo;

        setLoadingState(true);
        setDetailsState(null); 

        try {
            const token = contextToken || localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found. Please log in.");

            const response = await axios.post(
                "https://wemis-backend.onrender.com/manufactur/viewAMapDeviceInManufactur",
                { deviceNo: deviceNoToFetch }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data?.mapDevice && typeof response.data.mapDevice === 'object' && !Array.isArray(response.data.mapDevice)) {
                setDetailsState(response.data.mapDevice); 
                return response.data.mapDevice;
            } else {
                setDetailsState({ error: `No detailed data found for Device No: ${deviceNoToFetch}` });
            }
        } catch (error) {
            console.error("Error fetching device details:", error);
            setDetailsState({ error: `API call failed. Status: ${error.response?.status || error.message}` });
        } finally {
            setLoadingState(false);
        }
        return null;
    };
    
    const handleViewDetails = () => {
        if (!isSingleDeviceSelected) return;
        setIsViewModalOpen(true);
        fetchDeviceDetails(selectedDeviceIds[0], setModalDeviceDetails, setModalLoading);
    };
    // -----------------------------------------------------------------


    // --- Certificate Download Handler (NEW/UPDATED) ---
    const handleOpenCertificateModal = () => {
        if (!isSingleDeviceSelected) return;
        setIsCertificateModalOpen(true);
    };

    const downloadCertificatePDF = async (deviceNo, options) => {
        if (!deviceNo) return;
        
        setIsPdfDownloading(true);
        let deviceData = null;

        try {
            // First, fetch the full device data
            const selectedDevice = mapDevices.find(device => device.deviceNo === deviceNo);
            
            if (!selectedDevice) {
                throw new Error("Device not found in the list.");
            }

            // We need to fetch the detailed data, similar to the view details
            deviceData = await fetchDeviceDetails(selectedDevice._id, () => {}, () => {}); 

            if (!deviceData) {
                throw new Error("Failed to retrieve complete device data for PDF.");
            }
        } catch (error) {
            console.error("Error fetching device details for PDF:", error);
            alert(`Failed to fetch device details for PDF: ${error.message}`);
            setIsPdfDownloading(false);
            return;
        }
        
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            generateCertificatePDF(doc, deviceData, options);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`An error occurred during PDF generation: ${error.message}`);
        } finally {
            setIsPdfDownloading(false);
            setIsCertificateModalOpen(false); // Close modal after successful or failed attempt
        }
    };
    // -----------------------------------------------------------------


    // --- Initial Fetch of All Devices ---
    useEffect(() => {
        const fetchMapDevices = async () => {
          setLoading(true);
          try {
            const token = contextToken || localStorage.getItem("token");
            if (!token) {
              setLoading(false);
              return;
            }
    
            const response = await axios.post(
              "https://wemis-backend.onrender.com/manufactur/fetchAllMapDevice",
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
    
            if (response.data?.mapDevice) {
              const devicesArray = Array.isArray(response.data.mapDevice) ? response.data.mapDevice : [];
              const sortedDevices = devicesArray.sort((a, b) => 
                (a.deviceNo || "").localeCompare(b.deviceNo || "")
              );
              setMapDevices(sortedDevices);
            }
          } catch (error) {
            console.error("Error fetching map devices:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchMapDevices();
      }, [contextToken]);
    
    // --- Checkbox Handlers ---
    const handleSelectAll = (event) => {
        if (event.target.checked) {
          const allIds = mapDevices.map(device => device._id);
          setSelectedDeviceIds(allIds);
        } else {
          setSelectedDeviceIds([]);
        }
    };
    
    const handleSelectOne = (event, deviceId) => {
        if (event.target.checked) {
          setSelectedDeviceIds(prevIds => [...prevIds, deviceId]);
        } else {
          setSelectedDeviceIds(prevIds => prevIds.filter(id => id !== deviceId));
        }
    };

    const isAllSelected = mapDevices.length > 0 && selectedDeviceIds.length === mapDevices.length;
    const isIndeterminate = selectedDeviceIds.length > 0 && !isAllSelected;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-gray-900">
                <PulsingDotLoader text="Fetching all mapped devices..." />
            </div>
        );
    }

    if (mapDevices.length === 0) {
        return (
            <div className="p-10 text-center bg-gray-800 rounded-2xl shadow-2xl m-6 border border-indigo-500/30">
                <AlertTriangle className="mx-auto h-12 w-12 text-indigo-500" />
                <h3 className="mt-2 text-xl font-semibold text-white">No Mapped Devices Found</h3>
                <p className="mt-1 text-gray-400">Please check your network or try again later.</p>
            </div>
        );
    }
    
    const selectedDeviceNo = isSingleDeviceSelected 
        ? mapDevices.find(d => d._id === selectedDeviceIds[0])?.deviceNo || null
        : null;

    return (
        <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-gray-100">
            {/* Loading overlay for PDF generation */}
            {isPdfDownloading && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
                    <PulsingDotLoader text="Generating and downloading PDF certificate..." />
                </div>
            )}

            <header className="mb-6 md:mb-8 pb-4 border-b border-gray-700">
                <h2 className="text-3xl font-extrabold text-indigo-400 tracking-tight flex items-center gap-2">
                    <Zap className="h-7 w-7" /> Mapped Devices Report
                </h2>
                
                {/* ACTION BUTTONS ROW */}
                <div className="mt-6 flex space-x-4 p-4 bg-gray-800 rounded-xl border border-indigo-700/50 shadow-xl">
                    <ActionButton icon={Eye} label="View Details" onClick={handleViewDetails} />
                    <ActionButton icon={Edit} label="Edit" onClick={() => alert('Edit action for ' + selectedDeviceIds[0])} />
                    
                    <ActionButton 
                        icon={FileText} 
                        label="Certificates (PDF)" 
                        onClick={handleOpenCertificateModal} 
                        isCertificate={true}
                    />
                </div>
            </header>

            {/* TABLE CONTAINER */}
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden ring-1 ring-indigo-500/20">
                <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
                    <table className="min-w-full text-sm divide-y divide-gray-700">
                        <thead className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10 border-b border-indigo-500/50">
                            <tr>
                                <th className="px-4 py-3 text-left min-w-[50px]">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 cursor-pointer checked:bg-indigo-500 checked:border-indigo-500" 
                                        checked={isAllSelected} 
                                        ref={selectAllRef} 
                                        onChange={handleSelectAll} 
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]"># Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">Device No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">Sim Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">State/Division</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">Vehicle Detail</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">Dealer(Technician)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">Customer Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">Customer Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[200px]">Customer Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {mapDevices.map((device) => (
                                <tr 
                                    key={device._id} 
                                    className={`hover:bg-gray-700/50 transition duration-150 ${selectedDeviceIds.includes(device._id) ? 'bg-indigo-900/40' : ''}`}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 cursor-pointer checked:bg-indigo-500 checked:border-indigo-500"
                                            checked={selectedDeviceIds.includes(device._id)}
                                            onChange={(e) => handleSelectOne(e, device._id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => {
                                                setSelectedDeviceIds([device._id]); // Auto-select on Info click
                                                handleViewDetails();
                                            }}
                                            className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-semibold text-xs border border-indigo-600 px-3 py-1 rounded-full transition"
                                        >
                                            <Info size={14} className="mr-1" /> Info
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-100 font-medium">{device.deviceNo || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{device.simDetails?.map(s => s.simNo).join(', ') || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{`${device.Customerstate || 'N/A'} / ${device.Customerdistrict || 'N/A'}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{device.VehicleType || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-yellow-400 font-semibold">{device.delerName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-100">{device.fullName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{device.mobileNo || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-300">{device.email || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          

            {/* View Details Sidebar Modal */}
            <DeviceDetailsModal 
                device={modalDeviceDetails} 
                onClose={() => setIsViewModalOpen(false)} 
                loading={modalLoading} 
                isOpen={isViewModalOpen}
            />

            {/* NEW: Certificate Selection Modal */}
            <CertificateModal
                isOpen={isCertificateModalOpen}
                onClose={() => setIsCertificateModalOpen(false)}
                deviceNo={selectedDeviceNo}
                onDownload={downloadCertificatePDF}
                isDownloading={isPdfDownloading}
            />
        </div>
    );
}

export default DeviceMapreport;