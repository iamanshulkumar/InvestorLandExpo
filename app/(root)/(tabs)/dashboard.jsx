import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { settings } from '@/constants/data';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Updated SettingsItem to handle both navigation and functions
const SettingsItem = ({ title, icon, onPress, textStyle, showArrow = true }) => {
  const router = useRouter();

  const handlePress = () => {
    if (typeof onPress === 'string') {
      router.push(onPress); // Navigate if it's a path
    } else if (typeof onPress === 'function') {
      onPress(); // Execute function directly
    }
  };

  return (
    <TouchableOpacity className="flex flex-row items-center justify-between py-3" onPress={handlePress}>
      <View className="flex flex-row items-center gap-3">
        <Image source={icon} className="size-6" />
        <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>{title}</Text>
      </View>
      {showArrow && <Image source={icons.rightArrow} className="size-5" />}
    </TouchableOpacity>
  );
};

const Dashboard = () => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Fetch user token and data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const user = await AsyncStorage.getItem('userData');

        if (token && user) {
          console.log('User Token:', token);
          console.log('User Data:', JSON.parse(user));

          setUserToken(token);
          setUserData(JSON.parse(user));
        } else {
          console.log('No user data found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Logout Function
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Clear all stored data
      Alert.alert('Logged Out', 'You have been logged out successfully.');
      router.push('/signin'); // Redirect to sign-in screen
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-center mt-5">
          <Text className="text-xl font-rubik-bold">User Dashboard</Text>
        </View>

        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image source={images.avatar} className="size-44 relative rounded-full" />
            <Text className="text-2xl font-rubik-bold mt-2">
              {userData ? userData.name : 'User'}
            </Text>
            {userData && (
              <>
                <Text className="text-sm text-gray-500 mt-1">
                  Email: {userData.email}
                </Text>
                <Text className="text-sm text-gray-500">
                  Mobile: {userData.mobile}
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="flex flex-col mt-10">
          <SettingsItem icon={icons.person} title="Edit Profile" onPress="/dashboard/editprofile" />
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          {settings.slice(1).map((item, index) => (
            <SettingsItem key={index} {...item} />
          ))}
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout} // Now works correctly
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
