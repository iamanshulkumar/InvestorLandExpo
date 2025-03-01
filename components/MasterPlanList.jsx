import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Linking } from "react-native";

const MasterPlanList = ({ masterPlanDocs }) => {
    const openPdf = (pdfUrl) => {
        Linking.openURL(pdfUrl);
    };

    const renderItem = ({ item }) => {
        const isPdf = item.toLowerCase().endsWith(".pdf");

        return (
            <View className="mb-4">
                {isPdf ? (
                    <TouchableOpacity onPress={() => openPdf(item)}>
                        <View className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Text className="text-lg text-blue-500 underline">View PDF</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <Image
                        source={{ uri: item }}
                        className="w-full h-96 rounded-lg"
                        resizeMode="contain"
                    />
                )}
            </View>
        );
    };

    return (
        <View className="mt-4">
            {masterPlanDocs?.length > 0 ? (
                <FlatList
                    data={masterPlanDocs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
                />
            ) : (
                <Text className="text-gray-500 text-center">No Master Plan Available</Text>
            )}
        </View>
    );
};

export default MasterPlanList;
