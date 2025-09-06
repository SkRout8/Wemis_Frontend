import React, { useContext } from "react"
import { Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import SuperAdminDashboard from "./pages/SuperAdminDashboard"
import AdminDashboard from "./AdminPage/AdminDashboard"
import AdminList from "./pages/AdminList"
import CreateAdmin from "./pages/CreateAdmin"
import { ToastContainer } from "react-toastify";
import SuperAdminElement from "./pages/SuperAdminElement"
import SuperAdminElementTypes from "./pages/SuperAdminElementTypes"
import SuperAdminModelNumbers from "./pages/SuperAdminModelNumbers"
import SuperAdminPartNumbers from "./pages/SuperAdminPartNumbers"
import SuperAdminTACNumbers from "./pages/SuperAdminTACNumbers"
import SuperAdminCOPNumbers from "./pages/SuperAdminCOPNumbers"
import SuperAdminTestingAgency from "./pages/SuperAdminTestingAgency"
import SuperAdminAssignElement from "./pages/SuperAdminAssignElement"
import { UserAppContext } from "./contexts/UserAppProvider"
import AdminElementList from "./AdminPage/AdminElementList"
import AdminElementAsignList from "./AdminPage/AdminElementAsignList"
import CreateWlp from "./AdminPage/CreateWlp"
import Wlplist from "./AdminPage/Wlplist"
import WlpDashboard from "./WlpPage/WlpDashboard"
import WlpElementList from "./WlpPage/WlpElementList"
import WlpElementAssignList from "./WlpPage/WlpElementAssignList"
import ManufactureList from "./WlpPage/ManufactureList"
import CreateManufacture from "./WlpPage/CreateManufacture"
import ManufactureDashboard from "./ManufacturePage/ManufactureDashboard"
import StatusDashboard from "./ManufacturePage/StatusDashboard"
import CCCDashboard from "./ManufacturePage/CCCDashboard"
import MonitoringDashboard from "./ManufacturePage/MonitoringDashboard"
import Reports from "./ManufacturePage/Reports"
import { Barcode } from "lucide-react"
import Distributors from "./ManufacturePage/Distributors"
import OEM from "./ManufacturePage/OEM"
import Technicians from "./ManufacturePage/Technicians"
import ManageDevice from "./ManufacturePage/ManageDevice"
import Subscription from "./ManufacturePage/Subscription"



function App() {
  const { user } = useContext(UserAppContext)
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login />} />

        {user && (
          <>
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />


            <Route path="/superadmin/adminlist" element={<AdminList />} />
            <Route path="/superadmin/createadmin" element={<CreateAdmin />} />
            <Route path="/superadmin/element" element={<SuperAdminElement />} />
            <Route path="/superadmin/element-types" element={<SuperAdminElementTypes />} />
            <Route path="/superadmin/model-numbers" element={<SuperAdminModelNumbers />} />
            <Route path="/superadmin/part-numbers" element={<SuperAdminPartNumbers />} />
            <Route path="/superadmin/tac-numbers" element={<SuperAdminTACNumbers />} />
            <Route path="/superadmin/cop-numbers" element={<SuperAdminCOPNumbers />} />
            <Route path="/superadmin/testing-agency" element={<SuperAdminTestingAgency />} />
            <Route path="/superadmin/assign-element" element={<SuperAdminAssignElement />} />
            {/* Admin Routes */}

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/element" element={<AdminElementList />} />
            <Route path="/admin/assign-element" element={<AdminElementAsignList />} />
            <Route path="/admin/createwlp" element={<CreateWlp />} />
            <Route path="/admin/wlplist" element={<Wlplist />} />

            {/* Wlp Routes */}
            <Route path="/wlp/dashboard" element={<WlpDashboard />} />

            <Route path="/wlp/Element-List" element={<WlpElementList />} />
            <Route path="/wlp/assign-element" element={<WlpElementAssignList />} />
            <Route path="/wlp/manufacturelist" element={<ManufactureList />} />
            <Route path="/wlp/createmanufacture" element={<CreateManufacture />} />

            {/* Manufacture Routes */}
            <Route path="/manufacturer/dashboard" element={<ManufactureDashboard />} />


            <Route path="/dashboard/status" element={<StatusDashboard />} />
            <Route path="/dashboard/ccc" element={<CCCDashboard/>} />
            <Route path="/dashboard/monitoring" element={<MonitoringDashboard />} />

            {/* Others */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/barcode" element={<Barcode />} />
            <Route path="/subscription" element={<Subscription />} />

            {/* Members */}
            <Route path="/members/distributors" element={<Distributors />} />
            <Route path="/members/oem" element={<OEM />} />
            <Route path="/members/technicians" element={<Technicians />} />

            {/* Devices */}
            <Route path="/manage-device" element={<ManageDevice />} />


          </>
        )}
      </Routes>

    </>
  )
}

export default App
