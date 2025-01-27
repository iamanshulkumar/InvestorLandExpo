import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { categories } from '@/constants/data';

const Filters = () => {

    const params = useLocalSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(params.filter || 'All');

    const handleCategoryPress = (category) => { }

    return (
        <ScrollView horizontal showHorizontalScrollIndicator={false} className="mt-3 mb-2 pb-3">
            {categories.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleCategoryPress(item.category)} className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${selectedCategory == item.category ? 'bg-primary-300 text-white' : 'bg-primary-100 border border-primary-200'} `}>
                    <Text>{item.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}

export default Filters;

const styles = StyleSheet.create({})