import { contextBridge, ipcRenderer } from 'electron'

// 等待获取后端URL的Promise
const getBackendUrl = async () => {
  const config = await ipcRenderer.invoke('get-runtime-config');
  return `http://localhost:${config.backendPort}`;
};

// 状态检查函数
const checkSystemStatus = async () => {
  const backendUrl = await getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/system/init-status`);
  return response.json();
};

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('backend', {
  // 调用后端API的通用方法
  api: async (endpoint: string, method: string = 'GET', data?: any) => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await fetch(`${backendUrl}/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include' // 支持跨域认证
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 系统状态检查
  system: {
    // 获取应用版本
    getVersion: () => ipcRenderer.invoke('get-version'),
    // 检查系统状态
    checkStatus: checkSystemStatus,
    // 检查更新
    checkForUpdates: () => ipcRenderer.invoke('check-updates'),
    // 获取系统信息
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  }
});