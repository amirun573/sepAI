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
  cpu_logical_threads: number;
  cpu_physcial_cores: number;
}

export interface GPUDetails {
  load_percent: number;
  memory_free_MB: string;
  memory_total_MB: string;
  memory_used_MB: string;
  name: string;
  temperature: number;
}
