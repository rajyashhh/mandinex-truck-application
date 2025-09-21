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
    if (pin.trim().length === 0) return;
    setLoading(true);

    // Replace this check with your actual backend check
    const correctPin = "123456"; // Example

    if (pin.trim() === correctPin) {
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
    } else {
      setLoading(false);
      Alert.alert("No ride assigned", "No ride is assigned to you with this ride pin.");
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
          
          {/* Debug info - remove in production */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Debug: Use PIN "123456" to test</Text>
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
  
  // Debug info styles - remove in production
  debugInfo: {
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#AAD1A6",
  },
  debugText: {
    fontSize: 14,
    color: "#337A4E",
    textAlign: "center",
    fontWeight: "600",
  },
});
