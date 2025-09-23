// Location debugging utility
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

export class LocationDebugger {
  private static logs: any[] = [];
  
  static async log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      apiUrl: API_CONFIG.BASE_URL,
      isDev: __DEV__
    };
    
    console.log('[LocationDebug]', message, data);
    
    this.logs.push(logEntry);
    
    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs.shift();
    }
    
    // Save to AsyncStorage for persistence
    try {
      await AsyncStorage.setItem('location_debug_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save debug logs:', error);
    }
  }
  
  static async getLogs() {
    try {
      const logsJson = await AsyncStorage.getItem('location_debug_logs');
      if (logsJson) {
        this.logs = JSON.parse(logsJson);
      }
      return this.logs;
    } catch (error) {
      console.error('Failed to get debug logs:', error);
      return this.logs;
    }
  }
  
  static async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem('location_debug_logs');
  }
  
  static async testLocationUpdate(driverPhone: string, tripId: string) {
    try {
      const testLocation = {
        latitude: 23.1685 + (Math.random() * 0.01),
        longitude: 77.4073 + (Math.random() * 0.01),
        speed: Math.random() * 60,
        heading: Math.random() * 360,
        altitude: 500 + Math.random() * 100,
        accuracy: 5 + Math.random() * 10,
      };
      
      await this.log('Testing location update', {
        tripId,
        driverPhone,
        location: testLocation,
        apiUrl: `${API_CONFIG.BASE_URL}/api/update-location`
      });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          driverPhone,
          ...testLocation,
          batteryLevel: 85,
          networkType: 'wifi'
        }),
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { rawResponse: responseText };
      }
      
      await this.log('Location update response', {
        status: response.status,
        statusText: response.statusText,
        result,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return { success: response.ok, response: result };
    } catch (error: any) {
      await this.log('Location update error', {
        error: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      return { success: false, error };
    }
  }
}
