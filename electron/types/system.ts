export interface SystemStatus {
    isSystemReady: boolean;
    backendStatus: {
      status: string;
      version: string;
      mode: string;
    };
    databaseStatus: {
      isConnected: boolean;
      isInitialized: boolean;
      migrationCompleted: boolean;
      version?: string;
    };
    error?: string;
  }