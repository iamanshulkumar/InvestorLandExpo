import {
    FlatList,
    Image,
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions,
    Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import images from "@/constants/images";
import Comment from "@/components/Comments";
import { facilities, gallery } from "@/constants/data";

import { useAppwrite } from "@/lib/useAppwrite";
import { getPropertyById } from "@/lib/appwrite";

const PropertyDetails = () => {
    const { id } = useLocalSearchParams();
    const windowHeight = Dimensions.get("window").height;

    const reviews = [
        {
            id: 1,
            user: {
                name: "John Doe",
                avatar: images.avatar,
            },
            rating: 4.5,
            comment: "Great property, had an amazing time!",
            date: "2023-10-01",
        },
        {
            id: 2,
            user: {
                name: "Jane Smith",
                avatar: images.avatar,
            },
            rating: 4.0,
            comment: "Nice place, but could use some improvements.",
            date: "2023-09-15",
        },
    ];

    const property = {
        facilities: facilities,
        gallery: gallery,
        reviews: reviews,
        rating: (
            reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length
        ).toFixed(1),
    };

    return (
        <View className="pb-24">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32 bg-white"
            >
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image
                        source={images.newYork}
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
                    <Text className='text-2xl font-rubik-extrabold'>Modern Apartment {id}</Text>

                    <View className='flex flex-row items-center gap-3'>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold text-primary-300'>Condo</Text>
                        </View>

                        <View className='flex flex-row items-center gap-2'>
                            <Image source={icons.star} className='size-5' />
                            <Text className='text-black-200 text-sm mt-1 font-rubik-medium'>
                                4.5 (5000 reviews)
                            </Text>
                        </View>
                    </View>

                    <View className='flex flex-row items-center mt-5'>
                        <View className='flex flex-row items-center justify-center bg-primary-100 rounded-full size-10'>
                            <Image source={icons.bed} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            5 Beds
                        </Text>

                        <View className='flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.bath} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            5 Baths
                        </Text>

                        <View className='flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.area} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            1500 sqft
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
                                    Agent Name
                                </Text>
                                <Text className="text-sm text-black-200 text-start font-rubik-medium">
                                    agent@gmail.com
                                </Text>
                            </View>
                        </View>

                        <View className="flex flex-row items-center gap-3">
                            <Image
                                source={icons.chat}
                                className="size-7"
                            />
                            <Image
                                source={icons.phone}
                                className="size-7"
                            />
                        </View>
                    </View>

                    <View className='mt-7'>
                        <Text className='text-black-300 text-xl font-rubik-bold'>Overview</Text>
                        <Text className='text-black-200 text-base font-rubik mt-2'>
                            description
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

                    {/* gallery */}
                    {property?.gallery?.length > 0 && (
                        <View className="mt-7">
                            <Text className="text-black-300 text-xl font-rubik-bold">
                                Gallery
                            </Text>
                            <FlatList
                                data={property.gallery}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <Image
                                        source={item.image}
                                        className="size-40 rounded-xl"
                                    />
                                )}
                                contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
                            />
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
                                Address
                            </Text>
                        </View>

                        <Image
                            source={images.map}
                            className="h-52 w-full mt-5 rounded-xl"
                        />
                    </View>

                    {/* reviews */}

                    {property?.reviews.length > 0 && (
                        <View className="mt-7">
                            <View className="flex flex-row items-center justify-between">
                                <View className="flex flex-row items-center">
                                    <Image source={icons.star} className="size-6" />
                                    <Text className="text-black-300 text-xl font-rubik-bold ml-2">
                                        {property?.rating} ({property?.reviews.length} reviews)
                                    </Text>
                                </View>

                                <TouchableOpacity>
                                    <Text className="text-primary-300 text-base font-rubik-bold">
                                        View All
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mt-5">
                                <Comment item={property?.reviews[0]} />
                            </View>
                        </View>
                    )}

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
                            className="text-primary-300 text-start text-2xl font-rubik-bold"
                        >
                            $54321
                        </Text>
                    </View>

                    <TouchableOpacity className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
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

const styles = StyleSheet.create({})