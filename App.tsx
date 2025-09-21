import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, AppStateStatus } from 'react-native';
import AppNavigation from './src/navigation';
import LocationService from './src/services/LocationService';

export default function App() {
  useEffect(() => {
    let appStateSubscription: any;

    // Handle app state changes
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background or being closed
        console.log('App going to background/closing, saving last location...');
        const locationService = LocationService.getInstance();
        await locationService.saveLastLocation();
      }
    };

    // Subscribe to app state changes
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigation />
    </SafeAreaProvider>
  );
}