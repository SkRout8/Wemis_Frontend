// ManufactureNavbar.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Settings,
  LayoutDashboard,
  FileText,
  QrCode,
  CreditCard,
  Users2,
  Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";

const ManufactureNavbar = ({ activeRoute, setActiveRoute }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Menu definition with routes
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard />,
      dropdown: [
        { name: "Status Dashboard", route: "/manufacturer/dashboard" },
        { name: "CCC Dashboard", route: "/dashboard/ccc" },
        { name: "Monitoring Dashboard", route: "/dashboard/monitoring" },
      ],
    },
    { name: "Reports", icon: <FileText />, route: "/reports" },
    { name: "Barcode", icon: <QrCode />, route: "/barcode" },
    { name: "Subscription", icon: <CreditCard />, route: "/subscription" },
    {
      name: "Members",
      icon: <Users2 />,
      dropdown: [
        { name: "Distributors", route: "/members/distributors" },
        { name: "OEM", route: "/members/oem" },
        { name: "Technicians", route: "/members/technicians" },
      ],
    },
    { name: "Manage Device", icon: <Cpu />, route: "/manage-device" },
  ];

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header className="bg-black border-b border-yellow-500/40">
      {/* Top Header */}
      <div className="px-6 py-4 flex flex-col lg:flex-row items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-6">
          <div className="text-2xl font-bold text-yellow-400">MEMUS</div>
          <div className="hidden md:flex items-center space-x-4 text-gray-400">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search...</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-6 mt-4 lg:mt-0">
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium">
            Product
          </button>
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-5 h-5 bg-yellow-500 rounded"></div>
            <span className="text-yellow-400 font-medium">Wallet</span>
            <ChevronDown className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-center space-x-2 cursor-pointer">
            <Settings className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400">Settings</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-medium">MRUTYUNJAY PRADHAN</span>
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold">M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="px-6 pb-4">
        <div className="flex flex-wrap justify-center lg:justify-center gap-10 mt-12 pb-6">
          {menuItems.map((item) => (
            <div key={item.name} className="relative flex flex-col items-center">
              {/* Main Nav Item */}
              <div
                onClick={() =>
                  item.dropdown ? toggleDropdown(item.name) : setActiveRoute(item.route)
                }
                className={`flex flex-col items-center cursor-pointer transition ${
                  activeRoute === item.route
                    ? "text-yellow-400"
                    : "text-gray-500 hover:text-yellow-300"
                }`}
              >
                <div className="w-8 h-8 mb-1">{item.icon}</div>
                <span className="text-sm font-medium flex items-center gap-1">
                  {item.dropdown ? (
                    <>
                      {item.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.name
                            ? "rotate-180 text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    </>
                  ) : (
                    <Link to={item.route}>{item.name}</Link>
                  )}
                </span>
              </div>

              {/* Dropdown if exists */}
              {item.dropdown && openDropdown === item.name && (
                <div className="absolute top-full mt-2 bg-[#111] border border-yellow-500/40 rounded-lg shadow-lg min-w-[180px] z-50">
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.route}
                      onClick={() => {
                        setActiveRoute(sub.route);
                        setOpenDropdown(null);
                      }}
                      className={`block px-4 py-2 text-sm rounded transition ${
                        activeRoute === sub.route
                          ? "bg-yellow-500 text-black"
                          : "text-gray-300 hover:bg-yellow-500 hover:text-black"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default ManufactureNavbar;
