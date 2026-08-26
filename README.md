# Contract Management — Exception Workbench

**SAP Ariba Contract Obligation & Renewal Exception Workbench**

A single-page enterprise application for Contract Operations Managers to identify, understand, prioritise and resolve contract-related exceptions — powered by transparent data, business rules, risk calculation, and AI-style decision support.

---

## Overview

The status quo in most organisations using SAP Ariba is fragmented reports and manual coordination. This app centralises the entire exception workflow into one workbench:

```
SAP Ariba Contract Data
  → Data Validation
    → Exception Detection
      → Risk / Aging / Value Exposure / Service Impact
        → Prioritised Exception Queue
          → AI Decision Support
            → Recommended Action
              → Manager Action
                → Auditable Resolution Timeline
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| UI Design | SAP Fiori Horizon-inspired (custom CSS) |
| Data | SAP Ariba JSON integration (mock) |
| API | OData V4 (simulated) |
| Auth | Persona-based (SAP IAS simulation) |
| Hosting | SAP BTP Cloud Foundry ready |
| Backend | SAP CAP Node.js (adapter-ready) |
| DB | SAP HANA Cloud / PostgreSQL (adapter-ready) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs on `http://localhost:3000` by default.

---

## Personas & Access

| Role | Access |
|---|---|
| **Contract Operations Manager** | Full workbench — all contracts, all actions, AI support |
| **Contract Owner** | Own contracts only — monitor & initiate renewal |
| **Procurement Manager** | All contracts — assign owners, approve renewals |
| **Legal Compliance Reviewer** | All contracts — flag compliance, escalate legal issues |
| **Approver** | Contracts awaiting approval only |

---

## Core Workflow

The 5 primary manager actions available in the workbench:

1. **Monitor** — Flag contract for active tracking without immediate action
2. **Assign Owner** — Set or reassign contract owner responsibility
3. **Escalate** — Escalate to Procurement Director, Legal, Finance, or Board
4. **Start Renewal** — Initiate SAP Ariba renewal workflow
5. **Resolve** — Close exception with auditable resolution summary

---

## Exception Types Detected

- `EXPIRY_CRITICAL` — Contract expires within 7 days
- `EXPIRY_WARNING` — Contract expires within 30 days
- `RENEWAL_OVERDUE` — Contract has expired with no renewal action
- `RENEWAL_DUE` — Renewal notice date passed, action required
- `OBLIGATION_BREACH` — Vendor obligation not fulfilled
- `SPEND_EXCEEDED` — Actual spend exceeds contracted value
- `COMPLIANCE_GAP` — Regulatory or policy compliance issue detected
- `AWAITING_APPROVAL` — Renewal/change pending approval >7 days
- `AUTO_RENEWAL_RISK` — Contract will auto-renew with unfavourable terms
- `VALUE_EXPOSURE` — High-value contract with unresolved exceptions

---

## AI Decision Support

For every contract, the Insight Engine provides:

- **Recommended Action** with urgency level (Immediate / Today / This Week / Monitor)
- **Confidence Score** (%)
- **Analysis** — Why this recommendation was generated
- **Impact Assessment** — What happens if no action is taken
- **Step-by-step Action Plan** — Concrete next steps for resolution

The AI engine is rule-based (no external API dependency) using:
- Days to expiry
- Contract value exposure
- Exception count and type severity
- Exception aging
- Compliance status
- Owner assignment status

---

## Priority Score Algorithm

Each contract receives a 0–100 priority score:

| Factor | Weight |
|---|---|
| Days to expiry / overdue | 0–50 pts |
| Value exposure | 0–25 pts |
| Exception count × severity | 0–15 pts |
| Exception aging | 0–10 pts |

The exception queue is sorted by this score — the most urgent contracts always appear first.

---

## Project Structure

```
src/
├── data/
│   ├── contracts.json       # 14 SAP Ariba contract records
│   └── users.json           # 5 persona definitions
├── utils/
│   └── contractUtils.js     # Risk calc, AI engine, formatters
├── context/
│   ├── AuthContext.jsx      # Auth state & persona login
│   └── ContractContext.jsx  # Contract state & actions
├── components/
│   ├── auth/
│   │   └── LoginScreen.jsx
│   ├── layout/
│   │   └── Header.jsx
│   ├── dashboard/
│   │   ├── KPICards.jsx
│   │   └── AnalyticsView.jsx
│   ├── workbench/
│   │   ├── WorkbenchView.jsx    # Main workbench shell
│   │   ├── ExceptionQueue.jsx   # Priority queue (left panel)
│   │   ├── ContractDetail.jsx   # Contract detail (right panel)
│   │   ├── AIDecisionPanel.jsx  # AI recommendation panel
│   │   ├── ActionPanel.jsx      # 5 manager action buttons + modals
│   │   └── AuditTimeline.jsx    # Auditable resolution trail
│   └── shared/
│       ├── StatusBadge.jsx
│       └── Modal.jsx
├── App.jsx                  # SPA routing & view switching
├── main.jsx                 # React root
└── styles.css               # SAP Fiori-inspired design system
```

---

## Sample Contract Data

The example data from the brief is included as `CNT-460069`:

```json
{
  "companyCode": "1400",
  "plant": "1106",
  "storageLocation": "SL16",
  "costCentre": "CC-2269",
  "material": "Smart Meter SM-8",
  "businessPartner": "Cobalt Engineering",
  "document": "SRV-460069",
  "amount": 107375,
  "currency": "GBP",
  "requestedDate": "2026-09-14",
  "status": "AWAITING_APPROVAL"
}
```

---

## Responsive Layout

| Breakpoint | Layout |
|---|---|
| Desktop (>1200px) | Full 2-column workbench (queue + detail) |
| Tablet (768–1200px) | Stacked panels, full-width |
| Mobile (<768px) | Queue-first, detail on selection |

---

## Extending for Production

To connect to real SAP Ariba:

1. Replace `src/data/contracts.json` with OData V4 API calls to SAP Ariba
2. Implement `ContractContext.jsx` data fetching via `@sap/cds-client` or `fetch`
3. Replace `AuthContext.jsx` with `@sap/cloud-sdk` or SAP IAS token flow
4. Deploy to SAP BTP Cloud Foundry with `cf push`

---

*Built with SAP Fiori design principles. No UI5/Fiori Elements library required for this MVP.*
