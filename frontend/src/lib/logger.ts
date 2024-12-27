export class Logger {
    static error(message: string, error: unknown) {
      if (import.meta.env.DEV) {
        console.error(message, error);
      }
  
      if (window.electron?.log?.error) { // 使用可选链操作符
        window.electron.log.error({
          message,
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error
        });
      } else {
        // 在非 Electron 环境下的处理，例如使用 console.error 或者其他日志服务
        console.error(`[Non-Electron] ${message}`, error);
      }
    }
}