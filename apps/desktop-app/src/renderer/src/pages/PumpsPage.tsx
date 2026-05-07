import { useDashboardStore } from "../store/useDashboardStore";

export function PumpsPage() {
  const pumps = useDashboardStore((state) => state.pumps);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Pumps</p>
          <h2>Pump inventory</h2>
        </div>
      </header>

      <div className="table-card">
        {pumps.map((pump) => (
          <div className="table-row" key={pump.id}>
            <div>
              <strong>{pump.name}</strong>
              <p>{pump.nozzle}</p>
            </div>
            <div>{pump.fuelType.toUpperCase()}</div>
            <div>{pump.status}</div>
            <div>₹{pump.pricePerLiter.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
