# Fuel IoT Platform Monorepo

Industrial offline-first fuel dispensing SaaS for desktop, web, cloud, and simulated IoT devices.

## Architecture Goals

- Multi-tenant cloud backend
- Offline-first Electron desktop operations
- Hardware-independent pump abstraction
- Shared TypeScript packages across apps
- Queue-based sync and conflict-safe replication

## Initial Monorepo Layout

```txt
fuel-iot-platform/
├── apps/
│   ├── backend-api/
│   ├── desktop-app/
│   ├── device-simulator/
│   └── web-dashboard/
├── packages/
│   ├── analytics-engine/
│   ├── auth/
│   ├── billing-engine/
│   ├── device-core/
│   ├── shared-types/
│   ├── sync-engine/
│   └── ui/
├── turbo.json
├── tsconfig.base.json
└── package.json
```

## Architecture Principles

- Loose coupling through interfaces
- Dependency injection for services and device adapters
- Feature-based folder structure inside each app/package
- No direct hardware dependencies from UI layers
- Local-first data flow with background synchronization

## Roadmap

1. Monorepo and folder architecture
2. Shared types, UI primitives, and core device contracts
3. Backend API, Prisma schema, and auth
4. Electron desktop shell with IPC and local SQLite
5. Sync engine, MQTT integration, and device simulator
6. Billing, analytics, reporting, and tenant-aware operations

