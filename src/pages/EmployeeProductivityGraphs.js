import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, Radar } from "react-chartjs-2";
import "chart.js/auto";
import { Accordion, Card, Button } from "react-bootstrap";
import "./EmployeeProductivityGraphs.css";

const EmployeeProductivityGraphs = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductivityData();
    }, []);

    const fetchProductivityData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/orders-productivity`);
            const formattedOrders = response.data.map(order => ({
                order_id: order.id,
                order_number: order.order_number,
                timePerPiece: order.MachineAllocations.flatMap(machine =>
                    machine.EmployeeTasks.map(task => ({
                        employee_id: task.employee_id,
                        time_per_piece: task.total_completed ? (8 * 60) / task.total_completed : 0
                    }))
                ),
                totalPieces: order.MachineAllocations.flatMap(machine =>
                    machine.EmployeeTasks.map(task => ({
                        employee_id: task.employee_id,
                        total_completed: Number(task.total_completed) || 0
                    }))
                ),
                hourlyTrend: [],
                employeePerformance: order.MachineAllocations.flatMap(machine =>
                    machine.EmployeeTasks.map(task => ({
                        employee_id: task.employee_id,
                        total_completed: Number(task.total_completed) || 0
                    }))
                )
            }));
            setOrders(formattedOrders);
        } catch (error) {
            console.error("❌ Error fetching productivity data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Chart.js common options for a modern look
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 12
                    },
                    usePointStyle: true,
                    padding: 20
                },
                position: 'top',
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                bodyFont: {
                    family: "'Poppins', sans-serif",
                },
                titleFont: {
                    family: "'Poppins', sans-serif",
                    weight: 'bold'
                },
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true
            }
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-4">Employee Productivity Analysis</h2>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading productivity data...</p>
                </div>
            ) : orders.length > 0 ? (
                <Accordion defaultActiveKey="0">
                    {orders.map((order, index) => (
                        <Card key={order.order_id}>
                            <Accordion.Item eventKey={String(index)}>
                                <Accordion.Header>Order ID: {order.order_id} - {order.order_number}</Accordion.Header>
                                <Accordion.Body>
                                    <div className="row g-4 justify-content-center">
                                        <div className="col-12 col-md-6">
                                            <div className="card shadow-sm p-3">
                                                <h5 className="chart-title">Time per Piece</h5>
                                                <div style={{ height: "300px" }}>
                                                    <Line
                                                        data={{
                                                            labels: order.timePerPiece?.map(d => `Emp ${d.employee_id}`),
                                                            datasets: [{
                                                                label: "Avg. Time Taken per Piece (Minutes)",
                                                                data: order.timePerPiece?.map(d => parseFloat(d.time_per_piece) || 0),
                                                                borderColor: "rgba(13, 110, 253, 0.8)",
                                                                backgroundColor: "rgba(13, 110, 253, 0.1)",
                                                                borderWidth: 2,
                                                                tension: 0.4,
                                                                pointRadius: 4,
                                                                pointBackgroundColor: "rgba(13, 110, 253, 1)",
                                                                fill: true
                                                            }]
                                                        }}
                                                        options={chartOptions}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <div className="card shadow-sm p-3">
                                                <h5 className="chart-title">Total Pieces</h5>
                                                <div style={{ height: "300px" }}>
                                                    <Bar
                                                        data={{
                                                            labels: order.totalPieces?.map(d => `Emp ${d.employee_id}`),
                                                            datasets: [{
                                                                label: "Total Pieces Completed",
                                                                data: order.totalPieces?.map(d => d.total_completed),
                                                                backgroundColor: "rgba(25, 135, 84, 0.7)",
                                                                borderRadius: 6,
                                                                borderColor: "rgba(25, 135, 84, 0.9)",
                                                                borderWidth: 1
                                                            }]
                                                        }}
                                                        options={chartOptions}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <div className="card shadow-sm p-3">
                                                <h5 className="chart-title">Hourly Productivity</h5>
                                                <div style={{ height: "300px" }}>
                                                    <Line
                                                        data={{
                                                            labels: order.hourlyTrend?.map(d => d.hour_slot),
                                                            datasets: [{
                                                                label: "Hourly Productivity",
                                                                data: order.hourlyTrend?.map(d => d.hourly_completed),
                                                                borderColor: "rgba(102, 16, 242, 0.8)",
                                                                backgroundColor: "rgba(102, 16, 242, 0.1)",
                                                                borderWidth: 2,
                                                                tension: 0.4,
                                                                pointRadius: 4,
                                                                pointBackgroundColor: "rgba(102, 16, 242, 1)",
                                                                fill: true
                                                            }]
                                                        }}
                                                        options={chartOptions}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <div className="card shadow-sm p-3">
                                                <h5 className="chart-title">Performance Comparison</h5>
                                                <div style={{ height: "300px" }}>
                                                    <Radar
                                                        data={{
                                                            labels: order.employeePerformance?.map(d => `Emp ${d.employee_id}`),
                                                            datasets: [{
                                                                label: "Performance",
                                                                data: order.employeePerformance?.map(d => d.total_completed),
                                                                backgroundColor: "rgba(220, 53, 69, 0.3)",
                                                                borderColor: "rgba(220, 53, 69, 0.8)",
                                                                borderWidth: 2,
                                                                pointRadius: 4,
                                                                pointBackgroundColor: "rgba(220, 53, 69, 1)"
                                                            }]
                                                        }}
                                                        options={{
                                                            ...chartOptions,
                                                            scales: {
                                                                r: {
                                                                    angleLines: {
                                                                        color: "rgba(0, 0, 0, 0.1)"
                                                                    },
                                                                    grid: {
                                                                        color: "rgba(0, 0, 0, 0.05)"
                                                                    },
                                                                    pointLabels: {
                                                                        font: {
                                                                            family: "'Poppins', sans-serif",
                                                                            size: 12
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Card>
                    ))}
                </Accordion>
            ) : (
                <div className="alert alert-info p-4 text-center shadow-sm">
                    <i className="bi bi-info-circle me-2"></i>
                    No productivity data available at this time.
                </div>
            )}
        </div>
    );
};

export default EmployeeProductivityGraphs;