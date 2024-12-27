// /src/types/system.ts

export interface SystemStatus {
    isSystemReady: boolean;
    backendStatus: {
      isConnected: boolean;
      version: string;
      mode: string;
    };
    databaseStatus: {
      isConnected: boolean;
      isInitialized: boolean;
      migrationCompleted: boolean;
    };
  }
  
  export interface SystemError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
  
  export interface SystemInitializationResult {
    status: SystemStatus;
    error?: SystemError;
  }

  export interface SystemInitStatus {
    initialized: boolean;
    database_connected: boolean;
  }
  