import { MockPumpDevice, type PumpDevice, type PumpDeviceConfig } from "@fuel/device-core";

export interface SimulatorPumpConfig extends PumpDeviceConfig {
  nozzle: string;
}

export class PumpSimulatorService {
  createDevice(config: SimulatorPumpConfig): PumpDevice {
    return new MockPumpDevice(config);
  }
}
