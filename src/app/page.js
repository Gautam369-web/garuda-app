"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const resp = await fetch("/api/admin/devices");
      const data = await resp.json();
      setDevices(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    }
  };

  const updateDevice = async (hwid, updates) => {
    try {
      await fetch("/api/admin/devices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hwid, ...updates }),
      });
      fetchDevices();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteDevice = async (hwid) => {
    if (!confirm("Are you sure you want to delete this device?")) return;
    try {
      await fetch("/api/admin/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hwid }),
      });
      fetchDevices();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const stats = {
    total: devices.length,
    pending: devices.filter(d => d.status === "PENDING").length,
    approved: devices.filter(d => d.status === "APPROVED").length
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-text">GARUDA PANEL</div>
        </div>
        <nav className="nav-links">
          <a className="nav-item active">Devices</a>
          <a className="nav-item">Settings</a>
          <a className="nav-item">API Logs</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>License Management</h1>
          <p>Global control for NeoBridge unauthorized hardware IDs.</p>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Devices</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--status-pending)' }}>
            <div className="stat-label">Pending Approval</div>
            <div className="stat-value" style={{ color: 'var(--status-pending)' }}>{stats.pending}</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--status-approved)' }}>
            <div className="stat-label">Active Licenses</div>
            <div className="stat-value" style={{ color: 'var(--status-approved)' }}>{stats.approved}</div>
          </div>
        </div>

        {/* Device Table */}
        <div className="device-table-container">
          <table>
            <thead>
              <tr>
                <th>Machine Info</th>
                <th>HWID Fingerprint</th>
                <th>Status</th>
                <th>Validity Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading devices...</td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No device requests found.</td></tr>
              ) : devices.map(device => (
                <tr key={device.hwid}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{device.pcName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{device.username}</div>
                  </td>
                  <td>
                    <code style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {device.hwid}
                    </code>
                  </td>
                  <td>
                    <span className={`status-badge status-${device.status.toLowerCase()}`}>
                      {device.status}
                    </span>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={device.validUntil ? device.validUntil.split('T')[0] : ""}
                      onChange={(e) => updateDevice(device.hwid, { validUntil: e.target.value })}
                    />
                  </td>
                  <td>
                    {device.status === "PENDING" && (
                      <button className="action-btn btn-approve" onClick={() => updateDevice(device.hwid, { status: "APPROVED" })}>Approve</button>
                    )}
                    {device.status !== "REJECTED" && (
                      <button className="action-btn btn-reject" onClick={() => updateDevice(device.hwid, { status: "REJECTED" })}>Reject</button>
                    )}
                    {device.status === "REJECTED" && (
                      <button className="action-btn btn-approve" onClick={() => updateDevice(device.hwid, { status: "APPROVED" })}>Restore</button>
                    )}
                    <button className="action-btn btn-delete" onClick={() => deleteDevice(device.hwid)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
