import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── Local "DB" helpers ───────────────────────────────────────────────────────
const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem("registered_users") || "[]");
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem("registered_users", JSON.stringify(users));
};

function Register() {
  const navigate  = useNavigate();
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser]         = useState({
    name: "", email: "", password: "", confirmPassword: "",
    factoryName: "", role: "", contact: "",
  });

  const set = (field) => (e) => {
    setUser(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!user.name.trim())                                        e.name = "Full name is required.";
    if (!user.email.trim())                                       e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(user.email))                   e.email = "Please enter a valid email.";
    if (!user.password)                                           e.password = "Password is required.";
    else if (user.password.length < 6)                           e.password = "Password must be at least 6 characters.";
    if (user.password !== user.confirmPassword)                   e.confirmPassword = "Passwords do not match.";
    if (!user.factoryName.trim())                                 e.factoryName = "Factory name is required.";
    if (!user.role)                                               e.role = "Please select a role.";
    if (!user.contact.trim())                                     e.contact = "Contact number is required.";
    else if (!/^\d{10}$/.test(user.contact.replace(/\D/g, ""))) e.contact = "Please enter a valid 10-digit number.";
    return e;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getUsers();

      // Check duplicate email
      if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        setErrors({ general: "An account with this email already exists. Please login." });
        setIsLoading(false);
        return;
      }

      // Check duplicate phone
      const cleanPhone = user.contact.replace(/\D/g, "");
      if (users.find(u => u.contact.replace(/\D/g, "") === cleanPhone)) {
        setErrors({ general: "An account with this phone number already exists." });
        setIsLoading(false);
        return;
      }

      // Save new user (password stored as-is in localStorage — fine for local/demo use)
      const newUser = {
        id:          Date.now().toString(),
        name:        user.name.trim(),
        email:       user.email.trim().toLowerCase(),
        password:    user.password,           // stored in localStorage
        factoryName: user.factoryName.trim(),
        role:        user.role,
        contact:     cleanPhone,
        createdAt:   new Date().toISOString(),
      };

      saveUsers([...users, newUser]);
      setIsLoading(false);
      navigate("/");
    }, 600);
  };

  const inp = (field) => ({
    padding: "14px",
    borderRadius: "10px",
    border: `1px solid ${errors[field] ? "#ef4444" : "#374151"}`,
    background: "#111827",
    color: "white",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    transition: "border-color .3s",
  });

  const err = (field) =>
    errors[field] ? (
      <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "-8px" }}>{errors[field]}</span>
    ) : null;

  return (
    <div style={S.container}>
      {/* LEFT */}
      <div style={S.left}>
        <h1 style={S.logo}>FactoryPULSE AI</h1>
        <h2 style={S.heading}>AI Manufacturing Analytics</h2>
        <p style={S.text}>
          Smart monitoring, predictive maintenance, machine analytics,
          production insights, and intelligent factory management.
        </p>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { icon: "📊", title: "Real-time Analytics",     sub: "Live production monitoring" },
            { icon: "🔧", title: "Predictive Maintenance",  sub: "Prevent machine failures" },
            { icon: "🤖", title: "AI Assistant",            sub: "24/7 smart support" },
          ].map(({ icon, title, sub }) => (
            <div key={title} style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, background: "rgba(96,165,250,.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
              <div>
                <strong style={{ color: "#e2e8f0" }}>{title}</strong>
                <br />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={S.right}>
        <form style={S.form} onSubmit={handleRegister} noValidate>
          <h2 style={S.formTitle}>Create Account</h2>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: 10, fontSize: 13 }}>
            Join the future of factory management
          </p>

          {errors.general && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid #ef4444", color: "#fca5a5", padding: "12px", borderRadius: "10px", fontSize: 13, textAlign: "center" }}>
              {errors.general}
            </div>
          )}

          <input placeholder="Full Name"              style={inp("name")}            value={user.name}            onChange={set("name")}            type="text"     />
          {err("name")}

          <input placeholder="Email Address"          style={inp("email")}           value={user.email}           onChange={set("email")}           type="email"    autoComplete="email" />
          {err("email")}

          <input placeholder="Password (min 6 chars)" style={inp("password")}        value={user.password}        onChange={set("password")}        type="password" autoComplete="new-password" />
          {err("password")}

          <input placeholder="Re-enter Password"      style={inp("confirmPassword")} value={user.confirmPassword} onChange={set("confirmPassword")} type="password" autoComplete="new-password" />
          {err("confirmPassword")}

          <input placeholder="Factory Name"           style={inp("factoryName")}     value={user.factoryName}     onChange={set("factoryName")}     type="text"     />
          {err("factoryName")}

          <select style={inp("role")} value={user.role} onChange={set("role")}>
            <option value="">Select Role</option>
            {["Factory Manager","Supervisor","Machine Operator","Worker","Quality Inspector","Maintenance Engineer"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {err("role")}

          <input placeholder="Contact Number (10 digits)" style={inp("contact")} value={user.contact} onChange={set("contact")} type="tel" autoComplete="tel" />
          {err("contact")}

          <button
            type="submit"
            disabled={isLoading}
            style={{ ...S.button, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            {isLoading ? "Registering…" : "Register →"}
          </button>

          <p style={S.loginText}>
            Already have an account?{" "}
            <Link to="/" style={S.link}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const S = {
  container: { minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#0f172a,#1e1b4b)", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
  left:      { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", color: "white", background: "linear-gradient(135deg,#1e1b4b,#312e81)", overflow: "hidden" },
  logo:      { fontSize: 42, color: "#60a5fa", marginBottom: 20, fontWeight: "bold" },
  heading:   { fontSize: 32, marginBottom: 20, color: "#e2e8f0" },
  text:      { fontSize: 16, color: "#cbd5e1", lineHeight: "1.6", maxWidth: 500 },
  right:     { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: 40 },
  form:      { width: 420, background: "#1f2937", padding: 40, borderRadius: 20, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 25px 50px -12px rgba(0,0,0,.5)", maxHeight: "95vh", overflowY: "auto" },
  formTitle: { color: "white", textAlign: "center", marginBottom: 5, fontSize: 28 },
  button:    { padding: 14, border: "none", borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "white", fontSize: 16, fontWeight: "bold", marginTop: 6, transition: "transform .2s ease" },
  loginText: { color: "#cbd5e1", textAlign: "center", fontSize: 14 },
  link:      { color: "#60a5fa", marginLeft: 5, textDecoration: "none" },
};

export default Register;