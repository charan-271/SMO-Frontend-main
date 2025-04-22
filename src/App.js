import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Orders from "./pages/Orders";
import Employees from "./pages/EmployeeList";
import Navbar from "./components/Navbar";
import WorkTracking from "./pages/WorkTracking";
import AddEmployee from "./pages/AddEmployee";
import AddMachine from "./pages/AddMachine";
import CreateOrder from "./pages/CreateOrder";
import AssignEmployee from "./pages/AssignEmployee";
import OfficeDashboard from "./pages/OfficeDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductionFlow from "./pages/ProductionFlow";
import EmployeeProductivityGraphs from "./pages/EmployeeProductivityGraphs";

function Layout({ auth, setAuth }) {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
    const [collapsed, setCollapsed] = useState(false);

    // ✅ Save last visited page (excluding login & register)
    useEffect(() => {
        if (auth && location.pathname !== "/login" && location.pathname !== "/register") {
            localStorage.setItem("lastVisited", location.pathname);
        }
    }, [auth, location.pathname]);

    // Store navbar collapsed state in localStorage for components to access
    const handleNavbarCollapse = (isCollapsed) => {
        setCollapsed(isCollapsed);
        localStorage.setItem("navbarCollapsed", isCollapsed);
    };

    return (
        <div className="layout">
            {!hideNavbar && <Navbar setAuth={setAuth} onToggleCollapse={handleNavbarCollapse} />}
            <div className={hideNavbar ? "content" : `content main-content ${collapsed ? "main-content-collapsed" : ""}`}>
                <Routes>
                    <Route path="/" element={<Navigate to={auth ? localStorage.getItem("lastVisited") || "/orders" : "/login"} />} />
                    <Route path="/login" element={auth ? <Navigate to={localStorage.getItem("lastVisited") || "/orders"} /> : <Login setAuth={setAuth} />} />
                    <Route path="/register" element={auth ? <Navigate to={localStorage.getItem("lastVisited") || "/orders"} /> : <Register />} />
                    <Route path="/orders" element={auth ? <Orders /> : <Navigate to="/login" />} />
                    <Route path="/employees" element={auth ? <Employees /> : <Navigate to="/login" />} />
                    <Route path="/work-tracking" element={auth ? <WorkTracking /> : <Navigate to="/login" />} />
                    <Route path="/add-employee" element={auth ? <AddEmployee /> : <Navigate to="/login" />} />
                    <Route path="/add-machine" element={auth ? <AddMachine /> : <Navigate to="/login" />} />
                    <Route path="/create-order" element={auth ? <CreateOrder /> : <Navigate to="/login" />} />
                    <Route path="/assign-employee" element={auth ? <AssignEmployee /> : <Navigate to="/login" />} />
                    <Route path="/office-dashboard" element={auth ? <OfficeDashboard /> : <Navigate to="/login" />} />
                    <Route path="/productivity" element={<EmployeeProductivityGraphs />} />
                    <Route path="/production-flow" element={auth ? <ProductionFlow /> : <Navigate to="/login" />} />
                    {/* Add more routes as needed */}
                </Routes>
            </div>
        </div>
    );
}

function App() {
    const [auth, setAuth] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuth(true);
        }
    }, []);

    return (
        <Router>
            <Layout auth={auth} setAuth={setAuth} />
        </Router>
    );
}

export default App;
