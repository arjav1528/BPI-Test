import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Simple splash screen component
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BPI</Text>
      <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

// Styles for the splash screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0000ff',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    color: '#555',
  },
  spinner: {
    marginVertical: 20,
  },
});

export default function RootLayout() {
    const [isInitialized, setIsInitialized] = useState(false);
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!publishableKey) {
        throw new Error("Missing NEXT_PUBLIC_CLERK_FRONTEND_API_KEY");
    }

    useEffect(() => {
        // Simulate initialization delay - this is the ONLY place in the app 
        // where we should show the splash screen during initial load
        const timer = setTimeout(() => {
          setIsInitialized(true)
        }, 1500)
        
        return () => clearTimeout(timer)
      }, [])
    
      if (!isInitialized) {
        return <SplashScreen />
      }

      return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
          <ClerkLoaded>
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              {/* <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="complete-profile" /> */}
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="index" />
            </Stack>
          </ClerkLoaded>
        </ClerkProvider>
      )
}