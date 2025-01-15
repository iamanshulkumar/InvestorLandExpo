import { useGlobalContext } from "@/lib/global-provider";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppLayout() {
    const { loading, isLoggedIn } = useGlobalContext();

    if (loading) {
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        );
    }

    if (!isLoggedIn) {
        console.log('Redirecting to /signin');
        return <Redirect href="/signin" />;
    }

    return <Slot />;
}
