import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DataTable from "../components/DataTable";
import api, { getApiError } from "../services/api";
import { getInitials } from "../utils/format";

function Users() {
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await api.get("/users");
            setUsers(response.data || []);
        } catch (loadError) {
            setError(getApiError(loadError, "Unable to load users"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    async function handleDelete(userId) {
        setError("");

        const currentUser = users.find((user) => user.id === userId);
        const shouldDelete = window.confirm(
            `Delete ${currentUser?.name || "this user"}? This action cannot be undone.`
        );

        if (!shouldDelete) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            setUsers((currentUsers) =>
                currentUsers.filter((user) => user.id !== userId)
            );
        } catch (deleteError) {
            setError(getApiError(deleteError, "Unable to delete user"));
        }
    }

    const visibleUsers = useMemo(() => {
        const normalizedQuery = searchText.trim().toLowerCase();

        const filteredUsers = users.filter((user) => {
            if (!normalizedQuery) {
                return true;
            }

            return [user.name, user.email, String(user.id)]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery));
        });

        const sortedUsers = [...filteredUsers].sort((a, b) => {
            if (sortBy === "id-desc") {
                return Number(b.id) - Number(a.id);
            }

            if (sortBy === "id-asc") {
                return Number(a.id) - Number(b.id);
            }

            if (sortBy === "name-desc") {
                return String(b.name || "").localeCompare(String(a.name || ""));
            }

            return String(a.name || "").localeCompare(String(b.name || ""));
        });

        return sortedUsers;
    }, [searchText, sortBy, users]);

    const columns = [
        {
            key: "id",
            header: "ID",
            render: (user) => `#${user.id}`,
        },
        {
            key: "name",
            header: "Name",
            render: (user) => (
                <span className="identity-cell">
                    <span className="avatar">{getInitials(user.name)}</span>
                    <strong>{user.name}</strong>
                </span>
            ),
        },
        {
            key: "email",
            header: "Email",
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (user) => (
                <button
                    aria-label={`Delete ${user.name}`}
                    className="icon-button danger"
                    onClick={() => handleDelete(user.id)}
                    type="button"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            ),
        },
    ];

    return (
        <div className="page-stack">
            <div className="page-header page-header-row">
                <div>
                    <span className="eyebrow">Registry</span>
                    <h1>Users</h1>
                </div>
                <Link className="btn btn-primary" to="/users/add">
                    <span className="material-symbols-outlined">add</span>
                    Add User
                </Link>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Accounts</span>
                        <h2>User Directory</h2>
                    </div>
                    <div className="panel-controls">
                        <label className="field compact-field">
                            <span>Search</span>
                            <div className="input-shell compact-shell">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="Name, email or ID"
                                    type="text"
                                    value={searchText}
                                />
                            </div>
                        </label>
                        <label className="field compact-field">
                            <span>Sort</span>
                            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="id-desc">Newest First</option>
                                <option value="id-asc">Oldest First</option>
                            </select>
                        </label>
                        <button className="btn btn-secondary" onClick={loadUsers} type="button">
                            <span className="material-symbols-outlined">refresh</span>
                            Refresh
                        </button>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={visibleUsers}
                    emptyMessage="No users available."
                    isLoading={isLoading}
                />
                <div className="panel-footer">
                    Showing {visibleUsers.length} of {users.length} users
                </div>
            </section>

            <section className="insight-grid">
                <div className="insight-band">
                    <span className="material-symbols-outlined">analytics</span>
                    <div>
                        <strong>{users.length}</strong>
                        <span>Registered analysts</span>
                    </div>
                </div>
                <div className="insight-band">
                    <span className="material-symbols-outlined">verified_user</span>
                    <div>
                        <strong>Active</strong>
                        <span>Access status</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Users;
