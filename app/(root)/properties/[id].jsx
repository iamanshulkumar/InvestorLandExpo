import { FlatList, Image, ScrollView, Text, TouchableOpacity, View, Dimensions, Platform, ActivityIndicator, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { facilities, gallery } from "@/constants/data";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Videobox from "../../../components/Videobox";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from "react-native-maps";
import 'react-native-get-random-values';
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import MasterPlanList from "@/components/MasterPlanList";
import PriceHistoryChart from "@/components/PriceHistoryChart";

const PropertyDetails = () => {
    const [propertyId, setPropertyId] = useState(useLocalSearchParams().id);
    const [address, setAddress] = useState("");
    const windowHeight = Dimensions.get("window").height;
    const [propertyData, setPropertyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [propertyThumbnail, setPropertyThumbnail] = useState(images.avatar); // Default avatar
    const [propertyGallery, setPropertyGallery] = useState(); // Default avatar
    const [videoUrls, setVideoUrls] = useState([]);
    const [loggedinUserId, setLoggedinUserId] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [priceHistory, setPriceHistory] = useState([]);
    const [masterPlanDocs, setMasterPlanDocs] = useState([]);
    const [priceHistoryData, setPriceHistoryData] = useState([]);
    const [isPdf, setIsPdf] = useState(false);
    const property = {
        facilities: facilities,
        gallery: gallery,
    };
    const [coordinates, setCoordinates] = useState({
        latitude: "",
        longitude: "",
    });
    const [region, setRegion] = useState({
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    });
    const navigation = useNavigation();

    const openPdf = (pdfUrl) => {
        Linking.openURL(pdfUrl);
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Allow location access in settings.");
                return;
            }
            // console.log("location:", latitude, longitude);

            let location = await Location.reverseGeocodeAsync({ latitude, longitude });
            // console.log("location:", location);

            if (location.length > 0) {
                const { name, street, city, region, country, postalCode } = location[0];
                setAddress(`${name || street}, ${city}, ${region}, ${country} - ${postalCode}`);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const handleEnquiry = async () => {
        try {
            setLoading(true); // Show loading indicator
            // Get user data from AsyncStorage
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
            const userId = parsedUserData?.id; // Extract user ID safely
            // console.log("Stored userData:", parsedUserData);
            if (!userId) {
                console.error("User ID not found in stored userData.");
                return;
            }
            const enquiryData = {
                customername: parsedUserData.name,
                phone: parsedUserData.mobile,
                email: parsedUserData.email,
                city: propertyData.city || '',
                propertytype: propertyData.category || '',
                propertyid: propertyId,
                userid: parsedUserData.id,
                state: propertyData.city || '',
            };
            // Send enquiry request
            const response = await axios.post("https://investorlands.com/api/sendenquiry", enquiryData);

            if (response.status === 200 && !response.data.error) {
                alert("Enquiry submitted successfully!");
            } else {
                alert("Failed to submit enquiry. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    const shareProperty = async () => {
        try {
            const propertyUrl = `https://investorlands.com/property-details/${propertyId}`;

            const message = `View my property: ${propertyUrl}`;

            const result = await Share.share({
                message: message,
                url: propertyUrl,
                title: "Check out this property!",
            });

            if (result.action === Share.sharedAction) {
                console.log("Property shared successfully!");
            } else if (result.action === Share.dismissedAction) {
                console.log("Share dismissed.");
            }
        } catch (error) {
            console.error("Error sharing property:", error);
        }
    };

    const fetchPropertyData = async () => {
        try {
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
            setLoggedinUserId(parsedUserData?.id || "");

            // Fetch property data from API
            const response = await axios.get(`https://investorlands.com/api/property-details/${propertyId}`);

            if (response.data) {
                const apiData = response.data.details;
                setPropertyData(apiData);

                // ✅ Handle Thumbnail
                setPropertyThumbnail(
                    apiData.thumbnail
                        ? (apiData.thumbnail.startsWith('http')
                            ? apiData.thumbnail
                            : `https://investorlands.com/assets/images/Listings/${apiData.thumbnail}`)
                        : images.newYork
                );

                // ✅ Handle Gallery Images
                let galleryImages = [];
                try {
                    galleryImages = apiData.gallery ? JSON.parse(apiData.gallery).map(image => ({
                        id: Math.random().toString(36).substring(2, 11), // Unique ID
                        image: image.startsWith('http')
                            ? image
                            : `https://investorlands.com/${image.replace(/\\/g, '/')}`
                    })) : [];
                } catch (error) {
                    console.error("Error parsing gallery images:", error);
                }
                setPropertyGallery(galleryImages);

                // ✅ Handle Videos
                let parsedVideos = [];
                try {
                    parsedVideos = apiData.videos
                        ? (typeof apiData.videos === 'string' ? JSON.parse(apiData.videos) : [])
                        : [];
                } catch (error) {
                    console.error("Error parsing videos:", error);
                }
                setVideoUrls(parsedVideos.map(video =>
                    video.startsWith('http') ? video : `https://investorlands.com/${video}`
                ));

                // ✅ Handle Amenities
                let parsedAmenities = [];
                try {
                    parsedAmenities = apiData.amenties
                        ? JSON.parse(apiData.amenties)
                        : [];
                } catch (error) {
                    console.error("Error parsing amenities:", error);
                }
                setAmenities(parsedAmenities);

                // ✅ Handle Price History
                let priceHistory = [];
                try {
                    priceHistory = apiData.pricehistory
                        ? JSON.parse(apiData.pricehistory)
                        : [];
                } catch (error) {
                    console.error("Error parsing price history:", error);
                }
                setPriceHistory(priceHistory);


                if (apiData.maplocations) {
                    try {
                        const locationData = JSON.parse(apiData.maplocations);
                        const latitude = parseFloat(locationData.Latitude);
                        const longitude = parseFloat(locationData.Longitude);

                        if (latitude && longitude) {
                            // Update state
                            setCoordinates({ latitude, longitude });
                            setRegion({
                                latitude,
                                longitude,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.0121,
                            });
                            // console.log("location:",region);

                            // Fetch address from coordinates
                            getAddressFromCoordinates(latitude, longitude);
                        }
                    } catch (error) {
                        console.error("Error parsing map locations:", error);
                    }
                }

                if (apiData.masterplandoc) {
                    const fileUrl = `https://investorlands.com/assets/images/Listings/${apiData.masterplandoc}`;

                    // Check if the file is a PDF or an image
                    if (fileUrl.toLowerCase().endsWith(".pdf")) {
                        setIsPdf(true);
                    } else {
                        setIsPdf(false);
                    }
                    setMasterPlanDocs(fileUrl);
                    // console.log("masterplan:", masterPlanDocs);
                }

                if (apiData.pricehistory) {
                    let priceHistory = apiData.pricehistory;

                    // Ensure priceHistory is an array
                    if (typeof priceHistory === "string") {
                        try {
                            priceHistory = JSON.parse(priceHistory);
                        } catch (error) {
                            console.error("Error parsing price history:", error);
                            priceHistory = []; // Fallback to empty array
                        }
                    }

                    if (Array.isArray(priceHistory)) {
                        setPriceHistoryData(priceHistory);
                    } else {
                        console.error("Invalid price history data format");
                        setPriceHistoryData([]);
                    }
                }
            } else {
                console.error('Unexpected API response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching property data:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {

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
                                    <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik ring-1 ring-inset ${propertyData.status === 'published' ? ' bg-green-50  text-green-700  ring-green-600/20 ' : 'bg-red-50  text-red-700 ring-red-600/20'}`}>{propertyData.status}</Text>
                                }
                                {/* <Image
                                    source={icons.heart}
                                    className="size-7"
                                    tintColor={"#191D31"}
                                /> */}
                                <TouchableOpacity
                                    onPress={shareProperty}
                                    className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                                >
                                    <Image source={icons.send} className="size-7" />
                                </TouchableOpacity>


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
                            <Text className='text-xs font-rubik-bold text-yellow-800'> {propertyData.city}</Text>
                        </View>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Image source={icons.area} className='size-4' />
                            <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                                {propertyData.squarefoot} sqft
                            </Text>
                        </View>
                    </View>

                    <View className='flex flex-row items-center flew-wrap'>
                        <View className='flex flex-row  items-center justify-center bg-primary-100 rounded-full size-10'>
                            <Image source={icons.bed} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {propertyData.bedroom} Bedroom
                        </Text>
                        <View className='flex  flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.bed} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {propertyData.floor} Floors
                        </Text>

                        <View className='flex  flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.bath} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {propertyData.bathroom} Bathroom
                        </Text>

                    </View>

                    <View className="w-full border-t border-primary-200 pt-7 mt-5">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Contact Us
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

                        <Text className='text-black-300 text-base font-rubik-medium mt-3'>Near by Locations:</Text>
                        <Text className='text-black-200 text-base font-rubik mt-2'>
                            {propertyData.nearbylocation}
                        </Text>

                        <Text className='text-black-300 text-center font-rubik-medium mt-2 bg-blue-100 flex-grow p-2 rounded-full'>
                            Approx Rental Income: ₹{propertyData.approxrentalincome}
                        </Text>
                    </View>

                    {/* facilities */}
                    {amenities && Array.isArray(amenities) && amenities.length > 0 && (
                        <View className='mt-7'>
                            <Text className='text-black-300 text-xl font-rubik-bold'>Amenties</Text>
                            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-3">
                                {amenities.map((item, index) => (
                                    <View key={index} className="flex items-start">
                                        <View className="px-3 py-2 bg-blue-100 rounded-full flex flex-row items-center justify-center">
                                            <Image source={icons.checkmark} className="size-6 me-2" />
                                            <Text className="text-black-300 text-sm text-center font-rubik-bold capitalize">
                                                {item}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}


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
                        <View className="flex flex-row items-center justify-start my-4 gap-2">
                            <Image source={icons.location} className="w-7 h-7" />
                            <Text className="text-black-200 text-sm font-rubik-medium">
                                {propertyData.address}
                            </Text>
                        </View>

                        <View>
                            <MapView
                                style={{ height: 150, borderRadius: 10 }}
                                region={region}
                                initialRegion={region}
                            >
                                {region && <Marker coordinate={coordinates} />}
                            </MapView>

                            {/* 🔹 Show the Address Below the Map */}
                            {address ? (
                                <Text className="text-center text-black-500 mt-2 font-bold">
                                    📍 {address}
                                </Text>
                            ) : (
                                <Text className="text-center text-gray-500 mt-2">Fetching address...</Text>
                            )}
                        </View>

                    </View>


                    <View className="mt-7">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Documents
                        </Text>
                        <View className="mt-4">
                            <View className="mt-4">
                                <MasterPlanList masterPlanDocs={masterPlanDocs} />
                            </View>

                        </View>

                    </View>
                    <View className="mt-7">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Price History
                        </Text>
                        <View className="mt-4">
                            <View className="mt-4">
                                <PriceHistoryChart priceHistoryData={priceHistoryData} />
                            </View>

                        </View>

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
                            ₹{propertyData.price}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => handleEnquiry()} className="flex-1 flex flex-row items-center justify-center bg-yellow-800 py-3 rounded-full shadow-md shadow-zinc-400">
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