import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddEmployee.css";

const AddEmployee = () => {
    const [latestRFID, setLatestRFID] = useState("");
    const [name, setName] = useState("");
    const [manualRFID, setManualRFID] = useState(false); // ✅ Toggle manual/auto input

    const fetchLatestRFID = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/employees/latest-scan`);
            console.log("✅ Latest RFID Fetched:", response.data);
            setLatestRFID(response.data.rfid || "No recent scan found");
        } catch (error) {
            console.error("❌ Error fetching latest RFID:", error);
            setLatestRFID("Error fetching RFID");
        }
    };

    const handleRegister = async () => {
        if (!latestRFID || latestRFID === "No recent scan found" || latestRFID === "Error fetching RFID") {
            alert("⚠️ No valid RFID available!");
            return;
        }
        if (!name) {
            alert("⚠️ Please enter employee name.");
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/employees/register`, { name, rfid: latestRFID });
            alert("✅ Employee registered successfully!");
            setName("");
            setLatestRFID("");
        } catch (error) {
            console.error("❌ Error registering employee:", error);
            alert("❌ Failed to register employee.");
        }
    };

    return (
        <div className="add-employee-container">
            <div className="employee-form-card">
                <div className="card-header">
                    <h1 className="form-title">Add Employee</h1>
                    <div className="title-underline"></div>
                </div>

                <div className="card-body">
                    <div className="rfid-toggle-section">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="manualRFIDSwitch"
                                checked={manualRFID}
                                onChange={() => {
                                    setManualRFID(!manualRFID);
                                    setLatestRFID(""); // Reset RFID input when switching
                                }}
                            />
                            <label className="form-check-label" htmlFor="manualRFIDSwitch">
                                Manual RFID Entry
                            </label>
                        </div>
                    </div>

                    {!manualRFID ? (
                        <div className="rfid-fetch-section">
                            <button className="modern-btn primary fetch-btn" onClick={fetchLatestRFID}>
                                <i className="fas fa-sync-alt me-2"></i>
                                Fetch Latest RFID
                            </button>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="modern-label">RFID</label>
                            <div className="input-with-icon">
                                <i className="fas fa-id-card input-icon"></i>
                                <input
                                    type="text"
                                    className="modern-input"
                                    placeholder="Enter RFID manually"
                                    value={latestRFID}
                                    onChange={(e) => setLatestRFID(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="rfid-status">
                        <p className="fw-bold">
                            Latest RFID:{" "}
                            <span className={`rfid-value ${latestRFID ? 'has-rfid' : ''}`}>
                                {latestRFID || "No scan yet"}
                            </span>
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="modern-label">Employee Name</label>
                        <div className="input-with-icon">
                            <i className="fas fa-user input-icon"></i>
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="Enter Employee Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-action">
                        <button className="btn btn-success w-100 py-3" onClick={handleRegister}>
                            <i className="fas fa-user-plus me-2"></i>
                            Register Employee
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;