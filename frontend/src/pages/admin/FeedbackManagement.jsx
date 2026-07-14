import React, { useEffect, useState } from "react";
import { API_BASE_URL as BASE_URL } from "../../config";
import "../../styles/FeedbackManagement.css";

const API_BASE_URL = `${BASE_URL}/api/feedback`;

const Icon = ({ path, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

const ICONS = {
    resolve: "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z",
    unresolve: "M15 10a.75.75 0 01-.75.75H5.707l2.147 2.146a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 111.06 1.06L5.707 9.25H14.25A.75.75 0 0115 10z",
    delete: "M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 9.25a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7z",
    refresh: "M.75 4.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H1.5a.75.75 0 01-.75-.75zM1.5 6.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H1.5zM19.25 15.25a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75zM18.5 13.25a.75.75 0 000-1.5h-4.5a.75.75 0 000 1.5h4.5zM6.252 8.618A.75.75 0 017.31 9.77l-4.5 4.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97L5.84 8.68a.75.75 0 01.412-.062zM13.748 11.382a.75.75 0 01-.412.062L11.77 12.82l-1.03-1.03a.75.75 0 011.06-1.06l1.5 1.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-.97-.97a.75.75 0 111.06-1.06l3.47 3.47 3.44-4.4a.75.75 0 01.412-.062z",
};

export default function FeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");

    useEffect(() => {
        fetchFeedbacks();
    }, [filter, urgencyFilter]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}?status=${filter}&urgency=${urgencyFilter}`);
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setFeedbacks(data || []);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        const original = [...feedbacks];
        // Optimistic Update UI
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));

        try {
            const response = await fetch(`${API_BASE_URL}/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error("Update failed");
        } catch (err) {
            alert(err.message);
            setFeedbacks(original); // Revert on failure
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm("Delete this feedback?")) return;
        
        const original = [...feedbacks];
        // Optimistic Delete
        setFeedbacks(prev => prev.filter(f => f.id !== id));

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Delete failed");
        } catch (err) {
            alert(err.message);
            setFeedbacks(original); // Revert on failure
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="feedback-layout">
            <div className="component-header">
                <div className="component-header-left">
                    <h2 className="component-header-title">Feedback Management</h2>
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Status:</label>
                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Urgency:</label>
                            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
                                <option value="all">All</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button onClick={fetchFeedbacks} className="button-secondary">
                    <Icon path={ICONS.refresh} /> Refresh
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total</span>
                    <span className="stat-number">{feedbacks.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Pending</span>
                    <span className="stat-number">{feedbacks.filter(f => f.status === 'pending').length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Resolved</span>
                    <span className="stat-number">{feedbacks.filter(f => f.status === 'resolved').length}</span>
                </div>
            </div>

            {loading ? (
                <div className="component-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="empty-state">
                    <h3>No feedback found</h3>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Details</th>
                                <th>Message</th>
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.map(item => {
                                const isResolved = item.status === 'resolved';
                                return (
                                    <tr key={item.id} className={isResolved ? "row-resolved" : ""}>
                                        <td>
                                            <div className="student-info">
                                                <span className="student-name">{item.name || "Anonymous"}</span>
                                                <span className="student-email">{item.roll_no}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="student-info">
                                                <span className="student-email">{item.department}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#999' }}>{item.feedback_type}</span>
                                            </div>
                                        </td>
                                        <td><div className="feedback-message">{item.message}</div></td>
                                        <td>
                                            <span className={`urgency-badge urgency-${(item.urgency || 'low').toLowerCase()}`}>
                                                {item.urgency || 'Low'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${isResolved ? "confirmed" : "pending"}`}>
                                                {isResolved ? "Resolved" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="feedback-date">{formatDate(item.created_at)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {!isResolved ? (
                                                    <button onClick={() => handleUpdateStatus(item.id, 'resolved')} className="button-icon confirmed" title="Resolve">
                                                        <Icon path={ICONS.resolve} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleUpdateStatus(item.id, 'pending')} className="button-icon warning" title="Unresolve">
                                                        <Icon path={ICONS.unresolve} />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteFeedback(item.id)} className="button-icon rejected" title="Delete">
                                                    <Icon path={ICONS.delete} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}