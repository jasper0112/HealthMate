"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import "@/styles/card.css";

type MenuItem = "user-management" | "statistics";

export default function AdminPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<MenuItem>("user-management");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", minHeight: "600px" }}>
      {/* Left sidebar */}
      <aside
        style={{
          width: "240px",
          background: "white",
          borderRight: "1px solid var(--border)",
          padding: "1rem 0",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 1rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>Admin Panel</h2>
        </div>
        <nav>
          <MenuItem
            icon="👥"
            label="User Management"
            isActive={activeMenu === "user-management"}
            onClick={() => setActiveMenu("user-management")}
          />
          <MenuItem
            icon="📊"
            label="Statistics"
            isActive={activeMenu === "statistics"}
            onClick={() => setActiveMenu("statistics")}
          />
        </nav>
      </aside>

      {/* Main content area */}
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", padding: "1.5rem" }}>
        {activeMenu === "user-management" && <UserManagement />}
        {activeMenu === "statistics" && <Statistics />}
      </main>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "0.75rem 1rem",
        cursor: "pointer",
        background: isActive ? "#e0e7ff" : "transparent",
        borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
        color: isActive ? "var(--primary)" : "var(--text)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "#f3f4f6";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span style={{ fontSize: "15px", fontWeight: isActive ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"all" | "username" | "email" | "role" | "enabled">("all");
  const [searchValue, setSearchValue] = useState("");
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState<{ id: number; enabled: boolean } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const { listAllUsersIncludingDisabled } = await import("@/lib/api");
      const data = await listAllUsersIncludingDisabled();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchValue.trim() && searchType === "all") {
      loadUsers();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const api = await import("@/lib/api");
      let result: any[] = [];

      switch (searchType) {
        case "username":
          const user = await api.getUserByUsername(searchValue.trim());
          result = [user];
          break;
        case "email":
          const userByEmail = await api.getUserByEmail(searchValue.trim());
          result = [userByEmail];
          break;
        case "role":
          if (!searchValue.trim()) {
            setError("Please select a role");
            setLoading(false);
            return;
          }
          const roleValue = searchValue.trim().toUpperCase();
          if (roleValue !== "USER" && roleValue !== "ADMIN" && roleValue !== "DOCTOR") {
            setError("Please select a valid role");
            setLoading(false);
            return;
          }
          result = await api.getUsersByRole(roleValue as "USER" | "ADMIN" | "DOCTOR");
          break;
        case "enabled":
          if (!searchValue.trim()) {
            setError("Please select enabled status");
            setLoading(false);
            return;
          }
          // The value selected from dropdown is "true" or "false" string
          const enabledValue = searchValue.trim();
          if (enabledValue !== "true" && enabledValue !== "false") {
            setError("Please select a valid enabled status");
            setLoading(false);
            return;
          }
          const enabled = enabledValue === "true";
          
          // Reverse selection logic: if querying disabled users, get all users first, then filter out disabled ones
          if (!enabled) {
            // Query disabled users: get all users, then filter out enabled === false
            const allUsers = await api.listAllUsersIncludingDisabled();
            result = allUsers.filter(user => user.enabled === false);
          } else {
            // Query enabled users: use API directly
            result = await api.getUsersByEnabled(true);
            // If the returned result is incorrect, also filter from all users
            if (!Array.isArray(result) || result.length === 0) {
              const allUsers = await api.listAllUsersIncludingDisabled();
              result = allUsers.filter(user => user.enabled === true);
            }
          }
          
          // Ensure result is an array
          if (!Array.isArray(result)) {
            result = [];
          }
          break;
        default:
          // When querying all users, ensure all users are included (including disabled ones)
          result = await api.listAllUsersIncludingDisabled();
      }

      setUsers(result);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleEnabled(userId: number, currentEnabled: boolean) {
    setShowToggleConfirm({ id: userId, enabled: currentEnabled });
  }

  async function confirmToggleEnabled() {
    if (!showToggleConfirm) return;
    try {
      const { updateUser } = await import("@/lib/api");
      await updateUser(showToggleConfirm.id, { enabled: !showToggleConfirm.enabled });
      setShowToggleConfirm(null);
      await loadUsers();
    } catch (e: any) {
      alert(e?.message || "Operation failed");
    }
  }

  async function handleDelete(userId: number) {
    setShowDeleteConfirm(userId);
  }

  async function confirmDelete() {
    if (!showDeleteConfirm) return;
    try {
      const { deleteUser } = await import("@/lib/api");
      await deleteUser(showDeleteConfirm);
      setShowDeleteConfirm(null);
      await loadUsers();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  return (
    <div className="max-w-7xl">
      <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "1.5rem" }}>User Management</h3>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              style={{ width: "100%", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}
            >
              <option value="all">All Users</option>
              <option value="username">By Username</option>
              <option value="email">By Email</option>
              <option value="role">By Role</option>
              <option value="enabled">By Enabled Status</option>
            </select>
          </div>
          {searchType !== "all" && (
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                {searchType === "enabled" ? "Select Enabled Status" : searchType === "role" ? "Select Role" : `Enter ${searchType === "username" ? "Username" : "Email"}`}
              </label>
              {searchType === "enabled" ? (
                <select
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{ width: "100%", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}
                >
                  <option value="">Please select</option>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : searchType === "role" ? (
                <select
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{ width: "100%", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}
                >
                  <option value="">Please select</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DOCTOR">DOCTOR</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder={searchType === "username" ? "Username" : "Email"}
                  style={{ width: "100%", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}
                />
              )}
            </div>
          )}
          <div>
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>
          <div>
            <button onClick={loadUsers} className="btn btn-ghost">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="card">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>{error}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Enabled Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                      No users
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.fullName || "—"}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            background: user.role === "ADMIN" ? "#fee2e2" : user.role === "DOCTOR" ? "#dbeafe" : "#e0e7ff",
                            color: user.role === "ADMIN" ? "#dc2626" : user.role === "DOCTOR" ? "#2563eb" : "#3730a3",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleEnabled(user.id, user.enabled)}
                          className="btn btn-ghost"
                          style={{
                            background: user.enabled ? "#dcfce7" : "#fee2e2",
                            color: user.enabled ? "#16a34a" : "#dc2626",
                            border: "none",
                            fontSize: "13px",
                            padding: "6px 12px",
                          }}
                        >
                          {user.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--muted)" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-danger"
                          style={{ fontSize: "13px", padding: "6px 12px" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation popup */}
      {showDeleteConfirm != null && (
        <div
          onClick={() => setShowDeleteConfirm(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: 20, 
              width: 360, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              position: "relative",
              margin: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm Delete</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enable/Disable confirmation popup */}
      {showToggleConfirm != null && (
        <div
          onClick={() => setShowToggleConfirm(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: 20, 
              width: 360, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              position: "relative",
              margin: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm {showToggleConfirm.enabled ? "Disable" : "Enable"}</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>Are you sure you want to {showToggleConfirm.enabled ? "disable" : "enable"} this user?</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => setShowToggleConfirm(null)}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleEnabled}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "black",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Confirm {showToggleConfirm.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Statistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const { getUserCount } = await import("@/lib/api");
      const data = await getUserCount();
      setStats(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Statistics</h3>
        <button onClick={loadStats} className="btn btn-primary">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ color: "var(--muted)" }}>Loading...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ color: "#dc2626" }}>{error}</div>
        </div>
      ) : stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div className="card scale-in">
            <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "0.5rem" }}>Total Users</div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--primary)" }}>{stats.total || 0}</div>
          </div>

          {stats.enabled !== undefined && (
            <div className="card scale-in">
              <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "0.5rem" }}>Enabled Users</div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#16a34a" }}>{stats.enabled || 0}</div>
            </div>
          )}

          {stats.disabled !== undefined && (
            <div className="card scale-in">
              <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "0.5rem" }}>Disabled Users</div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#dc2626" }}>{stats.disabled || 0}</div>
            </div>
          )}

          {stats.byRole && Object.keys(stats.byRole).length > 0 && (
            <>
              {Object.entries(stats.byRole).map(([role, count]: [string, any]) => (
                <div key={role} className="card scale-in">
                  <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "0.5rem" }}>
                    {role === "USER" ? "Regular Users" : role === "ADMIN" ? "Administrators" : role === "DOCTOR" ? "Doctors" : role}
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--text)" }}>{count || 0}</div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
