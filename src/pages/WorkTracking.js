import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./WorkTracking.css";
import { FaUserCog, FaCog, FaBullseye, FaCheck, FaSpinner, FaSync, FaUser, FaIndustry, FaClock } from "react-icons/fa";

const WorkTracking = () => {
    const [employeeTasks, setEmployeeTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Initial data fetch with loading indicator
        fetchInitialData();

        // Set up background refresh every 5 seconds
        const interval = setInterval(fetchDataInBackground, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchInitialData = () => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/employee-tasks/assigned`)
            .then(response => {
                setEmployeeTasks(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching tasks:", error);
                setLoading(false);
            });
    };

    const fetchDataInBackground = () => {
        setIsRefreshing(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/employee-tasks/assigned`)
            .then(response => {
                setEmployeeTasks(response.data);
                setIsRefreshing(false);
            })
            .catch(error => {
                console.error("Error fetching tasks:", error);
                setIsRefreshing(false);
            });
    };

    const getStatusBadgeClass = (status) => {
        return status.toLowerCase() === "completed" ? "status-badge completed" : "status-badge in-progress";
    };

    // Render a mobile-friendly card for each task
    const renderTaskCard = (task) => {
        const progressPercentage = Math.min(100, Math.round((task.completed / task.target) * 100));
        
        return (
            <div className="task-card" key={task.id}>
                <div className="task-card-header">
                    <div className="employee-info">
                        <FaUser className="icon" />
                        <span className="name">{task.Employee?.name}</span>
                    </div>
                    <span className={getStatusBadgeClass(task.status)}>
                        {task.status}
                    </span>
                </div>
                
                <div className="task-card-body">
                    <div className="task-detail">
                        <div className="detail-label">
                            <FaIndustry className="detail-icon" /> Machine
                        </div>
                        <div className="detail-value">
                            {task.MachineAllocation?.machine_id}
                        </div>
                    </div>
                    
                    <div className="task-detail">
                        <div className="detail-label">
                            <FaBullseye className="detail-icon" /> Target
                        </div>
                        <div className="detail-value highlight">
                            {task.target}
                        </div>
                    </div>
                    
                    <div className="task-detail">
                        <div className="detail-label">
                            <FaCheck className="detail-icon" /> Completed
                        </div>
                        <div className="detail-value highlight">
                            {task.completed}
                        </div>
                    </div>
                    
                    <div className="task-detail">
                        <div className="detail-label">
                            <FaSync className="detail-icon" /> Assigned Date
                        </div>
                        <div className="detail-value">
                            {new Date(task.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <div className="task-detail">
                        <div className="detail-label">
                            <FaClock className="detail-icon" /> Last Updated
                        </div>
                        <div className="detail-value">
                            {new Date(task.updatedAt).toLocaleString()}
                        </div>
                    </div>
                    
                    <div className="task-progress">
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar-fill" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <span className="progress-percentage">{progressPercentage}%</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="worktracking-container page-container">
                <h1 className="page-title">Work Tracking</h1>
                
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner-border text-primary loading-spinner" role="status"></div>
                        <p className="mt-3 text-muted">Loading work assignments...</p>
                    </div>
                ) : employeeTasks.length === 0 ? (
                    <div className="alert alert-warning rounded-3 border-0 shadow-sm">
                        <div className="d-flex align-items-center">
                            <FaSpinner className="me-2" />
                            <span>No active tasks assigned.</span>
                        </div>
                    </div>
                ) : (
                    <div className="modern-card mt-4">
                        <div className="refresh-indicator">
                            <span className="small text-muted">
                                Auto-refreshing data {isRefreshing && <FaSync className="refresh-icon" />}
                            </span>
                        </div>
                        
                        {/* Desktop view - Table */}
                        <div className="scrollable-table-container d-none d-md-block">
                            <table className="table table-hover mb-0 scrollable-table">
                                <thead>
                                    <tr>
                                        <th><FaUserCog className="me-2" />Employee</th>
                                        <th><FaCog className="me-2" />Machine</th>
                                        <th><FaBullseye className="me-2" />Target</th>
                                        <th><FaCheck className="me-2" />Completed</th>
                                        <th>Status</th>
                                        <th>Progress</th>
                                        <th>Assigned Date</th>
                                        <th>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeTasks.map(task => (
                                        <tr key={task.id}>
                                            <td>{task.Employee?.name} (RFID: {task.Employee?.rfid})</td>
                                            <td>{task.MachineAllocation?.machine_id}</td>
                                            <td>{task.target}</td>
                                            <td>{task.completed}</td>
                                            <td>
                                                <span className={getStatusBadgeClass(task.status)}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="progress-bar-container">
                                                    <div 
                                                        className="progress-bar-fill" 
                                                        style={{ width: `${Math.min(100, Math.round((task.completed / task.target) * 100))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="small text-muted">
                                                    {Math.round((task.completed / task.target) * 100)}%
                                                </span>
                                            </td>
                                            <td>{new Date(task.createdAt).toLocaleString()}</td>
                                            <td>{new Date(task.updatedAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Mobile view - Cards */}
                        <div className="task-cards-container d-md-none">
                            {employeeTasks.map(task => renderTaskCard(task))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkTracking;
