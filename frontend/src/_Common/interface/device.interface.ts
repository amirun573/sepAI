import { DeviceHealthyCondition } from "../enum/device.enum";

export interface DeviceCondition {
  battery_level: number;
  cpu_usage: string;
  disk_usage: string;
  memory_usage: string;
  status: DeviceHealthyCondition;
  temperature: number;
}

export interface DeviceSpecification {
  cpu: string;
  model: string;
  name: string;
  os: string;
  ram: string;
  storage: string;
}
