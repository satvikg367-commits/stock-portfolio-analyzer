import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { getApiError } from "../services/api";

const initialForm = {
    name: "",
    email: "",
    password: "",
};

function AddUser() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function updateField(event) {
        const { name, value } = event.target;
        setForm((currentForm) => ({ ...currentForm, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/users", form);
            setSuccess("User created successfully.");
            setForm(initialForm);
            window.setTimeout(() => navigate("/users"), 700);
        } catch (saveError) {
            setError(getApiError(saveError, "Unable to create user"));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="form-page">
            <section className="form-panel">
                <div className="form-panel-header">
                    <span className="eyebrow">Registry</span>
                    <h1>Add New User</h1>
                </div>

                {error ? <div className="alert alert-error">{error}</div> : null}
                {success ? <div className="alert alert-success">{success}</div> : null}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Name</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">person</span>
                            <input
                                autoComplete="name"
                                name="name"
                                onChange={updateField}
                                placeholder="Jane Doe"
                                required
                                type="text"
                                value={form.name}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Email Address</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">mail</span>
                            <input
                                autoComplete="email"
                                name="email"
                                onChange={updateField}
                                placeholder="jane.doe@example.com"
                                required
                                type="email"
                                value={form.email}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Password</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">lock</span>
                            <input
                                autoComplete="new-password"
                                name="password"
                                onChange={updateField}
                                placeholder="Minimum 6 characters"
                                required
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                            />
                            <button
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="icon-button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                type="button"
                            >
                                <span className="material-symbols-outlined">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                    </label>

                    <div className="form-actions">
                        <Link className="btn btn-secondary" to="/users">
                            <span className="material-symbols-outlined">close</span>
                            Cancel
                        </Link>
                        <button className="btn btn-primary" disabled={isSaving} type="submit">
                            <span className="material-symbols-outlined">
                                {isSaving ? "sync" : "arrow_forward"}
                            </span>
                            {isSaving ? "Saving" : "Create User"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default AddUser;
