// src/app/page.tsx (Segment 1 of 3)
"use client";

import { useEffect, useState } from "react";

interface Project {
  _id: string;
  name: string;
  cloudProvider: string;
  status: string;
  createdAt: string;
}

export default function InteractiveDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive UI Form Panel States
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cloudProvider: "vercel",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch all registered cloud projects from our internal API endpoint
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
    fetchProjects();
  }, []);

  // Handle Form Submission Data Transmission
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
  // src/app/page.tsx (Segment 2 of 3)
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans antialiased relative overflow-hidden selection:bg-orange-200 selection:text-orange-900">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c05_1px,transparent_1px),linear-gradient(to_bottom,#ea580c05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-orange-100/40 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Layout */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-orange-100 pb-10 mb-12">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-orange-700 uppercase bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded">
                v1.0.0 Live
              </span>
            </div>
            <h1 className="text-4xl font-black mt-3 tracking-tight text-stone-900">
              STACK<span className="text-orange-600">TRIM</span>
            </h1>
            <p className="text-stone-500 mt-2 text-sm max-w-xl">
              Autonomous cloud cost monitoring engine running agentic AI
              diagnostic code repairs.
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
                0 ready
              </p>
            </div>
          </div>
        </header>
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
                          ID: {project._id.substring(0, 8)}...
                        </p>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100 bg-[#FFFDF9] text-orange-800 uppercase tracking-wider">
                        {project.cloudProvider}
                      </span>
                    </div>

                    <div className="space-y-3 border-t border-stone-50 pt-4 mb-5">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono font-bold text-stone-400 mb-1">
                          <span>RESOURCE UTILIZATION</span>
                          <span className="text-orange-600">OPTIMAL</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden p-[1px] border border-stone-100">
                          <div className="w-[78%] h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono border-t border-stone-50 pt-4 mt-auto">
                    <span className="text-stone-400">
                      SYS_LOAD:{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/40 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* INTERACTIVE FORM DRAWER POPUP PANEL */}
        <div
          className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ease-in-out ${isPanelOpen ? "visible" : "invisible pointer-events-none"}`}
        >
          {/* Backdrop Shadow overlay blur */}
          <div
            onClick={() => setIsPanelOpen(false)}
            className={`absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity duration-500 ${isPanelOpen ? "opacity-100" : "opacity-0"}`}
          />

          {/* Sliding Glass Container Form */}
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
      </div>
    </main>
  );
}
