import { PumpInventoryTable } from "../features/pumps";

export function PumpsPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Pumps</p>
          <h2>Pump inventory</h2>
        </div>
      </header>

      <PumpInventoryTable />
    </section>
  );
}
