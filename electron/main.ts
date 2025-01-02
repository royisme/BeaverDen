// electron/main.ts
import { app, BrowserWindow } from 'electron'
import { spawn, exec } from 'child_process'
import * as path from 'path'
import { ConfigManager } from './utils/config-manager'
import { SecurityService } from './utils/security-service'
import { registerIpcHandlers } from './ipc-handlers'
import { SystemStatus } from './types/system'
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
      //  关键修改：在此处设置 AppUserModelId
      const appId = 'com.example.beaverden'; // 替换成你实际的 App ID！
      app.setAppUserModelId(appId);
      // 初始化配置（包含端口分配和密钥生成）
      await this.configManager.initialize();
      await this.securityService.initialize();
      this.registerAppEvents();

      // 注册IPC事件
      this.setupIpcHandlers();

      // 启动后端服务
      await this.startPythonBackend();

      // 创建主窗口
      await this.createMainWindow();
      
    } catch (error) {
      console.error('Application initialization failed:', error);
      app.quit();
    }
  }

  private async startPythonBackend() {
    const userDataPath = app.getPath('userData');
    process.env.ELECTRON_USER_DATA_PATH = userDataPath;
    try{

      this.pythonProcess = spawn(this.getPythonExecutable(), this.getPythonArguments(), {
        detached: true,
        stdio: 'pipe',
        env: {
          ...process.env,
          ELECTRON_USER_DATA_PATH: userDataPath
        }
      });

      // 捕获后端进程的标准输出和错误输出
      this.pythonProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Backend OUTPUT: ${data.toString()}`);
      });

      this.pythonProcess.stderr.on('data', (data: Buffer) => {
        console.error(`Backend OUTPUT: ${data.toString()}`);
      });

      // 处理后端进程的退出事件
      this.pythonProcess.on('exit', (code: number, signal: string) => {
        console.log(`Backend process exited with code ${code} and signal ${signal}`);
        this.pythonProcess = null;
      });
      // 捕获进程启动错误
      this.pythonProcess.on('error', (err: Error) => {
        console.error('Failed to start backend process:', err);
        this.cleanupPythonProcess();
      });

      // 等待后端启动
      const config = await this.configManager.loadConfig();
      const port = config.backendPort;
      await this.waitForBackend(port);
      console.log("==========waitForBackend")
      await this.waitForSystemInitialization(port);

      // 检查数据库初始化状态

    } catch (error) {
      console.error('Failed to start Python backend:', error);
      this.cleanupPythonProcess();
    }
  }
  private async waitForBackend(port: number): Promise<void> {
    const maxRetries = 30;
    const retryInterval = 100;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://localhost:${port}/api/v1/system/health`);
        console.log("==waitForBackend========response",response)
        if (response.ok) return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
    throw new Error('Backend failed to start');
  }
  private getPythonExecutable(): string {
    if (app.isPackaged) {
      // 打包模式，根据系统选择可执行文件路径
      const executableName = process.platform === 'win32'
        ? 'backend.exe' // Windows
        : 'backend'; // macOS/Linux
      return path.join(process.resourcesPath, 'backend', executableName);
    }
    // 开发模式，使用 Python 解释器
    return 'python';
  }
  private getPythonArguments(): string[] {
    if (app.isPackaged) {
      return [];
    }
    return [path.join(__dirname, '../../backend/main.py')];
  }

  private async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 860,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,  // 启用sandbox，增强安全性
        webSecurity: true
      },
      // 添加 macOS 特定配置
      // titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      trafficLightPosition: { x: 10, y: 10 },
      frame: true,
    });

    const config = await this.configManager.loadConfig();

    if (config.appMode === 'development') {
      await this.mainWindow.loadURL('http://localhost:5173');
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  }

  private registerAppEvents() {
    app.on('window-all-closed', () => {
      this.cleanupPythonProcess();
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // 添加应用退出前的清理
    app.on('before-quit', () => {
      this.cleanupPythonProcess();
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
  private cleanupPythonProcess() {
    if (this.pythonProcess) {
      try {
        // 在 Windows 上需要特殊处理
        if (process.platform === 'win32') {
          exec(`taskkill /pid ${this.pythonProcess.pid} /T /F`);
        } else {
          // 在 Unix 系统上发送终止信号
          process.kill(-this.pythonProcess.pid, 'SIGTERM');
        }
      } catch (error) {
        console.error('Failed to kill Python process:', error);
      }
      this.pythonProcess = null;
    }
  }
  private setupIpcHandlers() {
    registerIpcHandlers(this.configManager);

  }

  private async waitForSystemInitialization(port: number): Promise<void> {
    const maxRetries = 30;
    const retryInterval = 1000;
  
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://localhost:${port}/api/v1/system/init-status`);
        if (!response.ok) {
          throw new Error('Failed to check system status');
        }
        const data = await response.json();
        const { data: status } = data as { data: SystemStatus };
        // 详细的系统状态检查
        if (status.isSystemReady) {
          console.log('System initialization completed successfully', {
            backend: status.backendStatus,
            database: status.databaseStatus
          });
          return;
        }
  
        // 如果系统未就绪，输出详细状态
        console.log('Waiting for system initialization...', {
          backendHealth: status.backendStatus.status,
          dbConnected: status.databaseStatus.isConnected,
          dbInitialized: status.databaseStatus.isInitialized,
          dbMigrated: status.databaseStatus.migrationCompleted
        });
  
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
