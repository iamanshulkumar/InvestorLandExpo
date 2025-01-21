import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Link } from 'expo-router';
import { login } from "@/lib/appwrite";
import images from '@/constants/images';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';


const Signin = () => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();

  // Redirect the user if logged in
  if (!loading && isLoggedIn) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    try {
      console.log('Login attempt started');
      const result = await login();

      if (result) {
        console.log('Login successful');
        refetch();
      } else {
        Alert.alert('Error', 'Failed to log in');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFA500" />
      </SafeAreaView>
    );
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image
          source={images.onboarding}
          style={{ width: '100%', height: '20%' }}
          resizeMode="contain"
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
            Login to Investor Land
          </Text>

          <TextInput
            style={{
              height: 50,
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              marginTop: 20,
              fontFamily: 'Rubik-Regular',
            }}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={{
              height: 50,
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              marginTop: 20,
              fontFamily: 'Rubik-Regular',
            }}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#FFA500',
              borderRadius: 5,
              paddingVertical: 15,
              marginTop: 20,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Rubik-Medium',
                color: '#FFF',
              }}
            >
              Login
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Rubik-Regular',
              color: '#555',
              textAlign: 'center',
              marginTop: 30,
            }}
          >
            Or with
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

          <Link href="/signup" style={{ marginTop: 20, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Rubik-Regular',
                color: '#00000',
                textAlign: 'center',
              }}
            >
              Don't have an account? Register now
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signin;
