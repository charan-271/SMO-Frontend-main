import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { Modal, Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "./EmployeeList.css";
import { FaSearch, FaUserEdit, FaTrash, FaChartLine, FaHistory, FaQrcode, FaTimes, FaFilter, FaEllipsisV } from "react-icons/fa";

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [filteredHistoryData, setFilteredHistoryData] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [historySearchTerm, setHistorySearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showMobileActionMenu, setShowMobileActionMenu] = useState(null);
    const mobileMenuRef = useRef(null);
    const employeesPerPage = 6;

    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/employees/`)
            .then(response => {
                setEmployees(response.data);
                setFilteredEmployees(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching employees:", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        // Close mobile action menu when clicking outside
        function handleClickOutside(event) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileActionMenu(null);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredEmployees(employees);
        } else {
            setFilteredEmployees(
                employees.filter(emp =>
                    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.rfid.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, employees]);

    const deleteEmployee = (id) => {
        if (!window.confirm("⚠️ Are you sure you want to delete this employee?")) return;

        axios.delete(`${process.env.REACT_APP_API_URL}/api/employees/${id}`)
            .then(response => {
                console.log(response.data.message);
                setEmployees(employees.filter(emp => emp.id !== id));
            })
            .catch(error => {
                console.error("❌ Error deleting employee:", error);
                alert("❌ Failed to delete employee!");
            });
    };

    const fetchHistory = (employeeId) => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/employees/history/${employeeId}`)
            .then(response => {
                setHistoryData(response.data.history || []);
                setFilteredHistoryData(response.data.history || []);
                setShowHistoryModal(true);
            })
            .catch(error => {
                console.error("Error fetching history:", error);
                setHistoryData([]);
                setFilteredHistoryData([]);
                setShowHistoryModal(true);
            });
    };

    const handleGenerateQR = (employee) => {
        setSelectedEmployee(employee);
        setShowQRCodeModal(true);
    };

    const handlePrintQR = () => {
        // Use the print-specific CSS to only print the QR code
        window.print();
    };

    const toggleMobileActionMenu = (empId) => {
        setShowMobileActionMenu(showMobileActionMenu === empId ? null : empId);
    };

    // Paginate employee data
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top on mobile when changing pages
        if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    // Filter history data based on search term
    useEffect(() => {
        if (historySearchTerm === "") {
            setFilteredHistoryData(historyData);
        } else {
            setFilteredHistoryData(
                historyData.filter(record =>
                    (record.order_Number && record.order_Number.toString().toLowerCase().includes(historySearchTerm.toLowerCase())) ||
                    (record.Step_Name && record.Step_Name.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
                    (record.machine_number && record.machine_number.toString().toLowerCase().includes(historySearchTerm.toLowerCase())) ||
                    (record.target && record.target.toString().toLowerCase().includes(historySearchTerm.toLowerCase())) ||
                    (record.working_date && new Date(record.working_date).toLocaleDateString().toLowerCase().includes(historySearchTerm.toLowerCase()))
                )
            );
        }
    }, [historySearchTerm, historyData]);
    
    // Render mobile employee card
    const renderMobileEmployeeCard = (emp) => {
        return (
            <div key={emp.id} className="employee-card-mobile">
                <div className="employee-card-header">
                    <h5 className="employee-name">{emp.name}</h5>
                    <button 
                        className="mobile-action-toggle"
                        onClick={() => toggleMobileActionMenu(emp.id)}
                        aria-label="Employee actions"
                    >
                        <FaEllipsisV />
                    </button>
                    
                    {showMobileActionMenu === emp.id && (
                        <div className="mobile-action-menu" ref={mobileMenuRef}>
                            <button 
                                className="mobile-action-item"
                                onClick={() => alert("Edit functionality to be implemented")}
                            >
                                <FaUserEdit /> Edit
                            </button>
                            <button 
                                className="mobile-action-item"
                                onClick={() => deleteEmployee(emp.id)}
                            >
                                <FaTrash /> Delete
                            </button>
                            <button 
                                className="mobile-action-item"
                                onClick={() => alert("Analyze Clicked!")}
                            >
                                <FaChartLine /> Analytics
                            </button>
                            <button 
                                className="mobile-action-item"
                                onClick={() => fetchHistory(emp.id)}
                            >
                                <FaHistory /> History
                            </button>
                            <button 
                                className="mobile-action-item"
                                onClick={() => handleGenerateQR(emp)}
                            >
                                <FaQrcode /> QR Code
                            </button>
                        </div>
                    )}
                </div>
                <div className="employee-card-content">
                    <p className="employee-rfid">RFID: {emp.rfid}</p>
                    <span className="employee-role">Worker</span>
                </div>
            </div>
        );
    };
    
    return (
        <div className="container-fluid py-4">
            <div className="employee-list-container">
                <h1 className="employee-list-title text-center">Employee Management</h1>
                
                {/* Search Bar */}
                <div className="employee-search mb-4">
                    <FaSearch className="employee-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or RFID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status" />
                        <p className="mt-3 text-muted">Loading employees...</p>
                    </div>
                ) : (
                    <>
                        {currentEmployees.length > 0 ? (
                            <>
                                {/* Desktop View */}
                                <div className="row g-4 d-none d-md-flex">
                                    {currentEmployees.map(emp => (
                                        <div key={emp.id} className="col-lg-4 col-md-6">
                                            <div className="employee-card">
                                                <div className="employee-card-body">
                                                    <h5 className="employee-name">{emp.name}</h5>
                                                    <p className="employee-email">RFID: {emp.rfid}</p>
                                                    <span className="employee-role">Worker</span>
                                                    
                                                    <div className="employee-actions">
                                                        <button 
                                                            className="employee-action-btn edit"
                                                            onClick={() => alert("Edit functionality to be implemented")}
                                                        >
                                                            <FaUserEdit /> Edit
                                                        </button>
                                                        <button 
                                                            className="employee-action-btn delete"
                                                            onClick={() => deleteEmployee(emp.id)}
                                                        >
                                                            <FaTrash /> Delete
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="d-flex gap-2 mt-3">
                                                        <button 
                                                            className="btn btn-outline-primary rounded-pill btn-sm"
                                                            onClick={() => alert("Analyze Clicked!")}
                                                        >
                                                            <FaChartLine className="me-1" /> Analytics
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-info rounded-pill btn-sm"
                                                            onClick={() => fetchHistory(emp.id)}
                                                        >
                                                            <FaHistory className="me-1" /> History
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-dark rounded-pill btn-sm"
                                                            onClick={() => handleGenerateQR(emp)}
                                                        >
                                                            <FaQrcode className="me-1" /> QR Code
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Mobile View */}
                                <div className="employee-mobile-list d-md-none">
                                    {currentEmployees.map(emp => renderMobileEmployeeCard(emp))}
                                </div>
                            </>
                        ) : (
                            <div className="no-employees">
                                <h4>No employees found</h4>
                                <p>Try adjusting your search criteria</p>
                            </div>
                        )}
                        
                        {/* Pagination Controls */}
                        {filteredEmployees.length > employeesPerPage && (
                            <div className="pagination mt-4">
                                {/* Mobile Pagination - Previous/Next Style */}
                                <div className="d-md-none mobile-pagination">
                                    <button 
                                        className="page-nav-btn" 
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        Prev
                                    </button>
                                    <span className="page-indicator">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button 
                                        className="page-nav-btn" 
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                                
                                {/* Desktop Pagination - Number Buttons */}
                                <div className="d-none d-md-flex desktop-pagination">
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index + 1}
                                            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mobile-optimized Modal for Showing History */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="mb-0">Employee Task History</h4>
                            <button className="btn-close" onClick={() => setShowHistoryModal(false)}></button>
                        </div>

                        {/* Search for History */}
                        <div className="employee-search mb-4">
                            <FaSearch className="employee-search-icon" />
                            <input
                                type="text"
                                placeholder="Search history records..."
                                value={historySearchTerm}
                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                            />
                        </div>

                        {filteredHistoryData.length > 0 ? (
                            <>
                                {/* Desktop History Table */}
                                <div className="table-responsive task-table d-none d-md-block">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Order Number</th>
                                                <th>Step Name</th>
                                                <th>Machine Number</th>
                                                <th>Target</th>
                                                <th>Working Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHistoryData.map((record, idx) => (
                                                <tr key={idx}>
                                                    <td>#{record.order_Number || "N/A"}</td>
                                                    <td>{record.Step_Name || "N/A"}</td>
                                                    <td>{record.machine_number || "N/A"}</td>
                                                    <td>{record.target || 0}</td>
                                                    <td>{record.working_date ? new Date(record.working_date).toLocaleDateString() : "N/A"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile History Cards */}
                                <div className="task-cards d-md-none">
                                    {filteredHistoryData.map((record, idx) => (
                                        <div className="task-card" key={idx}>
                                            <div className="task-card-header">
                                                <div className="order-number">
                                                    #{record.order_Number || "N/A"}
                                                </div>
                                                <div className="task-date">
                                                    {record.working_date ? new Date(record.working_date).toLocaleDateString() : "N/A"}
                                                </div>
                                            </div>
                                            <div className="task-card-content">
                                                <div className="task-detail">
                                                    <span className="detail-label">Step:</span>
                                                    <span className="detail-value">{record.Step_Name || "N/A"}</span>
                                                </div>
                                                <div className="task-detail">
                                                    <span className="detail-label">Machine:</span>
                                                    <span className="detail-value">{record.machine_number || "N/A"}</span>
                                                </div>
                                                <div className="task-detail">
                                                    <span className="detail-label">Target:</span>
                                                    <span className="detail-value">{record.target || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="alert alert-info rounded-3 border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <FaHistory className="me-2" />
                                    <span>No history records found for this employee.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* QR Code Modal - Already responsive */}
            <Modal 
                show={showQRCodeModal} 
                onHide={() => setShowQRCodeModal(false)}
                centered
                dialogClassName="modal-dialog-centered"
            >
                <Modal.Header closeButton>
                    <Modal.Title>QR Code for {selectedEmployee?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    {selectedEmployee && (
                        <div>
                            <div className="border p-4 d-inline-block mb-3 rounded qr-print-container">
                                <QRCodeCanvas value={selectedEmployee.rfid} size={200} />
                            </div>
                            <p className="text-muted mb-4">Scan this QR code to quickly access employee info</p>
                            <Button variant="primary" onClick={handlePrintQR} className="rounded-pill px-4">
                                <FaQrcode className="me-2" /> Print QR Code
                            </Button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EmployeeList;
