import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AssignMachine from "./AssignMachine";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Orders.css";
import { FaEye, FaTrashAlt, FaCogs, FaCheckCircle, FaSpinner, FaBox, FaClipboardList } from "react-icons/fa";

// Create a custom hook to access the navbar collapsed state
const useNavbarState = () => {
  // Check if there's a navbar collapsed state in localStorage
  const storedState = localStorage.getItem("navbarCollapsed");
  return { isNavbarCollapsed: storedState === "true" };
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSteps, setOrderSteps] = useState([]);
  const [assignStep, setAssignStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);
  const { isNavbarCollapsed } = useNavbarState(); // Get navbar collapsed state

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/orders/progress`)
      .then((response) => {
        console.log(" Orders Progress Fetched:", response.data);
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(" Error fetching orders:", error);
        setLoading(false);
      });
  };

  const fetchOrderSteps = async (orderId) => {
    setStepsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/steps`);
      console.log(" Steps fetched for Order", orderId, ":", response.data);

      const stepsWithQuantity = response.data.map((step) => ({
        ...step,
        quantity: orders.find((order) => order.id === orderId)?.quantity || 0,
      }));

      setOrderSteps(stepsWithQuantity);
      setSelectedOrder(orders.find((o) => o.id === orderId));
    } catch (error) {
      console.error("Error fetching order steps:", error);
      alert("Failed to fetch order steps!");
    }
    setStepsLoading(false);
  };

  const deleteOrder = (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this order?")) return;
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/orders/${id}`)
      .then((response) => {
        console.log(response.data.message);
        setOrders(orders.filter((order) => order.id !== id));
      })
      .catch((error) => {
        console.error("❌ Error deleting order:", error);
        alert("❌ Failed to delete order!");
      });
  };

  const getStatusBadge = (status) => {
    if (status.toLowerCase().includes("complete")) {
      return (
        <span className="order-status-badge completed">
          <FaCheckCircle className="me-2" />
          Completed
        </span>
      );
    } else {
      return (
        <span className="order-status-badge in-progress">
          <FaSpinner className="me-2" />
          In Progress
        </span>
      );
    }
  };

  const calculateProgress = (step) => {
    if (!step.quantity) return 0;
    const percentage = Math.min(100, Math.round((step.completed / step.quantity) * 100));
    return percentage;
  };

  return (
    <div className="container-fluid py-4">
      <div className="orders-container">
        <h1 className="orders-title text-center">Order Management</h1>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary loading-spinner" role="status" />
            <p className="mt-3 text-muted">Loading orders...</p>
          </div>
        ) : (
          <>
            {orders.length === 0 ? (
              <div className="alert alert-info rounded-3 border-0 shadow-sm">
                <div className="d-flex align-items-center">
                  <FaClipboardList className="me-2" />
                  <span>No orders found.</span>
                </div>
              </div>
            ) : (
              <div className="order-table-container">
                <table className="order-table table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Number</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="order-row">
                        <td>{order.id}</td>
                        <td>{order.order_number}</td>
                        <td>{order.product}</td>
                        <td>{order.quantity}</td>
                        <td>{getStatusBadge(order.current_stage)}</td>
                        <td className="d-flex gap-2">
                          <button
                            onClick={() => fetchOrderSteps(order.id)}
                            className="action-button view"
                          >
                            <FaEye /> View
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <FaTrashAlt /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedOrder && (
              <div className="order-steps-container">
                <div className="steps-header">
                  <h3 className="steps-title">
                    <FaBox className="text-primary" />
                    Order Steps
                    <span className="steps-badge">#{selectedOrder.order_number}</span>
                  </h3>
                </div>

                {stepsLoading ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-3 text-muted">Loading steps...</p>
                  </div>
                ) : (
                  <>
                    {orderSteps.length === 0 ? (
                      <div className="alert alert-info">No steps found for this order.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="order-table table table-hover">
                          <thead>
                            <tr>
                              <th>Step Name</th>
                              <th>Progress</th>
                              <th>Completed</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderSteps.map((step, index) => (
                              <tr key={index} className="order-row">
                                <td>{step.name}</td>
                                <td style={{ width: "30%" }}>
                                  <div className="d-flex align-items-center">
                                    <div className="progress-bar-container flex-grow-1">
                                      <div 
                                        className="progress-bar-fill" 
                                        style={{ width: `${calculateProgress(step)}%` }}
                                      ></div>
                                    </div>
                                    <span className="ms-2 small">
                                      {calculateProgress(step)}%
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {step.completed} / {step.quantity}
                                </td>
                                <td>
                                  <button
                                    onClick={() => setAssignStep({ order_id: selectedOrder.id, step: step.name })}
                                    className={`action-button ${step.completed >= step.quantity ? 'view' : 'assign'}`}
                                    disabled={step.completed >= step.quantity}
                                  >
                                    {step.completed >= step.quantity ? (
                                      <>
                                        <FaCheckCircle /> Completed
                                      </>
                                    ) : (
                                      <>
                                        <FaCogs /> Assign
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Assign Machine Modal */}
            {assignStep && (
              <AssignMachine
                stepId={{ order_id: assignStep.order_id, step: assignStep.step }}
                onClose={() => setAssignStep(null)}
                isNavbarCollapsed={isNavbarCollapsed}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
