const paymentapi = process.env.EXPO_PUBLIC_PAYMENT_API;
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

if (!paymentapi) {
  throw new Error("Missing EXPO_PUBLIC_PAYMENT_API");
}

export const auth = async (token: string) => {
    try{
        const response = await fetch(`${paymentapi}/login/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        if(response.status === 200){
            const responseBody = await response.json();
            const returnedToken = responseBody.accessToken;
            if(returnedToken !== null){
                await SecureStore.setItemAsync('access_token', returnedToken);
                await SecureStore.setItemAsync('user_type', 'normal');
                console.log(responseBody);
                return returnedToken;
            }else{
                await SecureStore.setItemAsync('user_type', 'guest');
                return 'guest';
            }
        } else if(response.status === 403){
            await SecureStore.setItemAsync('user_type', 'guest');
            return 'guest';
        } else {
            throw new Error('Unexpected response status: ' + response.status);
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        throw error;
    }
};


export const checkPin = async (): Promise<any> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/has-pin`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            const responseBody = await response.json();
            return responseBody.hasPin;
        } else if (response.status === 401) {
            // Handle token expiration or invalidation
            return checkPin();
        } else {
            throw new Error('Failed to check if user has set pin: ' + response.status);
        }
    } catch (error) {
        console.error('Error checking pin:', error);
        throw error;
    }

}


export const getPin = async (): Promise<any> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/get-pin`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            const responseBody = await response.json();
            return responseBody.pin;
        } else if (response.status === 401) {
            // Handle token expiration or invalidation
            return getPin();
        } else {
            throw new Error('Failed to get pin: ' + response.status);
        }
    } catch (error) {
        console.error('Error getting pin:', error);
        throw error;
    }
}



export const setPin = async (pin: string): Promise<any> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/set-pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pin })
        });

        if (response.status === 201) {
            return true;
        } else if (response.status === 401) {
            // Handle token expiration or invalidation
            return setPin(pin);
        } else {
            throw new Error('Failed to set pin: ' + response.status);
        }
    }
    catch (error) {
        console.error('Error setting pin:', error);
        throw error;
    }
}

const getId = async (): Promise<string | null> => {
    if (Platform.OS === 'ios') {
      return await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === 'android') {
      return Application.getAndroidId() ?? 'unknown';
    }
    return 'unknown';
  };


export const makePayment = async (vendorId: string, amount: number, pin: string): Promise<string> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const deviceId = await getId() ?? 'unknown';

        const response = await fetch(`${paymentapi}/transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                vendorId,
                amount,
                pin,
                deviceId,
            }),
        });

        if (response.status === 201) {
            const paymentResponse = await response.text();
            console.log("Payment successful : ", paymentResponse);
            return paymentResponse;
        } else if (response.status === 403) {
            throw new Error('Forbidden: ' + await response.text());
        } else {
            throw new Error('Failed to make payment: ' + response.status);
        }
    } catch (error) {
        console.error('Error making payment:', error);
        throw error;
    }
}

export const blockAccount = async (): Promise<string> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/block-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const blockResponse = await response.text();
            console.log("Account blocked successfully : ", blockResponse);
            return blockResponse;
        } else {
            throw new Error('Failed to block account: ' + response.status);
        }
    } catch (error) {
        console.error('Error blocking account:', error);
        throw error;
    }
}


export const transactions = async (): Promise<any> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/transactions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            const balance = data.balance;
            const transactions = data.transactions;

            return { balance, transactions };
        } else if (response.status === 401) {
            // Handle token expiration or invalidation
            return transactions();
        } else {
            throw new Error('Failed to fetch transactions: ' + response.status);
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
}



export const requestOTP = async (): Promise<string> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/reset-pin/request-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const otpResponse = await response.text();
            console.log("OTP requested successfully : ", otpResponse);
            return otpResponse;
        } else {
            throw new Error('Failed to request OTP: ' + response.status);
        }
    } catch (error) {
        console.error('Error requesting OTP:', error);
        throw error;
    }
}

export const verifyOTP = async (otp: string, pin: string): Promise<boolean> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/student/reset-pin/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ otp, newPin: pin }),
        });

        if (response.status === 200) {
            return true;
        } else {
            throw new Error('Failed to verify OTP: ' + response.status);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
}

export const validateVendor = async (vendorId: string): Promise<string | null> => {
    try {
        const token = await SecureStore.getItemAsync('access_token');
        const response = await fetch(`${paymentapi}/vendor?vendorId=${vendorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            return data.shopName;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error validating vendor:', error);
        throw error;
    }

}



export const getDeviceInfo = async (): Promise<any> => {
    try {
        return {
          deviceId: Device.osInternalBuildId ?? 'unknown',
          model: Device.modelName ?? 'unknown',
          manufacturer: Device.manufacturer ?? 'unknown',
          osVersion: Device.osVersion ?? 'unknown',
        };
      } catch (e) {
        throw new Error(`Failed to get device information: ${e}`);
      }
}