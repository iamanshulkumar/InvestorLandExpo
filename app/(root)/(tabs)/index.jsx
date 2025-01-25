import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import Search from '@/components/Search';

const Index = () => {
    return (
        <SafeAreaView className='bg-white h-full'>
            <View className='px-5'>
                <View className='flex flex-row items-center justify-between mt-5'>
                    <View className='flex flex-row items-center ml-2 justify-center'>
                        <Image source={images.avatar} className='size-12 rounded-full' />

                        <View className='flex flex-col items-start ml-2 justify-center'>
                            <Text className='text-xs font-rubik text-black-100'>
                                Good Morning
                            </Text>
                            <Text className='text-base font-rubik-medium text-black-300'>
                                User
                            </Text>
                        </View>
                    </View>
                    <Image source={icons.bell} className='size-6' />
                </View>
            </View>

            <Search />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Index;
