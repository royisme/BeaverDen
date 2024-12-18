// electron/utils/security-service.ts
import * as crypto from 'crypto'
import { ConfigManager } from './config-manager'

export class SecurityService {
  private configManager: ConfigManager;
  private currentConfig: Awaited<ReturnType<ConfigManager['loadConfig']>> | null = null;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  async initialize(): Promise<void> {
    this.currentConfig = await this.configManager.loadConfig();
  }

  getSecretKey(): string {
    if (!this.currentConfig) {
      throw new Error('Security service not initialized');
    }
    return this.currentConfig.securityKeys.secretKey;
  }

  async encryptMessage(message: string): Promise<string> {
    if (!this.currentConfig) {
      throw new Error('Security service not initialized');
    }

    const key = Buffer.from(this.currentConfig.securityKeys.encryptionKey, 'base64');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('base64'),
      content: encrypted,
      tag: authTag.toString('base64')
    });
  }

  async decryptMessage(encryptedData: string): Promise<string> {
    if (!this.currentConfig) {
      throw new Error('Security service not initialized');
    }
    
    const { iv, content, tag } = JSON.parse(encryptedData);
    const key = Buffer.from(this.currentConfig.securityKeys.encryptionKey, 'base64');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    let decrypted = decipher.update(content, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}