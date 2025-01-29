import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card, FeaturedCard } from '@/components/Cards';
import Filters from '@/components/Filters';
import { Link, router } from 'expo-router';


const Index = () => {

    const handleCardPress = (id) => router.push(`/properties/${id}`);

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
                            <Link href={'/notifications'}>
                                <Image source={icons.bell} className='size-6' />
                            </Link>
                        </View>

                        <Search />
                        <View className='my-5'>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl font-rubik-bold text-black-300'>Featured</Text>
                                <TouchableOpacity>
                                    <Text className='text-base font-rubik-bold text-primary-300'>See All</Text>
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
                                    <Text className='text-base font-rubik-bold text-primary-300'>See All</Text>
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
