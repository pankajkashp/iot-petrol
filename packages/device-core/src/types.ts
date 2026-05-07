export type PumpStatus = "idle" | "dispensing" | "offline" | "error";

export interface PumpReading {
  id: string;
  pumpId: string;
  fuelType: "petrol" | "diesel" | "cng";
  status: PumpStatus;
  liters: number;
  revenue: number;
  createdAt: string;
}

export interface PumpDeviceStatus {
  pumpId: string;
  connected: boolean;
  status: PumpStatus;
  lastSeenAt: string;
}

export interface PumpDevice {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): Promise<PumpDeviceStatus>;
  getReading(): Promise<PumpReading>;
}

export interface PumpDeviceConfig {
  pumpId: string;
  pumpName: string;
  fuelType: PumpReading["fuelType"];
  pricePerLiter: number;
}

export type PumpDeviceEventType =
  | "pump:started"
  | "pump:stopped"
  | "pump:reading"
  | "device:online"
  | "device:offline"
  | "device:error";

export interface PumpDeviceEvent {
  type: PumpDeviceEventType;
  pumpId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
