import { useState } from "react";
import axios from "axios";
import "./CreateOrder.css";
import { FaClipboardList, FaLayerGroup, FaTasks } from "react-icons/fa"; // Import icons

const CreateOrder = () => {
    const [orderNumber, setOrderNumber] = useState("");
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [steps, setSteps] = useState([]);
    const [stepCount, setStepCount] = useState(0);

    const generateStepFields = () => {
        const newSteps = Array.from({ length: stepCount }, (_, i) => ({
            name: "",
            employees: [],
        }));
        setSteps(newSteps);
    };

    const handleStepChange = (index, key, value) => {
        const newSteps = [...steps];
        newSteps[index][key] = value;
        setSteps(newSteps);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newOrder = {
            order_number: orderNumber,
            product,
            quantity,
            steps,
        };

        axios.post(`${process.env.REACT_APP_API_URL}/api/orders/add`, newOrder)
            .then(() => {
                alert("Order created successfully!");
                setOrderNumber("");
                setProduct("");
                setQuantity("");
                setStepCount(0);
                setSteps([]);
            })
            .catch(error => console.error("Error creating order:", error));
    };

    return (
        <div className="container-fluid create-order-container">
            <div className="border p-5 rounded shadow mb-5">
                <form onSubmit={handleSubmit} className="create-order-form">
                    <div className="text-center mb-4">
                        <FaClipboardList size={40} color="#4481eb" className="mb-3" />
                        <h1 className="text-center">Create Order</h1>
                    </div>
                    
                    <div className="row g-4">
                        <div className="col-12 col-md-4">
                            <label className="form-label fw-bold mb-2">Order Number</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0">
                                    <FaClipboardList size={18} color="#6c757d" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter order number"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="col-12 col-md-4">
                            <label className="form-label fw-bold mb-2">Product Name</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0">
                                    <FaLayerGroup size={18} color="#6c757d" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter product name"
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="col-12 col-md-4">
                            <label className="form-label fw-bold mb-2">Quantity</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Enter quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-3 bg-light">
                                <div className="card-body">
                                    <h5 className="card-title d-flex align-items-center mb-3">
                                        <FaTasks className="me-2" color="#4481eb" />
                                        Production Steps
                                    </h5>
                                    <div className="row align-items-end">
                                        <div className="col-md-8">
                                            <label className="form-label fw-bold mb-2">Number of Steps</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="How many production steps?"
                                                value={stepCount}
                                                onChange={(e) => setStepCount(parseInt(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mt-3 mt-md-0">
                                            <button
                                                type="button"
                                                onClick={generateStepFields}
                                                className="btn btn-primary w-100"
                                            >
                                                Generate Steps
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {steps.length > 0 && (
                            <div className="col-12">
                                <div className="step-details">
                                    <h5 className="text-center mb-4 fw-bold">Production Step Details</h5>
                                    <div className="row">
                                        {steps.map((step, index) => (
                                            <div key={index} className="col-12 col-md-4 mb-3">
                                                <div className="border p-3 rounded shadow-sm h-100 step-card">
                                                    <h6 className="text-center mb-3 fw-bold text-primary">
                                                        Step {index + 1}
                                                    </h6>
                                                    <label className="form-label mb-2">Step Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={`Enter Step Name`}
                                                        value={step.name}
                                                        onChange={(e) => handleStepChange(index, "name", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-success w-100 py-3">
                                <FaClipboardList className="me-2" /> Create Order
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrder;