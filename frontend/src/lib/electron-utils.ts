import { DeviceInfo } from "@/types/user";
import { SystemInitStatus } from "@/types/system";

export const getBackendUrl = async (): Promise<string> => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8486'; // 使用你配置的默认端口
  }
  if (!window.backend) {
    throw new Error('Electron getBackendUrl API is not available.');
  }
  return window.backend.getBackendUrl();
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  if (import.meta.env.DEV) {
    return {
      deviceId: 'dev-device',
      deviceName: 'Development Machine',
      os: 'Development OS',
      deviceType: 'Desktop',
      model: '2024 Model',
      manufacturer: 'Apple',
      ip: '127.0.0.1',

    };
  }
  if (!window.backend) {
    throw new Error('Electron device API is not available.');
  }
  const deviceInfo = await window.backend.getDeviceInfo();
  
  return deviceInfo;
};

export const getSystemInitStatus = async (): Promise<SystemInitStatus> => {
  if (!window.backend) {
    throw new Error('Electron getSystemInitStatus API is not available.');
  }
  return window.backend.getSystemInitStatus();
};