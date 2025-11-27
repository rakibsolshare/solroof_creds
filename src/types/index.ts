export interface Inverter {
  serial?: string;
  ip?: string;
  username?: string;
  password?: string;
  wpaPsk?: string;
  size?: string;
  brand?: string;
}

export interface SolarPlant {
  id?: string;
  name: string;
  address?: string;
  capacityKW?: number;
  // Legacy single inverter fields (optional, kept for backward compatibility)
  inverterSerial?: string;
  inverterIp?: string;
  inverterUsername?: string;
  inverterPassword?: string;
  // New multiple inverters support
  inverters?: Inverter[];

  wifiSsid?: string;
  wifiPassword?: string;
  dataLoggerUsername?: string;
  dataLoggerPassword?: string;
  notes?: string;
  createdAt?: number;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id?: string;
  username: string;
  password?: string; // Note: In production, use proper password hashing
  role: UserRole;
  allowedPlants?: string[]; // Array of plant IDs the user can access. Empty/undefined = all plants
  createdAt?: number;
}
