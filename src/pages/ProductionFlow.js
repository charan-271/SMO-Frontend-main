import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Spinner, Badge } from "react-bootstrap";
import { FaArrowRight, FaCheckCircle, FaTools, FaSyncAlt } from "react-icons/fa";
import "./ProductionFlow.css";

const stages = [
  { title: "Cutting", statusList: ["Cutting should be started", "Cutting Started"] },
  { title: "Sewing", statusList: ["Cutting Completed", "Sewing is in progress"] },
  { title: "Quality Check", statusList: ["Sewing Completed", "Quality Check in progress"] },
  { title: "Packing", statusList: ["Quality Check Completed", "Packing is in progress"] },
  { title: "Dispatch", statusList: ["Packing Completed", "Ready for Dispatch"] },
];

const stageEnumMap = {
  "Cutting is in progress": "Cutting Started",
  "Cutting Completed": "Cutting Completed",
  "Sewing is in progress": "Sewing is in progress",
  "Sewing Completed": "Sewing Completed",
  "Quality Check in progress": "Quality Check in progress",
  "Quality Check Completed": "Quality Check Completed",
  "Packing is in progress": "Packing is in progress",
  "Packing Completed": "Packing Completed",
  "Ready for Dispatch": "Ready for Dispatch",
  "Dispatched": "Dispatched",
};

const stageActions = {
  Cutting: ["Cutting Started", "Cutting Completed"],
  Sewing: ["Sewing is in progress", "Sewing Completed"],
  QualityCheck: ["Quality Check in progress", "Quality Check Completed"],
  Packing: ["Packing is in progress", "Packing Completed"],
  Dispatch: [null, "Ready for Dispatch"],
};

const ProductionFlow = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStage, setSelectedStage] = useState(stages[0]); // Default to Cutting stage
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionData, setActionData] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/orders/progress`)
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders", err);
        setLoading(false);
      });
  };

  const updateStage = (orderId, newStage) => {
    const mappedStage = stageEnumMap[newStage] || newStage; // map to valid ENUM
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/orders/update-stage`, {
        id: orderId,
        current_stage: mappedStage,
      })
      .then(() => {
        fetchOrders();
        setShowModal(false);
      })
      .catch((err) => console.error("Error updating order stage", err));
  };

  const filteredOrders = selectedStage
    ? orders.filter((o) => selectedStage.statusList.includes(o.current_stage))
    : [];

  const getActions = (stageTitle) => {
    switch (stageTitle) {
      case "Cutting":
        return stageActions.Cutting;
      case "Sewing":
        return stageActions.Sewing;
      case "Quality Check":
        return stageActions.QualityCheck;
      case "Packing":
        return stageActions.Packing;
      case "Dispatch":
        return stageActions.Dispatch;
      default:
        return [null, null];
    }
  };

  const handleAction = (orderId, action) => {
    setActionData({ orderId, action });
    setShowModal(true);
  };

  const renderOrderCards = () => {
    return filteredOrders.map((order) => {
      const [startAction, completeAction] = getActions(selectedStage.title);
      return (
        <div className="order-card" key={order.id}>
          <div className="order-card-header">
            <h5 className="order-card-title">#{order.order_number}</h5>
            <Badge bg="info">{order.current_stage}</Badge>
          </div>
          <div className="order-card-body">
            <div className="order-card-detail">
              <span>Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="order-card-detail">
              <span>Product:</span>
              <span>{order.product}</span>
            </div>
            <div className="order-card-detail">
              <span>Quantity:</span>
              <span>{order.quantity}</span>
            </div>
          </div>
          <div className="order-card-actions">
            {startAction && (
              <Button
                variant="warning"
                size="sm"
                className="w-100 me-2"
                onClick={() => handleAction(order.id, startAction)}
                disabled={
                  order.current_stage === startAction || order.current_stage === completeAction
                }
              >
                <FaTools className="me-2" /> Start
              </Button>
            )}
            {completeAction && (
              <Button
                variant="success"
                size="sm"
                className="w-100"
                onClick={() => handleAction(order.id, completeAction)}
                disabled={order.current_stage === completeAction}
              >
                <FaCheckCircle className="me-2" /> Complete
              </Button>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="production-flow-container">
      <h2 className="production-flow-title">Production Workflow</h2>
      
      {/* Stage Selector (Using Bootstrap pills) */}
      <ul className="nav nav-pills mb-3">
        {stages.map((stage) => (
          <li className="nav-item" key={stage.title}>
            <button
              className={`nav-link ${selectedStage?.title === stage.title ? "active" : ""}`}
              onClick={() => setSelectedStage(stage)}
            >
              {stage.title}
            </button>
          </li>
        ))}
      </ul>

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading orders...</p>
        </div>
      ) : (
        selectedStage && (
          <div className="orders-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">{selectedStage.title} Orders</h3>
              <Button 
                variant="light" 
                size="sm" 
                onClick={fetchOrders} 
                title="Refresh orders"
                className="d-flex align-items-center"
              >
                <FaSyncAlt className="me-2" /> Refresh
              </Button>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No orders in this stage.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Order Number</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th colSpan="2" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const [startAction, completeAction] = getActions(selectedStage.title);
                        return (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.order_number}</td>
                            <td>{order.product}</td>
                            <td>{order.quantity}</td>
                            <td className="text-center">
                              {startAction && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleAction(order.id, startAction)}
                                  disabled={
                                    order.current_stage === startAction || order.current_stage === completeAction
                                  }
                                >
                                  <FaTools className="me-2" /> Start
                                </button>
                              )}
                            </td>
                            <td className="text-center">
                              {completeAction && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleAction(order.id, completeAction)}
                                  disabled={order.current_stage === completeAction}
                                >
                                  <FaCheckCircle className="me-2" /> Complete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Card view for mobile displays */}
                {renderOrderCards()}
              </>
            )}
          </div>
        )
      )}

      {/* Modal for Confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Stage Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to move this order to the next stage? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => updateStage(actionData.orderId, actionData.action)}
          >
            <FaArrowRight className="me-2" /> Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductionFlow;