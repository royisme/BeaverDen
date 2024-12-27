// preload.ts
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'
import { getFullDeviceInfo } from './utils/helpers'
console.log('Preload script is running');

// 定义 API 接口
const backendAPI = {
  getBackendUrl: async () => {
    const config = await ipcRenderer.invoke('get-runtime-config');
    return `http://localhost:${config.backendPort}`;
  },
  getDeviceInfo: getFullDeviceInfo,
  getSystemInitStatus: async () => {
    // 获取后端URL
    const config = await ipcRenderer.invoke('get-runtime-config');
    const backendUrl = `http://localhost:${config.backendPort}`;
    const response = await fetch(`${backendUrl}/api/v1/system/init-status`);
    if (!response.ok) {
      throw new Error('Failed to get system status');
    }
    return response.json();
  }
};

// 定义日志 API
const logAPI = {
  error: (...args: any[]) => ipcRenderer.invoke('log:error', ...args),
  warn: (...args: any[]) => ipcRenderer.invoke('log:warn', ...args),
  info: (...args: any[]) => ipcRenderer.invoke('log:info', ...args),
  debug: (...args: any[]) => ipcRenderer.invoke('log:debug', ...args),
};

// 暴露 API 到 window 对象
contextBridge.exposeInMainWorld('backend', backendAPI);
contextBridge.exposeInMainWorld('electron', { log: logAPI });
console.log('APIs exposed:', {
  backend: backendAPI,
  electron: { log: logAPI }
});