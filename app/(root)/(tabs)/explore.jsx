import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card, FeaturedCard } from '@/components/Cards';
import Filters from '@/components/Filters';
import { router } from 'expo-router';

const Explore = () => {
  return (
    <SafeAreaView className='bg-white h-full'>

      <FlatList
        data={[1, 2, 3, 4]}
        renderItem={({ item }) => <Card />}
        keyExtractor={(item) => item.toString()}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName='flex gap-5 px-5'
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className='px-5'>

            <View className='flex flex-row items-center ml-2 justify-between'>
              <TouchableOpacity onPress={() => router.back()} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center" >
                <Image source={icons.backArrow} className='size-5' />
              </TouchableOpacity>

              <Text className='text-base mr-2 text-center font-rubik-medium text-black-300'>
                Search for Your Ideal Home
              </Text>

              <Image source={icons.bell} className='size-6' />
            </View>


            <Search />
            <Filters />

            <View className='my-5'>
              <View className='flex flex-row items-center justify-between'>
                <Text className='text-xl font-rubik-bold text-black-300'>Found X properties</Text>

              </View>
            </View>


          </View>
        }
      />

    </SafeAreaView>
  )
}

export default Explore