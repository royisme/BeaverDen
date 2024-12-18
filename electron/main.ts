// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import { spawn } from 'child_process'
import * as path from 'path'
import { ConfigManager } from './utils/config-manager'
import { SecurityService } from './utils/security-service'
class MainProcess {
  private mainWindow: BrowserWindow | null = null;
  private pythonProcess: any = null;
  private configManager: ConfigManager;
  private securityService: SecurityService;
  constructor() {
    this.configManager = new ConfigManager();
    this.securityService = new SecurityService(this.configManager);
    this.initApp();
  }

  private async initApp() {
    try {
      await app.whenReady();
      
      // 初始化配置（包含端口分配）
      await this.configManager.initialize();
      await this.securityService.initialize();
      this.setupIpcHandlers();

      // 启动后端服务
      await this.startPythonBackend();
      await this.waitForSystemInitialization();

      // 创建主窗口
      await this.createMainWindow();
      
      this.registerAppEvents();
    } catch (error) {
      console.error('Application initialization failed:', error);
      app.quit();
    }
  }

  private async startPythonBackend() {
    const configPath = this.configManager.getConfigPath();
    const userDataPath = app.getPath('userData');

    const pythonPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'backend')
      : path.join(__dirname, '../backend');
    process.env.ELECTRON_USER_DATA_PATH = userDataPath;

    this.pythonProcess = spawn('python', [
      path.join(pythonPath, 'main.py'),
      '--config',
      configPath
    ]);

    this.pythonProcess.stdout.on('data', (data: any) => {
      console.log(`Backend: ${data}`);
    });

    this.pythonProcess.stderr.on('data', (data: any) => {
      console.error(`Backend Error: ${data}`);
    });

    // 等待后端启动
    const config = await this.configManager.loadConfig();
    await this.waitForBackend(config.backendPort);
    // 检查数据库初始化状态
    const response = await fetch(`http://localhost:${config.backendPort}/api/v1/system/init-status`);
    if (!response.ok) {
      throw new Error('Database initialization failed');
    }
  }

  private async waitForBackend(port: number): Promise<void> {
    const maxRetries = 30;
    const retryInterval = 100;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        if (response.ok) return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
    throw new Error('Backend failed to start');
  }

  private async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    const config = await this.configManager.loadConfig();

    // 注入后端 URL 到渲染进程
    await this.mainWindow.webContents.executeJavaScript(`
      window.BACKEND_URL = "http://localhost:${config.backendPort}";
    `);

    if (config.appMode === 'development') {
      await this.mainWindow.loadURL('http://localhost:5173');
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  }

  private registerAppEvents() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });

    app.on('quit', () => {
      if (this.pythonProcess) {
        this.pythonProcess.kill();
      }
    });
  }
  private setupIpcHandlers() {
    // 提供运行时配置
    ipcMain.handle('get-runtime-config', async () => {
      const config = await this.configManager.loadConfig();
      return {
        backendPort: config.backendPort,
        appMode: config.appMode
      };
    });

    // 其他IPC处理程序...
    ipcMain.handle('get-version', () => app.getVersion());
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        electronVersion: process.versions.electron
      };
    });
  }

  private async waitForSystemInitialization(): Promise<void> {
    const config = await this.configManager.loadConfig();
    const maxRetries = 30;
    const retryInterval = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        // 首先检查健康状态
        const healthResponse = await fetch(`http://localhost:${config.backendPort}/api/v1/health`);
        if (!healthResponse.ok) {
          throw new Error('Health check failed');
        }

        // 然后检查系统初始化状态
        const initResponse = await fetch(`http://localhost:${config.backendPort}/api/v1/system/init-status`);
        const status = await initResponse.json();

        if (status.initialized && status.database_connected) {
          console.log('System initialization completed successfully');
          return;
        }

        console.log('Waiting for system initialization...', status);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      } catch (error) {
        console.warn('Initialization check failed, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
    
    throw new Error('System initialization timeout');
  }
}

new MainProcess();