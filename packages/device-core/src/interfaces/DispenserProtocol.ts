import { EventEmitter } from "node:events";
import type { FuelType, PumpStatus } from "@fuel/shared-types";

export interface DispensingUpdate {
  pumpId: string;
  liters: number;
  totalAmount: number;
  flowRate: number;
  durationSeconds: number;
}

/**
 * Hardware Abstraction Layer Interface
 * All physical dispensers (RS232, TCP, etc.) must implement this
 */
export interface DispenserProtocol extends EventEmitter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Events:
  // 'nozzle_lifted' (pumpId: string)
  // 'dispensing_update' (update: DispensingUpdate)
  // 'nozzle_replaced' (pumpId: string, finalLiters: number, finalAmount: number)
  // 'error' (pumpId: string, message: string)
}

/**
 * Realistic Mock Implementation for Simulation
 */
export class MockDispenserProtocol extends EventEmitter implements DispenserProtocol {
  private intervals = new Map<string, NodeJS.Timeout>();
  private activeSessions = new Map<string, {
    liters: number;
    amount: number;
    startTime: number;
    price: number;
  }>();

  constructor(private readonly pumpConfigs: Array<{ id: string, price: number }>) {
    super();
  }

  async connect(): Promise<void> {
    console.log("[MockDispenser] Connected to forecourt simulator");
    this.startAutoSimulator();
  }

  async disconnect(): Promise<void> {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  private startAutoSimulator() {
    // Randomly lift nozzles for different pumps
    setInterval(() => {
      const randomPump = this.pumpConfigs[Math.floor(Math.random() * this.pumpConfigs.length)];
      if (randomPump && !this.activeSessions.has(randomPump.id) && Math.random() < 0.1) {
        this.simulateTransaction(randomPump.id, randomPump.price);
      }
    }, 2000);
  }

  private simulateTransaction(pumpId: string, price: number) {
    this.emit("nozzle_lifted", pumpId);

    const session = {
      liters: 0,
      amount: 0,
      startTime: Date.now(),
      price
    };
    this.activeSessions.set(pumpId, session);

    const durationSeconds = 10 + Math.floor(Math.random() * 20);
    let ticks = 0;

    const interval = setInterval(() => {
      ticks++;
      
      const flowRate = 1.5 + Math.random() * 2.0;
      session.liters += flowRate;
      session.amount = Number((session.liters * session.price).toFixed(2));

      this.emit("dispensing_update", {
        pumpId,
        liters: Number(session.liters.toFixed(2)),
        totalAmount: session.amount,
        flowRate,
        durationSeconds: Math.floor((Date.now() - session.startTime) / 1000)
      });

      if (ticks >= durationSeconds) {
        clearInterval(interval);
        this.intervals.delete(pumpId);
        this.activeSessions.delete(pumpId);
        this.emit("nozzle_replaced", pumpId, session.liters, session.amount);
      }
    }, 1000);

    this.intervals.set(pumpId, interval);
  }
}
