// electron/utils/config-manager.ts
import * as path from 'path'
import * as fs from 'fs/promises'
import { app } from 'electron'
import * as net from 'net'
import * as crypto from 'crypto'

interface RuntimeConfig {
  backendPort: number;
  appMode: 'development' | 'production';
  timestamp: number;
  isPackaged: boolean;
  version: string;
  buildId: string;
  securityKeys: {
    secretKey: string;
    encryptionKey: string;
  };
}

export class ConfigManager {
  private configPath: string;
  private currentConfig: RuntimeConfig | null = null;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'runtime-config.json');
  }

  /**
   * 检查端口是否可用
   */
  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer()
      server.once('error', () => {
        resolve(false)
      })
      server.once('listening', () => {
        server.close()
        resolve(true)
      })
      server.listen(port)
    })
  }

  /**
   * 获取可用端口
   */
  private async findAvailablePort(startPort: number = 8486, endPort: number = 8684): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port
      }
    }
    throw new Error('No available ports found')
  }

  async initialize(): Promise<void> {
    try {
      // 确保配置目录存在
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });

      try {
        // 尝试加载现有配置
        this.currentConfig = await this.loadConfig();
        console.log('Loaded existing runtime configuration:', this.configPath);
        return;
      } catch (error) {
        // 如果配置不存在或无效，则生成新配置
        console.log('No valid configuration found, generating new one...');
      }

      // 获取可用端口
      const port = await this.findAvailablePort();
      const securityKeys = this.generateSecurityKeys();

      // 构建完整配置
      this.currentConfig = {
        backendPort: port,
        appMode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        timestamp: Date.now(),
        isPackaged: app.isPackaged,
        version: app.getVersion(),
        buildId: Date.now().toString(),
        securityKeys: securityKeys
      };

      // 写入配置文件
      await this.saveConfig();
      
      console.log('New runtime configuration initialized:', this.configPath);
    } catch (error) {
      console.error('Failed to initialize config:', error);
      throw error;
    }
  }

  async saveConfig(): Promise<void> {
    if (!this.currentConfig) {
      throw new Error('Config not initialized');
    }
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.currentConfig, null, 2),
      'utf-8'
    );
  }

  async loadConfig(): Promise<RuntimeConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Failed to load runtime config');
    }
  }

  getConfigPath(): string {
    return this.configPath;
  }
  private generateSecurityKeys() {
    // 生成主密钥 (用于 JWT 等)
    const secretKey = crypto.randomBytes(32).toString('base64');
    
    // 生成加密密钥 (用于数据加密)
    const encryptionKey = crypto.randomBytes(32).toString('base64');

    return {
      secretKey,
      encryptionKey
    };
  }
}