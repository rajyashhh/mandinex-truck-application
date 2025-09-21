import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform, Alert } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';
const API_BASE_URL = 'http://192.168.43.20:3001'; // Update with your server URL
const LOCATION_UPDATE_INTERVAL = 30000; // Update every 30 seconds
const MIN_DISTANCE_UPDATE = 20; // Update if moved more than 20 meters

interface LocationData {
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  altitude?: number | null;
  accuracy?: number | null;
}

interface TripData {
  tripId: string;
  driverPhone: string;
  startTime: number;
}

class LocationService {
  private static instance: LocationService;
  private tripData: TripData | null = null;
  private lastLocationUpdate: number = 0;
  private appStateSubscription: any;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  constructor() {
    // Listen to app state changes
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  // Start background location tracking
  async startLocationTracking(tripId: string, driverPhone: string, ridePin: string): Promise<void> {
    try {
      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location Required',
          'Please enable "Always Allow" location access in settings for continuous tracking during your trip.',
          [{ text: 'OK' }]
        );
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Save trip data
      this.tripData = {
        tripId,
        driverPhone,
        startTime: Date.now(),
      };
      await AsyncStorage.setItem('active_trip', JSON.stringify(this.tripData));

      // Call start trip API
      await fetch(`${API_BASE_URL}/api/start-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverPhone,
          ridePin,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      });

      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: MIN_DISTANCE_UPDATE,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Mandinex Tracking Active',
          notificationBody: 'Your location is being tracked for trip safety',
          notificationColor: '#4CAF50',
        },
      });

      console.log('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  // Stop location tracking
  async stopLocationTracking(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      await AsyncStorage.removeItem('active_trip');
      this.tripData = null;
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  // Handle app state changes
  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App going to background - ensure tracking continues
      const tripDataStr = await AsyncStorage.getItem('active_trip');
      if (tripDataStr) {
        console.log('App backgrounded - tracking continues');
      }
    } else if (nextAppState === 'active') {
      // App coming to foreground
      console.log('App foregrounded');
    }
  };

  // Send location update to server
  async sendLocationUpdate(location: LocationData): Promise<void> {
    try {
      const tripDataStr = await AsyncStorage.getItem('active_trip');
      if (!tripDataStr) return;

      const tripData: TripData = JSON.parse(tripDataStr);
      
      // Get battery level
      const batteryLevel = await this.getBatteryLevel();
      const networkType = await this.getNetworkType();

      const response = await fetch(`${API_BASE_URL}/api/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: tripData.tripId,
          driverPhone: tripData.driverPhone,
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          accuracy: location.accuracy,
          batteryLevel,
          networkType,
        }),
      });

      const result = await response.json();
      console.log('Location update result:', result);
    } catch (error) {
      console.error('Error sending location update:', error);
      // Store failed updates for retry
      await this.storeFailedUpdate(location);
    }
  }

  // Save last location when app is being closed
  async saveLastLocation(): Promise<void> {
    try {
      const tripDataStr = await AsyncStorage.getItem('active_trip');
      if (!tripDataStr) return;

      const tripData: TripData = JSON.parse(tripDataStr);
      const location = await Location.getLastKnownPositionAsync();
      
      if (location) {
        const batteryLevel = await this.getBatteryLevel();
        
        await fetch(`${API_BASE_URL}/api/save-last-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: tripData.tripId,
            driverPhone: tripData.driverPhone,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            batteryLevel,
          }),
        });
      }
    } catch (error) {
      console.error('Error saving last location:', error);
    }
  }

  // Helper methods
  private async getBatteryLevel(): Promise<number> {
    try {
      // Import Battery dynamically to avoid issues if not installed
      const Battery = await import('expo-battery');
      const batteryLevel = await Battery.getBatteryLevelAsync();
      return Math.round(batteryLevel * 100);
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 100; // Default value
    }
  }

  private async getNetworkType(): Promise<string> {
    try {
      // Import Network dynamically to avoid issues if not installed
      const Network = await import('expo-network');
      const networkState = await Network.getNetworkStateAsync();
      
      if (!networkState.isConnected) return 'offline';
      if (networkState.type === Network.NetworkStateType.WIFI) return 'wifi';
      if (networkState.type === Network.NetworkStateType.CELLULAR) {
        return networkState.isInternetReachable ? '4g' : '3g';
      }
      return 'unknown';
    } catch (error) {
      console.error('Error getting network type:', error);
      return 'unknown';
    }
  }

  private async storeFailedUpdate(location: LocationData): Promise<void> {
    try {
      const failedUpdatesStr = await AsyncStorage.getItem('failed_location_updates');
      const failedUpdates = failedUpdatesStr ? JSON.parse(failedUpdatesStr) : [];
      failedUpdates.push({
        location,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem('failed_location_updates', JSON.stringify(failedUpdates));
    } catch (error) {
      console.error('Error storing failed update:', error);
    }
  }

  // Retry failed updates when connection is restored
  async retryFailedUpdates(): Promise<void> {
    try {
      const failedUpdatesStr = await AsyncStorage.getItem('failed_location_updates');
      if (!failedUpdatesStr) return;

      const failedUpdates = JSON.parse(failedUpdatesStr);
      for (const update of failedUpdates) {
        await this.sendLocationUpdate(update.location);
      }
      
      // Clear failed updates after successful retry
      await AsyncStorage.removeItem('failed_location_updates');
    } catch (error) {
      console.error('Error retrying failed updates:', error);
    }
  }
}

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    
    if (location) {
      const locationService = LocationService.getInstance();
      await locationService.sendLocationUpdate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
      });
    }
  }
});

export default LocationService;
