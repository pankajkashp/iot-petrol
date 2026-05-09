import type { PumpDeviceStatus, PumpReading } from "../types";

export interface PumpDevice {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): Promise<PumpDeviceStatus>;
  getReading(): Promise<PumpReading>;
  onReading(callback: (reading: PumpReading) => void): () => void;
  onStatusChange(callback: (status: PumpDeviceStatus) => void): () => void;
}
