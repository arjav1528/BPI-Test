import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';


const SplashScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>BPI</Text>
        <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  };
  
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

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  

  if(!isLoaded){
    console.log("Loading Clerk...")
    return <SplashScreen />
  }else{
    if(isSignedIn){
      console.log("User is signed in")
      return <Redirect href="/" />
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />

}


