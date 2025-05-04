import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSpinner, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./MachineAllocations.css";

const MachineAllocations = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsedCards, setCollapsedCards] = useState({});

    useEffect(() => {
        fetchAllocations();
    }, []);

    const fetchAllocations = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/machine-allocations/by-order`);
            setAllocations(response.data);
            // Initialize all cards as expanded (not collapsed)
            const initialCollapsedState = response.data.reduce((acc, order) => {
                acc[order.order_id] = false;
                return acc;
            }, {});
            setCollapsedCards(initialCollapsedState);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching allocations:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (allocationId) => {
        if (!window.confirm("Are you sure you want to delete this allocation?")) {
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/machine-allocations/${allocationId}`);
            fetchAllocations(); // Refresh the list
            alert("✅ Allocation deleted successfully");
        } catch (error) {
            console.error("Error deleting allocation:", error);
            alert("❌ Error deleting allocation");
        }
    };

    const toggleCollapse = (orderId) => {
        setCollapsedCards(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Loading allocations...</p>
            </div>
        );
    }

    return (
        <div className="machine-allocations-container">
            <h1 className="page-title">Machine Allocations</h1>
            
            {allocations.length === 0 ? (
                <div className="no-allocations">
                    <p>No machine allocations found</p>
                </div>
            ) : (
                <div className="allocations-grid">
                    {allocations.map((orderAllocation) => (
                        <div key={orderAllocation.order_id} className="allocation-card">
                            <div className="card-header" onClick={() => toggleCollapse(orderAllocation.order_id)}>
                                <div className="header-content">
                                    <h2>Order #{orderAllocation.order_number}</h2>
                                    <span className="product-name">{orderAllocation.product}</span>
                                </div>
                                {collapsedCards[orderAllocation.order_id] ? 
                                    <FaChevronDown className="collapse-icon" /> : 
                                    <FaChevronUp className="collapse-icon" />
                                }
                            </div>
                            
                            <div className={`allocations-list ${collapsedCards[orderAllocation.order_id] ? 'collapsed' : ''}`}>
                                {!collapsedCards[orderAllocation.order_id] && orderAllocation.allocations.map((allocation) => (
                                    <div key={allocation.id} className="allocation-item">
                                        <div className="allocation-details">
                                            <div className="detail-row">
                                                <span className="label">Machine:</span>
                                                <span className="value">{allocation.machine_number}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Step:</span>
                                                <span className="value">{allocation.step}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Status:</span>
                                                <span className={`status-badge ${allocation.status.toLowerCase()}`}>
                                                    {allocation.status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(allocation.id)}
                                            title="Delete allocation"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MachineAllocations;
