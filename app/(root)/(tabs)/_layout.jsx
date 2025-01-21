import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router';
import icons from '@/constants/icons';

const TabIcon = ({ focused, icon, title}) => (
    <View>
        <Image source={icon} />
    </View>
)

const TabsLayout = () => {
    return (
        <Tabs
            ScreenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    position: 'absolute',
                    borderTopColor: '#0061FF1A',
                    borderWidth: 1,
                    minHeight: 70,
                }
            }}
        >
        <Tabs.Screen
            name="index"
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: () => (
                    <View>
                        <TabIcon icon={icons.home} focused={focused} title={home} />
                    </View>
                )
            }}
            >

            </Tabs.Screen>
        </Tabs>
    )
}

export default TabsLayout

const styles = StyleSheet.create({})