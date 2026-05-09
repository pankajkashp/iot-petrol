import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../../store/useDashboardStore";

export function PumpInventoryTable() {
  const pumps = useDashboardStore((state) => state.pumps);
  const navigate = useNavigate();

  return (
    <div className="table-card">
      {pumps.map((pump) => (
        <div 
          className="table-row" 
          key={pump.pumpId} 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate(`/pumps/${pump.pumpId}`)}
        >
          <div>
            <strong>{pump.pumpName}</strong>
            <p>{pump.nozzle}</p>
          </div>
          <div>{pump.fuelType.toUpperCase()}</div>
          <div style={{ textTransform: 'capitalize' }}>{pump.status}</div>
          <div>₹{pump.pricePerLiter.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
