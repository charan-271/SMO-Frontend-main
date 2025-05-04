import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AssignEmployee.css";

const AssignEmployee = () => {
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [target, setTarget] = useState("");
    const [duration, setDuration] = useState("One Day");
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [collapsedOrders, setCollapsedOrders] = useState({});

    // ✅ Fetch Orders with Assigned Machines
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/orders/assigned-machines`)
            .then(response => {
                setOrders(response.data);
                // Set all orders as collapsed initially
                const initialCollapsedState = {};
                response.data.forEach(order => {
                    initialCollapsedState[order.id] = true;
                });
                setCollapsedOrders(initialCollapsedState);
            })
            .catch(error => console.error("❌ Error fetching orders:", error));
    }, []);

    // ✅ Fetch Employees for Selection
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/employees/`)
            .then(response => setEmployees(response.data))
            .catch(error => console.error("❌ Error fetching employees:", error));
    }, []);

    // ✅ Open Modal and Pre-Fill Data for Editing
    const openEditModal = (machine, task) => {
        setSelectedTask({ ...machine, task_id: task.id });
        setSelectedEmployee(task.employee_id);
        setTarget(task.target);
        setDuration(task.duration);
    };

    // ✅ Assign or Edit Employee Task
    const handleAssign = () => {
        if (!selectedEmployee || !target) {
            alert("⚠️ Please select an employee and enter a target.");
            return;
        }
    
        const apiEndpoint = selectedTask.task_id 
            ? `${process.env.REACT_APP_API_URL}/api/employee-tasks/update/${selectedTask.task_id}`  
            : `${process.env.REACT_APP_API_URL}/api/employee-tasks/assign`; 
    
        axios.post(apiEndpoint, {
            employee_id: selectedEmployee,
            machine_allocation_id: selectedTask.id,
            target,
            duration
        })
        .then(() => {
            alert(selectedTask.task_id ? "✅ Task updated successfully!" : "✅ Employee assigned successfully!");
    
            // ✅ Update UI without refreshing
            setOrders((prevOrders) =>
                prevOrders.map(order => ({
                    ...order,
                    MachineAllocations: order.MachineAllocations.map(machine => 
                        machine.id === selectedTask.id 
                            ? {
                                ...machine,
                                EmployeeTasks: [{
                                    id: selectedTask.task_id || Math.random(),
                                    employee_id: selectedEmployee,
                                    target,
                                    duration,
                                    status: target > 0 ? "In Progress" : "Completed",
                                    Employee: employees.find(emp => emp.id === selectedEmployee) || { name: "Unknown" }
                                }]
                            }
                            : machine
                    )
                }))
            );
    
            setSelectedTask(null); // Close modal after assignment
        })
        .catch(error => {
            console.error("❌ Error updating task:", error);
            alert("❌ Failed to update task.");
        });
    };

    // ✅ Delete Employee Task
    const handleDeleteTask = (machineId, taskId) => {
        if (!taskId) {
            alert("⚠️ Invalid task ID");
            return;
        }

        if (!window.confirm("⚠️ Are you sure you want to delete this task assignment?")) {
            return;
        }

        const token = localStorage.getItem('token');

        // Find the order and machine details
        const order = orders.find(order => 
            order.MachineAllocations.some(machine => machine.id === machineId)
        );
        const machine = order?.MachineAllocations.find(machine => machine.id === machineId);
        const task = machine?.EmployeeTasks[0];

        if (!order || !machine || !task) {
            alert("⚠️ Could not find task details");
            return;
        }

        // Ensure all values are in the correct format
        const payload = {
            order_Number: String(order.id), // Convert to string if it's a number
            Step_Name: String(machine.step), // Ensure step is a string
            machine_number: String(machine.machine_id), // Convert machine_id to string
            working_date: new Date().toISOString().slice(0, 10), // Format: YYYY-MM-DD
            target: Number(task.target) || 0 // Include target if needed
        };
        
        axios.delete(`${process.env.REACT_APP_API_URL}/api/employee-tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: payload
        })
            .then(response => {
                // Show success message from server or fallback message
                alert(response?.data?.message || "✅ Task deleted successfully!");
                
                // Update UI without refreshing
                setOrders((prevOrders) =>
                    prevOrders.map(order => ({
                        ...order,
                        MachineAllocations: order.MachineAllocations.map(machine => 
                            machine.id === machineId
                                ? { ...machine, EmployeeTasks: [] }
                                : machine
                        )
                    }))
                );
            })
            .catch(error => {
                console.error("❌ Error deleting task:", error);
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.message || 
                                   "Failed to delete task";
                alert(`❌ ${errorMessage}`);

                if (error.response?.status === 401) {
                    alert("Session expired. Please login again.");
                    window.location.href = '/login';
                    return;
                }

                // If task wasn't found (404) or other specific errors, update UI
                if (error.response?.status === 404) {
                    setOrders((prevOrders) =>
                        prevOrders.map(order => ({
                            ...order,
                            MachineAllocations: order.MachineAllocations.map(machine => 
                                machine.id === machineId
                                    ? { ...machine, EmployeeTasks: [] }
                                    : machine
                            )
                        }))
                    );
                }
            });
    };

    // Toggle dropdown open/close state
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Handle employee selection from custom dropdown
    const handleEmployeeSelect = (employeeId) => {
        setSelectedEmployee(employeeId);
        setDropdownOpen(false);
    };

    // Toggle collapse state for an order
    const toggleOrderCollapse = (orderId) => {
        setCollapsedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    return (
        <div className="container-AssignEmployee my-5">
            <h1 className="text-center mb-4">Assign Employee</h1>

            {orders.map(order => (
                <div key={order.id} className="modern-card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">
                            <span className="order-number">Order {order.id}</span>
                            {order.product}
                            <button 
                                onClick={() => toggleOrderCollapse(order.id)} 
                                className="btn btn-link">
                                {collapsedOrders[order.id] ? "Expand" : "Collapse"}
                            </button>
                        </h5>
                        
                        {!collapsedOrders[order.id] && (
                            <div className="row">
                                {order.MachineAllocations.map(machine => (
                                    <div key={machine.id} className="col-12 col-md-6 col-lg-4 mb-3">
                                        <div className="step-box">
                                            <div className="property-row">
                                                <div className="property-label">Step:</div>
                                                <div className="property-value">{machine.step}</div>
                                            </div>
                                            <div className="property-row">
                                                <div className="property-label">Machine:</div>
                                                <div className="property-value">{machine.machine_id}</div>
                                            </div>

                                            {machine.EmployeeTasks.length > 0 ? (
                                                <>
                                                    <div className="property-row">
                                                        <div className="property-label">Assigned:</div>
                                                        <div className="property-value">{machine.EmployeeTasks[0].Employee.name}</div>
                                                    </div>
                                                    <div className="property-row">
                                                        <div className="property-label">Target:</div>
                                                        <div className="property-value">{machine.EmployeeTasks[0].target}</div>
                                                    </div>
                                                    <div className="property-row">
                                                        <div className="property-label">Status:</div>
                                                        <div className="property-value">
                                                            <span className={`status-badge ${machine.EmployeeTasks[0].status === "Completed" ? "completed" : "in-progress"}`}>
                                                                {machine.EmployeeTasks[0].status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="button-container">
                                                        {machine.EmployeeTasks[0].status === "Completed" ? (
                                                            <div className="text-success">✅ Completed</div>
                                                        ) : (
                                                            <div className="d-flex gap-2">
                                                                <button 
                                                                    onClick={() => openEditModal(machine, machine.EmployeeTasks[0])} 
                                                                    className="modern-btn warning">
                                                                    Edit Task
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteTask(machine.id, machine.EmployeeTasks[0].id)} 
                                                                    className="modern-btn danger">
                                                                    Delete Task
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="button-container">
                                                    <button 
                                                        onClick={() => setSelectedTask(machine)} 
                                                        className="modern-btn primary">
                                                        Assign Employee
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {selectedTask && (
                <div className="modal d-block show" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Employee to Machine {selectedTask.machine_id} (Step: {selectedTask.step})</h5>
                                <button onClick={() => setSelectedTask(null)} className="btn-close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="modern-label">Select Employee:</label>
                                    <input 
                                        type="text" 
                                        className="modern-input mb-2" 
                                        placeholder="Search employee..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    
                                    {/* Custom dropdown with scrolling support */}
                                    <div className="custom-select-container">
                                        <div 
                                            className="custom-select-header" 
                                            onClick={toggleDropdown}
                                        >
                                            {selectedEmployee ? 
                                                employees.find(emp => emp.id === selectedEmployee)?.name || "-- Select Employee --" 
                                                : "-- Select Employee --"}
                                            <span className="dropdown-arrow">▼</span>
                                        </div>
                                        
                                        {dropdownOpen && (
                                            <div className="custom-select-options">
                                                <div 
                                                    className="custom-select-option"
                                                    onClick={() => handleEmployeeSelect("")}
                                                >
                                                    -- Select Employee --
                                                </div>
                                                {employees
                                                    .filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map(emp => (
                                                        <div 
                                                            key={emp.id} 
                                                            className={`custom-select-option ${selectedEmployee === emp.id ? 'selected' : ''}`}
                                                            onClick={() => handleEmployeeSelect(emp.id)}
                                                        >
                                                            {emp.name}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="modern-label">Target:</label>
                                    <input 
                                        type="number" 
                                        value={target} 
                                        onChange={(e) => setTarget(e.target.value)} 
                                        className="modern-input"
                                        placeholder="Enter target quantity"
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="modern-label">Duration:</label>
                                    <select 
                                        value={duration} 
                                        onChange={(e) => setDuration(e.target.value)} 
                                        className="modern-select"
                                    >
                                        <option value="One Day">One Day</option>
                                        <option value="Multiple Days">Multiple Days</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    onClick={handleAssign} 
                                    className="modern-btn primary"
                                >
                                    Save Changes
                                </button>
                                <button 
                                    onClick={() => setSelectedTask(null)} 
                                    className="modern-btn danger"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignEmployee;