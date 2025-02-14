import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card, FeaturedCard } from '@/components/Cards';
import Filters from '@/components/Filters';
import { Link, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Index = () => {

    const handleCardPress = (id) => router.push(`/properties/${id}`);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [image, setImage] = useState(images.avatar); // Default avatar

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));

                if (!parsedUserData || !parsedUserData.id) {
                    await AsyncStorage.removeItem('userData');
                    router.push('/signin');
                    return;
                }

                // Fetch user data from API
                const response = await axios.get(`https://investorlands.com/api/userprofile?id=${parsedUserData.id}`);
                // console.log('API Response:', response.data);

                if (response.data && response.data.data) {
                    const apiData = response.data.data;
                    setUserData(apiData);

                    // Set Profile Image, ensuring fallback to default avatar
                    if (apiData.profile_photo_path) {
                        setImage(
                            apiData.profile_photo_path.startsWith('http')
                                ? apiData.profile_photo_path
                                : `https://investorlands.com/assets/images/Users/${apiData.profile_photo_path}`
                        );
                    } else {
                        setImage(images.avatar);
                    }
                } else {
                    console.error('Unexpected API response format:', response.data);
                    setImage(images.avatar);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setImage(images.avatar);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <SafeAreaView className='bg-white h-full'>

            <FlatList
                data={[1, 2, 3, 4]}
                renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item)} />}
                keyExtractor={(item) => item.toString()}
                numColumns={2}
                contentContainerClassName="pb-32"
                columnWrapperClassName='flex gap-5 px-5'
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View className='px-5'>
                        <View className='flex flex-row items-center justify-between mt-5'>
                            <TouchableOpacity onPress={() => router.push('/dashboard')} className='flex flex-row items-center ml-2 justify-center'>
                                <Image source={typeof image === 'string' ? { uri: image } : image} className='size-12 rounded-full' />
                                <View className='flex flex-col items-start ml-2 justify-center'>
                                    <Text className='text-xs font-rubik text-black-100'>
                                        Welcome
                                    </Text>
                                    <Text className='text-base font-rubik-medium text-black-300'>
                                        {userData?.name?.split(' ')[0] || 'User'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/signin')}>
                                <Text className='text-base font-rubik-medium text-black-300'>
                                    Login
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/signup')}>
                                <Text className='text-base font-rubik-medium text-black-300'>
                                    SignUp
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/notifications')}>
                                <Image source={icons.bell} className='size-6' />
                            </TouchableOpacity>
                        </View>

                        <Search />
                        <View className='my-5'>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl font-rubik-bold text-black-300'>Featured</Text>
                                <TouchableOpacity>
                                    <Text className='text-base font-rubik-bold' style={{ color: Colors.brown }}>See All</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <FlatList
                            data={[1, 2]}
                            renderItem={({ item }) => <FeaturedCard item={item} onPress={() => handleCardPress(item)} />}
                            keyExtractor={(item) => item.toString()}
                            horizontal
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                            contentContainerClassName='flex gap-5 px-5'
                        />

                        <View className='my-5'>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl font-rubik-bold text-black-300'>Our Recommendation</Text>
                                <TouchableOpacity>
                                    <Text className='text-base font-rubik-bold text-yellow-800' style={{ color: Colors.brown }}>See All</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Filters />

                    </View>
                }
            />

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
