import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, FaClipboardList, FaUsers, FaTasks, 
  FaPlus, FaIndustry, FaUserPlus, FaCogs, FaSignOutAlt,
  FaChartBar, FaRandom, FaBars, FaTimes
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode"; // Changed from default import to named import
import "./Navbar.css";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

const Navbar = ({ setAuth, onToggleCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [role, setRole] = useState(""); // Added role state
  const navigate = useNavigate();
  const location = useLocation();
  
  // Decode JWT to get user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);
  
  // Auto-collapse sidebar on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setCollapsed(true);
        if (onToggleCollapse) {
          onToggleCollapse(true);
        }
      }
    };
    
    // Initialize on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [onToggleCollapse]);
  
  // Close mobile menu when changing routes on small screens
  useEffect(() => {
    setMobileMenuActive(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    // Communicate collapse state to parent component
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    navigate("/login");
  };

  return (
    <div className="d-flex">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle d-md-none" 
        onClick={toggleMobileMenu}
        aria-label={mobileMenuActive ? "Close menu" : "Open menu"}
      >
        {mobileMenuActive ? <FaTimes /> : <FaBars />}
      </button>
      
      {/* Mobile backdrop - only shown when mobile menu is active */}
      <div 
        className={`mobile-backdrop ${mobileMenuActive ? 'active' : ''}`} 
        onClick={toggleMobileMenu}
      ></div>
      
      <nav className={`sidebar ${collapsed ? "collapsed-navbar" : ""} ${mobileMenuActive ? "mobile-active" : ""}`}>
        <div className="navbar-brand d-flex align-items-center justify-content-center">
          <h4 className="navbar-title mb-0 text-white">{collapsed ? "SMO" : "SMO Tracking"}</h4>
        </div>
        
        <button 
          className="toggle-btn d-none d-md-flex mx-auto" 
          onClick={handleToggleCollapse}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <FaBars />
        </button>

        <ul className="nav flex-column flex-grow-1">
          {/* Common Navigation for admin, manager, employee */}
          {(role === "admin" || role === "manager" || role === "employee" || !role) && (
            <>
              <NavItem 
                to="/office-dashboard" 
                icon={<FaHome />} 
                text="Dashboard" 
                collapsed={collapsed} 
                active={location.pathname === "/office-dashboard"}
              />
              
              <NavItem 
                to="/orders" 
                icon={<FaClipboardList />} 
                text="Orders" 
                collapsed={collapsed}
                active={location.pathname === "/orders"}
              />
              
              <div className="nav-divider"></div>
              
              <NavItem 
                to="/employees" 
                icon={<FaUsers />} 
                text="Employees" 
                collapsed={collapsed}
                active={location.pathname === "/employees"}
              />
              
              <NavItem 
                to="/work-tracking" 
                icon={<FaTasks />} 
                text="Work Tracking" 
                collapsed={collapsed}
                active={location.pathname === "/work-tracking"}
              />
              
              <NavItem 
                to="/productivity" 
                icon={<FaChartBar />} 
                text="Productivity" 
                collapsed={collapsed}
                active={location.pathname === "/productivity"}
              />
              
            </>
          )}
          
          {/* Production Flow access for specific roles */}
          {(role === "admin" || role === "Cutting" || role === "Sewing" || 
            role === "Quality control" || role === "Packing" || !role) && (
            <NavItem 
              to="/production-flow" 
              icon={<FaRandom />} 
              text="Production Flow" 
              collapsed={collapsed}
              active={location.pathname === "/production-flow"}
            />
          )}
          
          {/* Admin functions for admin, manager or no role (fallback) */}
          {(role === "admin" || role === "manager" || !role) && (
            <>
              <div className="nav-divider"></div>
              
              <NavItem 
                to="/add-employee" 
                icon={<FaUserPlus />} 
                text="Add Employee" 
                collapsed={collapsed}
                active={location.pathname === "/add-employee"}
              />
              
              <NavItem 
                to="/add-machine" 
                icon={<FaIndustry />} 
                text="Add Machine" 
                collapsed={collapsed}
                active={location.pathname === "/add-machine"}
              />
              
              <NavItem 
                to="/create-order" 
                icon={<FaPlus />} 
                text="Create Order" 
                collapsed={collapsed}
                active={location.pathname === "/create-order"}
              />
              
              <NavItem 
                to="/assign-employee" 
                icon={<FaCogs />} 
                text="Assign Employee" 
                collapsed={collapsed}
                active={location.pathname === "/assign-employee"}
              />

              <NavItem 
                to= "/register"
                icon={<FaUserPlus />} 
                text="Register" 
                collapsed={collapsed}
                active={location.pathname === "/register"}
              />
            </>
          )}
          
          <div className="nav-divider"></div>
          
          {/* Logout button */}
          <li className="nav-item">
            <OverlayTrigger
              placement="right"
              overlay={collapsed && window.innerWidth > 576 ? <Tooltip id="tooltip-logout">Logout</Tooltip> : <></>}
            >
              <button 
                className="nav-link theme-adaptive-logout w-100 d-flex align-items-center" 
                onClick={handleLogout}
              >
                <span className={collapsed && window.innerWidth > 576 ? "icon-container" : ""}>
                  <FaSignOutAlt />
                </span>
                {(!collapsed || window.innerWidth <= 576) && <span className="ms-2">Logout</span>}
              </button>
            </OverlayTrigger>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Navbar Item Component with Tooltip
const NavItem = ({ to, icon, text, collapsed, active }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  
  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <li className="nav-item">
      <OverlayTrigger
        placement="right"
        overlay={collapsed && !isMobile ? <Tooltip id={`tooltip-${text}`}>{text}</Tooltip> : <></>}
      >
        <NavLink 
          to={to} 
          className={`nav-link ${active ? 'active' : ''}`}
        >
          <span className={collapsed && !isMobile ? "icon-container" : ""}>
            {icon}
          </span>
          {(!collapsed || isMobile) && <span className="ms-2">{text}</span>}
        </NavLink>
      </OverlayTrigger>
    </li>
  );
};

export default Navbar;
