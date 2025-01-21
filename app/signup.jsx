import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';

const Signup = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (email && password) {
      const userDetails = {
        email: email,
        password: password,
      };
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
      alert('User registered successfully!');
    } else {
      alert('Please fill in all fields');
    }
  };

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
              fontSize: 18,
              fontFamily: 'Rubik-Regular',
              color: '#555',
              textAlign: 'center',
              marginTop: 30,
            }}
          >
            Register on Investor Land
          </Text>
          <TextInput
            style={{
              height: 50,
              width: '100%',
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
            onPress={handleRegister}
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
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Signup