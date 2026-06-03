# ⛽ Fuel IoT Platform

<p align="center">
  <strong>Offline-first industrial fuel management platform with Electron desktop control and modular IoT device abstractions.</strong>
</p>

---

## 🚀 Project Summary

**Fuel IoT Platform** is a TypeScript monorepo designed to connect fuel pump hardware, local desktop control, and reusable package logic in a single product architecture.

This repository is built for industrial forecourt automation, providing a resilient edge application that can operate reliably with intermittent connectivity.

---

## 🔥 Core Capabilities

- **Electron desktop controller** for station operations
- **Offline persistence** using SQLite and `better-sqlite3`
- **Hardware-agnostic device layer** with `@fuel/device-core`
- **Shared TypeScript contracts** via `@fuel/shared-types`
- **Billing and transaction logic** in `@fuel/billing-engine`
- **Monorepo orchestration** powered by Turborepo

---

## 🏗️ Repository Structure

```txt
fuel-iot-platform/
├── apps/
│   └── desktop-app/        # Electron + Vite + React station controller
├── packages/
│   ├── billing-engine/     # Transaction and billing logic
│   ├── device-core/        # Pump device adapters and protocol contracts
│   └── shared-types/       # Shared TypeScript interfaces and domain types
└── package.json            # Turborepo workspace configuration
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo** | Turborepo, npm workspaces |
| **Desktop App** | Electron, Vite, React, TypeScript |
| **UI** | Tailwind CSS, Zustand, React Router |
| **Local Storage** | better-sqlite3, SQLite |
| **Platform** | Node.js, TypeScript |
| **Package Architecture** | Shared types, device core, billing engine |

---

## ⚡ Quick Start

```bash
npm install
npm run dev
npm run build
```

---

## 📌 Resume-ready Highlights

- TypeScript monorepo engineering
- Electron desktop application development
- React + Vite frontend architecture
- Tailwind CSS UI styling
- Turborepo workspace optimization
- IoT device abstraction and edge infrastructure

<p align="center">
  Built for dependable fuel station automation and resilient edge-first experiences.
</p>
