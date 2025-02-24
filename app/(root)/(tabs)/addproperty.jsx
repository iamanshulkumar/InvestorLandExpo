import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Link, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as VideoThumbnails from 'expo-video-thumbnails';
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";
import 'react-native-get-random-values';

const Addproperty = () => {
    const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;
    const [step1Data, setStep1Data] = useState({ property_name: '', description: '', nearbylocation: '', rentalIncome: '', });
    const [step2Data, setStep2Data] = useState({ price: '', amenities: '', sqft: '', bathroom: '', floor: '', city: '', officeaddress: '', });
    const [step3Data, setStep3Data] = useState();
    const textareaRef = useRef(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const [propertyDocuments, setPropertyDocuments] = useState([]);
    const [masterPlanDoc, setMasterPlanDoc] = useState([]);
    const [errors, setErrors] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [videos, setVideos] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [region, setRegion] = useState({
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    });
    const [coordinates, setCoordinates] = useState({
        latitude: "",
        longitude: "",
    });


    const validateStep = (step) => {
        if (step === 1) {
            return step1Data?.property_name && step1Data?.description && step1Data?.nearbylocation;
        }
        if (step === 2) {
            return step2Data?.price && step2Data?.amenities && step2Data?.sqft && step2Data?.bathroom && step2Data?.floor && step2Data?.city;
        }
        return true;
    };

    const onNextStep = (step) => {
        if (!validateStep(step)) {
            setErrors(true);
            Alert.alert("Validation Error", "Please fill all required fields.");
        } else {
            setErrors(false);
        }
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "Please allow access to media library.");
            return false;
        }
        return true;
    };

    const pickMainImage = async () => {
        if (!(await requestPermissions())) return;
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result?.canceled) {
            setMainImage(result.assets[0].uri);
        }
    };

    const pickGalleryImages = async () => {
        if (!(await requestPermissions())) return;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImages = result.assets.map(asset => asset.uri);
            setGalleryImages(prevImages => [...prevImages, ...selectedImages]);
        }
    };


    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const selectedVideos = result.assets;

            const videoDataPromises = selectedVideos.map(async (video) => {
                try {
                    const thumbnail = await VideoThumbnails.getThumbnailAsync(video.uri, {
                        time: 1000, // Capture frame at 1 sec
                    });

                    return { id: video.uri, uri: video.uri, thumbnailImages: thumbnail.uri };
                } catch (error) {
                    console.error("Thumbnail generation error:", error);
                    return { id: video.uri, uri: video.uri, thumbnailImages: null };
                }
            });

            const videoDataArray = await Promise.all(videoDataPromises);
            // console.log("Final Video List:", videoDataArray); // Debugging Output

            setVideos(prevVideos => [...prevVideos, ...videoDataArray]);
        }
    };


    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            multiple: true, // Enable multiple selection
        });

        if (result.canceled) return;

        // Ensure result is an array (Expo returns a single object if only one file is selected)
        const selectedDocuments = Array.isArray(result.assets) ? result.assets : [result];

        // Format documents to include a dummy thumbnail and prevent duplicates
        const newDocuments = selectedDocuments.map(doc => ({
            uri: doc.uri,
            name: doc.name || 'Unnamed Document',
            thumbnail: 'https://cdn-icons-png.flaticon.com/512/337/337946.png', // Dummy PDF icon
        }));

        setPropertyDocuments(prevDocs => [...prevDocs, ...newDocuments]);
    };

    // Function to remove a document
    const removeDocument = (index) => {
        setPropertyDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
    };


    const pickMasterPlan = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'], // Allow PDFs and images
            multiple: true, // Enable multiple selection
        });

        if (result.canceled) return;

        // Ensure result is an array (Expo returns a single object if only one file is selected)
        const selectedDocuments = Array.isArray(result.assets) ? result.assets : [result];

        // Format documents to include a dummy thumbnail for PDFs and the actual preview for images
        const newDocuments = selectedDocuments.map(doc => ({
            uri: doc.uri,
            name: doc.name || 'Unnamed Document',
            thumbnail: doc.mimeType.startsWith('image') ? doc.uri : 'https://cdn-icons-png.flaticon.com/512/337/337946.png', // Use actual image for images, PDF icon for PDFs
        }));

        setMasterPlanDoc(prevDocs => [...prevDocs, ...newDocuments]);
    };

    // Function to remove a document
    const removeMasterPlan = (index) => {
        setMasterPlanDoc(prevDocs => prevDocs.filter((_, i) => i !== index));
    };

    // Function to handle location selection from Google Places
    const handlePlaceSelect = (data, details = null) => {
        if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            setRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            });

            // Store selected coordinates
            setCoordinates({
                latitude: lat.toString(),
                longitude: lng.toString(),
            });
        }
    };

    // Function to handle manual selection on the map
    const handleMapPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        });

        // Store manual coordinates
        setCoordinates({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        });
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
        { label: 'Unpublished', value: 'Unpublished' },
        { label: 'Published', value: 'Published' },
    ];

    const getUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Could not retrieve user data.");
            return null;
        }
    };


    const handleSubmit = async () => {
        setLoading(true);
        try {
            const userData = await getUserData();
            if (!userData) return;

            const { roleid, usertype } = userData;
            const formData = new FormData();

            // Add text fields
            Object.keys(step1Data).forEach((key) => formData.append(key, step1Data[key]));
            Object.keys(step2Data).forEach((key) => formData.append(key, step2Data[key]));
            formData.append("category", selectedCategory);
            formData.append("status", selectedStatus);
            formData.append("roleid", roleid);
            formData.append("usertype", usertype);

            // 📍 Add coordinates
            formData.append("latitude", coordinates.latitude);
            formData.append("longitude", coordinates.longitude);

            // Add main image
            if (mainImage) {
                const fileType = mainImage.split('.').pop();
                formData.append("thumbnailImages", {
                    uri: mainImage,
                    type: `image/${fileType}`,
                    name: `mainImage-thumbnail.${fileType}`,
                });
            }

            // Add gallery images (Loop through each image)
            galleryImages.forEach((image, index) => {
                const fileType = image.split('.').pop();
                formData.append(`gallery_${index}`, {
                    uri: image,
                    type: `image/${fileType}`,
                    name: `gallery_${index}.jpg`,
                });
            });

            // Add documents (Handle PDFs & Images)
            [...propertyDocuments, ...masterPlanDoc].forEach((doc, index) => {
                const fileType = doc.uri.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
                formData.append(`document_${index}`, {
                    uri: doc.uri,
                    type: fileType,
                    name: doc.name || `document_${index}.${fileType === "application/pdf" ? "pdf" : "jpg"}`,
                });
            });

            // Add videos
            videos.forEach((video, index) => {
                formData.append(`video_${index}`, {
                    uri: video.uri,
                    type: "video/mp4",
                    name: `video_${index}.mp4`,
                });
            });

            console.log("Uploading FormData:", formData); // Debugging

            // Send data
            const response = await axios.post("https://investorlands.com/api/insertlisting", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Property added successfully!',
                });
                resetForm();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to add property.',
                });
            }
        } catch (error) {
            console.error("API Error:", error?.response?.data || error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset Form Function
    const resetForm = () => {
        setStep1Data({ property_name: '', description: '', nearbylocation: '', rentalIncome: '' });
        setStep2Data({ price: '', amenities: '', sqft: '', bathroom: '', floor: '', city: '', officeaddress: '' });
        setStep3Data(null); // Initialize with a default value
        setSelectedCategory(null);
        setSelectedStatus(null);
        setMainImage(null);
        setGalleryImages([]);
        setPropertyDocuments([]);
        setMasterPlanDoc([]);
        setVideos([]);
    };



    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <SafeAreaView style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={icons.backArrow} style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                        Add New Property
                    </Text>
                    <Link href={'/notifications'}>
                        <Image source={icons.bell} className='size-6' />
                    </Link>
                </View>
                <View style={styles.container}>

                    <ProgressSteps>

                        <ProgressStep label="General"
                            nextBtnTextStyle={buttonTextStyle}
                            // onNext={() => onNextStep(1)} 
                            errors={errors}
                        >
                            <View style={styles.stepContent}>
                                {/* enter property name */}
                                <Text style={styles.label}>Property Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter property name"
                                    value={step1Data.property_name}
                                    onChangeText={text => setStep1Data({ ...step1Data, property_name: text })}
                                />

                                {/* enter near by location */}
                                <Text style={styles.label}>Near By Location</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter near by location"
                                    value={step1Data.nearbylocation}
                                    onChangeText={text => setStep1Data({ ...step1Data, nearbylocation: text })}
                                />

                                {/* enter rental income */}
                                <Text style={styles.label}>Approx Rental Income</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter approx rental income"
                                    value={step1Data.rentalIncome} // Create a separate state variable
                                    onChangeText={text => setStep1Data({ ...step1Data, rentalIncome: text })}
                                />

                                {/* enter description */}
                                <Text style={styles.label}>Property Description</Text>
                                <TextInput
                                    style={styles.textarea}
                                    value={step1Data.description}
                                    onChangeText={text => setStep1Data({ ...step1Data, description: text })} maxLength={120}
                                    placeholder="Enter property description"
                                    multiline numberOfLines={5}
                                />

                                {/* enter thumbnail */}
                                <Text style={styles.label}>Property Thumbnail</Text>
                                {mainImage && <Image source={{ uri: mainImage }} style={styles.image} />}
                                <TouchableOpacity onPress={pickMainImage} style={styles.dropbox}>
                                    <Text style={{ textAlign: 'center' }}>Pick an image from gallery</Text>
                                </TouchableOpacity>

                                {/* select category */}
                                <Text style={styles.label}>Select category</Text>
                                <RNPickerSelect
                                    onValueChange={(value) => setSelectedCategory(value)}
                                    items={categories}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>
                        </ProgressStep>

                        <ProgressStep label="Details"
                            nextBtnTextStyle={buttonTextStyle}
                            previousBtnTextStyle={buttonTextStyle}
                            // onNext={() => onNextStep(2)} 
                            errors={errors}
                        >
                            <View>
                                <Text style={{ textAlign: 'center', fontFamily: 'Rubik-Bold' }}>Pricing & Other Details</Text>
                            </View>
                            <View style={styles.stepContent}>
                                {/* enter property price */}
                                <Text style={styles.label}>Property Price</Text>
                                <TextInput style={styles.input} placeholder="Property Price" value={step2Data.price} onChangeText={text => setStep2Data({ ...step2Data, price: text })} />

                                {/* enter amenities */}
                                <Text style={styles.label}>Features & Amenities</Text>
                                <TextInput style={styles.input} placeholder="Enter to Add Amenities" value={step2Data.amenities} onChangeText={text => setStep2Data({ ...step2Data, amenities: text })} />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {/* enter squre foot area */}
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.label}>Square Foot</Text>
                                        <TextInput style={styles.input} placeholder="Square Foot" value={step2Data.sqft} onChangeText={text => setStep2Data({ ...step2Data, sqft: text })} />
                                    </View>

                                    {/* enter number of bathrooms */}
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={styles.label}>Bathroom</Text>
                                        <TextInput style={styles.input} placeholder="Bathroom" value={step2Data.bathroom} onChangeText={text => setStep2Data({ ...step2Data, bathroom: text })} />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {/* enter number of floors */}
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.label}>Floor</Text>
                                        <TextInput style={styles.input} placeholder="Floor" value={step2Data.floor} onChangeText={text => setStep2Data({ ...step2Data, floor: text })} />
                                    </View>

                                    {/* enter property city */}
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={styles.label}>City</Text>
                                        <TextInput style={styles.input} placeholder="Enter City" value={step2Data.city} onChangeText={text => setStep2Data({ ...step2Data, city: text })} />
                                    </View>
                                </View>

                                {/* enter property address */}
                                <Text style={styles.label}>Property Address</Text>
                                <TextInput style={styles.textarea} placeholder="Property Address" value={step2Data.officeaddress} onChangeText={text => setStep2Data({ ...step2Data, officeaddress: text })} multiline numberOfLines={5} maxLength={120} />

                                <Text style={styles.label}>Pin Location in Map</Text>
                                <View styles={styles.mapTextInput}>
                                    <GooglePlacesAutocomplete
                                        placeholder="Search location"
                                        fetchDetails={true}
                                        onPress={handlePlaceSelect}
                                        onFail={(error) => console.error(error)}
                                        query={{
                                            key: GOOGLE_MAPS_API_KEY,
                                            language: "en",
                                        }}
                                        styles={styles.mapTextInput}
                                    />
                                </View>

                                <Text style={{ marginVertical: 10, fontWeight: "bold" }}>Pin Location on Map</Text>
                                <MapView
                                    style={{ height: 300, borderRadius: 10 }}
                                    region={region}
                                    onPress={handleMapPress}
                                >
                                    <Marker coordinate={region} />
                                </MapView>



                            </View>
                        </ProgressStep>

                        <ProgressStep label="Documents" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle} onSubmit={handleSubmit}>
                            {/* select status */}
                            <View style={styles.stepContent}>
                                <Text style={styles.label}>Select Status</Text>
                                <RNPickerSelect onValueChange={(value) => setSelectedValue(value)} items={status} style={pickerSelectStyles} placeholder={{ label: 'Choose an option...', value: null }} />
                            </View>

                            {/* upload gallery */}
                            <Text style={styles.label}>Property Gallery</Text>
                            <FlatList
                                data={galleryImages}
                                horizontal
                                keyExtractor={(item, index) => index.toString()}
                                nestedScrollEnabled={true}
                                contentContainerStyle={styles.fileContainer}
                                renderItem={({ item, index }) => (
                                    <View style={styles.thumbnailBox} className="border border-gray-300">
                                        <Image source={{ uri: item }} style={styles.thumbnail} />
                                        <Text className="text-center font-rubik-bold">Image: {index + 1}</Text>

                                        <TouchableOpacity
                                            onPress={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                                            style={styles.deleteButton}
                                        >
                                            <Text className="text-white">X</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />

                            <TouchableOpacity onPress={pickGalleryImages} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick images from gallery</Text>
                            </TouchableOpacity>




                            {/* Upload video */}
                            <View style={styles.stepContent}>
                                <Text style={styles.label}>Upload Videos</Text>
                                <FlatList
                                    data={videos}
                                    horizontal
                                    keyExtractor={(item) => item.id.toString()}
                                    nestedScrollEnabled={true}
                                    contentContainerStyle={styles.fileContainer}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.thumbnailBox} className="border border-gray-300">
                                            <Image
                                                source={{ uri: `${item.thumbnail}?update=${new Date().getTime()}` }}
                                                style={styles.thumbnail}
                                            />
                                            <Text className="text-center font-rubik-bold">Video {index + 1}</Text>

                                            <TouchableOpacity
                                                onPress={() => setVideos(videos.filter((v) => v.id !== item.id))}
                                                style={styles.deleteButton}
                                            >
                                                <Text className="text-white">X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />


                                <TouchableOpacity onPress={pickVideo} style={styles.dropbox}>
                                    <Text style={{ textAlign: 'center' }}>Pick videos from gallery</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.stepContent}>
                                <Text style={styles.label}>Upload Property Documents</Text>
                                <FlatList
                                    data={propertyDocuments}
                                    horizontal
                                    nestedScrollEnabled={true}
                                    keyExtractor={(_, index) => index.toString()}
                                    contentContainerStyle={styles.fileContainer}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.thumbnailBox} className="border border-gray-300">
                                            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                                            <Text className="text-center font-rubik-bold">Doc {index + 1}</Text>

                                            <TouchableOpacity onPress={() => removeDocument(index)} style={styles.deleteButton}>
                                                <Text className="text-white">X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />

                                <TouchableOpacity onPress={pickDocument} style={styles.dropbox}>
                                    <Text style={{ textAlign: 'center' }}>Pick Doc from gallery</Text>
                                </TouchableOpacity>
                            </View>

                            {/* upload document */}
                            <View style={styles.stepContent}>
                                <Text style={styles.label}>Upload Master Plan of Property</Text>
                                <FlatList
                                    data={masterPlanDoc}
                                    horizontal
                                    nestedScrollEnabled={true}
                                    keyExtractor={(_, index) => index.toString()}
                                    contentContainerStyle={styles.fileContainer}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.thumbnailBox} className="border border-gray-300">
                                            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                                            <Text className="text-center font-rubik-bold">Plan {index + 1}</Text>

                                            <TouchableOpacity onPress={() => removeMasterPlan(index)} style={styles.deleteButton}>
                                                <Text className="text-white">X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />

                                <TouchableOpacity onPress={pickMasterPlan} style={styles.dropbox}>
                                    <Text style={{ textAlign: 'center' }}>Pick Master Plan from gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </ProgressStep>
                    </ProgressSteps>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

export default Addproperty

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    stepContent: {
        paddingBottom: 20,
    },
    fileContainer: {
        padding: 5,
        backgroundColor: '#fff',
        flexDirection: 'row',
        display: 'flex',
    },
    deleteButton: {
        paddingHorizontal: 7,
        color: 'white',
        borderWidth: 1,
        borderRadius: 7,
        borderColor: 'red',
        marginLeft: 10,
        backgroundColor: 'red',
        width: 25,
        position: 'absolute',
        top: 0,
        right: 0,
    },
    label: {
        fontSize: 16,
        marginHorizontal: 5,
        marginTop: 10,
        fontWeight: 'bold',
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

    mapTextInput: {
        width: '100%',
        height: 50,
        borderColor: "#edf5ff",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
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
    },
    thumbnail: {
        width: 73,
        height: 70,
        borderRadius: 10,
    },
    thumbnailBox: {
        width: 75,
        height: 95,
        borderRadius: 10,
        marginRight: 10,
    },
    dropbox: {
        height: 80,
        padding: 5,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#edf5ff',
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        marginTop: 10,
        justifyContent: 'center',
        alignContent: 'center',
    },
    map: {
        width: '100%',
        height: 150,
        marginTop: 10
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
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
        marginTop: 10,
    },
});
