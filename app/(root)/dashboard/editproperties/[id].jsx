import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Button, ActivityIndicator, FlatList } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Link, router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import images from "@/constants/images";
import Videobox from '../../../../components/Videobox';


const Editproperty = () => {
    const { id } = useLocalSearchParams();
    const [step1Data, setStep1Data] = useState({ name: '', description: '', thumbnail: images.avatar });
    const [step2Data, setStep2Data] = useState({
        Price: '',
        squarefoot: '',
        Bathroom: '',
        Floor: '',
        City: '',
        Address: '',
    });
    const [step3Data, setStep3Data] = useState({ gallery: [], videos: [] });
    const textareaRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [propertyData, setPropertyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [propertyThumbnail, setPropertyThumbnail] = useState(images.avatar); // Default avatar
    const [propertyGallery, setPropertyGallery] = useState([]); // Initialize as an empty array
    const [propertyVideos, setPropertyVideos] = useState([]);
    const [errors, setErrors] = useState(false);

    const onNextStep = () => {
        if (!isValid) {
            setErrors(true);
        } else {
            setErrors(false);
        }
    };

    const [image, setImage] = useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const [videos, setVideos] = useState([]);

    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setVideos([...videos, result.assets[0]]);
        }
    };

    const buttonTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: 'lightgray',
        color: 'black',
    };

    const categories = [
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Villa', value: 'Villa' },
        { label: 'Penthouse', value: 'Penthouse' },
        { label: 'Residences', value: 'Residences' },
        { label: 'Luxury House', value: 'Luxury House' },
        { label: 'Bunglow', value: 'Bunglow' },
    ];
    const status = [
        { label: 'unpublished', value: 'unpublished' },
        { label: 'Published', value: 'published' },
    ];


    // Fetch Property Data
    const fetchPropertyData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://investorlands.com/api/property-details/${id}`);
            // console.log(response.data);
            if (response.data) {
                const apiData = response.data.details;
                setPropertyData(apiData);

                setStep1Data({
                    name: apiData.property_name || '',
                    description: apiData.discription || '',
                });

                setStep2Data({
                    Price: apiData.price || '',
                    squarefoot: apiData.squarefoot || '',
                    Bathroom: apiData.bathroom || '',
                    Floor: apiData.floor || '',
                    City: apiData.city || '',
                    Address: apiData.address || '',
                });


                if (apiData.gallery) {
                    const galleryImages = JSON.parse(apiData.gallery).map(img =>
                        img.startsWith('http') ? img : `https://investorlands.com/${img}`
                    );

                    setPropertyGallery(galleryImages);
                    // console.log("Updated Property Gallery:", galleryImages);
                }
                if (apiData.videos) {
                    const galleryVideos = JSON.parse(apiData.videos).map(video =>
                        video.startsWith('http') ? video : `https://investorlands.com/${video}`
                    );

                    setPropertyVideos(galleryVideos);
                    // console.log("Updated Property Video   :", propertyVideos);
                }


                setSelectedCategory(apiData.category || '');
                setSelectedStatus(apiData.status || '');

                if (apiData.thumbnail) {
                    setPropertyThumbnail(
                        apiData.thumbnail.startsWith('http')
                            ? apiData.thumbnail
                            : `https://investorlands.com/assets/images/Listings/${apiData.thumbnail}`
                    );
                } else {
                    setPropertyThumbnail(images.newYork);
                }
            }
        } catch (error) {
            console.error('Error fetching property data:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (id) {
            fetchPropertyData();
        }
    }, [id]);

    useEffect(() => {
        if (propertyData) {
            // console.log("Status from API:", propertyData.status); // Debugging line

            setStep1Data({
                name: propertyData.property_name || '',
                description: propertyData.discription || '',
            });

            setStep2Data({
                Price: propertyData.price || '',
                squarefoot: propertyData.squarefoot || '',
                Bathroom: propertyData.bathroom || '',
                Floor: propertyData.floor || '',
                City: propertyData.city || '',
                Address: propertyData.address || '',
            });

            setSelectedCategory(propertyData.category || '');
            setSelectedStatus(propertyData.status || ''); // Debug here
            if (propertyData.gallery) {
                const galleryImages = JSON.parse(propertyData.gallery).map(img =>
                    img.startsWith('http') ? img : `https://investorlands.com/${img}`
                );

                setPropertyGallery(galleryImages);
                // console.log("Updated Property Gallery:", galleryImages);
            }
            if (propertyData.videos) {
                const galleryVideos = JSON.parse(propertyData.videos).map(video =>
                    video.startsWith('http') ? video : `https://investorlands.com/${video}`
                );

                setPropertyVideos(galleryVideos);
                // console.log("Updated Property Video   :", propertyVideos);
            }
        }
    }, [propertyData]);

    if (loading) {
        return (
            <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 400 }} />
        );
    }

    if (!propertyData) {
        return (
            <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 400 }} />
        );
    }

    return (
        <SafeAreaView style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={icons.backArrow} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                    Edit My Property
                </Text>
                <Link href={'/notifications'}>
                    <Image source={icons.bell} className='size-6' />
                </Link>
            </View>


            <View className="flex justify-center items-center pt-3">
                <Text className="font-rubik text-lg">{step1Data.name}</Text>
                <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik ring-1 ring-inset ${selectedStatus === 'published' ? ' bg-green-50  text-green-700  ring-green-600/20 ' : 'bg-red-50  text-red-700 ring-red-600/20'}`}>{selectedStatus}</Text>
            </View>

            <View style={styles.container}>
                <ProgressSteps>
                    <ProgressStep label="General" nextBtnTextStyle={buttonTextStyle}>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Property Name</Text>
                            <TextInput style={styles.input} placeholder="Enter property name" value={step1Data.name} onChangeText={text => setStep1Data({ ...step1Data, name: text })} />

                            <Text style={styles.label}>Property Description</Text>
                            <TextInput style={styles.textarea} value={step1Data.description} onChangeText={text => setStep1Data({ ...step1Data, description: text })} maxLength={120} placeholder="Enter property description" multiline numberOfLines={5} />

                            <Text style={styles.label}>Property Thumbnail</Text>
                            <View className="flex flex-row">
                                <TouchableOpacity onPress={pickImage} style={styles.dropbox} className="m-3">
                                    <Text style={{ textAlign: 'center' }}>Pick an image from gallery</Text>
                                </TouchableOpacity>
                                <Image source={{ uri: propertyThumbnail }} style={styles.image} />
                            </View>

                            <Text style={styles.label}>Select category</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)} items={categories} style={pickerSelectStyles} placeholder={{ label: 'Choose an option...', value: null }} />
                            </View>
                        </View>
                    </ProgressStep>
                    <ProgressStep label="Details" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle}>
                        <View>
                            <Text style={{ textAlign: 'center', fontFamily: 'Rubik-Bold' }}>Pricing & Other Details</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Property Price</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Property Price"
                                value={step2Data.Price}
                                onChangeText={text => setStep2Data({ ...step2Data, Price: text })}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.label}>Square Foot</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Square Foot"
                                        value={step2Data.squarefoot}
                                        onChangeText={text => setStep2Data({ ...step2Data, squarefoot: text })}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.label}>Bathroom</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bathroom"
                                        value={step2Data.Bathroom}
                                        onChangeText={text => setStep2Data({ ...step2Data, Bathroom: text })}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.label}>Floor</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Floor"
                                        value={step2Data.Floor}
                                        onChangeText={text => setStep2Data({ ...step2Data, Floor: text })}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.label}>City</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter City"
                                        value={step2Data.City}
                                        onChangeText={text => setStep2Data({ ...step2Data, City: text })}
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Property Address</Text>
                            <TextInput
                                style={styles.textarea}
                                placeholder="Property Address"
                                value={step2Data.Address}
                                onChangeText={text => setStep2Data({ ...step2Data, Address: text })}
                                multiline
                                numberOfLines={5}
                                maxLength={120}
                            />

                        </View>
                    </ProgressStep>
                    <ProgressStep label="Documents" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle}>

                        <Text style={styles.label}>Property Gallery</Text>
                        <TouchableOpacity onPress={pickImage} style={styles.dropbox}>
                            <Text style={{ textAlign: 'center' }}>Pick an image from gallery</Text>
                        </TouchableOpacity>
                        <ScrollView horizontal style={{ marginTop: 10 }}>
                            {propertyGallery && propertyGallery.map((img, index) => (
                                <Image key={index} source={{ uri: img }} style={[styles.image, { marginRight: 10 }]} />
                            ))}
                        </ScrollView>

                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Upload Videos</Text>
                            <TouchableOpacity onPress={pickVideo} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick videos from gallery</Text>
                            </TouchableOpacity>

                            {propertyVideos.length > 0 ? (
                                <View className=" mt-4">
                                    <FlatList
                                        data={propertyVideos}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(_, index) => `video-${index}`}
                                        renderItem={({ item }) => <Videobox url={item} />}
                                    />
                                </View>
                            ) : (
                                <View className="mt-7 justify-center items-center">
                                    <Text className="text-gray-400 text-lg">No videos available</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>Property Status</Text>
                        <View style={styles.pickerContainer}>
                            <RNPickerSelect
                                value={selectedStatus}
                                onValueChange={(value) => setSelectedStatus(value)}
                                items={status}
                                style={pickerSelectStyles}
                                placeholder={{ label: 'Choose an option...', value: null }}
                            />
                        </View>

                    </ProgressStep>
                </ProgressSteps>
            </View>
        </SafeAreaView>
    )
}

export default Editproperty

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 0,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        marginHorizontal: 5,
        marginTop: 10

    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 10
    },
    editor: {
        flex: 1,
        padding: 0,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 30,
        marginVertical: 5,
        backgroundColor: 'white',
    },

    textarea: {
        textAlignVertical: 'top',  // hack android
        height: 110,
        fontSize: 14,
        marginTop: 10,
        borderRadius: 10,
        color: '#333',
        paddingHorizontal: 15,
        backgroundColor: '#edf5ff',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        padding: 5,
        marginTop: 10,
    },
    dropbox: {
        height: 100,
        padding: 15,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#edf5ff',
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        marginTop: 10,
        justifyContent: 'center',
        alignContent: 'center',
    },
    pickerContainer: {
        borderRadius: 10, // Apply borderRadius here
        overflow: 'hidden',
        backgroundColor: '#edf5ff',
        marginTop: 10,
        marginBottom: 20,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        borderRadius: 10,

    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 40,
        color: 'black',
        paddingRight: 30,
    },
});