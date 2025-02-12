import { View, TouchableOpacity, Image, TextInput, Text } from "react-native";
import { useDebouncedCallback } from "use-debounce";
import { useLocalSearchParams, router, usePathname } from "expo-router";
import React, { useState, useRef } from "react";
import icons from "@/constants/icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import RBSheet from "react-native-raw-bottom-sheet";
import Filters from "./Filters";
import { categories } from '@/constants/data';

const Search = () => {
    const path = usePathname();
    const params = useLocalSearchParams();
    const [search, setSearch] = useState(params.query);
    const refRBSheet = useRef(null);

    const debouncedSearch = useDebouncedCallback((text) => {
        router.setParams({ query: text });
    }, 500);

    const handleSearch = (text) => {
        setSearch(text);
        debouncedSearch(text);
    };

    const [selectedCategory, setSelectedCategory] = useState(params.filter || 'All');

    const handleCategoryPress = (category) => {
        if (selectedCategory == category) {
            setSelectedCategory('All');
            router.setParams({ filter: 'all' });
            return;
        }

        setSelectedCategory(category);
        router.setParams({ filter: category });
    }


    return (
        <View className="flex-1">
            {/* Search Bar */}
            <TouchableOpacity onPress={() => refRBSheet.current?.open()}>
                <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
                    <View className="flex-1 flex flex-row items-center justify-start">
                        <Image source={icons.search} className="size-5" />
                        <TextInput
                            value={search}
                            editable={false}
                            placeholder="Search for property"
                            className="text-sm font-rubik text-black-300 ml-2 flex-1"
                        />
                    </View>


                    <Image source={icons.filter} className="size-5" />
                </View>
            </TouchableOpacity>


            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={500}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)",
                    },
                    container: {
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        padding: 20,
                        backgroundColor: "white",
                        maxHeight: "90%",
                    },
                    draggableIcon: {
                        backgroundColor: "#000",
                    },
                }}
            >
                {/* Filter Content */}
                <View>
                    <View className="flex flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => refRBSheet.current.close()} className="p-2 bg-gray-300 rounded-full">
                            <Image
                                source={icons.backArrow}
                                className="size-5"
                            />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-black-300">Filter</Text>
                        <TouchableOpacity onPress={() => refRBSheet.current.close()} className="p-2">
                            <Text className="text-base font-bold text-yellow-800">Reset</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-5">
                        <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 py-2">
                            <View className="flex-1 flex flex-row items-center justify-start">
                                <Image source={icons.search} className="size-5" />
                                <TextInput
                                    value={search}
                                    onChangeText={handleSearch}
                                    placeholder="Search for property"
                                    className="text-sm font-rubik text-black-300 ml-2 flex-1"
                                />
                            </View>
                        </View>

                        <View className="mt-5">
                            <Text className="text-lg font-bold text-black-300">Price Range</Text>
                            <View className="flex flex-row items-center justify-between mt-2">
                                <TextInput
                                    placeholder="Min"
                                    keyboardType="numeric"
                                    className="text-sm font-rubik text-black-300 ml-2 flex-1 border border-primary-100 rounded-lg p-2"
                                />
                                <Text className="mx-2">-</Text>
                                <TextInput
                                    placeholder="Max"
                                    keyboardType="numeric"
                                    className="text-sm font-rubik text-black-300 ml-2 flex-1 border border-primary-100 rounded-lg p-2"
                                />
                            </View>
                        </View>

                        <View className="mt-5">
                            <Text className="text-lg font-bold text-black-300">Property Type</Text>
                            <View className="flex flex-row items-center justify-start mt-2 flex-wrap">
                            {categories.map((item, index) => (
                                <TouchableOpacity key={index} onPress={() => handleCategoryPress(item.category)} className={`flex flex-col items-start mr-4 px-4 py-2 my-1 rounded-full ${selectedCategory == item.category ? 'bg-yellow-800' : 'bg-primary-100 border border-primary-200'} `}>
                                    <Text className={`text-sm ${selectedCategory == item.category ? 'text-white font-rubik-bold mt-0.5' : 'text-black-300 font-rubik'} `}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                        </View>

                    </View>
                </View>
            </RBSheet>
        </View>
    );
};

export default Search;
