// src/UsersTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, FormControl } from 'react-bootstrap';
import './UsersTable.css'; // Import the CSS file

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);

    // Check if device is mobile
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 991);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/api/auth/users`)
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setLoading(false);
            });
    }, []);

    const handleEditClick = (user) => {
        setEditUser(user);
        setShowEditModal(true);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            axios
                .delete(`${process.env.REACT_APP_API_URL}/api/auth/delete/${id}`)
                .then(() => {
                    setUsers(users.filter((user) => user.id !== id));
                })
                .catch((error) => {
                    console.error('Error deleting user:', error);
                });
        }
    };

    const handleChangePasswordClick = (user) => {
        setEditUser(user);
        setShowPasswordModal(true);
    };

    const handleUpdatePassword = () => {
        if (editUser && newPassword) {
            axios
                .put(`${process.env.REACT_APP_API_URL}/api/auth/update-password/${editUser.id}`, { newPassword })
                .then(() => {
                    alert('Password updated successfully!');
                    setShowPasswordModal(false);
                    setNewPassword('');
                })
                .catch((error) => {
                    console.error('Error updating password:', error);
                });
        } else {
            alert('No user selected or password not provided.');
        }
    };

    const handleSaveEdit = () => {
        if (editUser) {
            axios
                .put(`${process.env.REACT_APP_API_URL}/api/auth/edit/${editUser.id}`, {
                    name: editUser.name,
                    email: editUser.email,
                    role: editUser.role,
                })
                .then(() => {
                    setShowEditModal(false);
                    setUsers(users.map((user) => (user.id === editUser.id ? editUser : user)));
                })
                .catch((error) => {
                    console.error('Error updating user:', error);
                });
        }
    };

    // Function to get the proper role class for styling
    const getRoleBadgeClass = (role) => {
        if (role === 'admin') return 'admin';
        if (role === 'manager') return 'manager';
        if (role === 'employee') return 'employee';
        return 'production'; // For Cutting, Sewing, Quality control, Packing
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="users-container">
            <h1 className="users-title">User Management</h1>
            
            {/* Desktop Table View */}
            <div className="table-responsive">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Button 
                                                className="user-action-btn edit" 
                                                onClick={() => handleEditClick(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                className="user-action-btn delete" 
                                                onClick={() => handleDeleteClick(user.id)}
                                            >
                                                Delete
                                            </Button>
                                            <Button 
                                                className="user-action-btn password" 
                                                onClick={() => handleChangePasswordClick(user)}
                                            >
                                                Change Password
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">
                                    <div className="empty-state">
                                        No users found.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="mobile-card">
                {users.length > 0 ? (
                    users.map((user) => (
                        <div className="user-card" key={user.id}>
                            <div className="user-card-header">
                                <div className="user-card-name">{user.name}</div>
                                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                            
                            <div className="user-card-item">
                                <div className="user-card-label">Email:</div>
                                <div className="user-card-value">{user.email}</div>
                            </div>
                            
                            <div className="user-card-actions">
                                <Button 
                                    className="user-action-btn edit" 
                                    onClick={() => handleEditClick(user)}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    className="user-action-btn delete" 
                                    onClick={() => handleDeleteClick(user.id)}
                                >
                                    Delete
                                </Button>
                                <Button 
                                    className="user-action-btn password" 
                                    onClick={() => handleChangePasswordClick(user)}
                                >
                                    Change PW
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        No users found.
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} className="user-modal" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editUser && (
                        <div>
                            <label className="form-label">Name</label>
                            <FormControl
                                type="text"
                                placeholder="Name"
                                value={editUser.name}
                                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                className="mb-3"
                            />
                            <label className="form-label">Email</label>
                            <FormControl
                                type="email"
                                placeholder="Email"
                                value={editUser.email}
                                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                className="mb-3"
                            />
                            <label className="form-label">Role</label>
                            <FormControl
                                as="select"
                                value={editUser.role}
                                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                className="mb-3"
                            >
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                                <option value="Cutting">Cutting</option>
                                <option value="Sewing">Sewing</option>
                                <option value="Quality control">Quality Control</option>
                                <option value="Packing">Packing</option>
                            </FormControl>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="user-action-btn delete" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button className="user-action-btn edit" onClick={handleSaveEdit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Change Password Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} className="user-modal" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label className="form-label">New Password</label>
                    <FormControl
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mb-3"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button className="user-action-btn delete" onClick={() => setShowPasswordModal(false)}>
                        Close
                    </Button>
                    <Button className="user-action-btn password" onClick={handleUpdatePassword}>
                        Change Password
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UsersTable;