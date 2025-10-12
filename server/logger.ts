// Logger configuration for controlling console output levels
export interface LoggerConfig {
  enableSessionLogs: boolean;
  enableApiLogs: boolean;
  enableSqlLogs: boolean;
  enableAdminLogs: boolean;
  enableLiveDataLogs: boolean;
  enablePaymentLogs: boolean;
  level: 'silent' | 'error' | 'warn' | 'info' | 'debug';
}

// Default configuration based on environment
const defaultConfig: LoggerConfig = {
  enableSessionLogs: process.env.NODE_ENV !== 'production',
  enableApiLogs: process.env.NODE_ENV !== 'production',
  enableSqlLogs: process.env.NODE_ENV !== 'production',
  enableAdminLogs: true, // Admin logs might be important even in production
  enableLiveDataLogs: false, // These are very frequent
  enablePaymentLogs: true, // Payment logs are important for debugging
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
};

// Override config with environment variables
const config: LoggerConfig = {
  enableSessionLogs: process.env.ENABLE_SESSION_LOGS === 'true' || (process.env.ENABLE_SESSION_LOGS !== 'false' && defaultConfig.enableSessionLogs),
  enableApiLogs: process.env.ENABLE_API_LOGS === 'true' || (process.env.ENABLE_API_LOGS !== 'false' && defaultConfig.enableApiLogs),
  enableSqlLogs: process.env.ENABLE_SQL_LOGS === 'true' || (process.env.ENABLE_SQL_LOGS !== 'false' && defaultConfig.enableSqlLogs),
  enableAdminLogs: process.env.ENABLE_ADMIN_LOGS === 'true' || (process.env.ENABLE_ADMIN_LOGS !== 'false' && defaultConfig.enableAdminLogs),
  enableLiveDataLogs: process.env.ENABLE_LIVE_DATA_LOGS === 'true' || (process.env.ENABLE_LIVE_DATA_LOGS !== 'false' && defaultConfig.enableLiveDataLogs),
  enablePaymentLogs: process.env.ENABLE_PAYMENT_LOGS === 'true' || (process.env.ENABLE_PAYMENT_LOGS !== 'false' && defaultConfig.enablePaymentLogs),
  level: (process.env.LOG_LEVEL as any) || defaultConfig.level
};

export class Logger {
  private static config = config;
  
  static setConfig(newConfig: Partial<LoggerConfig>) {
    Logger.config = { ...Logger.config, ...newConfig };
  }
  
  static getConfig(): LoggerConfig {
    return { ...Logger.config };
  }

  // Session-related logs (authentication, session management)
  static session(message: any, ...args: any[]) {
    if (Logger.config.enableSessionLogs && Logger.shouldLog('info')) {
      console.log(`🔐 ${message}`, ...args);
    }
  }

  // API request/response logs
  static api(message: any, ...args: any[]) {
    if (Logger.config.enableApiLogs && Logger.shouldLog('info')) {
      console.log(`📡 ${message}`, ...args);
    }
  }

  // SQL and database logs
  static sql(message: any, ...args: any[]) {
    if (Logger.config.enableSqlLogs && Logger.shouldLog('debug')) {
      console.log(`🔥 ${message}`, ...args);
    }
  }

  // Admin-specific logs
  static admin(message: any, ...args: any[]) {
    if (Logger.config.enableAdminLogs && Logger.shouldLog('info')) {
      console.log(`👑 ${message}`, ...args);
    }
  }

  // Live data polling logs
  static liveData(message: any, ...args: any[]) {
    if (Logger.config.enableLiveDataLogs && Logger.shouldLog('debug')) {
      console.log(`📊 ${message}`, ...args);
    }
  }

  // Payment processing logs
  static payment(message: any, ...args: any[]) {
    if (Logger.config.enablePaymentLogs && Logger.shouldLog('info')) {
      console.log(`💳 ${message}`, ...args);
    }
  }

  // Standard log levels
  static info(message: any, ...args: any[]) {
    if (Logger.shouldLog('info')) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }

  static warn(message: any, ...args: any[]) {
    if (Logger.shouldLog('warn')) {
      console.warn(`⚠️  ${message}`, ...args);
    }
  }

  static error(message: any, ...args: any[]) {
    if (Logger.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  static debug(message: any, ...args: any[]) {
    if (Logger.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  private static shouldLog(level: 'error' | 'warn' | 'info' | 'debug'): boolean {
    if (Logger.config.level === 'silent') return false;
    
    const levels = ['error', 'warn', 'info', 'debug'];
    const configLevelIndex = levels.indexOf(Logger.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= configLevelIndex;
  }
}

// Initialize logger
Logger.info(`Logger initialized with config:`, Logger.getConfig());

export default Logger;