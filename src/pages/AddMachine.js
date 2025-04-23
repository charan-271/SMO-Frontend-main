import { useState } from "react";
import axios from "axios";
import { FaPlus, FaCog } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddMachine.css";

const AddMachine = () => {
    const [machineNumber, setMachineNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        axios.post(`${process.env.REACT_APP_API_URL}/api/machines/add`, { machine_number: machineNumber })
            .then(() => {
                alert("Machine added successfully!");
                setMachineNumber("");
                setIsSubmitting(false);
            })
            .catch(error => {
                console.error("Error adding machine:", error);
                setIsSubmitting(false);
            });
    };

    return (
        <div className="page-container">
            <div className="add-machine-container">
                <div className="machine-form-card">
                    <div className="card-header">
                        <h1 className="form-title">Add Machine</h1>
                        <div className="title-underline"></div>
                        <div className="header-icon">
                            <FaCog className="icon-spin" size={30} />
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="add-machine-form">
                            <div className="form-group mb-4">
                                <label htmlFor="machineNumber" className="form-label">Machine Number</label>
                                <div className="input-with-icon">
                                    <input
                                        id="machineNumber"
                                        type="text"
                                        placeholder="Enter Machine Number"
                                        value={machineNumber}
                                        onChange={(e) => setMachineNumber(e.target.value)}
                                        required
                                        className="form-control modern-input"
                                    />
                                </div>
                            </div>
                            <div className="d-grid">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" 
                                                  style={{ width: '1.5rem', height: '1.5rem' }}></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="me-2" size={20} /> Add Machine
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMachine;
