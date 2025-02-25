import { FlatList, Image, ScrollView, Text, TouchableOpacity, View, Dimensions, Platform, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { facilities, gallery } from "@/constants/data";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Videobox from "../../../components/Videobox";
import AsyncStorage from '@react-native-async-storage/async-storage';

const PropertyDetails = () => {
    const [propertyId, setPropertyId] = useState(useLocalSearchParams().id);

    const windowHeight = Dimensions.get("window").height;
    const [propertyData, setPropertyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [propertyThumbnail, setPropertyThumbnail] = useState(images.avatar); // Default avatar
    const [propertyGallery, setPropertyGallery] = useState(); // Default avatar
    const [videoUrls, setVideoUrls] = useState([]);
    const [loggedinUserId, setLoggedinUserId] = useState([]);

    const property = {
        facilities: facilities,
        gallery: gallery,
    };

    useEffect(() => {
        const fetchPropertyData = async () => {
            try {
                const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
                setLoggedinUserId(parsedUserData.id)
                // Fetch user data from API
                const response = await axios.get(`https://investorlands.com/api/property-details/${propertyId}`);
                // console.log('API Response:', response.data);

                if (response.data) {
                    const apiData = response.data.details;
                    setPropertyData(apiData);
                    // console.log('API apiData:', apiData);

                    // Set Profile Image, ensuring fallback to default avatar
                    if (apiData.thumbnail) {
                        // console.log('API apiData.thumbnail:', apiData.thumbnail);
                        setPropertyThumbnail(
                            apiData.thumbnail.startsWith('http')
                                ? apiData.thumbnail
                                : `https://investorlands.com/assets/images/Listings/${apiData.thumbnail}`
                        );
                    } else {
                        setPropertyThumbnail(images.newYork);
                    }

                    if (apiData.gallery) {
                        const galleryImages = JSON.parse(apiData.gallery).map((image) => ({
                            id: Math.random().toString(36).substring(2, 11), // Generate a unique id for each image
                            image: image.startsWith('http')
                                ? image
                                : `https://investorlands.com/${image.replace(/\\/g, '/')}`,
                        }));
                        setPropertyGallery(galleryImages);
                    }

                    let parsedVideos = [];
                    try {
                        parsedVideos = typeof apiData.videos === 'string'
                            ? JSON.parse(apiData.videos)
                            : Array.isArray(apiData.videos)
                                ? apiData.videos
                                : [];
                    } catch (error) {
                        console.error("Error parsing videos:", error);
                    }
                    // Convert relative paths to full URLs
                    const fullVideoUrls = parsedVideos.map(video =>
                        video.startsWith("http") ? video : `https://investorlands.com/${video}`
                    );
                    setVideoUrls(fullVideoUrls);
                    // console.log("Video URLs:", videoUrls);
                } else {
                    console.error('Unexpected API response format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyData();
    }, [propertyId])


    if (loading) {
        return (
            <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 400 }} />
        );
    }

    if (!propertyData) {
        return (
            <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 400 }} />
        );
    }



    return (
        <View className="pb-24">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32 bg-white"
                contentContainerStyle={{ paddingBottom: 32, backgroundColor: 'white' }}>
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image
                        source={{ uri: propertyThumbnail }}
                        className="size-full"
                        resizeMode="cover"
                    />
                    <Image
                        source={images.whiteGradient}
                        className="absolute top-0 w-full z-40"
                    />

                    <View
                        className="z-50 absolute inset-x-7"
                        style={{
                            top: Platform.OS === "ios" ? 70 : 20,
                        }}
                    >
                        <View className="flex flex-row items-center w-full justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                            >
                                <Image
                                    source={icons.backArrow}
                                    className="size-5"
                                />
                            </TouchableOpacity>

                            <View className="flex flex-row items-center gap-3">
                                {propertyData.roleid == loggedinUserId &&
                                    <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-medium ring-1 ring-inset ${propertyData.status === 'published' ? ' bg-green-50  text-green-700  ring-green-600/20 ' : 'bg-red-50  text-red-700 ring-red-600/20'}`}>{propertyData.status}</Text>
                                }
                                <Image
                                    source={icons.heart}
                                    className="size-7"
                                    tintColor={"#191D31"}
                                />
                                <Image
                                    source={icons.send}
                                    className="size-7"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className='px-5 mt-7 flex gap-2'>
                    <Text className='text-2xl font-rubik-extrabold'>{propertyData.property_name}</Text>

                    <View className='flex flex-row items-center gap-3'>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold'> Category:</Text>
                            <Text className='text-xs font-rubik-bold text-yellow-800'> {propertyData.category}</Text>
                        </View>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold'> City:</Text>
                            <Text className='text-xs font-rubik-bold text-yellow-800'>  {propertyData.city}</Text>
                        </View>
                    </View>

                    <View className='flex flex-row items-center mt-5'>
                        <View className='flex flex-row items-center justify-center bg-primary-100 rounded-full size-10'>
                            <Image source={icons.bed} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {propertyData.bedroom} Bedroom
                        </Text>

                        <View className='flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.bath} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {propertyData.bathroom} Bathroom
                        </Text>

                        <View className='flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.area} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {propertyData.squarefoot} sqft
                        </Text>
                    </View>

                    <View className="w-full border-t border-primary-200 pt-7 mt-5">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Agent
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between mt-4">
                        <View className="flex flex-row items-center">
                            <Image
                                source={images.avatar}
                                className="size-14 rounded-full"
                            />

                            <View className="flex flex-col items-start justify-center ml-3">
                                <Text className="text-lg text-black-300 text-start font-rubik-bold">
                                    User
                                </Text>
                                <Text className="text-sm text-black-200 text-start font-rubik-medium">
                                    example@gmail.com
                                </Text>
                            </View>
                        </View>

                        <View className="flex flex-row items-center gap-3">
                            <TouchableOpacity>
                                <Image
                                    source={icons.chat}
                                    className="size-7"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image
                                    source={icons.phone}
                                    className="size-7"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className='mt-7'>
                        <Text className='text-black-300 text-xl font-rubik-bold'>Overview</Text>
                        <Text className='text-black-200 text-base font-rubik mt-2'>
                            {propertyData.discription}
                        </Text>
                    </View>

                    {/* facilities */}
                    <View className='mt-7'>
                        <Text className='text-black-300 text-xl font-rubik-bold'>Facilities</Text>

                        {property?.facilities.length > 0 && (
                            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                                {property.facilities.map((item, index) => (
                                    <View
                                        key={index}
                                        className="flex flex-1 flex-col items-center min-w-[20%] max-w-full"
                                    >
                                        <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Image
                                                source={item.icon || icons.info}
                                                className="size-6"
                                            />
                                        </View>

                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            className="text-black-300 text-sm text-center font-rubik mt-1.5"
                                        >
                                            {item.title}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* propertyGallery */}
                    {propertyGallery && propertyGallery.length > 0 ? (
                        <View className="mt-7">
                            <Text className="text-black-300 text-xl font-rubik-bold">
                                Gallery
                            </Text>
                            <FlatList
                                data={propertyGallery} // Use the correct state
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <Image
                                        source={{ uri: item.image }}
                                        className="size-40 rounded-xl"
                                    />
                                )}
                                contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
                            />
                        </View>
                    ) : (
                        <View className="mt-7 justify-center items-center">
                            <Text className="text-gray-400 text-lg">No images available</Text>
                            <Image
                                source={images.defaultGallery} // Fallback image
                                className="size-40 rounded-xl"
                            />
                        </View>
                    )}


                    {videoUrls.length > 0 ? (
                        <View className=" mt-4">
                            <Text className="text-black-300 text-xl font-rubik-bold">Property Videos</Text>
                            <FlatList
                                data={videoUrls}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(_, index) => `video-${index}`}
                                renderItem={({ item }) => <Videobox url={item} />}
                            />
                        </View>
                    ) : (
                        <View className="mt-7 justify-center items-center">
                            <Text className="text-gray-400 text-lg">No videos available</Text>
                        </View>
                    )}



                    {/* location */}
                    <View className="mt-7">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Location
                        </Text>
                        <View className="flex flex-row items-center justify-start mt-4 gap-2">
                            <Image source={icons.location} className="w-7 h-7" />
                            <Text className="text-black-200 text-sm font-rubik-medium">
                                {propertyData.address}
                            </Text>
                        </View>

                        <Image
                            source={images.map}
                            className="h-52 w-full mt-5 rounded-xl"
                        />
                    </View>



                </View>
            </ScrollView>

            <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text className="text-black-200 text-xs font-rubik-medium">
                            Price
                        </Text>
                        <Text
                            numberOfLines={1}
                            className="text-yellow-800 text-start text-2xl font-rubik-bold"
                        >
                            $54321
                        </Text>
                    </View>

                    <TouchableOpacity className="flex-1 flex flex-row items-center justify-center bg-yellow-800 py-3 rounded-full shadow-md shadow-zinc-400">
                        <Text className="text-white text-lg text-center font-rubik-bold">
                            Book Now
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default PropertyDetails

// const styles = StyleSheet.create({})