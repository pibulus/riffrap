import { browser } from '$app/environment';
import { errorHandler, StorageError } from './errorHandler';
import { createLogger } from './loggerService';

const logger = createLogger('StorageUtils');

export class StorageUtils {
  static getItem(key, defaultValue = null) {
    if (!browser) return defaultValue;
    if (!key) {
      logger.warn('Attempted to get item with null or undefined key');
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      logger.debug(`Retrieved item for key: ${key}`, { 
        found: item !== null 
      });
      return item !== null ? item : defaultValue;
    } catch (error) {
      const storageError = new StorageError(`Error reading ${key} from localStorage`, {
        code: 'ERR_STORAGE_READ',
        context: { 
          key,
          originalError: error.message,
          storageType: 'localStorage'
        },
        isOperational: true // Most storage errors are operational
      });
      
      errorHandler.handleError(storageError, {
        notify: false, // Don't notify user about storage read errors
        rethrow: false // Don't rethrow the error
      });
      
      logger.warn(`Error reading ${key} from localStorage`, { 
        errorMessage: error.message,
        errorType: error.constructor.name
      });
      
      return defaultValue;
    }
  }

  static setItem(key, value) {
    if (!browser) return false;
    if (!key) {
      logger.warn('Attempted to set item with null or undefined key');
      return false;
    }
    
    try {
      localStorage.setItem(key, value);
      logger.debug(`Saved item for key: ${key}`);
      return true;
    } catch (error) {
      // Check if this is a quota exceeded error
      const isQuotaError = error.name === 'QuotaExceededError' || 
                          error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
                          /quota/i.test(error.message);
      
      const errorCode = isQuotaError ? 'ERR_STORAGE_QUOTA_EXCEEDED' : 'ERR_STORAGE_WRITE';
      
      const storageError = new StorageError(
        isQuotaError 
          ? `Storage quota exceeded while saving ${key}` 
          : `Error saving ${key} to localStorage`, 
        {
          code: errorCode,
          context: { 
            key,
            originalError: error.message,
            storageType: 'localStorage',
            valueLength: typeof value === 'string' ? value.length : String(value).length
          },
          isOperational: true
        }
      );
      
      errorHandler.handleError(storageError, {
        notify: isQuotaError, // Notify user only for quota errors
        rethrow: false
      });
      
      logger.warn(`Error saving ${key} to localStorage`, { 
        errorMessage: error.message,
        errorType: error.constructor.name,
        isQuotaError
      });
      
      return false;
    }
  }

  static removeItem(key) {
    if (!browser) return false;
    if (!key) {
      logger.warn('Attempted to remove item with null or undefined key');
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      logger.debug(`Removed item for key: ${key}`);
      return true;
    } catch (error) {
      const storageError = new StorageError(`Error removing ${key} from localStorage`, {
        code: 'ERR_STORAGE_REMOVE',
        context: { 
          key,
          originalError: error.message,
          storageType: 'localStorage'
        },
        isOperational: true
      });
      
      errorHandler.handleError(storageError, {
        notify: false, // Don't notify user about storage removal errors
        rethrow: false
      });
      
      logger.warn(`Error removing ${key} from localStorage`, { 
        errorMessage: error.message,
        errorType: error.constructor.name
      });
      
      return false;
    }
  }

  static getBooleanItem(key, defaultValue = false) {
    const value = this.getItem(key);
    if (value === null) return defaultValue;
    return value === 'true';
  }

  static getNumberItem(key, defaultValue = 0) {
    const value = this.getItem(key);
    if (value === null) return defaultValue;
    
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  static getJSONItem(key, defaultValue = null) {
    const value = this.getItem(key);
    if (value === null) return defaultValue;
    
    try {
      return JSON.parse(value);
    } catch (error) {
      const storageError = new StorageError(`Error parsing JSON for ${key}`, {
        code: 'ERR_STORAGE_JSON_PARSE',
        context: { 
          key,
          originalError: error.message,
          valueLength: value.length,
          valueSample: value.length > 50 ? `${value.substring(0, 50)}...` : value
        },
        isOperational: true
      });
      
      errorHandler.handleError(storageError, {
        notify: false, // Don't notify user about JSON parsing errors
        rethrow: false
      });
      
      logger.warn(`Error parsing JSON for ${key}`, { 
        errorMessage: error.message,
        errorType: error.constructor.name,
        valueLength: value.length
      });
      
      return defaultValue;
    }
  }

  static setJSONItem(key, value) {
    if (!key) {
      logger.warn('Attempted to set JSON item with null or undefined key');
      return false;
    }
    
    try {
      const stringified = JSON.stringify(value);
      logger.debug(`Stringified JSON for key: ${key}`, { 
        valueLength: stringified.length 
      });
      
      return this.setItem(key, stringified);
    } catch (error) {
      const storageError = new StorageError(`Error stringifying JSON for ${key}`, {
        code: 'ERR_STORAGE_JSON_STRINGIFY',
        context: { 
          key,
          originalError: error.message,
          valueType: typeof value,
          isArray: Array.isArray(value),
          isNull: value === null,
          circularRef: error.message.includes('circular')
        },
        isOperational: true
      });
      
      errorHandler.handleError(storageError, {
        notify: false, // Don't notify user about JSON stringification errors
        rethrow: false
      });
      
      logger.warn(`Error stringifying JSON for ${key}`, { 
        errorMessage: error.message,
        errorType: error.constructor.name,
        valueType: typeof value,
        isArray: Array.isArray(value)
      });
      
      return false;
    }
  }
}