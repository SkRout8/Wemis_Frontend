import React, { useContext } from "react"
import { Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import SuperAdminDashboard from "./pages/SuperAdminDashboard"
import AdminDashboard from "./AdminPage/AdminDashboard"
import WlpDashboadrd from "./pages/WlpDashboadrd"
import ManufactureDashboard from "./pages/ManufactureDashboard"
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
            <Route path="/wlp/dashboard" element={<WlpDashboadrd />} />
            <Route path="/manufacture/dashboard" element={<ManufactureDashboard />} />
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
            <Route path="/admin/wlplist" element={<Wlplist/>} />

          </>
        )}
      </Routes>

    </>
  )
}

export default App
