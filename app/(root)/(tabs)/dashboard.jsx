import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import images from '@/constants/images';
import icons from '@/constants/icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { settings } from '@/constants/data';
import { Link, useRouter } from 'expo-router';


const SettingsItem = ({ title, icon, onPress, textStyle, showArrow = true }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      router.push(onPress);
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
  return (
    <SafeAreaView>
      <ScrollView
        showVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-center mt-5">
          <Text className="text-xl font-rubik-bold">User Dashboard</Text>
        </View>

        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image source={images.avatar} className="size-44 relative rounded-full" />
            <Text className="text-2xl font-rubik-bold mt-2">
              User | Agent
            </Text>
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
          <SettingsItem icon={icons.logout} title="Logout" textStyle="text-danger" showArrow={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Dashboard;