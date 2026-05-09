import type { FuelPrice, FuelPriceUpdate, FuelType } from "@fuel/shared-types";

export interface FuelPriceProvider {
  name: string;
  fetchPrices(city: string): Promise<FuelPriceUpdate>;
}

export class MockFuelPriceProvider implements FuelPriceProvider {
  name = "MockProvider";

  async fetchPrices(city: string): Promise<FuelPriceUpdate> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      city,
      prices: [
        { fuelType: "petrol", price: 106.0 + Math.random() * 5 },
        { fuelType: "diesel", price: 90.0 + Math.random() * 5 },
        { fuelType: "cng", price: 72.0 + Math.random() * 5 },
      ],
    };
  }
}

export interface FuelPriceCache {
  getPrices(city: string): Promise<FuelPrice[]>;
  savePrices(prices: FuelPrice[]): Promise<void>;
  getPriceHistory(fuelType: FuelType, city: string, limit?: number): Promise<FuelPrice[]>;
}

export class FuelPriceService {
  constructor(
    private readonly provider: FuelPriceProvider,
    private readonly cache: FuelPriceCache
  ) {}

  async getPrices(city: string, forceRefresh = false): Promise<FuelPrice[]> {
    if (!forceRefresh) {
      const cached = await this.cache.getPrices(city);
      if (cached.length > 0) {
        return cached;
      }
    }

    try {
      const update = await this.provider.fetchPrices(city);
      const now = new Date().toISOString();
      const prices: FuelPrice[] = update.prices.map((p) => ({
        ...p,
        city: update.city,
        provider: this.provider.name,
        updatedAt: now,
      }));

      await this.cache.savePrices(prices);
      return prices;
    } catch (error) {
      console.error(`Failed to fetch fuel prices from ${this.provider.name}:`, error);
      // Fallback to cache if offline
      return this.cache.getPrices(city);
    }
  }

  async getPriceHistory(fuelType: FuelType, city: string, limit = 10) {
    return this.cache.getPriceHistory(fuelType, city, limit);
  }
}
