import type { PumpDevice } from "../interfaces/PumpDevice";
import type { DeviceEvent } from "../events/deviceEvents";
import { DeviceEventType } from "../events/deviceEvents";
import type { PumpReading } from "../types";

export interface SensorFeedListener {
  onEvent(event: DeviceEvent): void;
  onReading(reading: PumpReading): void;
}

export class SensorFeedSimulator {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly device: PumpDevice,
    private readonly pumpId: string,
    private readonly listener: SensorFeedListener
  ) {}

  start() {
    if (this.timer) {
      return;
    }

    void this.tick();
    this.timer = setInterval(() => {
      void this.tick();
    }, 2500);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick() {
    const reading = await this.device.getReading();
    this.listener.onEvent({
      type: DeviceEventType.FLOW_UPDATED,
      pumpId: this.pumpId,
      timestamp: reading.createdAt,
      payload: {
        liters: reading.liters,
        revenue: reading.revenue,
        status: reading.status
      }
    });
    this.listener.onReading(reading);
  }
}
