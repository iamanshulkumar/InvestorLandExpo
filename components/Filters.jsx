import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { categories } from '@/constants/data';

const Filters = () => {

    const params = useLocalSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(params.filter || 'All');

    const handleCategoryPress = (category) => {
        if (selectedCategory == category) {
            setSelectedCategory('All');
            router.setParams({filter: 'all'});
            return;
        }

        setSelectedCategory(category);
        router.setParams({filter: category});
    }

    return (
        <ScrollView horizontal showHorizontalScrollIndicator={false} className="mt-3 mb-2 pb-3">
            {categories.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleCategoryPress(item.category)} className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${selectedCategory == item.category ? 'bg-primary-300' : 'bg-primary-100 border border-primary-200'} `}>
                    <Text className={`text-sm ${selectedCategory == item.category ? 'text-white font-rubik-bold mt-0.5' : 'text-black-300 font-rubik'} `}>{item.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}

export default Filters;

const styles = StyleSheet.create({})