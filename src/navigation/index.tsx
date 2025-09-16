// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// In src/navigation/index.tsx
export type RootStackParamList = {
  Splash: undefined;
  StartRide: undefined;
  Login: { rideType?: 'new' | 'continue' } | undefined;
  OTPVerification: { phone: string; rideType: 'new' | 'continue' };
  DriverRegistration: { phone: string };
  Dashboard: { driverName?: string; phone?: string; license?: string; permitFile?: any } | undefined; // Updated
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  // lazy require screens so a single failing import won't crash the whole bundle at load time
  const SplashScreen = require('../screens/SplashScreen').default;
  const StartRideScreen = require('../screens/StartRideScreen').default;
  const LoginScreen = require('../screens/LoginScreen').default;
  const OTPVerificationScreen = require('../screens/OtpVerificationScreen').default;
  const DriverRegistrationScreen = require('../screens/DriverRegistrationScreen').default;
  const DashboardScreen = require('../screens/DashboardScreen').default;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="StartRide" component={StartRideScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistrationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
