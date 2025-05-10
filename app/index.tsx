import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Camera, CameraView } from 'expo-camera';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@react-navigation/elements';
interface BarcodeScannerResult {
  type: string;
  data: string;
}

const App = () => {
    const { isSignedIn, isLoaded, signOut } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [scanned, setScanned] = useState(false);

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
    if (hasPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    // return (
    //     <SafeAreaView style={styles.safeArea}>
    //       <StatusBar barStyle="dark-content" />
    //       <View style={styles.container}>
    //         <Text style={styles.title}>Welcome to BPI</Text>
    //         <Text style={styles.subtitle}>Your new application</Text>
    //         <TouchableOpacity 
    //           style={styles.button}
    //           onPress={handleSignOut}>
    //           <Text style={styles.buttonText}>Sign Out</Text>
    //         </TouchableOpacity>
    //       </View>
    //     </SafeAreaView>
    // );
    return (
      <View style={styles.container}>
        <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes : ["qr", "pdf417"]
        }}
        style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <TouchableOpacity onPress={() => setScanned(false)}>
            <Text>Tap to scan again</Text>
          </TouchableOpacity>
        )}
      </View>

    );
}

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 24,
//   },
//   button: {
//     backgroundColor: '#f44336',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   buttonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});

export default App;