import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

// ─── Local "DB" helpers ───────────────────────────────────────────────────────
const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem("registered_users") || "[]");
  } catch {
    return [];
  }
};

function Login() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod]   = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData]       = useState({ email: "", phone: "", password: "" });
  const [error, setError]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const identifier = authMethod === "email" ? formData.email.trim() : formData.phone.trim();
    if (!identifier || !formData.password) {
      setError(`Please enter ${authMethod === "email" ? "email" : "phone number"} and password.`);
      return;
    }

    setIsLoading(true);

    // Simulate slight async delay for UX
    setTimeout(() => {
      const users = getUsers();

      const matched = authMethod === "email"
        ? users.find(u => u.email.toLowerCase() === identifier.toLowerCase())
        : users.find(u => u.contact.replace(/\D/g, "") === identifier.replace(/\D/g, ""));

      if (!matched) {
        setError(authMethod === "email"
          ? "No account found with this email. Please register first."
          : "No account found with this phone number. Please register first."
        );
        setIsLoading(false);
        return;
      }

      if (matched.password !== formData.password) {
        setError("Incorrect password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Success — store session (never store password in session)
      const session = {
        name:        matched.name,
        email:       matched.email,
        contact:     matched.contact,
        factoryName: matched.factoryName,
        role:        matched.role,
      };
      localStorage.setItem("isLoggedIn",   "true");
      localStorage.setItem("currentUser",  JSON.stringify(session));
      setIsLoading(false);
      navigate("/dashboard");
    }, 600);
  };

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        html,body,#root { width:100%; height:100%; overflow:hidden; }

        .container { width:100vw; height:100vh; display:flex; position:relative; overflow:hidden; background:#020817; }

        .glow1 { position:absolute; width:42vw; height:42vw; background:rgba(37,99,235,0.25); border-radius:50%; filter:blur(160px); top:-15%; left:-10%; animation:pulse 8s ease-in-out infinite; }
        .glow2 { position:absolute; width:42vw; height:42vw; background:rgba(147,51,234,0.22); border-radius:50%; filter:blur(160px); bottom:-15%; right:-10%; animation:pulse 8s ease-in-out infinite reverse; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.1);opacity:1} }

        .left { flex:1; background:linear-gradient(135deg,#2563eb,#4338ca,#7e22ce); display:flex; align-items:center; justify-content:center; padding:60px; position:relative; overflow:hidden; }
        .left::before { content:''; position:absolute; width:200%; height:200%; background:radial-gradient(circle,rgba(255,255,255,0.1) 1%,transparent 1%); background-size:50px 50px; animation:moveDots 20s linear infinite; }
        @keyframes moveDots { from{transform:translate(0,0)} to{transform:translate(50px,50px)} }

        .left-content { max-width:600px; position:relative; z-index:1; }

        .logo-circle { width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.12); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; margin-bottom:30px; animation:float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .brand-title { font-size:60px; font-weight:800; line-height:1.1; background:linear-gradient(135deg,#fff,#bfdbfe); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .description { margin-top:20px; font-size:18px; color:#dbeafe; line-height:1.6; }
        .features { margin-top:30px; }
        .feature { display:flex; gap:10px; margin-bottom:12px; align-items:center; color:#e0f2fe; font-size:15px; }
        .dot { width:8px; height:8px; background:#60a5fa; border-radius:50%; box-shadow:0 0 8px #60a5fa; flex-shrink:0; }

        .right { flex:1; display:flex; align-items:center; justify-content:center; background:#030b1f; position:relative; }

        .form-box { width:100%; max-width:450px; padding:20px; animation:fadeIn .6s ease-out; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .login-title { font-size:48px; font-weight:800; background:linear-gradient(135deg,#fff,#94a3b8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .login-subtitle { color:#9ca3af; margin-bottom:30px; font-size:14px; }

        .switch { display:flex; gap:12px; margin:25px 0; }
        .switch button { flex:1; padding:12px; border:none; border-radius:12px; background:#0f172a; color:#9ca3af; cursor:pointer; font-weight:600; font-size:14px; transition:all .3s ease; display:flex; align-items:center; justify-content:center; gap:6px; }
        .switch button:hover { transform:translateY(-2px); }
        .switch .active { background:linear-gradient(135deg,#3b82f6,#4f46e5); color:white; box-shadow:0 4px 15px rgba(59,130,246,.3); }

        .input-group { position:relative; margin-top:20px; }
        .input-icon { position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#6b7280; pointer-events:none; }
        input { width:100%; padding:14px 16px 14px 45px; border-radius:12px; border:1px solid #374151; background:#0f172a; color:white; font-size:14px; transition:all .3s ease; }
        input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
        input::placeholder { color:#4b5563; }

        .password-toggle { position:absolute; right:15px; top:50%; transform:translateY(-50%); background:none; border:none; color:#6b7280; cursor:pointer; display:flex; align-items:center; }

        .error-message { background:rgba(239,68,68,.1); border:1px solid #ef4444; color:#fca5a5; padding:12px; border-radius:12px; font-size:13px; margin-top:20px; text-align:center; }

        .login-btn { width:100%; margin-top:25px; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#3b82f6,#9333ea); color:white; font-weight:bold; font-size:16px; cursor:pointer; transition:all .3s ease; }
        .login-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 25px rgba(59,130,246,.3); }
        .login-btn:disabled { opacity:.7; cursor:not-allowed; }

        .footer { margin-top:20px; text-align:center; color:#6b7280; font-size:14px; }
        .footer a { color:#60a5fa; text-decoration:none; font-weight:600; transition:color .3s; }
        .footer a:hover { color:#93c5fd; text-decoration:underline; }

        @media(max-width:968px) { .left{display:none} .login-title{font-size:36px} }
      `}</style>

      <div className="container">
        <div className="glow1" />
        <div className="glow2" />

        {/* LEFT */}
        <div className="left">
          <div className="left-content">
            <div className="logo-circle">
              <ShieldCheck size={50} color="#60a5fa" />
            </div>
            <h1 className="brand-title">Welcome<br />Back</h1>
            <p className="description">
              Secure login with professional dashboard access.<br />
              Monitor your factory operations in real-time.
            </p>
            <div className="features">
              {["Secure local authentication","Fast dashboard access","Email & phone login","Real-time analytics"].map((item, i) => (
                <div className="feature" key={i}>
                  <div className="dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="form-box">
            <h1 className="login-title">Login</h1>
            <p className="login-subtitle">Access your manufacturing dashboard</p>

            <div className="switch">
              <button
                className={authMethod === "email" ? "active" : ""}
                onClick={() => { setAuthMethod("email"); setError(""); }}
                type="button"
              >
                <Mail size={15} /> Email
              </button>
              <button
                className={authMethod === "phone" ? "active" : ""}
                onClick={() => { setAuthMethod("phone"); setError(""); }}
                type="button"
              >
                <Phone size={15} /> Phone
              </button>
            </div>

            <form onSubmit={handleLogin}>
              {authMethod === "email" ? (
                <div className="input-group">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email" name="email" placeholder="Email Address"
                    value={formData.email} onChange={handleInputChange}
                    autoComplete="email"
                  />
                </div>
              ) : (
                <div className="input-group">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel" name="phone" placeholder="Phone Number"
                    value={formData.phone} onChange={handleInputChange}
                    autoComplete="tel"
                  />
                </div>
              )}

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" placeholder="Password"
                  value={formData.password} onChange={handleInputChange}
                  autoComplete="current-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Authenticating…" : "Login →"}
              </button>

              <div className="footer">
                Don't have an account? <Link to="/register">Register here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;