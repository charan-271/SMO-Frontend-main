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

    // Chart options and styles
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 12,
                        family: "'Poppins', sans-serif",
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1a1a2e',
                bodyColor: '#333',
                bodyFont: {
                    size: 13
                },
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                padding: 15,
                borderColor: 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1,
                displayColors: true,
                boxWidth: 10,
                boxHeight: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    labelTextColor: function(context) {
                        return '#333';
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Poppins', sans-serif"
                    },
                    color: '#555'
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.03)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Poppins', sans-serif"
                    },
                    color: '#555',
                    padding: 10
                }
            }
        }
    };

    // Radar specific options
    const radarOptions = {
        ...chartOptions,
        scales: undefined,
        elements: {
            line: {
                borderWidth: 2
            },
            point: {
                radius: 4,
                hoverRadius: 6,
                borderWidth: 2,
                hoverBorderWidth: 2
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.03)'
                },
                pointLabels: {
                    font: {
                        size: 11,
                        family: "'Poppins', sans-serif"
                    },
                    color: '#555'
                },
                ticks: {
                    backdropColor: 'transparent',
                    color: '#555',
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-4">Employee Productivity Analysis</h2>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading productivity data...</p>
                </div>
            ) : orders.length > 0 ? (
                <Accordion defaultActiveKey="0">
                    {orders.map((order, index) => (
                        <Card key={order.order_id}>
                            <Accordion.Item eventKey={String(index)}>
                                <Accordion.Header>
                                    <span className="order-header">
                                        <span className="order-number">Order #{order.order_number}</span>
                                        <span className="order-id"> (ID: {order.order_id})</span>
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className="row g-4 justify-content-center">
                                        <div className="col-12 col-md-6">
                                            <div className="card shadow-sm">
                                                <h5 className="chart-title">Time per Piece Analysis</h5>
                                                <div style={{ height: '300px' }}>
                                                    <Line
                                                        data={{
                                                            labels: order.timePerPiece?.map(d => `Emp ${d.employee_id}`),
                                                            datasets: [{
                                                                label: "Minutes per Piece",
                                                                data: order.timePerPiece?.map(d => parseFloat(d.time_per_piece) || 0),
                                                                borderColor: "rgba(66, 133, 244, 1)",
                                                                backgroundColor: "rgba(66, 133, 244, 0.2)",
                                                                fill: true,
                                                                tension: 0.4,
                                                                borderWidth: 3,
                                                                pointBackgroundColor: "rgba(66, 133, 244, 1)",
                                                                pointBorderColor: "#fff",
                                                                pointRadius: 5,
                                                                pointHoverRadius: 7
                                                            }]
                                                        }}
                                                        options={chartOptions}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <div className="card shadow-sm">
                                                <h5 className="chart-title">Productivity by Employee</h5>
                                                <div style={{ height: '300px' }}>
                                                    <Bar
                                                        data={{
                                                            labels: order.totalPieces?.map(d => `Emp ${d.employee_id}`),
                                                            datasets: [{
                                                                label: "Total Pieces Completed",
                                                                data: order.totalPieces?.map(d => d.total_completed),
                                                                backgroundColor: [
                                                                    'rgba(54, 162, 235, 0.7)',
                                                                    'rgba(75, 192, 192, 0.7)',
                                                                    'rgba(153, 102, 255, 0.7)',
                                                                    'rgba(255, 159, 64, 0.7)',
                                                                    'rgba(255, 99, 132, 0.7)',
                                                                    'rgba(89, 212, 153, 0.7)',
                                                                ],
                                                                borderColor: [
                                                                    'rgba(54, 162, 235, 1)',
                                                                    'rgba(75, 192, 192, 1)',
                                                                    'rgba(153, 102, 255, 1)',
                                                                    'rgba(255, 159, 64, 1)',
                                                                    'rgba(255, 99, 132, 1)',
                                                                    'rgba(89, 212, 153, 1)',
                                                                ],
                                                                borderWidth: 2,
                                                                borderRadius: 6,
                                                                maxBarThickness: 45
                                                            }]
                                                        }}
                                                        options={chartOptions}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-lg-8">
                                            <div className="card shadow-sm">
                                                <h5 className="chart-title">Performance Comparison</h5>
                                                <div style={{ height: '350px' }}>
                                                    <Radar
                                                        data={{
                                                            labels: order.employeePerformance?.map(d => `Employee ${d.employee_id}`),
                                                            datasets: [{
                                                                label: "Task Completion",
                                                                data: order.employeePerformance?.map(d => d.total_completed),
                                                                backgroundColor: "rgba(94, 114, 228, 0.25)",
                                                                borderColor: "rgba(94, 114, 228, 1)",
                                                                pointBackgroundColor: "rgba(94, 114, 228, 1)",
                                                                pointBorderColor: "#fff",
                                                                pointHoverBackgroundColor: "#fff",
                                                                pointHoverBorderColor: "rgba(94, 114, 228, 1)"
                                                            }]
                                                        }}
                                                        options={radarOptions}
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
                <div className="text-center text-danger">
                    <i className="fas fa-chart-line fa-3x mb-3"></i>
                    <p>No productivity data available for analysis.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeProductivityGraphs;