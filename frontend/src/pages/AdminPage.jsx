import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
// NEW IMPORTS FOR CHARTS
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// REGISTER CHART COMPONENTS GLOBALLY
ChartJS.register(
    ArcElement, // For Doughnut/Pie charts
    CategoryScale, // For Bar charts (X-axis)
    LinearScale, // For Bar charts (Y-axis)
    BarElement, // For Bar charts
    Tooltip,
    Legend
);


// Base URL for the API (replace with your actual server address)
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const REPORTS_ENDPOINT = `${API_BASE_URL}/daily_reports.php`;
const USER_MANAGEMENT_ENDPOINT = `${API_BASE_URL}/user_management.php`; // NEW ENDPOINT
// --- LOCAL PATHS ---
// Conceptual path where avatars are served
const AVATAR_UPLOAD_PATH = `http://localhost/mkffwebsystem/backend/api/uploads/avatars/`;
// Fallback for missing/broken avatar files
const DEFAULT_AVATAR_PATH = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTE2IDguNWExLjUgMS41IDAgMSAxIDAgLTVhMS41IDEuNSAwIDAgMSAwIDVaTTkgMTMuNGM2LjUgMCA3IDUuMyA3IDV2Mi41aC0xNGwtLjItLjJjLS4xLS4xLS40LS41LS43LS45LS40LS41LS43LTEuMS0uNy0xLjhjMC0uNi40LTEuMS44LTEuNS41LS41IDEuMy0uNyAyLjItLjcgMS4yIDAgMi4xLjMgMyAxLjEgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjkgLS41IDEuNi0xLjMgMi4zLS41LjUtMS4xLjgtMS44LjhoLTJjLS45IDAtMS42LS4zLTIuMS0uN2wxLjgtLjIgLjMtLjNjLS41LS41LS45LS44LTEuNC0xLjIgMS0uOSAxLjctMi40IDEuNy00LjUgMC0xLS40LTEuOS0xLjEtMi42LS42LS43LTEuNS0xLjEtMi41LTEuMi0xLjIgMC0yLjQuNS0zLjUgMS41LS41LjItLjkuNS0xLjQgLjcgLjIuNS40LjkuNSAxLjQgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjggLS41IDEuNi0xLjQgMi4zLS4zLjItLjYuNS0uOS43bC0xLjguMi0uMi0uMmMtLjQtLjQtLjctLjgtLjctMS40IDAtLjggLjUtMS41IDEuMS0yLjIgLjUtLjUgMS4xLS44IDEuOC0uOC45IDAgMS43LjMgMi40LjkgLjQtLjIuOC0uNCAxLjItLjcgMC0uNy0uMy0xLjQtLjktMi4xLS41LS42LTEuMi0xLS43LTEuNyAwLS42LjUtMS4xIDEtMS41LjQtLjQgLjctLjUgMS4yLS42LjYtLjIgMS41LS4yIDIuMiAwIDAgLjUgLjQgLjcgLjggMS4xLjMtLjIuNi0uNCAxLS42LjktLjUgMi0uNyAyLjgtLjcgc20uMy0uNWMuOCAwIDEuNC41IDEuNSAxLjEuMS43LS41IDEuMy0xLjQgMS40LS44IDAtMS41LS42LTEuNS0xLjIgMC0uNS40LS45LjgtMS4zLjUtLjQgMS4yLS42IDEuNi0uNnptMi44IDYuOC40LjRjLjIgLjEuNC4yLjYgLjUgMCAuNy0uMyAxLjQtLjggMi4xLS40LjYtMSAxLjEtMS44IDEuNC0uMS4xLS4zLjEtLjQuM2wtLjMtLjNjLS41LS41LS44LTEuMS0uOC0xLjggMC0uOC40LTEuNSAxLjItMi4xem0tMS41LS40Yy0uMi0uMS0uMy0uMi0uNC0uMy0uMi0uMi0uMy0uNC0uNS0uNi0uMy0uMy0uNi0uNS0uOC0uNy0uMy0uMy0uNS0uNi0uNy0uOS0uNS0uNi0uOC0xLjQtLjgtMi40IDAtLjkuMy0xLjcgLjktMi40LjUtLjUgMS4zLS44IDIuMy0uOCAxLjIgMCAyLjEuMyAzIC45LjQuMi43LjUgMS4xLjcuNC4zLjcgLjYgLjggLjkgLjMgLjUgLjYgMSAuOCAxLjYgLjMgLjYgLjUgMS4yLjUgMS44IDAgLjgtLjIgMS41LS42IDIuMS0uNCAuNy0uOSAxLjMtMS41IDEuN3ptLTEuMy02LjNjaC0xLjMuNGMtLjEgLjQtLjIgLjktLjMgMS4yLS40LjctLjUgMS40LS41IDIuMiAwIC43LjMgMS4zLjkgMS44LjQtLjIuNy0uNSAxLS45LjUtLjUgLjctMS4xLjctMS44IDAtLjkgMC0xLjctLjUtMi40LS41LS42LTEuMy0xLTEuOC0xLjItLjEgLjMtLjIuNi0uNCAxeiIvPjwvc3ZnPg==';

// Helper function to format date as YYYY-MM-DD
const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

// --- Edit Unit Modal Component (Existing, Unchanged) ---
const EditUnitModal = ({ unit, onClose, onSave }) => {
    // ... (rest of EditUnitModal remains unchanged)
    const [formData, setFormData] = useState(unit ? {
        status: unit.status,
        remarks: unit.remarks,
        model: unit.model,
        revision: unit.revision,
        base_unit_kitting_no: unit.base_unit_kitting_no,
        assembly_no: unit.assembly_no,
        device_serial_no: unit.device_serial_no,
        accessory_kitting_no: unit.accessory_kitting_no,
        station: unit.station,
    } : {});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(unit.id, formData);
    };

    if (!unit) return null;

    const statusOptions = ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Edit Unit: {unit.device_serial_no}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-muted small">ID: {unit.id} | Station: {unit.station}</p>
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Model</label>
                                <input type="text" className="form-control" name="model" value={formData.model || ''} onChange={handleChange} readOnly />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    {statusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Remarks</label>
                                <textarea className="form-control" name="remarks" value={formData.remarks || ''} onChange={handleChange}></textarea>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button type="button" className="btn btn-danger" onClick={handleSave}>Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END MODAL COMPONENT ---


// Report Detail Viewer Modal (Existing, Unchanged)
const ReportDetailModal = ({ report, onClose }) => {
    // ... (rest of ReportDetailModal remains unchanged)
    if (!report) return null;

    const attachmentUrl = report.attachment_filename
        ? `${API_BASE_URL}/uploads/${report.attachment_filename}`
        : null;

    const getMetricsCard = (label, value, className = "text-primary") => (
        <div className="card shadow-sm p-3 h-100">
            <div className="small text-muted">{label}</div>
            <h5 className={`fw-bold mb-0 ${className}`}>{value}</h5>
        </div>
    );

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Daily Report Details: {report.station} - {report.report_date}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">{getMetricsCard("Submitted By", report.submitted_by || 'N/A', "text-dark")}</div>
                            <div className="col-md-3">{getMetricsCard("Shift", report.shift)}</div>
                            <div className="col-md-3">{getMetricsCard("Units Processed", report.total_units_processed, "text-success")}</div>
                            <div className="col-md-3">{getMetricsCard("NG Units", report.total_ng, "text-danger")}</div>
                        </div>

                        <h6>Shift Summary & Issues</h6>
                        <div className="p-3 border rounded bg-light small whitespace-pre-wrap">{report.summary || "No detailed summary provided."}</div>

                        <h6>Attachment</h6>
                        {attachmentUrl ? (
                            <div className="border p-3 bg-light text-center">
                                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                                    <i className="bi bi-paperclip me-2"></i> View Attached File: {report.attachment_filename}
                                </a>
                            </div>
                        ) : (
                            <div className="text-muted small">No file was attached to this report.</div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => { window.print(); }}>
                            <i className="bi bi-printer"></i> Print Summary
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- NEW: User Management Modal (Create/Edit, Unchanged) ---
const ManageUserModal = ({ userToEdit, stations, onClose, onSave }) => {
    // Determine if we are in Edit mode (userToEdit is passed and has an id)
    const isEditMode = userToEdit && userToEdit.id !== null;

    // Define the structure for Add/Edit, including avatar fields
    const initialFormData = isEditMode ? {
        id: userToEdit.id,
        username: userToEdit.username,
        password: userToEdit.password || '', // Display current password for edit as requested
        role: userToEdit.role,
        full_name: userToEdit.full_name,
        station: userToEdit.station || '',
        avatar_url: userToEdit.avatar_url || '', // Existing avatar file name from DB
        avatar_file: null, // Placeholder for new file object
    } : {
        // This is the structure for 'Add New User' mode
        id: null,
        username: '',
        password: '',
        role: 'Operator',
        full_name: '',
        station: '',
        avatar_url: '',
        avatar_file: null,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for the image preview
    const [avatarPreview, setAvatarPreview] = useState(
        (isEditMode && userToEdit.avatar_url)
        ? `${AVATAR_UPLOAD_PATH}${userToEdit.avatar_url}`
        : DEFAULT_AVATAR_PATH
    );

    const roleOptions = ["Administrator", "IT Assistant", "Operator"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    // Handle file selection and preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Store file object and set avatar_url to the *new* filename
            setFormData({
                ...formData,
                avatar_file: file,
                avatar_url: file.name
            });
            // Create a temporary browser URL for immediate preview
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            // Clear or reset to existing avatar if they hit cancel/clear
            setFormData({
                ...formData,
                avatar_file: null,
                avatar_url: isEditMode ? initialFormData.avatar_url : ''
            });
            setAvatarPreview(isEditMode && initialFormData.avatar_url ? `${AVATAR_UPLOAD_PATH}${initialFormData.avatar_url}` : DEFAULT_AVATAR_PATH);
        }
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        if (!formData.username || !formData.password || !formData.role || !formData.full_name) {
            setError('All required fields are needed.');
            return;
        }

        // --- PREPARE DATA FOR BACKEND ---
        const isFileUpdate = formData.avatar_file instanceof File;

        let payload;
        let headers = { };
        let url;
        const methodOverride = formData.id ? 'PUT' : 'POST';

        if (isFileUpdate) {
            // SCENARIO 1: FILE UPLOAD (multipart/form-data)
            payload = new FormData();

            // Append the new file
            payload.append('avatar', formData.avatar_file, formData.avatar_file.name);

            // Append all other fields
            payload.append('id', formData.id || '');
            payload.append('username', formData.username);
            payload.append('password', formData.password);
            payload.append('role', formData.role);
            payload.append('full_name', formData.full_name);
            payload.append('station', formData.station || '');
            payload.append('avatar_url', formData.avatar_url);

            url = `${USER_MANAGEMENT_ENDPOINT}?method=${methodOverride}`;

        } else {
            // SCENARIO 2: TEXT/URL ONLY UPDATE (JSON)
            payload = {
                id: formData.id,
                username: formData.username,
                password: formData.password,
                role: formData.role,
                full_name: formData.full_name,
                station: formData.station,
                avatar_url: formData.avatar_url, // Send the URL/filename
            };
            headers['Content-Type'] = 'application/json';
            url = `${USER_MANAGEMENT_ENDPOINT}?method=${methodOverride}`;
        }

        try {
            // The onSave function now handles the API call and refresh, eliminating redundancy.
            await onSave(payload, headers, url);

            setSuccess(`User ${isEditMode ? 'updated' : 'added'} successfully!`);
            setTimeout(onClose, 1000);
        } catch (error) {
            // Error handling relies on the error thrown by the parent's onSave
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} user:`, error);
            // Use error.message because handleSaveUser throws a new Error object
            setError(error.message || `Failed to ${isEditMode ? 'update' : 'add'} user.`);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">{isEditMode ? `Edit User: ${userToEdit.username}` : 'Add New User'}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger small">{error}</div>}
                        {success && <div className="alert alert-success small">{success}</div>}
                        {isEditMode && <p className="text-muted small">ID: {userToEdit.id} | Created: {userToEdit.created_at}</p>}

                        <form>
                            <div className="row">
                                {/* Left Column: Avatar Management */}
                                <div className="col-md-4 text-center">
                                    <h6 className="small text-muted">Profile Avatar</h6>
                                    {/* Avatar Preview */}
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="img-fluid rounded-circle mb-2 border border-secondary"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        // Handle error if the existing URL is broken
                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                    />
                                    {/* File Input */}
                                    <div className="mb-3">
                                        <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleFileChange} />
                                        {formData.avatar_url &&
                                            <div className="form-text small text-primary">
                                                {formData.avatar_file ? 'New file selected' : `Current file: ${formData.avatar_url}`}
                                            </div>
                                        }
                                        {!formData.avatar_url &&
                                            <div className="form-text small text-muted">
                                                No avatar set. Click to upload.
                                            </div>
                                        }
                                    </div>
                                </div>
                                {/* Right Column: Fields */}
                                <div className="col-md-8">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{isEditMode ? 'Password (Current: ****)' : 'Password'}</label>
                                        <input type="text" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                                        {isEditMode && <div className="form-text text-danger">The current password is: **{userToEdit.password}**. Edit as needed.</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Role</label>
                                            <select className="form-select" name="role" value={formData.role} onChange={handleChange} required>
                                                {roleOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Station (Optional)</label>
                                            <select className="form-select" name="station" value={formData.station} onChange={handleChange}>
                                                <option value="">N/A (Admin/IT)</option>
                                                {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button type="button" className="btn btn-danger" onClick={handleSave} disabled={!!success}>
                            {isEditMode ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW: Delete User Modal (Existing, Unchanged) ---
const DeleteUserModal = ({ user, onClose, onDelete }) => {
    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title">Confirm Deletion</h5>
                        <button type="button" className="btn-close btn-close-dark" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to **permanently delete** the user:</p>
                        <p className="fw-bold text-danger mb-0">{user.full_name} ({user.username})?</p>
                        <p className="small text-muted">ID: {user.id} | Role: {user.role}</p>
                        {user.id === 1 && <div className="alert alert-danger small mt-2">Cannot delete the primary system admin (ID 1).</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => onDelete(user.id)}
                            disabled={user.id === 1} // Disable deletion for ID 1
                        >
                            <i className="bi bi-trash"></i> Delete User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END NEW MODALS ---


// --- NEW: Submit Report Modal (Existing, Unchanged) ---
const SubmitReportModal = ({ user, stations, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        station: user.station || (stations.length > 0 ? stations[0].id : ''),
        shift: 'Day',
        total_units_processed: '',
        total_ng: '',
        downtime_minutes: '',
        summary: '',
        attachment_file: null,
    });
    const [filePreview, setFilePreview] = useState(null);
    const [error, setError] = useState('');
    const shiftOptions = ["Day", "Night"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, attachment_file: file });
        setFilePreview(file ? file.name : null);
    };

    const handleSave = async () => {
        if (!formData.station || !formData.shift || !formData.total_units_processed) {
            setError('Station, Shift, and Units Processed are required.');
            return;
        }

        const dataToSend = new FormData();

        // Append all text fields
        dataToSend.append('submitted_by', user.full_name || user.username || 'Unknown');
        dataToSend.append('report_date', getTodayDate());
        dataToSend.append('shift', formData.shift);
        dataToSend.append('station', formData.station);
        dataToSend.append('total_units_processed', formData.total_units_processed);
        dataToSend.append('total_ng', formData.total_ng || 0);
        dataToSend.append('downtime_minutes', formData.downtime_minutes || 0);
        dataToSend.append('summary', formData.summary);

        // Append the file if present
        if (formData.attachment_file) {
            dataToSend.append('attachment', formData.attachment_file, formData.attachment_file.name);
        }

        try {
            // Note: This assumes daily_reports.php supports POST for new reports and handles files.
            await axios.post(REPORTS_ENDPOINT, dataToSend);
            onSave(); // Parent function refresh
            onClose();
        } catch (err) {
            console.error("Report submission failed:", err);
            setError(err.response?.data?.message || "Failed to submit report. Check backend (daily_reports.php) POST method.");
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Submit Daily Production Report</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger small">{error}</div>}
                        <p className="text-muted small">Reporting for: **{user.full_name || user.username}** | Date: **{getTodayDate()}**</p>

                        <form>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Station</label>
                                    <select className="form-select" name="station" value={formData.station} onChange={handleChange} required>
                                        <option value="">Select Station</option>
                                        {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Shift</label>
                                    <select className="form-select" name="shift" value={formData.shift} onChange={handleChange} required>
                                        {shiftOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Units Processed (Completed)</label>
                                    <input type="number" className="form-control" name="total_units_processed" value={formData.total_units_processed} onChange={handleChange} min="0" required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">No Good (NG) Units</label>
                                    <input type="number" className="form-control" name="total_ng" value={formData.total_ng} onChange={handleChange} min="0" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Downtime (Minutes)</label>
                                    <input type="number" className="form-control" name="downtime_minutes" value={formData.downtime_minutes} onChange={handleChange} min="0" />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Shift Summary / Issues Encountered</label>
                                <textarea className="form-control" name="summary" value={formData.summary} onChange={handleChange} rows="3"></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Attachment (Optional)</label>
                                <input type="file" className="form-control" name="attachment" onChange={handleFileChange} accept="image/*,.pdf,.xlsx,.csv" />
                                {filePreview && <p className="form-text text-muted">File selected: {filePreview}</p>}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={handleSave}>Submit Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END Submit Report Modal ---

// --- NEW: Station History Modal Component ---
const StationHistoryModal = ({ stationId, onClose }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Assuming the backend path: http://localhost/mkffwebsystem/backend/api/unit_history.php
    const HISTORY_ENDPOINT = `${API_BASE_URL}/unit_history.php`;

    // Fetch history logs for the given station
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch logs, passing the station ID as a query parameter
                const response = await axios.get(HISTORY_ENDPOINT, {
                    params: { station: stationId }
                });
                // Ensure response.data is an array before setting state
                if (Array.isArray(response.data)) {
                    // Sort logs by timestamp descending (newest first, same as PHP ORDER BY)
                    setHistoryLogs(response.data);
                } else {
                    setHistoryLogs([]);
                    setError("Received non-array response from history endpoint. Please check PHP output.");
                }
            } catch (err) {
                console.error("Error fetching station history:", err);
                // Access nested message if available, otherwise use generic error
                setError(err.response?.data?.message || "Failed to fetch unit history. Check backend (unit_history.php).");
            } finally {
                setLoading(false);
            }
        };

        if (stationId) {
            fetchHistory();
        }
    }, [stationId]);

    if (!stationId) return null;

    // Helper function to render status badges
    const getStatusBadge = (status) => {
        let className = 'bg-secondary';
        if (status === 'Completed') className = 'bg-success';
        else if (status === 'No Good (NG)') className = 'bg-danger';
        else if (status === 'In Progress') className = 'bg-primary';
        else if (status === 'Pending Approval') className = 'bg-warning text-dark';
        
        return <span className={`badge ${className}`}>{status}</span>;
    };
    
    // Helper function to render Action Type badges
    const getActionTypeBadge = (action) => {
        let className = 'bg-info text-dark';
        if (action === 'COMPLETED_AT_STATION') className = 'bg-success';
        else if (action === 'APPROVAL_REQUESTED') className = 'bg-warning text-dark';
        else if (action === 'STATUS_UPDATED') className = 'bg-primary';
        
        return <span className={`badge ${className}`}>{action.replace(/_/g, ' ')}</span>;
    };


    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title"><i className="bi bi-clock-history me-2"></i> Unit History for: {stationId}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-0">
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger" role="status"></div>
                                <p className="mt-3 text-muted">Loading history...</p>
                            </div>
                        )}
                        {error && (
                            <div className="alert alert-danger m-3">{error}</div>
                        )}
                        
                        {!loading && !error && (
                            <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover table-striped mb-0 small">
                                    <thead className="table-dark sticky-top">
                                        <tr>
                                            {/* UPDATED HEADERS TO MATCH AUDIT DATA */}
                                            <th>H. ID</th>
                                            <th>Unit ID</th>
                                            <th>Action Type</th>
                                            <th>Status After</th>
                                            <th>Action By</th>
                                            <th>Remarks</th>
                                            <th>Timestamp</th>
                                            <th>Station</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyLogs.length > 0 ? historyLogs.map(log => (
                                            // Make sure your backend returns history_id, unit_id, action_type, status_after, remarks, action_by, timestamp, station_name
                                            <tr key={log.history_id}> 
                                                <td>{log.history_id}</td>
                                                <td>{log.unit_id}</td> 
                                                <td>{getActionTypeBadge(log.action_type)}</td> 
                                                <td>{getStatusBadge(log.status_after)}</td>
                                                <td>{log.action_by || 'System'}</td>
                                                <td>{log.remarks || 'N/A'}</td>
                                                <td className="text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td>{log.station_name || stationId}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="8" className="text-center py-4">No historical records found for **{stationId}**.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END NEW MODAL COMPONENT ---


// --- CHART COMPONENTS (Updated to use Chart.js, Unchanged) ---
const UnitPieChart = ({ metrics, title }) => {
    // Convert metrics into Chart.js data object format
    const chartData = {
        labels: ['Completed', 'No Good (NG)', 'In Progress'],
        datasets: [
            {
                label: 'Unit Count',
                data: [metrics.completedUnits, metrics.ngUnits, metrics.pendingUnits],
                backgroundColor: ['#198754', '#dc3545', '#0d6efd'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: false, text: title },
        },
    };

    const total = metrics.completedUnits + metrics.ngUnits + metrics.pendingUnits;

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-white"><h6 className="mb-0 text-uppercase small fw-bold">{title}</h6></div>
            <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <div style={{ height: '150px', width: '100%', marginBottom: '10px' }}>
                    {/* Render Doughnut Chart */}
                    {total === 0 ? (
                        <p className="text-muted">No units recorded.</p>
                    ) : (
                        <Doughnut data={chartData} options={options} />
                    )}
                </div>

                {/* Manual breakdown below the chart */}
                <div className="mt-2 w-100">
                    {chartData.labels.map((label, index) => {
                        const value = chartData.datasets[0].data[index];
                        const color = chartData.datasets[0].backgroundColor[index];
                        const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(1);
                        return (
                            <div key={label} className="d-flex justify-content-between small">
                                <span className="fw-bold" style={{ color: color }}>• {label}</span>
                                <span>{value} ({percentage}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const StationBarChart = ({ logs, stations, calculateMetrics }) => {
    const liveLogs = logs.filter(l => l.status !== 'Pending Approval');

    const summaries = stations.map(station => ({
        ...calculateMetrics(station.id, liveLogs),
        name: station.name
    }));

    const chartLabels = summaries.map(s => s.name);
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Total Output (Completed + NG)',
                data: summaries.map(s => s.yieldTotal),
                backgroundColor: 'rgba(220, 53, 69, 0.8)', // Danger Red
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Make it a horizontal bar chart
        scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: true } }
        },
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
    };

    const totalOutput = summaries.reduce((sum, s) => sum + s.yieldTotal, 0);

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-danger text-white">
                <h5 className="mb-0"><i className="bi bi-bar-chart-fill me-2"></i>Daily Output Comparison (Excl. Pending)</h5>
            </div>
            <div className="card-body">
                {totalOutput === 0 ? (
                    <p className="text-muted text-center">No completed or NG units checked across all stations.</p>
                ) : (
                    <div style={{ height: '300px', width: '100%' }}>
                        <Bar data={chartData} options={options} />
                    </div>
                )}
            </div>
        </div>
    );
};
// --- END CHART COMPONENTS ---


export default function AdminPage({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [logs, setLogs] = useState([]); // Unit logs
    const [dailyReportsList, setDailyReportsList] = useState([]); // NEW: Report logs
    const [userList, setUserList] = useState([]); // NEW: User list
    const [stations, setStations] = useState([]); // State for station list
    const [stationMonitorId, setStationMonitorId] = useState(null);

    // STATES for Reports and Editing
    const [reportDate, setReportDate] = useState(getTodayDate());
    const [reportFilterStationId, setReportFilterStationId] = useState('All');
    const [selectedUnitToEdit, setSelectedUnitToEdit] = useState(null);
    const [selectedReportToView, setSelectedReportToView] = useState(null);
    const [selectedUserToManage, setSelectedUserToManage] = useState(null); // NEW: User to Edit/Add
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null); // NEW: User to Delete
    const [showReportModal, setShowReportModal] = useState(false); // NEW: State for report creation modal
    // --- NEW STATE FOR HISTORY ---
    const [stationHistoryId, setStationHistoryId] = useState(null); // The ID of the station whose history we want to view
    // -----------------------------
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Define the initial structure for a new user object
    const initialNewUserData = {
        id: null,
        username: '',
        password: '',
        role: 'Operator',
        full_name: '',
        station: '',
        avatar_url: '', // Initialize new field
        avatar_file: null, // Initialize file placeholder for modal
    };


    // --- FETCH DATA (Updated to fetch Units, Reports, and Users) ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch Units/Logs
            const unitsRes = await axios.get(UNITS_ENDPOINT);
            setLogs(unitsRes.data);

            // 2. Fetch Daily Reports
            const reportsRes = await axios.get(REPORTS_ENDPOINT);
            if (Array.isArray(reportsRes.data)) {
                 setDailyReportsList(reportsRes.data);
            } else {
                 setDailyReportsList([]);
            }

            // 3. Fetch User List (NEW)
            const usersRes = await axios.get(USER_MANAGEMENT_ENDPOINT);
            if (Array.isArray(usersRes.data)) {
                setUserList(usersRes.data);

                // IMPORTANT: Find the current logged-in user and update its avatar/name locally
                const loggedInUserData = usersRes.data.find(u => u.id === user.id);
                if (loggedInUserData) {
                    // Update the user object prop directly, forcing the header display to refresh
                    // NOTE: This relies on React seeing the 'user' object reference change for the header to fully refresh.
                    // In a real app, you would use a global state (e.g., Redux/Context) to manage the user object.
                    user.full_name = loggedInUserData.full_name;
                    user.avatar_url = loggedInUserData.avatar_url;
                }
            } else {
                setUserList([]);
            }


            // 4. Mock Station Data (Used to build the station select list)
            // Removed mock status (RUNNING/IDLE)
            const mockStations = Array.from({ length: 15 }, (_, i) => ({
                id: `Station${i + 1}`,
                name: `Station ${i + 1}`,
                // status field removed
                operator: `Operator-${100 + i}`
            }));
            setStations(mockStations);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(`Failed to fetch data from the server. Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // This is called by the Report Submission modal to refresh data after a successful save
    const refreshAndCloseReport = () => {
        fetchData();
        setShowReportModal(false);
    };

    // UseEffect for Polling (Real-time update)
    useEffect(() => {
        fetchData();
        // Poll every 3 seconds
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // --- UNIT HANDLERS (Existing, Unchanged) ---
    const handleMonitorStation = (stationId) => {
        setStationMonitorId(stationId);
        setActiveTab('station_monitor');
    };

    const handleEditClick = (log) => {
        setSelectedUnitToEdit(log);
    };

    // NEW HANDLER: Open report detail modal
    const handleViewReport = (report) => {
        setSelectedReportToView(report);
    };

    // --- NEW HANDLER: Open Station History Modal ---
    const handleViewHistory = (stationId) => {
        setStationHistoryId(stationId);
    };
    // ------------------------------------------------

    const handleApproveUnit = async (unitId, unitData) => {
        setLoading(true);

        const dataToSend = {
            ...unitData,
            id: unitId,
            status: 'In Progress', // The key change: Approve it back to the floor
        };

        try {
            await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchData();
        } catch (error) {
            console.error(`Error approving unit ${unitId}:`, error);
            alert(`Failed to approve unit ${unitId}. Check server logs.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async (id, updatedData) => {
        setSelectedUnitToEdit(null);
        setLoading(true);

        const dataToSend = {
            id: id,
            model: updatedData.model,
            revision: updatedData.revision,
            base_unit_kitting_no: updatedData.base_unit_kitting_no,
            assembly_no: updatedData.assembly_no,
            device_serial_no: updatedData.device_serial_no,
            accessory_kitting_no: updatedData.accessory_kitting_no,
            status: updatedData.status,
            remarks: updatedData.remarks,
            station: updatedData.station,
        };

        try {
            await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error(`Error saving unit ${id}:`, error);
            alert(`Failed to save changes for unit ${id}. Check server logs.`);
        } finally {
            setLoading(false);
            fetchData();
        }
    };

    // --- NEW USER MANAGEMENT HANDLERS (Unchanged) ---
    const handleAddUser = () => {
        // Pass the initial structure for 'Add' mode
        setSelectedUserToManage(initialNewUserData);
    };

    const handleEditUser = (user) => {
        // Pass the existing user object for 'Edit' mode
        setSelectedUserToManage(user);
    };

    const handleConfirmDeleteUser = (user) => {
        setSelectedUserToDelete(user);
    };

    const handleSaveUser = async (payload, headers, url) => {
        // **Defensive check for invalid payload**
        if (!payload) {
            throw new Error("Invalid user data received. Cannot save.");
        }

        try {
            await axios.post(url, payload, { headers });

            // --- CRITICAL UPDATE FOR HEADER AVATAR/NAME ---
            await fetchData();
            // ---------------------------------------------

        } catch (error) {
            const isMultipartError = !headers['Content-Type'];

            let message = error.response?.data?.message || error.message;

            if (isMultipartError && error.response?.status === 500) {
                 message = `Server Error during file upload. Check PHP file permissions (uploads/avatars directory). Details: ${message}`;
            }

            console.error(`Error saving user:`, error);
            throw new Error(message || "Failed to save changes. Check server logs.");
        }
    };

    const handleDeleteUser = async (userId) => {
        setSelectedUserToDelete(null);
        try {
            // Using POST with method=DELETE for deletions
            await axios.post(`${USER_MANAGEMENT_ENDPOINT}?method=DELETE`, { id: userId }, {
                 headers: { 'Content-Type': 'application/json' }
            });
            fetchData(); // Refresh list
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            alert(error.response?.data?.message || `Failed to delete user ${userId}. Check server logs.`);
        }
    };

    // --- CALCULATE METRICS (Existing, Unchanged) ---
    const calculateStationMetrics = (stationId, currentLogs = logs) => {

        // Filter out 'Pending Approval' units for live monitoring purposes
        const liveLogs = currentLogs.filter(l => l.status !== 'Pending Approval');

        const stationLogs = stationId
            ? liveLogs.filter(l => l.station === stationId)
            : liveLogs; // If no stationId, calculate for all live logs

        // Calculate units specifically in 'Pending Approval' queue (not counted in live metrics)
        const pendingApprovalUnits = currentLogs.filter(l => l.status === 'Pending Approval').length;

        const completedUnits = stationLogs.filter(l => l.status === 'Completed').length;
        const ngUnits = stationLogs.filter(l => l.status === 'No Good (NG)').length;
        const totalUnitsForYield = completedUnits + ngUnits;
        const pendingUnits = stationLogs.filter(l => l.status === 'In Progress').length;
        const overallTotalLogs = stationLogs.length;

        const yieldRate = totalUnitsForYield > 0
            ? (completedUnits / totalUnitsForYield) * 100
            : 0;

        return {
            stationLogs,
            completedUnits,
            ngUnits,
            totalUnits: overallTotalLogs,
            yieldTotal: totalUnitsForYield,
            pendingUnits, // 'In Progress' units only
            pendingApprovalUnits: stationId ? currentLogs.filter(l => l.station === stationId && l.status === 'Pending Approval').length : pendingApprovalUnits,
            yieldRate: yieldRate.toFixed(2),
        };
    };

    // Overall Metrics calculation
    const overallMetrics = calculateStationMetrics(null, logs);
    const totalOutput = overallMetrics.completedUnits;
    const systemAlerts = overallMetrics.ngUnits;
    const activeStationsCount = [...new Set(logs.map(l => l.station))].length;

    // Filter reports list based on date and station filter
    const filteredReports = dailyReportsList.filter(report => {
        const reportDbDate = report.report_date ? report.report_date.split(' ')[0] : null;
        const reportMatchesDate = reportDbDate === reportDate;
        const reportMatchesStation = reportFilterStationId === 'All' || report.station === reportFilterStationId;
        return reportMatchesDate && reportMatchesStation;
    });

    // Determine the header avatar source (uses the current user prop)
    const headerAvatarSrc = user.avatar_url
        ? `${AVATAR_UPLOAD_PATH}${user.avatar_url}`
        : DEFAULT_AVATAR_PATH;

    // Determine the header full name (uses the current user prop)
    const headerFullName = user.full_name || user.username || 'Admin';

    // --- RENDER CONTENT ---
    const renderContent = () => {
        if (loading && logs.length === 0) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading real-time production data...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="alert alert-danger text-center py-5">
                    <i className="bi bi-x-octagon-fill me-2"></i> {error}
                </div>
            );
        }

        switch (activeTab) {
            case "dashboard":
                return (
                    // ... Dashboard content ...
                    <>
                        <div className="row g-4 mb-4">
                            <div className="col-md-3"><div className="card text-white bg-primary shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Total Completed (Live)</h6><h2 className="display-6 fw-bold">{totalOutput}</h2><p className="card-text small">Units successfully completed</p></div></div></div>
                            <div className="col-md-3"><div className="card text-white bg-success shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Active Stations</h6><h2 className="display-6 fw-bold">{activeStationsCount}/{stations.length}</h2><p className="card-text small">Based on recent logs</p></div></div></div>
                            <div className="col-md-3"><div className="card text-white bg-warning shadow-sm h-100"><div className="card-body text-dark"><h6 className="card-title text-uppercase mb-2">Pending Units (In Progress)</h6><h2 className="display-6 fw-bold">{overallMetrics.pendingUnits}</h2><p className="card-text small">Units currently in progress (Live)</p></div></div></div>
                            <div className="col-md-3"><div className="card text-white bg-danger shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">No Good (NG) (Live)</h6><h2 className="display-6 fw-bold">{systemAlerts}</h2><p className="card-text small">Defective units recorded</p></div></div></div>
                        </div>

                        <div className="alert alert-info d-flex align-items-center mb-4">
                            <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                            <span className="fw-bold me-2">{overallMetrics.pendingApprovalUnits}</span> units are awaiting QA approval. Check the **Approvals** tab.
                        </div>

                        <div className="row g-4">
                            <div className="col-lg-4">
                                <UnitPieChart
                                    metrics={overallMetrics}
                                    title="Overall Live Unit Status Distribution"
                                />
                            </div>
                            <div className="col-lg-8">
                                <StationBarChart
                                    logs={logs}
                                    stations={stations}
                                    calculateMetrics={calculateStationMetrics}
                                />
                            </div>
                        </div>
                    </>
                );

            case "stations":
                // --- STATIONS OVERVIEW (Fixed Logic) ---
                return (
                    <div className="row g-3">
                        <div className="col-12 mb-3"><h4><i className="bi bi-grid-3x3-gap-fill me-2"></i>Stations Overview (1-15)</h4><p className="text-muted small">Shows live unit activity based on current metrics. Click **Monitor** for details or **History** for all recorded activity.</p></div>
                        {stations.map((station) => {
                            const metrics = calculateStationMetrics(station.id);
                            const hasActivity = metrics.pendingUnits > 0 || metrics.completedUnits > 0 || metrics.ngUnits > 0;

                            // Determine visual status based on metrics
                            let statusText = "IDLE";
                            let statusClass = "bg-secondary";
                            if (metrics.pendingUnits > 0) {
                                statusText = `${metrics.pendingUnits} IN PROGRESS`;
                                statusClass = "bg-primary";
                            } else if (metrics.yieldTotal > 0 && metrics.ngUnits > 0 && metrics.completedUnits === 0) {
                                statusText = "NG ALERT";
                                statusClass = "bg-danger";
                            }

                            return (
                                <div key={station.id} className="col-md-4 col-lg-3 col-xl-2">
                                    <div className={`card h-100 shadow-sm border-top-4 ${statusClass === 'bg-danger' ? 'border-danger' : statusClass === 'bg-primary' ? 'border-primary' : 'border-secondary'}`}>
                                        <div className="card-body text-center p-2">
                                            <h6 className="fw-bold mb-1">{station.name}</h6>
                                            <span className={`badge mb-2 ${statusClass}`}>{statusText}</span>
                                            <p className="small text-muted mb-0">{station.operator}</p>
                                        </div>
                                        <div className="card-footer bg-white p-1 d-flex justify-content-between">
                                            <button
                                                className="btn btn-primary btn-sm py-0 flex-grow-1 me-1"
                                                style={{fontSize: '0.7rem'}}
                                                onClick={() => handleMonitorStation(station.id)}
                                                disabled={!hasActivity}
                                            >
                                                <i className="bi bi-eye me-1"></i>Monitor
                                            </button>
                                            {/* NEW HISTORY BUTTON */}
                                            <button
                                                className="btn btn-secondary btn-sm py-0"
                                                style={{fontSize: '0.7rem'}}
                                                onClick={() => handleViewHistory(station.id)}
                                            >
                                                <i className="bi bi-clock-history me-1"></i>History
                                            </button>
                                            {/* END NEW HISTORY BUTTON */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            case "station_monitor":
                // ... Station Monitor (unchanged) ...
                if (!stationMonitorId) { setActiveTab('stations'); return null; }
                const station = stations.find(s => s.id === stationMonitorId);
                const metrics = calculateStationMetrics(stationMonitorId);

                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center">
                            <i className="bi bi-activity me-2 text-danger"></i>
                            Real-time Monitoring for <span className="text-primary ms-2">{station?.name || stationMonitorId}</span>
                            <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => setActiveTab('stations')}><i className="bi bi-arrow-left me-1"></i> Back to Stations</button>
                        </h3>

                        <hr />

                        {/* STATION KPI CARDS AND CHART */}
                        <div className="row g-4 mb-4">
                            <div className="col-lg-9">
                                <div className="row g-4">
                                    <div className="col-md-4"><div className="card bg-success text-white shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Completed Units</h6><h2 className="display-6 fw-bold">{metrics.completedUnits}</h2><p className="card-text small">Total units successfully processed.</p></div></div></div>
                                    <div className="col-md-4"><div className="card bg-info text-dark shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Overall Yield</h6><h2 className="display-6 fw-bold">{metrics.yieldRate}%</h2><p className="card-text small">Good Units / Total Units Checked ({metrics.yieldTotal})</p></div></div></div>
                                    <div className="col-md-4"><div className="card bg-danger text-white shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">No Good (NG)</h6><h2 className="display-6 fw-bold">{metrics.ngUnits}</h2><p className="card-text small">Total defective units recorded.</p></div></div></div>
                                    <div className="col-md-4"><div className="card bg-warning text-dark shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">In Progress</h6><h2 className="display-6 fw-bold">{metrics.pendingUnits}</h2><p className="card-text small">Units currently being processed.</p></div></div></div>
                                </div>
                            </div>

                            <div className="col-lg-3">
                                <UnitPieChart
                                    metrics={metrics}
                                    title={`${station?.name || 'Station'} Status (Live)`}
                                />
                            </div>
                        </div>

                        {/* STATION LOGS TABLE (Only showing LIVE units) */}
                        <div className="card shadow-sm">
                            <div className="card-header bg-white"><h5 className="mb-0">Live Logs (Excluding Pending Approval) for {station?.name || stationMonitorId}</h5></div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Station</th><th>Model</th><th>Revision</th><th>Base Unit No.</th><th>Assembly No.</th><th>Serial No.</th><th>Accessory No.</th><th>Status</th><th>Remarks</th><th>Timestamp</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {metrics.stationLogs.length > 0 ? metrics.stationLogs.map(log => (
                                            <tr key={log.id}><td>{log.id}</td>
                                                <td><span className="badge bg-secondary">{log.station}</span></td>
                                                <td>{log.model}</td>
                                                <td>{log.revision}</td>
                                                <td>{log.base_unit_kitting_no}</td>
                                                <td>{log.assembly_no}</td>
                                                <td className="fw-bold">{log.device_serial_no}</td>
                                                <td>{log.accessory_kitting_no}</td>
                                                <td><span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.status === 'No Good (NG)' ? 'bg-danger' : log.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>{log.status}</span></td>
                                                <td>{log.remarks}</td>
                                                <td className="small">{new Date(log.created_at).toLocaleString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger py-0" onClick={() => handleEditClick(log)}>
                                                        <i className="bi bi-pencil"></i> Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="12" className="text-center py-4">No live logs found for this station.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "reports":
                // ... Reports content ...
                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center">
                            <i className="bi bi-clipboard-data me-2 text-danger"></i>
                            Submitted Daily Reports
                        </h3>
                        <p className="text-muted">View production reports submitted by all stations, filtered by date and station.</p>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            {/* Filter Bar */}
                            <div className="d-flex gap-3 align-items-center">
                                <label className="form-label mb-0 fw-bold">Filter Date:</label>
                                <input
                                    type="date"
                                    className="form-control w-auto"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                    max={getTodayDate()}
                                />
                                <label className="form-label mb-0 fw-bold ms-3">Filter Station:</label>
                                <select
                                    className="form-select w-auto"
                                    value={reportFilterStationId}
                                    onChange={(e) => setReportFilterStationId(e.target.value)}
                                >
                                    <option value="All">All Stations</option>
                                    {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                </select>
                            </div>

                            {/* Report Submission Button */}
                            <button className="btn btn-sm btn-success" onClick={() => setShowReportModal(true)}>
                                <i className="bi bi-file-earmark-plus me-1"></i> Submit New Report
                            </button>
                        </div>

                        {/* Reports Table */}
                        <div className="card shadow-sm">
                            <div className="card-header bg-white fw-bold">
                                Reports for {reportDate} ({filteredReports.length} found)
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Station</th>
                                            <th>Shift</th>
                                            <th>Units Processed</th>
                                            <th>NG/Downtime</th>
                                            <th>Submitted By</th>
                                            <th>Timestamp</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.length > 0 ? filteredReports.map(report => (
                                            <tr key={report.id}>
                                                <td>{report.id}</td>
                                                <td><span className="badge bg-primary">{report.station}</span></td>
                                                <td>{report.shift}</td>
                                                <td className="fw-bold text-success">{report.total_units_processed}</td>
                                                <td><span className="text-danger">{report.total_ng} NG</span> / {report.downtime_minutes} min</td>
                                                <td>{report.submitted_by}</td>
                                                <td className="small">{new Date(report.created_at).toLocaleString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-info py-0"
                                                        onClick={() => handleViewReport(report)}
                                                    >
                                                        <i className="bi bi-eye me-1"></i> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="text-center py-4">No reports found for the selected criteria.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "approval":
                // ... Approval Tab Logic (unchanged) ...
                const approvalQueueLogs = logs.filter(l => l.status === 'Pending Approval');
                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center">
                            <i className="bi bi-check-circle-fill me-2 text-danger"></i>
                            Units Awaiting QA Approval
                            <span className="badge bg-danger ms-3">{approvalQueueLogs.length}</span>
                        </h3>
                        <p className="text-muted">These units require review, typically because they were manually flagged for inspection or reopened from a final status (Completed/No Good).</p>

                        <div className="card shadow-sm mt-4">
                            <div className="card-header bg-warning text-dark fw-bold">
                                Approval Queue
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Station</th><th>Serial No.</th><th>Model/Rev</th><th>Status</th><th>Remarks</th><th>Timestamp</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {approvalQueueLogs.length > 0 ? approvalQueueLogs.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.id}</td>
                                                <td><span className="badge bg-secondary">{log.station}</span></td>
                                                <td className="fw-bold">{log.device_serial_no}</td>
                                                <td>{log.model} (Rev: {log.revision})</td>
                                                <td><span className="badge bg-info text-dark">{log.status}</span></td>
                                                <td>{log.remarks || 'No remarks.'}</td>
                                                <td className="small">{new Date(log.created_at).toLocaleString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-success py-0" onClick={() => handleApproveUnit(log.id, log)}>
                                                        <i className="bi bi-check"></i> Approve (In Progress)
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="text-center py-4">No units currently require approval.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "manage_account": // NEW TAB: Manage Account (Unchanged)
                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center">
                            <i className="bi bi-person-gear me-2 text-danger"></i>
                            Manage Users
                        </h3>
                        <p className="text-muted">Create, edit, and view system users. The password is visible and editable for administrative control.</p>

                        <div className="d-flex justify-content-end mb-3">
                            <button className="btn btn-danger" onClick={handleAddUser}>
                                <i className="bi bi-person-plus me-2"></i> Add New User
                            </button>
                        </div>

                        <div className="card shadow-sm">
                            <div className="card-header bg-white fw-bold">
                                System User List ({userList.length} total)
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>User / Avatar</th>
                                            <th>Password</th>
                                            <th>Full Name</th>
                                            <th>Role</th>
                                            <th>Station</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userList.length > 0 ? userList.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                {/* Display Avatar and Username */}
                                                <td className="d-flex align-items-center">
                                                    <img
                                                        src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                                        alt={`${u.username} avatar`}
                                                        className="rounded-circle me-2"
                                                        style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                    />
                                                    <strong>{u.username}</strong>
                                                </td>
                                                <td><span className="text-info fw-bold">{u.password}</span></td>
                                                <td>{u.full_name}</td>
                                                <td><span className={`badge ${u.role === 'Administrator' ? 'bg-danger' : u.role === 'Operator' ? 'bg-primary' : 'bg-warning text-dark'}`}>{u.role}</span></td>
                                                <td>{u.station || 'N/A'}</td>
                                                <td className="small">{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger py-0 me-1" onClick={() => handleEditUser(u)}>
                                                        <i className="bi bi-pencil"></i> Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary py-0"
                                                        onClick={() => handleConfirmDeleteUser(u)}
                                                        disabled={u.id === 1} // Disable delete button for ID 1
                                                    >
                                                        <i className="bi bi-trash"></i> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="text-center py-4">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "analytics":
            case "guide":
                return (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-cone-striped display-1"></i>
                        <h3 className="mt-3">Under Construction</h3>
                        <p>The module **{activeTab}** is currently being developed.</p>
                    </div>
                );

            default:
                return (
                    <div className="alert alert-info text-center">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        The module **{activeTab}** is under development.
                    </div>
                );
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light overflow-hidden">
            {/* --- SIDEBAR --- */}
            <div
                className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark transition-all`}
                style={{
                    width: isSidebarOpen ? "260px" : "80px",
                    transition: "width 0.3s",
                    backgroundColor: "#111827"
                }}
            >
                <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none overflow-hidden">
                    <i className="bi bi-cpu-fill fs-3 me-3 text-danger"></i>
                    {isSidebarOpen && <span className="fs-5 fw-bold text-nowrap">MKFF Admin</span>}
                </div>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'dashboard' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('dashboard'); setStationMonitorId(null); setReportFilterStationId('All'); setStationHistoryId(null); }}><i className="bi bi-speedometer2 me-3"></i>{isSidebarOpen && "Dashboard"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'stations' || activeTab === 'station_monitor' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('stations'); setStationMonitorId(null); setReportFilterStationId('All'); setStationHistoryId(null); }}><i className="bi bi-grid-3x3-gap me-3"></i>{isSidebarOpen && "Stations"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'reports' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('reports'); setStationMonitorId(null); setStationHistoryId(null); }}><i className="bi bi-file-text me-3"></i>{isSidebarOpen && "Reports"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'approval' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('approval'); setStationHistoryId(null); }}><i className="bi bi-check-circle me-3"></i>{isSidebarOpen && "Approvals"}</button></li>
                    {/* NEW: Manage Account Tab */}
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'manage_account' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('manage_account'); setStationHistoryId(null); }}><i className="bi bi-person-gear me-3"></i>{isSidebarOpen && "Manage Account"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'analytics' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('analytics'); setStationHistoryId(null); }}><i className="bi bi-graph-up me-3"></i>{isSidebarOpen && "Analytics"}</button></li>
                </ul >
                <button className="btn btn-outline-light mt-auto w-100" onClick={onLogout}>
                    <i className="bi bi-box-arrow-left me-2"></i>{isSidebarOpen && "Logout"}
                </button>
            </div >


            {/* --- MAIN --- */}
            <div className="flex-grow-1 d-flex flex-column" style={{maxHeight: '100vh', overflowY: 'auto'}}>
                <header className="bg-white shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center sticky-top">
                    <div className="d-flex align-items-center">
                        <button className="btn btn-light border me-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><i className="bi bi-list"></i></button>
                        <h5 className="mb-0 fw-bold text-secondary text-uppercase">
                            {activeTab === 'station_monitor'
                                ? `${stations.find(s => s.id === stationMonitorId)?.name || 'Monitor'} Details`
                                : activeTab.replace('_', ' ')}
                        </h5>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-bell fs-4 text-secondary position-relative">
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1" style={{fontSize:'0.5rem'}}>3</span>
                        </i>
                        <div className="text-end me-2 d-none d-md-block">
                            {/* DISPLAY FULL NAME IN HEADER */}
                            <div className="fw-bold small">{headerFullName}</div>
                            <div className="text-muted small" style={{fontSize: '0.75rem'}}>Administrator</div>
                        </div>
                        {/* DISPLAY AVATAR IN HEADER */}
                        <img
                            src={headerAvatarSrc}
                            alt="User Avatar"
                            className="rounded-circle border border-danger"
                            style={{width: '35px', height: '35px', objectFit: 'cover'}}
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                        />
                    </div>
                </header>

                <div className="container-fluid px-4 pb-5">
                    {renderContent()}
                </div>
            </div>

            {/* --- MODAL RENDERING --- */}
            {selectedUnitToEdit && (
                <EditUnitModal
                    unit={selectedUnitToEdit}
                    onClose={() => setSelectedUnitToEdit(null)}
                    onSave={handleSaveEdit}
                />
            )}
            {selectedReportToView && (
                <ReportDetailModal
                    report={selectedReportToView}
                    onClose={() => setSelectedReportToView(null)}
                />
            )}

            {/* NEW: Report Submission Modal */}
            {showReportModal && (
                <SubmitReportModal
                    user={user}
                    stations={stations}
                    onClose={() => setShowReportModal(false)}
                    onSave={refreshAndCloseReport} // Refreshes data after submission
                />
            )}
            
            {/* NEW: Station History Modal */}
            {stationHistoryId && (
                <StationHistoryModal
                    stationId={stationHistoryId}
                    onClose={() => setStationHistoryId(null)}
                />
            )}

            {/* User Management Modals */}
            {selectedUserToManage && (
                <ManageUserModal
                    userToEdit={selectedUserToManage.id ? selectedUserToManage : initialNewUserData}
                    stations={stations}
                    onClose={() => setSelectedUserToManage(null)}
                    onSave={handleSaveUser}
                />
            )}
            {selectedUserToDelete && (
                <DeleteUserModal
                    user={selectedUserToDelete}
                    onClose={() => setSelectedUserToDelete(null)}
                    onDelete={handleDeleteUser}
                />
            )}
        </div>
    );
}