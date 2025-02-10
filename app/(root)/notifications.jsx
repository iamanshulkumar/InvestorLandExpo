import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images';
import icons from '@/constants/icons';
import { Link, router } from 'expo-router';


const products = [
    {
        id: 1,
        name: 'Throwback Hip Bag',
        href: '#',
        color: 'Salmon',
        time: '2 hours ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
        imageAlt: 'Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.',
    },
    {
        id: 2,
        name: 'Medium Stuff Satchel',
        href: '#',
        color: 'Blue',
        time: '1 day ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-02.jpg',
        imageAlt: 'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
    },
    {
        id: 3,
        name: 'Mini Backpack',
        href: '#',
        color: 'Black',
        time: '3 days ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg',
        imageAlt: 'Black mini backpack with adjustable straps and front zipper pocket.',
    },
    {
        id: 4,
        name: 'Travel Duffel Bag',
        href: '#',
        color: 'Gray',
        time: '5 days ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-04.jpg',
        imageAlt: 'Gray travel duffel bag with black straps and handles.',
    },
    {
        id: 5,
        name: 'Classic Tote Bag',
        href: '#',
        color: 'Red',
        time: '1 week ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-05.jpg',
        imageAlt: 'Red classic tote bag with black handles.',
    },
    {
        id: 6,
        name: 'Leather Wallet',
        href: '#',
        color: 'Brown',
        time: '2 weeks ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-06.jpg',
        imageAlt: 'Brown leather wallet with multiple card slots.',
    },
    {
        id: 7,
        name: 'Canvas Messenger Bag',
        href: '#',
        color: 'Green',
        time: '3 weeks ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-07.jpg',
        imageAlt: 'Green canvas messenger bag with adjustable shoulder strap.',
    },
    {
        id: 8,
        name: 'Weekender Bag',
        href: '#',
        color: 'Navy',
        time: '1 month ago',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-08.jpg',
        imageAlt: 'Navy weekender bag with black handles and shoulder strap.',
    },
]

const Notifications = () => {


    const [readStatus, setReadStatus] = useState(products.map(product => ({ id: product.id, read: false })));

    const toggleReadStatus = (id) => {
        setReadStatus(prevStatus =>
            prevStatus.map(status =>
                status.id === id ? { ...status, read: !status.read } : status
            )
        );
    };

    return (
        <SafeAreaView className="bg-white h-full px-4">
            <View className="flex-row items-center ml-2 justify-between">
                <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                    <Image source={icons.backArrow} className="w-5 h-5" />
                </TouchableOpacity>
                <Text className="text-lg mr-2 text-center font-medium text-gray-700">
                    Notifications
                </Text>
                <View>
                    <TouchableOpacity onPress={() => setReadStatus(readStatus.map(status => ({ ...status, read: true })))}>
                        <Text>Mark all read</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mt-3 mb-12">
                <FlatList
                    data={products}
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName=''
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item: product }) => {
                        const isRead = readStatus.find(status => status.id === product.id)?.read;
                        return (
                            <View className={`flex-row my-1 p-3 rounded-lg border border-gray-100 ${isRead ? ' ' : 'bg-blue-50'}`}>
                                <View className="w-24 h-24 overflow-hidden rounded-lg border border-gray-300">
                                    <Image source={{ uri: product.imageSrc }} className="w-full h-full object-cover" />
                                </View>

                                <View className="ml-4 flex-1 flex-col">
                                    <View className="flex-row justify-between">
                                        <Link href={product.href}>
                                            <Text className="text-lg font-medium text-gray-900">
                                                {product.name}
                                            </Text>
                                        </Link>
                                        <TouchableOpacity onPress={() => toggleReadStatus(product.id)}>
                                            <View className="flex-row items-center">
                                                <View className={`w-5 h-5 border border-gray-100 rounded-full ${isRead ? 'bg-green-600 border-green-400' : '  bg-white'}`} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View className="mt-2 flex-row items-end">
                                        <Text className="text-sm text-gray-500 flex-1">{product.imageAlt}</Text>
                                        <Text className="text-sm text-gray-500 ">{product.time}</Text>
                                    </View>
                                    
                                </View>
                            </View>
                        ); 
                    }}
                />
            </View>
        </SafeAreaView>
    )
}

export default Notifications

const styles = StyleSheet.create({})