import { useEffect, useState } from "react";
import { resolveDesktopApi } from "../../services/desktopApi";
import type { FuelPrice } from "@fuel/device-core";

const cities = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"];

export function FuelPriceWidget() {
  const api = resolveDesktopApi();
  const [city, setCity] = useState(cities[0]!);
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPrices = async (refresh = false) => {
    setLoading(true);
    try {
      const data = await api.getFuelPrices(city, refresh);
      setPrices(data);
    } catch (error) {
      console.error("Failed to load fuel prices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPrices();
  }, [city]);

  return (
    <div className="fuel-price-widget">
      <div className="widget-header">
        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          className="city-select"
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button 
          type="button" 
          onClick={() => void fetchPrices(true)}
          disabled={loading}
          className="refresh-mini"
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>
      
      <div className="price-list">
        {prices.map((p) => (
          <div key={p.fuelType} className="price-item">
            <span className="fuel-label">{p.fuelType.toUpperCase()}</span>
            <div className="price-value-container">
               <span className="currency">₹</span>
               <span className="price-value">{p.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {prices.length > 0 && (
        <div className="widget-footer">
          <span>Source: {prices[0]?.provider}</span>
          <span>Last updated: {new Date(prices[0]?.updatedAt || "").toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}
