// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  StartRide: undefined;
  RideStart: undefined;
  Login: { rideType?: 'new' | 'continue' } | undefined;
  OTPVerification: { phone: string; rideType: 'new' | 'continue'; driverId?: number };
  DriverRegistration: { phone: string };
  Dashboard: { 
    driverName?: string; 
    phone?: string; 
    license?: string; 
    permitFile?: any;
    ridePin?: string;
    startLocation?: {
      latitude: number;
      longitude: number;
      altitude?: number | null;
      accuracy?: number | null;
      altitudeAccuracy?: number | null;
      heading?: number | null;
      speed?: number | null;
    };
  } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const SplashScreen = require('../screens/SplashScreen').default;
  const StartRideScreen = require('../screens/StartRideScreen').default;
  const RideStartScreen = require('../screens/RideStartScreen').default;
  const LoginScreen = require('../screens/LoginScreen').default;
  const OTPVerificationScreen = require('../screens/OtpVerificationScreen').default;
  const DriverRegistrationScreen = require('../screens/DriverRegistrationScreen').default;
  const DashboardScreen = require('../screens/DashboardScreen').default;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="StartRide" component={StartRideScreen} />
        <Stack.Screen name="RideStart" component={RideStartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistrationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
