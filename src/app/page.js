"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const resp = await fetch("/api/admin/devices");
      const data = await resp.json();

      if (Array.isArray(data)) {
        setDevices(data);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Invalid response format from server.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch devices", err);
      setError("Network error: Could not reach the server.");
      setLoading(false);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout API failed, redirecting anyway", e);
    }
    router.push("/login");
  };

  const stats = {
    total: devices.length,
    pending: devices.filter(d => d.status === "PENDING").length,
    approved: devices.filter(d => d.status === "APPROVED").length
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#16161a] border-r border-white/10 p-6 flex flex-col
        transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-12">
          <div className="text-2xl font-black tracking-tight text-cyber">GARUDA PANEL</div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <a className="bg-white/5 text-accent-primary px-4 py-3 rounded-lg font-medium cursor-pointer">Devices</a>
          <a className="text-gray-400 hover:text-accent-primary px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer">Settings</a>
          <a className="text-gray-400 hover:text-accent-primary px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer">API Logs</a>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-400 font-medium px-4 py-3 rounded-lg w-full text-left transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-12 overflow-y-auto">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <div className="text-xl font-bold text-cyber">GARUDA</div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white/5 rounded-lg text-accent-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">License Management</h1>
          <p className="text-gray-400">Global control for NeoBridge unauthorized hardware IDs.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#16161a] p-6 rounded-2xl border border-white/5">
            <div className="text-gray-400 text-sm mb-2 font-medium">Total Devices</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-[#16161a] p-6 rounded-2xl border border-[var(--status-pending)]/20">
            <div className="text-gray-400 text-sm mb-2 font-medium">Pending Approval</div>
            <div className="text-3xl font-bold text-status-pending">{stats.pending}</div>
          </div>
          <div className="bg-[#16161a] p-6 rounded-2xl border border-status-approved/20">
            <div className="text-gray-400 text-sm mb-2 font-medium">Active Licenses</div>
            <div className="text-3xl font-bold text-status-approved">{stats.approved}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div><strong>API Error:</strong> {error}</div>
          </div>
        )}

        {/* Device Table Container */}
        <div className="bg-[#16161a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-5 text-gray-400 text-xs font-bold uppercase tracking-wider">Machine Info</th>
                  <th className="p-5 text-gray-400 text-xs font-bold uppercase tracking-wider">HWID Fingerprint</th>
                  <th className="p-5 text-gray-400 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="p-5 text-gray-400 text-xs font-bold uppercase tracking-wider">Validity Until</th>
                  <th className="p-5 text-gray-400 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading devices...</td></tr>
                ) : !Array.isArray(devices) || devices.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-400">No device requests found.</td></tr>
                ) : devices.map(device => (
                  <tr key={device.hwid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-white mb-1">{device.pcName}</div>
                      <div className="text-xs text-gray-500">{device.username}</div>
                    </td>
                    <td className="p-5">
                      <code className="bg-black/50 px-2 py-1 rounded text-xs text-accent-primary font-mono border border-accent-primary/20">
                        {device.hwid}
                      </code>
                    </td>
                    <td className="p-5">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                        ${device.status === 'PENDING' ? 'bg-status-pending/20 text-status-pending' :
                          device.status === 'APPROVED' ? 'bg-status-approved/20 text-status-approved' :
                            'bg-status-rejected/20 text-status-rejected'}
                      `}>
                        {device.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <input
                        type="date"
                        value={device.validUntil ? device.validUntil.split('T')[0] : ""}
                        onChange={(e) => updateDevice(device.hwid, { validUntil: e.target.value })}
                        className="bg-black/40 border border-white/10 text-xs px-2 py-1.5 rounded focus:border-accent-primary outline-none text-white appearance-none"
                      />
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {device.status === "PENDING" && (
                          <button onClick={() => updateDevice(device.hwid, { status: "APPROVED" })} className="p-2 bg-status-approved text-black rounded-lg font-bold text-xs hover:opacity-80">Approve</button>
                        )}
                        {device.status !== "REJECTED" && (
                          <button onClick={() => updateDevice(device.hwid, { status: "REJECTED" })} className="p-2 bg-status-rejected text-white rounded-lg font-bold text-xs hover:opacity-80">Reject</button>
                        )}
                        {device.status === "REJECTED" && (
                          <button onClick={() => updateDevice(device.hwid, { status: "APPROVED" })} className="p-2 bg-accent-primary text-black rounded-lg font-bold text-xs hover:opacity-80">Restore</button>
                        )}
                        <button onClick={() => deleteDevice(device.hwid)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
