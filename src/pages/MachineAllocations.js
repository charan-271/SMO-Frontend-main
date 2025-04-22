import { useState } from "react";
import AssignEmployee from "./AssignEmployee";

const MachineAllocations = ({ machineAllocations }) => {
    const [selectedMachineAllocation, setSelectedMachineAllocation] = useState(null);

    return (
        <div className="container mt-4">
            <h2>Machine Allocations</h2>
            
            {/* Bootstrap Table */}
            <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                    <tr>
                        <th>Order ID</th>
                        <th>Step</th>
                        <th>Machine ID</th>
                        <th>Assign Employee</th>
                    </tr>
                </thead>
                <tbody>
                    {machineAllocations.map(allocation => (
                        <tr key={allocation.id}>
                            <td>{allocation.order_id}</td>
                            <td>{allocation.step}</td>
                            <td>{allocation.machine_id}</td>
                            <td>
                                <button 
                                    onClick={() => setSelectedMachineAllocation(allocation.id)} 
                                    className="btn btn-primary"
                                >
                                    Assign Employee
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Conditional Rendering for AssignEmployee Component */}
            {selectedMachineAllocation && (
                <AssignEmployee 
                    machineAllocationId={selectedMachineAllocation}
                    onClose={() => setSelectedMachineAllocation(null)}
                />
            )}
        </div>
    );
};

export default MachineAllocations;
