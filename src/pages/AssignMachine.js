import { useState, useEffect } from "react";
import axios from "axios";

const AssignMachine = ({ stepId, onClose, isNavbarCollapsed }) => {
    const [machines, setMachines] = useState([]);
    const [assignedMachines, setAssignedMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [responsiveStyles, setResponsiveStyles] = useState({});

    // ✅ Fetch Machines & Assigned Machines on Load
    useEffect(() => {
        fetchMachines();
        fetchAssignedMachines();
        
        // Initialize responsive styles
        setResponsiveStyles(getResponsiveStyles());
        
        // Add window resize listener
        const handleResize = () => {
            setResponsiveStyles(getResponsiveStyles());
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // ✅ Fetch All Machines
    const fetchMachines = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/machines/`);
            console.log("✅ Machines Fetched:", response.data);
            setMachines(response.data);
        } catch (error) {
            console.error("❌ Error fetching machines:", error);
        }
    };

    // ✅ Fetch Assigned Machines (Excluding Completed Tasks)
    const fetchAssignedMachines = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/machine-allocations/`);
            console.log("🔴 Assigned Machines:", response.data);

            // ✅ Remove machines that have completed their tasks
            const availableMachines = response.data.filter(machine => machine.status !== "Completed");
            setAssignedMachines(availableMachines);
        } catch (error) {
            console.error("❌ Error fetching assigned machines:", error);
        }
    };

    // ✅ Update Machine Status Before Assigning
    const updateMachineStatusBeforeAssign = async (machine_id) => {
        try {
            console.log("🟢 Checking if machine needs to be freed:", machine_id);
            await axios.post(`${process.env.REACT_APP_API_URL}/api/machine-allocations/update-machine-status`, {
                machine_id
            });
            console.log("✅ Machine status updated.");
        } catch (error) {
            console.error("❌ Error updating machine status:", error);
        }
    };

    // ✅ Handle Machine Assignment
    const handleAssign = async () => {
        if (!selectedMachine) {
            alert("⚠️ Please select a machine before assigning.");
            return;
        }

        setIsAssigning(true);

        try {
            // Step 1: Ensure the machine is available before assigning
            await updateMachineStatusBeforeAssign(selectedMachine);

            console.log("🟢 Assigning Machine:", { 
                order_id: stepId.order_id, 
                step: stepId.step, 
                machine_id: selectedMachine 
            });

            await axios.post(`${process.env.REACT_APP_API_URL}/api/machine-allocations/assign`, {
                order_id: stepId.order_id,
                step: stepId.step,
                machine_id: selectedMachine
            });

            alert("✅ Machine assigned successfully!");
            fetchMachines();
            fetchAssignedMachines();
            onClose();
        } catch (error) {
            console.error("❌ Error assigning machine:", error.response ? error.response.data : error);
            alert("❌ Failed to assign machine. Check console for details.");
        } finally {
            setIsAssigning(false);
        }
    };

    // ✅ Organizing Machines into Lines (Fixed Allocation) in Ascending Order
    const sortedMachines = [...machines].sort((a, b) => a.id - b.id);
    const lines = [];
    for (let i = 0; i < 6; i++) {
        lines.push(sortedMachines.slice(1015 + i * 50 - 1015, 1065 + i * 50 - 1015));
    }

    // Helper function to extract just the number from machine number
    const extractMachineNumber = (machineNumber) => {
        // If it starts with "MACH", remove it
        if (machineNumber && machineNumber.includes("MACH")) {
            return machineNumber.replace(/MACH-?/i, "").trim();
        }
        return machineNumber;
    };

    return (
        <div style={{ 
            ...styles.modal, 
            ...responsiveStyles.modal,
            marginLeft: isNavbarCollapsed ? "35px" : "120px" // Adjust modal position based on navbar state
        }}>
            <div style={styles.modalHeader}>
                <h2 style={{ ...styles.title, ...responsiveStyles.title }}>
                    Assign Machine for Step: <b>{stepId.step}</b> (Order ID: {stepId.order_id})
                </h2>
                
                <div style={styles.fixedButtonContainer}>
                    <button 
                        onClick={handleAssign} 
                        style={styles.assignButton} 
                        disabled={isAssigning}
                    >
                        {isAssigning ? "Assigning..." : "Assign Machine"}
                    </button>
                    <button onClick={onClose} style={styles.closeButton}>Close</button>
                </div>
            </div>

            <div style={styles.contentContainer}>
                <div style={{ ...styles.grid, ...responsiveStyles.grid }}>
                    {lines.map((line, lineIndex) => (
                        <div key={lineIndex} style={styles.lineContainer}>
                            <h3 style={styles.subtitle}>Line {lineIndex + 1}</h3>
                            <div style={styles.machineButtonsContainer}>
                                {line.map(machine => {
                                    const assignedInfo = assignedMachines.find(item => item.machine_id === machine.id);
                                    const isAssigned = !!assignedInfo;
                                    
                                    // Apply responsive styles to buttons
                                    const buttonStyle = isAssigned 
                                        ? {...styles.assigned, ...(responsiveStyles.assigned || {})}
                                        : selectedMachine === machine.id 
                                            ? {...styles.selected, ...(responsiveStyles.selected || {})}
                                            : {...styles.machineButton, ...(responsiveStyles.machineButton || {})};

                                    return (
                                        <button
                                            key={machine.id}
                                            style={buttonStyle}
                                            onClick={() => !isAssigned && setSelectedMachine(machine.id)}
                                            disabled={isAssigned}
                                        >
                                            {extractMachineNumber(machine.machine_number)} {isAssigned ? "✓" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ✅ Existing Styles (Not Changed)
const styles = {
    modal: { 
        position: "fixed", 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)", 
        backgroundColor: "white", 
        padding: "0", 
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", 
        width: "90vw", 
        maxWidth: "1200px", 
        height: "90vh", 
        overflowY: "hidden", 
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column"
    },
    modalHeader: {
        position: "sticky",
        top: "0",
        backgroundColor: "white",
        zIndex: "10",
        padding: "20px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px"
    },
    fixedButtonContainer: {
        display: "flex",
        gap: "15px",
        alignItems: "center"
    },
    assignButton: {
        padding: "12px 25px", 
        fontSize: "15px", 
        background: "linear-gradient(90deg, #4481eb, #04befe)", 
        color: "white", 
        border: "none", 
        cursor: "pointer",
        textAlign: "center",
        borderRadius: "8px",
        fontWeight: "600",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        minWidth: "180px"
    },
    contentContainer: {
        padding: "20px 30px",
        overflowY: "auto",
        flex: "1"
    },
    grid: { 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "16px", 
        justifyContent: "center",
        alignItems: "start",
        marginBottom: "30px"
    },
    lineContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "15px"
    },
    machineButtonsContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px"
    },
    machineButton: { 
        padding: "6px", 
        fontSize: "13px", 
        width: "60px", 
        height: "35px", 
        background: "linear-gradient(90deg, #4481eb, #04befe)", 
        color: "white", 
        border: "none", 
        cursor: "pointer",
        textAlign: "center",
        borderRadius: "8px",
        fontWeight: "500",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
    },
    selected: { 
        padding: "6px", 
        fontSize: "13px", 
        width: "60px", 
        height: "35px", 
        background: "#3470d8", 
        color: "white", 
        border: "none", 
        cursor: "pointer",
        textAlign: "center",
        borderRadius: "8px",
        fontWeight: "500",
        transition: "all 0.3s ease",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 12px rgba(68, 129, 235, 0.3)"
    },
    assigned: { 
        padding: "6px", 
        fontSize: "13px", 
        width: "60px", 
        height: "35px", 
        backgroundColor: "rgba(220, 53, 69, 0.1)", 
        color: "#dc3545", 
        border: "none", 
        cursor: "not-allowed",
        textAlign: "center",
        borderRadius: "8px",
        fontWeight: "500"
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        flexWrap: "wrap",
        marginTop: "20px"
    },
    closeButton: {
        padding: "10px 20px", 
        fontSize: "13px", 
        width: "auto", 
        height: "auto", 
        backgroundColor: "rgba(220, 53, 69, 0.1)", 
        color: "#dc3545", 
        border: "none", 
        cursor: "pointer",
        textAlign: "center",
        borderRadius: "8px",
        fontWeight: "500",
        transition: "all 0.3s ease"
    },
    title: {
        fontSize: "1.5rem",
        textAlign: "center"
    },
    subtitle: {
        fontSize: "1.1rem",
        fontWeight: "600",
        marginBottom: "15px",
        textAlign: "center",
        color: "#4481eb"
    },
    mobileNote: {
        display: "none",
        padding: "15px",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        color: "#ffc107",
        borderRadius: "8px",
        margin: "15px 0",
        textAlign: "center",
        fontWeight: "500",
        "@media (max-width: 768px)": {
            display: "block"
        }
    }
};

// Media query styles applied dynamically
const getResponsiveStyles = () => {
    // Check if window exists (for SSR compatibility)
    if (typeof window !== "undefined") {
        const width = window.innerWidth;
        
        if (width <= 768) {
            // Mobile styles
            return {
                modal: {
                    ...styles.modal,
                    width: "95vw",
                    height: "95vh"
                },
                modalHeader: {
                    ...styles.modalHeader,
                    padding: "15px",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px"
                },
                contentContainer: {
                    ...styles.contentContainer,
                    padding: "15px"
                },
                fixedButtonContainer: {
                    ...styles.fixedButtonContainer,
                    width: "100%",
                    justifyContent: "center"
                },
                assignButton: {
                    ...styles.assignButton,
                    minWidth: "150px",
                    fontSize: "14px"
                },
                grid: {
                    ...styles.grid,
                    gridTemplateColumns: "1fr",
                    gap: "10px"
                },
                machineButton: {
                    ...styles.machineButton,
                    width: "50px",
                    fontSize: "12px",
                    padding: "4px"
                },
                selected: {
                    ...styles.selected,
                    width: "50px",
                    fontSize: "12px",
                    padding: "4px"
                },
                assigned: {
                    ...styles.assigned,
                    width: "50px",
                    fontSize: "12px",
                    padding: "4px"
                },
                title: {
                    ...styles.title,
                    fontSize: "1.2rem"
                }
            };
        } else if (width <= 1024) {
            // Tablet styles
            return {
                grid: {
                    ...styles.grid,
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
                }
            };
        }
    }

    // Default: return empty object to use default styles
    return {};
};

export default AssignMachine;