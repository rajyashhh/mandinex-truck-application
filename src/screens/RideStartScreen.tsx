// src/screens/RideStartScreen.tsx

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationService from '../services/LocationService';

const { width } = Dimensions.get("window");

interface DriverDetails {
  driverName: string;
  phone: string;
  license: string;
  permitFile: string | null;
}

export default function RideStartScreen({ navigation, route }: any) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }).start();
  }, []);

  const handleRideStart = async () => {
    if (pin.trim().length === 0) {
      Alert.alert("Error", "Please enter the ride PIN provided by the farmer.");
      return;
    }
    
    if (pin.trim().length !== 6) {
      Alert.alert("Error", "PIN must be 6 digits.");
      return;
    }
    
    setLoading(true);

    try {
        // Get driver details from AsyncStorage
        const savedDriverDetails = await AsyncStorage.getItem('driverDetails');
        let driverDetails: DriverDetails;
        
        if (savedDriverDetails) {
          driverDetails = JSON.parse(savedDriverDetails);
          console.log('Retrieved driver details:', driverDetails);
        } else {
          // If no saved details (existing driver case), use route params or defaults
          driverDetails = {
            driverName: route?.params?.driverName || "Driver",
            phone: route?.params?.phone || "Unknown",
            license: route?.params?.license || "Not provided",
            permitFile: route?.params?.permitFile || null,
          };
        }
        
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "Please enable location access to start the trip.",
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }
        
        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;
        
        // Call API to validate PIN and start trip
        const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || 'http://192.168.168.20:3001';
        const response = await fetch(`${serverUrl}/api/start-trip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            driverPhone: driverDetails.phone,
            ridePin: pin.trim(),
            latitude,
            longitude,
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          setLoading(false);
          Alert.alert("Invalid PIN", result.error || "Please check with the farmer for correct PIN.");
          return;
        }

        // Start background location tracking
        const locationService = LocationService.getInstance();
        // Use the PIN as tripId since it's stored as mandi_buyer_pin in the database
        const tripId = pin.trim();
        
        try {
          await locationService.startLocationTracking(
            tripId,
            driverDetails.phone,
            pin.trim()
          );
          
          console.log('Background location tracking started');
        } catch (locationError) {
          console.error('Location tracking error:', locationError);
          Alert.alert(
            "Location Tracking",
            "Location tracking started with limited permissions. For best experience, please enable 'Always Allow' location access.",
            [{ text: "OK" }]
          );
        }

        setLoading(false);

        // Navigate to Dashboard with all driver details
        navigation.replace("Dashboard", {
          ...driverDetails, // Spread saved driver details
          ridePin: pin.trim(),
          tripId: tripId,
        });

      } catch (error) {
        console.error('Error starting trip:', error);
        setLoading(false);
        Alert.alert("Error", "Failed to start trip. Please try again.");
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6FBF3" />
      <LinearGradient
        colors={["#D4EDC7", "#E8F3E6", "#F6FBF3"]}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          <Text style={styles.heading}>Start Your Ride</Text>
          <Text style={styles.subheading}>Enter your Ride PIN to begin</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="Enter Ride PIN"
            value={pin}
            onChangeText={setPin}
            editable={!loading}
            maxLength={8}
            placeholderTextColor="#AAD1A6"
          />
          <TouchableOpacity
            style={[
              styles.startBtn,
              { backgroundColor: pin.trim() ? "#4CAF50" : "#B0D3BA" },
            ]}
            onPress={handleRideStart}
            disabled={!pin.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>
              {loading ? "Starting..." : "Start Ride"}
            </Text>
          </TouchableOpacity>
          <View style={styles.tipBox}>
            <Text style={styles.tipBoxEmoji}>📍</Text>
            <Text style={styles.tipBoxText}>
              Live location will be captured as soon as you start your trip.
            </Text>
          </View>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipBoxEmoji}>🔑</Text>
            <Text style={styles.tipBoxText}>
              Get the 6-digit PIN from the farmer to start the trip.
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FBF3" },
  inner: {
    marginTop: 68,
    marginHorizontal: 21,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A4620",
    marginBottom: 13,
    letterSpacing: 0.1,
  },
  subheading: {
    fontSize: 17,
    color: "#529668",
    marginBottom: 27,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F6FFF3",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
    fontSize: 21,
    fontWeight: "600",
    borderColor: "#CDF2D5",
    borderWidth: 2,
    color: "#184729",
    shadowColor: "#C4E9B4",
    shadowOpacity: 0.10,
    shadowRadius: 14,
    marginBottom: 20,
    width: width * 0.80,
    textAlign: "center",
    letterSpacing: 2,
  },
  startBtn: {
    borderRadius: 99,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 24,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17.5,
    letterSpacing: 0.7,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "#E6F3E6",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 26,
    width: width * 0.84,
    shadowColor: "#C2DECC",
    shadowOpacity: 0.11,
    shadowRadius: 10,
    marginBottom: 20,
  },
  tipBoxEmoji: { fontSize: 21, marginRight: 11 },
  tipBoxText: { fontSize: 15, color: "#337A4E", fontWeight: "600", lineHeight: 21 },
});
