// src/app/page.tsx (Split 1 of 4)
"use client";

import { useEffect, useState } from "react";

interface Project {
  _id: string;
  name: string;
  cloudProvider: string;
  status: string;
  createdAt: string;
  totalComputeCost?: number;
  avgExecutionTime?: number;
  errorCount?: number;
}

interface AIDiagnosis {
  score: number;
  diagnosis: string;
  remediationCode: string;
}

interface UserSession {
  id: string;
  email: string;
}

export default function InteractiveDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Active User Authentication Session States
  const [session, setSession] = useState<UserSession | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setFormDataAuth] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Creation Drawer Panel States
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cloudProvider: "vercel",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // AI Diagnostic Layer States
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aiReport, setAIReport] = useState<AIDiagnosis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Fetch registered project arrays from our aggregated endpoint
  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects");
      const json = await response.json();
      if (json.success) setProjects(json.data);
    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  // Handle User Login and Registration Form Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthError("All credentials fields are required.");
      return;
    }

    setAuthSubmitting(true);
    const targetEndpoint =
      authMode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const json = await response.json();

      if (json.success) {
        if (authMode === "login") {
          // Commit session profile data directly to active app context memory state
          setSession({ id: json.user.id, email: json.user.email });
          setFormDataAuth({ email: "", password: "" });
        } else {
          // If registered successfully, flip instantly to sign-in view mode with a reset form
          setAuthMode("login");
          setFormDataAuth({ email: authForm.email, password: "" });
          setAuthError(
            "Registration complete! Please enter your password to sign in.",
          );
        }
      } else {
        setAuthError(
          json.message || "Authentication transmission layer failed.",
        );
      }
    } catch (err) {
      setAuthError("Network credentials validation communication crash.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim()) {
      setFormError("Application name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await response.json();
      if (json.success) {
        setFormData({ name: "", cloudProvider: "vercel" });
        setIsPanelOpen(false);
        fetchProjects();
      } else {
        setFormError(json.message || "Failed to save cluster.");
      }
    } catch (err) {
      setFormError("Network communication layer error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunAIAudit = async (project: Project) => {
    setSelectedProject(project);
    setAIReport(null);
    setIsAIPanelOpen(true);
    setLoadingAI(true);
    try {
      const response = await fetch("/api/ai-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project._id }),
      });
      const json = await response.json();
      if (json.success) {
        setAIReport({
          score: json.score,
          diagnosis: json.diagnosis,
          remediationCode: json.remediationCode,
        });
      }
    } catch (err) {
      console.error("AI Network failure:", err);
    } finally {
      setLoadingAI(false);
    }
  };
  // src/app/page.tsx (Split 2 of 4)
  // SECURITY GATEWAY: If no active user session exists, display the login interface
  if (!session) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans antialiased relative overflow-hidden flex flex-col items-center justify-center p-6 selection:bg-orange-200 selection:text-orange-900">
        {/* Background Decorative Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c05_1px,transparent_1px),linear-gradient(to_bottom,#ea580c05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fadeIn">
          {/* Platform Branding Logo Accent */}
          <div className="text-center mb-8">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-orange-700 uppercase bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded">
              Infrastructure Control
            </span>
            <h1 className="text-4xl font-black mt-3 tracking-tight text-stone-900">
              STACK<span className="text-orange-600">TRIM</span>
            </h1>
            <p className="text-stone-500 mt-2 text-xs font-mono">
              AGENTIC_SECURE_AUTH_HANDSHAKE
            </p>
          </div>

          {/* Secure Interactive Glass Form Panel */}
          <div className="bg-white border border-orange-100 rounded-3xl p-8 shadow-xl shadow-orange-600/5">
            <h2 className="text-xl font-black text-stone-900 mb-2 capitalize">
              {authMode === "login" ? "Welcome Back" : "Create Developer Space"}
            </h2>
            <p className="text-xs text-stone-400 mb-6">
              {authMode === "login"
                ? "Enter your global security master credentials to mount clusters."
                : "Register a master profile to provision clean telemetry nodes."}
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {authError && (
                <div
                  className={`p-3 border rounded-xl text-xs font-semibold font-mono ${
                    authError.includes("complete")
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {authError.includes("complete") ? "SUCCESS // " : "ERROR // "}{" "}
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Master Email Address
                </label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setFormDataAuth({ ...authForm, email: e.target.value })
                  }
                  placeholder="name@company.com"
                  className="w-full bg-[#FFFDF9] border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-stone-800 transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Account Password
                </label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) =>
                    setFormDataAuth({ ...authForm, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#FFFDF9] border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-stone-800 transition-colors shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full bg-stone-900 hover:bg-orange-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center font-mono uppercase tracking-wider"
              >
                {authSubmitting
                  ? "Verifying Identity Link..."
                  : authMode === "login"
                    ? "Access Workspace ⚡"
                    : "Register Node Profile 🛠️"}
              </button>
            </form>

            {/* Toggle System View Link */}
            <div className="mt-6 pt-4 border-t border-stone-50 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
                className="text-stone-500 hover:text-orange-600 font-medium transition-colors underline underline-offset-4"
              >
                {authMode === "login"
                  ? "New to the engine? Initialize account profile"
                  : "Already registered? Mount existing workspace"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  // src/app/page.tsx (Split 3 of 5)
  // PRIMARY DASHBOARD WORKSPACE: Renders seamlessly only when an active user session exists
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans antialiased relative overflow-hidden selection:bg-orange-200 selection:text-orange-900">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c05_1px,transparent_1px),linear-gradient(to_bottom,#ea580c05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-orange-100/40 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Layout */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-orange-100 pb-10 mb-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-orange-700 uppercase bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded">
                v1.0.0 Live
              </span>
              <span className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Active Account:{" "}
                <strong className="text-stone-700 font-bold">
                  {session.email}
                </strong>
              </span>
            </div>
            <h1 className="text-4xl font-black mt-3 tracking-tight text-stone-900">
              STACK<span className="text-orange-600">TRIM</span>
            </h1>
            <p className="text-stone-500 mt-2 text-sm max-w-xl">
              Autonomous cloud cost monitoring engine running agentic AI
              infrastructure diagnostic repairs.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white border border-orange-100/80 p-2.5 rounded-2xl shadow-sm backdrop-blur-md">
            <div className="px-4 py-1">
              <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                Cloud Waste Audit
              </p>
              <p className="text-xl font-black text-stone-900 mt-0.5">
                $0.00{" "}
                <span className="text-xs font-normal text-stone-500">
                  saved
                </span>
              </p>
            </div>
            <div className="w-[1px] h-8 bg-orange-100" />
            <div className="px-4 py-1">
              <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                AI Diagnoses
              </p>
              <p className="text-xl font-black text-orange-600 mt-0.5">
                {
                  projects.filter((p) => p.errorCount && p.errorCount > 0)
                    .length
                }{" "}
                critical
              </p>
            </div>
            <div className="w-[1px] h-8 bg-orange-100" />
            <button
              onClick={() => setSession(null)}
              className="px-3 py-1.5 bg-stone-50 hover:bg-rose-50 border border-stone-200 text-stone-500 hover:text-rose-600 font-mono text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider"
            >
              Logout ✕
            </button>
          </div>
        </header>
        {/* src/app/page.tsx (Split 4 of 5) */}
        {/* Dashboard Clusters Container */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              <h2 className="text-sm font-mono uppercase font-bold tracking-wider text-stone-600">
                Infrastructure Clusters ({projects.length})
              </h2>
            </div>

            <button
              onClick={() => setIsPanelOpen(true)}
              className="relative group overflow-hidden rounded-xl p-[1px] shadow-sm shadow-orange-600/10 hover:shadow-md hover:shadow-orange-600/20 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl" />
              <span className="relative block px-5 py-2.5 rounded-xl bg-white text-sm font-bold text-orange-700 transition-colors group-hover:bg-transparent group-hover:text-white">
                + Connect New App
              </span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-orange-200/80 rounded-2xl bg-white shadow-inner">
              <div className="w-8 h-8 rounded-full border-2 border-orange-100 border-t-orange-500 animate-spin mb-4" />
              <p className="text-xs font-mono text-stone-400 animate-pulse">
                Syncing core network logs...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="relative border border-orange-100 bg-white rounded-2xl p-12 text-center shadow-sm">
              <p className="text-stone-500 font-medium">
                No core infrastructure modules identified.
              </p>
              <p className="text-xs text-stone-400 mt-2 font-mono">
                Open the panel layout link to connect a target stack entry.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="group relative border border-orange-100/70 bg-white rounded-2xl p-6 shadow-sm shadow-orange-100/30 transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-200/40 hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 tracking-tight group-hover:text-orange-600 transition-colors duration-200 truncate max-w-[200px]">
                          {project.name}
                        </h3>
                        <p className="text-[11px] font-mono text-stone-400 mt-1">
                          ID:{" "}
                          {project._id
                            ? project._id.substring(0, 8)
                            : "loading"}
                          ...
                        </p>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100 bg-[#FFFDF9] text-orange-800 uppercase tracking-wider">
                        {project.cloudProvider}
                      </span>
                    </div>

                    {/* Infrastructure Auditing Visual Analytics */}
                    <div className="space-y-3.5 border-t border-stone-50 pt-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[#FFFDF9] border border-orange-100/50 p-2 rounded-xl">
                          <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                            Avg Latency
                          </p>
                          <p className="text-sm font-black text-stone-800 mt-0.5">
                            {project.avgExecutionTime
                              ? `${Math.round(project.avgExecutionTime)}ms`
                              : "0ms"}
                          </p>
                        </div>
                        <div className="bg-[#FFFDF9] border border-orange-100/50 p-2 rounded-xl">
                          <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                            Matured Bill
                          </p>
                          <p className="text-sm font-black text-orange-600 mt-0.5">
                            {project.totalComputeCost
                              ? `$${project.totalComputeCost.toFixed(4)}`
                              : "\$0.0000"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                          <span className="text-stone-400">
                            ANOMALY LOG DETECTIONS
                          </span>
                          <span
                            className={
                              project.errorCount && project.errorCount > 0
                                ? "text-rose-600 font-black animate-pulse"
                                : "text-emerald-600 font-bold"
                            }
                          >
                            {project.errorCount && project.errorCount > 0
                              ? `${project.errorCount} CRASHES`
                              : "NO ISSUES"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden p-[1px] border border-stone-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${project.errorCount && project.errorCount > 0 ? "bg-rose-500" : "bg-gradient-to-r from-orange-400 to-amber-500"}`}
                            style={{
                              width:
                                project.errorCount && project.errorCount > 0
                                  ? `${Math.min(project.errorCount * 15, 100)}%`
                                  : "100%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interceptive Trigger Actions Wrapper */}
                  <div className="border-t border-stone-50 pt-3 mt-4 space-y-2">
                    <button
                      onClick={() => handleRunAIAudit(project)}
                      className="w-full bg-stone-900 hover:bg-orange-600 text-white font-mono text-[11px] font-bold py-2 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      ⚡ Run AI Diagnosis
                    </button>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-1">
                      <span>
                        LOAD_REF:{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 font-bold uppercase">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* src/app/page.tsx (Split 5 of 6) */}
        {/* ========================================================= */}
        {/* INTERACTIVE FORM DRAWER POPUP PANEL (RIGHT SLIDE)        */}
        {/* ========================================================= */}
        <div
          className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ease-in-out ${isPanelOpen ? "visible" : "invisible pointer-events-none"}`}
        >
          <div
            onClick={() => setIsPanelOpen(false)}
            className={`absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity duration-500 ${isPanelOpen ? "opacity-100" : "opacity-0"}`}
          />
          <div
            className={`relative w-full max-w-md bg-white border-l border-orange-100 shadow-2xl h-full p-8 flex flex-col justify-between z-10 transform transition-transform duration-500 ease-in-out ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div>
              <div className="flex justify-between items-center border-b border-orange-50 pb-5 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Connect Cluster Stack
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 font-mono">
                    PROVISION_NODE_HANDSHAKE
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="w-8 h-8 rounded-lg bg-stone-50 hover:bg-orange-50 border border-stone-200/60 text-stone-500 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 font-mono">
                    ERROR // {formError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Application Identifier Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Production API Gateway"
                    className="w-full bg-[#FFFDF9] border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-stone-800 transition-colors shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Cloud Core Infrastructure Host
                  </label>
                  <select
                    value={formData.cloudProvider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cloudProvider: e.target.value,
                      })
                    }
                    className="w-full bg-[#FFFDF9] border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-stone-800 transition-colors shadow-sm"
                  >
                    <option value="vercel">Vercel Edge Network</option>
                    <option value="aws">Amazon Web Services (AWS)</option>
                    <option value="netlify">Netlify Edge Serverless</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-orange-600/10 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center"
                >
                  {submitting
                    ? "Establishing Data Link..."
                    : "Initialize Core Metrics Audit"}
                </button>
              </form>
            </div>
            <div className="text-[10px] font-mono text-stone-400 border-t border-stone-50 pt-4 text-center">
              SECURE TLS CONNECTION // STACKTRIM COST ENGINE
            </div>
          </div>
        </div>
        {/* src/app/page.tsx (Split 6 of 6) */}
        {/* ========================================================= */}
        {/* ADVANCED AI DIAGNOSTIC TERMINAL PANEL (LEFT SLIDE)       */}
        {/* ========================================================= */}
        <div
          className={`fixed inset-0 z-50 flex justify-start transition-all duration-500 ease-in-out ${isAIPanelOpen ? "visible" : "invisible pointer-events-none"}`}
        >
          <div
            onClick={() => setIsAIPanelOpen(false)}
            className={`absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity duration-500 ${isAIPanelOpen ? "opacity-100" : "opacity-0"}`}
          />
          <div
            className={`relative w-full max-w-2xl bg-white border-r border-orange-100 shadow-2xl h-full p-8 flex flex-col justify-between z-10 transform transition-transform duration-500 ease-in-out ${isAIPanelOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex flex-col h-full overflow-y-auto pr-2 space-y-6">
              <div className="flex justify-between items-center border-b border-orange-50 pb-5">
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    AI Remediation Engine{" "}
                    <span className="text-orange-600">// Audit</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-mono">
                    TARGET: {selectedProject?.name || "Unknown Cluster"}
                  </p>
                </div>
                <button
                  onClick={() => setIsAIPanelOpen(false)}
                  className="w-8 h-8 rounded-lg bg-stone-50 hover:bg-orange-50 border border-stone-200/60 text-stone-500 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {loadingAI ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin" />
                  <p className="text-xs font-mono font-bold text-orange-600 animate-pulse uppercase tracking-widest">
                    Compiling Architecture Logs...
                  </p>
                </div>
              ) : aiReport ? (
                <div className="space-y-6">
                  {/* Performance Health Gauge Score Card */}
                  <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FFFDF9] border border-orange-100/70">
                    <div
                      className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border font-mono ${
                        aiReport.score < 70
                          ? "bg-rose-50 border-rose-200 text-rose-600"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      <span className="text-2xl font-black">
                        {aiReport.score}
                      </span>
                      <span className="text-[8px] font-bold tracking-wider -mt-1 uppercase">
                        Score
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        Infrastructure Health Status
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {aiReport.score < 70
                          ? "Severe optimization bottlenecks detected. Structural repairs required immediately."
                          : "Application is stable. Minor optimization recommendations generated below."}
                      </p>
                    </div>
                  </div>

                  {/* Written Technical Breakdown Text */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
                      AI Systems Diagnosis
                    </h4>
                    <p className="text-sm text-stone-600 leading-relaxed bg-stone-50/60 p-4 rounded-xl border border-stone-100">
                      {aiReport.diagnosis}
                    </p>
                  </div>

                  {/* Clean Technical Terminal Code Box Fix */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
                      Automated Remediation Patch
                    </h4>
                    <div className="bg-stone-900 rounded-xl overflow-hidden shadow-inner flex-1 font-mono text-xs flex flex-col">
                      <div className="bg-stone-950 px-4 py-2 flex items-center justify-between border-b border-stone-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] text-stone-500 ml-1">
                            patch_fix.ts
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                          AI Code Repair
                        </span>
                      </div>
                      <pre className="p-4 text-orange-100/90 overflow-x-auto whitespace-pre leading-relaxed select-all max-h-[350px]">
                        {aiReport.remediationCode}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-400 font-mono">
                  Failed to fetch architecture report node payload.
                </p>
              )}
            </div>

            <div className="text-[10px] font-mono text-stone-400 border-t border-stone-50 pt-4 text-center mt-auto">
              AGENTIC AUDIT CHANNEL // SECURE SYSDIAG LAYER
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
