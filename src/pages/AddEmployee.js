import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddEmployee.css";

const AddEmployee = () => {
    const [latestRFID, setLatestRFID] = useState("");
    const [name, setName] = useState("");
    const [manualRFID, setManualRFID] = useState(false);
    const [mobile, setMobile] = useState("");

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
        if (!name || !mobile) {
            alert("⚠️ Please enter all required fields.");
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/employees/register`, {
                name,
                rfid: latestRFID,
                mobile
            });
            alert("✅ Employee registered successfully!");
            setName("");
            setMobile("");
            setLatestRFID("");
        } catch (error) {
            console.error("❌ Error registering employee:", error);
            alert(error?.response?.data?.error || "❌ Failed to register employee.");
        }
    };

    return (
        <div className="container-Addemployee my-5">
            <div className="card shadow p-4">
                <h1 className="mb-4 text-center">Add Employee</h1>

                <div className="d-flex justify-content-center mb-3">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="manualRFIDSwitch"
                            checked={manualRFID}
                            onChange={() => {
                                setManualRFID(!manualRFID);
                                setLatestRFID("");
                            }}
                        />
                        <label className="form-check-label" htmlFor="manualRFIDSwitch">
                            Manual RFID Entry
                        </label>
                    </div>
                </div>

                {!manualRFID ? (
                    <div className="d-grid gap-2 mb-3">
                        <button className="btn btn-primary" onClick={fetchLatestRFID}>
                            Fetch Latest RFID
                        </button>
                    </div>
                ) : (
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter RFID manually"
                            value={latestRFID}
                            onChange={(e) => setLatestRFID(e.target.value)}
                        />
                    </div>
                )}

                <div className="mb-3 text-center">
                    <p className="fw-bold">
                        Latest RFID:{" "}
                        <span className="text-success">{latestRFID || "No scan yet"}</span>
                    </p>
                </div>

                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Employee Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                    />
                </div>

                <div className="d-grid gap-2">
                    <button className="btn btn-success" onClick={handleRegister}>
                        Register Employee
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;