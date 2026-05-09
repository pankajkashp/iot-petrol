export const DeviceEventType = {
  PUMP_STARTED: "PUMP_STARTED",
  PUMP_STOPPED: "PUMP_STOPPED",
  FLOW_UPDATED: "FLOW_UPDATED",
  DEVICE_OFFLINE: "DEVICE_OFFLINE",
  DEVICE_ONLINE: "DEVICE_ONLINE",
  DEVICE_ERROR: "DEVICE_ERROR"
} as const;

export type DeviceEventType = (typeof DeviceEventType)[keyof typeof DeviceEventType];

export interface DeviceEventPayload {
  [key: string]: unknown;
}

export interface DeviceEvent {
  type: DeviceEventType;
  pumpId: string;
  timestamp: string;
  payload?: DeviceEventPayload;
}
