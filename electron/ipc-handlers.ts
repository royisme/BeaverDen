import { ipcMain, app } from 'electron';
import { ConfigManager } from './utils/config-manager';

export function registerIpcHandlers(
  configManager: ConfigManager,
): void {
  // 现有的处理器
  ipcMain.handle('get-runtime-config', async () => {
    const config = await configManager.loadConfig();
    return {
      backendPort: config.backendPort,
      appMode: config.appMode,
    };
  });

  ipcMain.handle('get-version', () => app.getVersion());
  
  ipcMain.handle('get-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: process.versions.electron,
    };
  });

  // 添加日志处理器
  ipcMain.handle('log:error', (_, ...args) => console.error(...args));
  ipcMain.handle('log:warn', (_, ...args) => console.warn(...args));
  ipcMain.handle('log:info', (_, ...args) => console.info(...args));
  ipcMain.handle('log:debug', (_, ...args) => console.debug(...args));
}