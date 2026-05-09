import {
  Esp32PumpDevice,
  MockPumpDevice,
  type PumpDefinition,
  type PumpDevice
} from "@fuel/device-core";

type DeviceMode = "mock" | "esp32";

function resolveDeviceMode(): DeviceMode {
  return process.env.DEVICE_MODE === "esp32" ? "esp32" : "mock";
}

export function createDeviceMap(pumps: PumpDefinition[]): Record<string, PumpDevice> {
  const mode = resolveDeviceMode();

  return Object.fromEntries(
    pumps.map((pump) => {
      const config = {
        pumpId: pump.pumpId,
        pumpName: pump.pumpName,
        fuelType: pump.fuelType,
        pricePerLiter: pump.pricePerLiter
      } as const;

      const device = mode === "esp32" ? new Esp32PumpDevice(config) : new MockPumpDevice(config);
      return [pump.pumpId, device] as const;
    })
  );
}
