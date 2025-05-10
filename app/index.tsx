import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BarcodeScannerResult {
  type: string;
  data: string;
}

const App = () => {
    const { isSignedIn, isLoaded, signOut } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [flashEnabled, setFlashEnabled] = useState(false);

    useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    }, []);

    if (isLoaded && !isSignedIn) {
        console.log("User is not signed in, redirecting to login");
        return <Redirect href="/(auth)/login" />;
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleBarcodeScanned = ({ type, data }: BarcodeScannerResult) => {
      setScanned(true);
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    }

    const toggleFlash = () => {
      setFlashEnabled(prev => !prev);
    };

    if (hasPermission === null) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={64} color="#ff3b30" />
          <Text style={styles.permissionText}>No access to camera</Text>
          <Text style={styles.permissionSubText}>
            Camera access is required to scan QR codes
          </Text>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Camera View */}
          <View style={styles.cameraContainer}>
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "pdf417"]
              }}
              style={styles.camera}
            />
            
            {/* Scan Overlay */}
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.flashButton} 
                onPress={toggleFlash}
              >
                <Ionicons 
                  name={flashEnabled ? "flash" : "flash-off"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bottom Area */}
          <View style={styles.bottomArea}>
            {scanned ? (
              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={() => setScanned(false)}
              >
                <Ionicons name="scan-outline" size={24} color="#fff" />
                <Text style={styles.scanButtonText}>Scan Again</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.instructionText}>
                Position a QR code inside the square to scan
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2196F3',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2196F3',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2196F3',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2196F3',
  },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomArea: {
    padding: 24,
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  permissionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  permissionSubText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default App;