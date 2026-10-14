# StackTrim ⚡

An elite, open-source, full-stack **Cloud Cost Auditor & Agentic AI Infrastructure Optimizer** built from the ground up using **Next.js 15+**, **TypeScript**, and **MongoDB Atlas**.

**StackTrim** automatically ingests multi-module cloud provider metrics, processes them via performance-optimized database aggregation pipelines, diagnoses serverless execution bottlenecks, and generates precise, deployment-ready architectural code repair patches.

---

## ⚡ Architectural Core & Features

- **Singleton Connection Architecture:** Features a production-grade database pooling wrapper (`src/lib/mongodb.ts`) designed specifically for serverless/edge runtimes to enforce strict resource caps and eliminate connection pool leaks.
- **High-Speed Relational Aggregation:** Employs native **MongoDB Aggregation Pipelines** (`$lookup`, `$sum`, `$avg`) to execute telemetry analytics directly within the database tier, minimizing network payload latency.
- **Agentic AI Diagnostic Engine:** Evaluates performance anomalies (such as latency spikes and cold-start execution exceptions) to produce structured remediation blueprints and syntax-highlighted code patches.
- **Futuristic Light Crème & Orange UI:** A premium, bespoke developer interface styled with Tailwind CSS, utilizing advanced global state controls and dynamic dual-sliding animated panel workflows.
- **Permissive MIT Licensing:** Fully modularized and structured under the MIT license, encouraging rapid community forks, modifications, and startup optimization rollouts.

---

## 📂 System Folder Map

```text
stacktrim/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-diagnose/
│   │   │   │   └── route.ts       # Backend AI Diagnostic API Route
│   │   │   ├── projects/
│   │   │   │   └── route.ts       # Projects CRUD API & Aggregation Pipeline
│   │   │   └── seed-metrics/
│   │   │       └── route.ts       # Time-Series Telemetry Seeding Engine
│   │   ├── layout.tsx             # Global Application Template Layout
│   │   └── page.tsx               # Primary Cyberpunk Light UI Control Board
│   ├── lib/
│   │   └── mongodb.ts             # Cached Singleton Database Driver Wrapper
│   └── types/
│       ├── metric.ts              # Time-Series Telemetry Interface Contract
│       └── project.ts             # Master Cluster Document Schema Model
├── .env.local                     # Secure Environment Key Repository (Git-Ignored)
├── package.json                   # Core System Dependency Manifest
└── tsconfig.json                  # Low-Level TypeScript Path Configurations
```

---

## ⚙️ Quick Installation & Deployment

### 1. Clone the Workspace Ecosystem

```bash
git clone https://github.com/YOUR_USERNAME/stacktrim.git
cd stacktrim
```

### 2. Install Underlying Package Modules

```bash
npm install
```

### 3. Establish Private Environment Vault

Create a `.env.local` file directly inside the root directory and supply your cluster keys:

```text
# Secure Environment Container Keys
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stacktrim?retryWrites=true&w=majority
OPENAI_API_KEY=sk-mock-developer-token-key-sandbox
```

_(Note: If utilizing a mock placeholder key, the engine intelligently diverts to the internal AI simulation suite, allowing full-stack testing for free)._

### 4. Ignite the Local Development Server

```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser window to interact with the system workspace.

---

## 🧪 Verification & Telemetry Testing

1.  **Mount a New Cluster Node:** Click **`+ Connect New App`** within the UI control panel, enter an identifier name (e.g., `Production API Gateway`), select your infrastructure provider, and click **Initialize**.
2.  **Seed Time-Series Metrics:** Grab the 24-character hex ID string generated inside your MongoDB Atlas collection console and hit your endpoint to trigger the log simulator via cURL or a REST client:
    ```bash
    # Using standard JSON payloads to mock 50 real cloud telemetry metrics
    POST http://localhost:3000/api/seed-metrics
    Body: { "projectId": "YOUR_FULL_24_CHARACTER_ID" }
    ```
3.  **Run Autonomous Diagnostics:** Click the **`⚡ Run AI Diagnosis`** action link on the project card to slide out the diagnostic terminal and observe the autonomous health score indexing and source-code repairs run live.

---

## 📄 License

Distributed under the highly permissive **MIT License**. See `LICENSE` inside the repository root for definitive details.
