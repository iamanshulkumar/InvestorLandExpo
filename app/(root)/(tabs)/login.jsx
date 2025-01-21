import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';

import images from '@/constants/images';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';

const Login = () => {
    const { refetch, loading, isLoggedIn, login } = useGlobalContext(); // Ensure `login` is provided by the global context.

    // Redirect the user if they are already logged in
    if (!loading && isLoggedIn) return <Redirect href="/" />;

    // const handleLogin = async () => {
    //   try {
    //     const result = await login();

    //     if (result) {
    //       refetch(); // Update the global context state
    //     } else {
    //       Alert.alert('Error', 'Failed to log in');
    //     }
    //   } catch (error) {
    //     Alert.alert('Error', 'An unexpected error occurred');
    //     console.error(error);
    //   }
    // };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Image
                    source={images.onboarding}
                    style={{ width: '100%', height: '60%' }}
                    resizeMode="cover"
                />

                <View style={{ paddingHorizontal: 40 }}>
                    <Text
                        style={{
                            fontSize: 16,
                            textAlign: 'center',
                            fontFamily: 'Rubik-Regular',
                            color: '#555',
                        }}
                    >
                        Welcome to Investor Land
                    </Text>
                    <Text
                        style={{
                            fontSize: 24,
                            textAlign: 'center',
                            fontFamily: 'Rubik-Bold',
                            color: '#333',
                            marginTop: 10,
                        }}
                    >
                        Let's Get You Closer To {'\n'}
                        <Text style={{ color: '#FFA500' }}>Your Dream Home</Text>
                    </Text>

                    <Text
                        style={{
                            fontSize: 18,
                            fontFamily: 'Rubik-Regular',
                            color: '#555',
                            textAlign: 'center',
                            marginTop: 30,
                        }}
                    >
                        Login to ReState with Google
                    </Text>

                    <TouchableOpacity
                        onPress={handleLogin}
                        style={{
                            backgroundColor: '#FFF',
                            shadowColor: '#999',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            borderRadius: 50,
                            paddingVertical: 15,
                            marginTop: 20,
                            alignItems: 'center',
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={icons.google}
                                style={{ width: 20, height: 20 }}
                                resizeMode="contain"
                            />
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontFamily: 'Rubik-Medium',
                                    color: '#333',
                                    marginLeft: 10,
                                }}
                            >
                                Continue with Google
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}

export default Login