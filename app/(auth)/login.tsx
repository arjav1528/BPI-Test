import { useAuth, useSSO, useSignIn, useUser } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Setup WebBrowser for authentication
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  useWarmUpBrowser();
  
  const { startSSOFlow } = useSSO();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const spinnerFadeAnim = useRef(new Animated.Value(0)).current;

  // Handle animation when loading state changes
  useEffect(() => {
    if (isGoogleLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(spinnerFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(spinnerFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isGoogleLoading]);

  // Google sign in handler
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setGeneralError('');
      setIsGoogleLoading(true);
      
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
          router.replace('/');
        } else {
          setGeneralError('Session activation failed. Please try again.');
        }
      } else {
        setGeneralError('Sign in process was not completed.');
      }
    } catch (err : any) {
      console.error('Error during OAuth:', JSON.stringify(err, null, 2));
      
      if (err?.message?.includes('cancelled') || err?.message?.includes('dismiss')) {
        setGeneralError('Sign in was cancelled.');
      } else if (err?.message?.includes('network')) {
        setGeneralError('Network error. Please check your connection and try again.');
      } else if (err?.errors && err.errors.length > 0) {
        setGeneralError(err.errors[0].message || 'Failed to sign in with Google.');
      } else {
        setGeneralError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [startSSOFlow, setActive, router]);

  // Redirects if already signed in
  useEffect(() => {
    if (isAuthLoaded && isUserLoaded && isSignedIn) {
      router.replace('/');
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' }} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Continue with Google</Text>
        </View>

        {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

        <View style={styles.formContainer}>
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
                style={styles.googleIcon} 
                resizeMode="contain"
              />
            </Animated.View>
            
            {isGoogleLoading ? (
              <Animated.View style={{ opacity: spinnerFadeAnim, position: 'absolute' }}>
                <ActivityIndicator size="small" color="#757575" />
              </Animated.View>
            ) : null}
            
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 450,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 75,
    height: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 10,
    color: '#202124',
  },
  subtitle: {
    fontSize: 16,
    color: '#202124',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    marginVertical: 20,
    elevation: 1,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#d93025',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
  }
});

export default LoginScreen;