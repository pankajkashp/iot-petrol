import { DeviceActivityTable } from "../features/devices";

export function DevicesPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Devices</p>
          <h2>Simulator activity</h2>
        </div>
      </header>

      <DeviceActivityTable />
    </section>
  );
}
