import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./OfficeDashboard.css";
import { FaUsers, FaUserClock, FaCogs, FaShoppingBag, FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const OfficeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  // Add a resize listener to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Data fetching effect
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/dashboard/office`)
      .then((response) => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching office dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Stats configuration with icons
  const stats = [
    { title: "Total Orders", value: dashboardData?.totalOrders, icon: <FaShoppingBag size={24} color="#4481eb" /> },
    { title: "Active Orders", value: dashboardData?.activeOrders, icon: <FaSpinner size={24} color="#4481eb" /> },
    { title: "Completed Orders", value: dashboardData?.completedOrders, icon: <FaCheckCircle size={24} color="#4481eb" /> },
    { title: "Total Employees", value: dashboardData?.totalEmployees, icon: <FaUsers size={24} color="#4481eb" /> },
    { title: "Employees Working", value: dashboardData?.employeesWorking, icon: <FaUserClock size={24} color="#4481eb" /> },
    { title: "Machines In Use", value: dashboardData?.inUseMachines, icon: <FaCogs size={24} color="#4481eb" /> },
  ];

  const getStatusBadgeClass = (status) => {
    return status.toLowerCase().includes("completed") ? "status-badge completed" : "status-badge in-progress";
  };

  // Mobile Task Card component
  const MobileTaskCard = ({ task }) => (
    <div className="mobile-task-card">
      <div className="task-header-row">
        <div className="order-id">Order #{task.order_id || "N/A"}</div>
        <span className={getStatusBadgeClass(task.status)}>
          {task.status}
        </span>
      </div>
      
      <div className="task-detail-row">
        <div className="task-label">Step:</div>
        <div className="task-value">{task.step_name || "N/A"}</div>
      </div>
      
      <div className="task-detail-row">
        <div className="task-label">Employee:</div>
        <div className="task-value">{task.employee_name || "Unassigned"}</div>
      </div>
      
      <div className="task-detail-row">
        <div className="task-label">Progress:</div>
        <div className="task-value" style={{ width: "100%" }}>
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ 
                width: `${Math.min(100, Math.round((task.completed / task.target) * 100))}%`,
                backgroundColor: "#4481eb" 
              }}
              aria-valuenow={Math.round((task.completed / task.target) * 100)}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div className="progress-text">
            {task.completed || 0}/{task.target || 0}
          </div>
        </div>
      </div>
    </div>
  );

  // Task table or cards based on screen size
  const TasksContent = () => {
    if (!dashboardData?.tasks || dashboardData.tasks.length === 0) {
      return (
        <div className="alert alert-info rounded-3 border-0 shadow-sm">
          <div className="d-flex align-items-center">
            <FaSpinner className="me-2" />
            <span>No active tasks at the moment.</span>
          </div>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="mobile-task-cards-container">
          {dashboardData.tasks.map((task, index) => (
            <MobileTaskCard key={index} task={task} />
          ))}
        </div>
      );
    }

    return (
      <div className="task-table">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Step Name</th>
              <th>Employee</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.tasks.map((task, index) => (
              <tr key={index}>
                <td>#{task.order_id || "N/A"}</td>
                <td>{task.step_name || "N/A"}</td>
                <td>{task.employee_name || "Unassigned"}</td>
                <td>
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="progress flex-grow-1" style={{ height: "10px", minWidth: "100px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ 
                          width: `${Math.min(100, Math.round((task.completed / task.target) * 100))}%`,
                          backgroundColor: "#4481eb" 
                        }}
                        aria-valuenow={Math.round((task.completed / task.target) * 100)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className="ms-2 small">
                      {task.completed || 0}/{task.target || 0}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(task.status)}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="dashboard-container">
        <h1 className="dashboard-title text-center">Production Overview</h1>

        {loading ? (
          <div className="text-center p-3 p-md-5">
            <div className="spinner-border text-primary loading-spinner" role="status" />
            <p className="mt-3 text-muted">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <FaExclamationTriangle className="me-2" />
            <div>{error}</div>
          </div>
        ) : (
          <>
            {/* Stats Cards Section - Responsive grid with different column sizes for different screen sizes */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 g-md-4 mb-4">
              {stats.map((stat, index) => (
                <div className="col" key={index}>
                  <div className="stat-card h-100">
                    <div className="stat-card-header d-flex align-items-center">
                      {stat.icon}
                      <span className="ms-2">{stat.title}</span>
                    </div>
                    <div className="stat-card-body">
                      <h2 className="stat-value">{stat.value || 0}</h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Task Progress Section */}
            <div className="mt-4 mt-md-5">
              <div className="task-header">
                <h3 className="mb-0">Live Task Progress</h3>
              </div>
              
              {isMobile ? (
                <TasksContent />
              ) : (
                <div className="table-responsive">
                  <TasksContent />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfficeDashboard;
