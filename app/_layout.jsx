import { SplashScreen, Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './globals.css';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    });

    const [appIsReady, setAppIsReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const prepareApp = async () => {
            try {
                await SplashScreen.preventAutoHideAsync();

                if (fontsLoaded) {
                    const token = await AsyncStorage.getItem("userToken");

                    // Delay navigation until Root Layout is mounted
                    requestAnimationFrame(() => {
                        if (token) {
                            router.replace("/"); // Redirect if logged in
                        } else {
                            router.replace("/signin"); // Redirect if not logged in
                        }
                    });
                }
            } catch (error) {
                console.error("Error during auth check:", error);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        };

        prepareApp();
    }, [fontsLoaded]);

    if (!appIsReady) return null;

    return <Stack screenOptions={{ headerShown: false }} />;
}
