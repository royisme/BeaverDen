export interface Backend {
    getBackendUrl: () => Promise<string>;
    getDeviceInfo: () => Promise<DeviceInfo>;
    getSystemInitStatus: () => Promise<SystemInitStatus>; 
}

interface ElectronLogAPI {
  error: (...args: any[]) => Promise<void>;
  warn: (...args: any[]) => Promise<void>;
  info: (...args: any[]) => Promise<void>;
  debug: (...args: any[]) => Promise<void>;
}

interface ElectronAPI {
  log: ElectronLogAPI;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    backend: Backend;
  }
}