import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList, Alert, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';

const Addproperty = () => {
    const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;
    const [step1Data, setStep1Data] = useState({ property_name: '', description: '', nearbylocation: '', });
    const [step2Data, setStep2Data] = useState({ approxrentalincome: '', historydate: [], price: '', price: '' });
    const [step3Data, setStep3Data] = useState({ sqfoot: '', bathroom: '', floor: '', city: '', officeaddress: '', });
    const [isValid, setIsValid] = useState(false);

    const [propertyDocuments, setPropertyDocuments] = useState([]);
    const [propertyDocNames, setPropertyDocNames] = useState([]);

    const [masterPlanDoc, setMasterPlanDoc] = useState([]);
    const [masterPlanDocNames, setMasterPlanDocNames] = useState([]);

    const [errors, setErrors] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [mainImage, setMainImage] = useState(null);

    const [videos, setVideos] = useState([]);
    const [videoNames, setVideoNames] = useState([]);

    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryImageNames, setGalleryImageNames] = useState([]);

    const [loading, setLoading] = useState(false);
    const [amenity, setAmenity] = useState('');
    const [amenities, setAmenities] = useState([]);
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
    const [show, setShow] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [price, setPrice] = useState('');

    const validateStep = (step) => {
        if (step === 1) {
            return step1Data?.property_name && step1Data?.description && step1Data?.nearbylocation;
        }
        if (step === 2) {
            return step3Data?.sqfoot && step3Data?.bathroom && step3Data?.floor && step3Data?.city;
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

    const handleAddAmenity = () => {
        if (amenity.trim() !== '') {
            setAmenities([...amenities, amenity.trim()]);
            setAmenity('');
        }
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

    const extractFileName = (uri) => uri.split('/').pop();

    const pickGalleryImages = async () => {
        if (!(await requestPermissions())) return;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedURIs = result.assets.map(asset => asset.uri); // Full paths for UI display
            const selectedNames = result.assets.map(asset => extractFileName(asset.uri)); // Extract only filenames

            setGalleryImages(prevImages => [...new Set([...prevImages, ...selectedURIs])]); // Keep URIs for UI
            setGalleryImageNames(prevNames => [...new Set([...prevNames, ...selectedNames])]); // Store filenames for API
        }
    };

    // Handle Date Change
    const handleDateChange = (event, date) => {
        setShow(false);
        if (date) {
            const formattedDate = date.toLocaleDateString("en-GB"); // Convert to YYYY-MM-DD
            setSelectedDate(formattedDate);
        }
    };

    // Add Price History Entry
    const addPriceHistory = () => {
        if (selectedDate && price) {
            const newHistoryEntry = { dateValue: selectedDate, priceValue: price };

            setStep2Data((prevData) => ({
                ...prevData,
                historydate: [...prevData.historydate, newHistoryEntry],
            }));

            setSelectedDate('');
            setPrice('');
        }
    };

    // Function to remove a specific price history entry
    const removePriceHistory = (index) => {
        setStep2Data((prevData) => ({
            ...prevData,
            historydate: prevData.historydate.filter((_, i) => i !== index),
        }));
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
                    return { id: video.uri, uri: video.uri, thumbnailImages: "https://via.placeholder.com/150?text=No+Thumbnail" };
                } catch (error) {
                    console.error("Thumbnail generation error:", error);
                    return { id: video.uri, uri: video.uri, thumbnailImages: "https://via.placeholder.com/150?text=No+Thumbnail" }; // Default thumbnail
                }
            });

            const videoDataArray = await Promise.all(videoDataPromises);
            const videoFileNames = selectedVideos.map(video => extractFileName(video.uri));

            setVideos(prevVideos => [...prevVideos, ...videoDataArray]); // Store full URIs for UI
            setVideoNames(prevNames => [...prevNames, ...videoFileNames]); // Store filenames for API
        }
    };



    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            multiple: true, // Enable multiple selection
        });

        if (result.canceled) return;

        const selectedDocuments = Array.isArray(result.assets) ? result.assets : [result];

        const newDocuments = selectedDocuments.map(doc => ({
            uri: doc.uri,
            name: doc.name || 'Unnamed Document',
            thumbnail: 'https://cdn-icons-png.flaticon.com/512/337/337946.png', // PDF icon
        }));

        const newDocNames = selectedDocuments.map(doc => extractFileName(doc.uri));

        setPropertyDocuments(prevDocs => [...prevDocs, ...newDocuments]); // Keep full URIs for UI
        setPropertyDocNames(prevNames => [...prevNames, ...newDocNames]);
    };

    // Function to remove a document
    const removeDocument = (index) => {
        setPropertyDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
        setPropertyDocNames(prevNames => prevNames.filter((_, i) => i !== index));
    };


    const pickMasterPlan = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'], // Allow PDFs and images
            multiple: true,
        });

        if (result.canceled) return;

        const selectedDocuments = Array.isArray(result.assets) ? result.assets : [result];

        const newDocuments = selectedDocuments.map(doc => ({
            uri: doc.uri,
            name: doc.name || 'Unnamed Document',
            thumbnail: doc.mimeType.startsWith('image') ? doc.uri : 'https://cdn-icons-png.flaticon.com/512/337/337946.png', // Image preview or PDF icon
        }));

        const newDocNames = selectedDocuments.map(doc => extractFileName(doc.uri));

        setMasterPlanDoc(prevDocs => [...prevDocs, ...newDocuments]); // Keep full URIs for UI
        setMasterPlanDocNames(prevNames => [...prevNames, ...newDocNames]);
    };

    // Function to remove a document
    const removeMasterPlan = (index) => {
        setMasterPlanDoc(prevDocs => prevDocs.filter((_, i) => i !== index));
        setMasterPlanDocNames(prevNames => prevNames.filter((_, i) => i !== index));
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

    const buttonPreviousTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: '#ff938f',
        color: 'black',
    };
    const buttonNextTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: 'lightgreen',
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
            const userData = await AsyncStorage.getItem('userData');
            const userToken = await AsyncStorage.getItem('userToken');

            console.log("Logged-in userToken:", userToken);

            return {
                userData: userData ? JSON.parse(userData) : null,
                userToken: userToken ? userToken : null
            };
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Could not retrieve user data.");
            return null;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { userData, userToken } = await getUserData();
            if (!userData) return;
            console.log("Logged-in User:", userData);
            console.log("Logged-in userToken:", userToken);
            
            const { id, user_type } = userData;
            if (!userToken) {
                throw new Error("User is not authenticated. Token missing.");
            }
    
            const formattedVideos = videoNames.join(",");
            const formattedGalleryImages = galleryImageNames.join(",");
            const formattedPropertyDocs = propertyDocNames.join(",");
            const formattedMasterPlanDocs = masterPlanDocNames.join(",");
    
            const formData = new FormData();
    
            // Add text fields
            Object.keys(step1Data).forEach((key) => formData.append(key, step1Data[key]));
            Object.keys(step3Data).forEach((key) => formData.append(key, step3Data[key]));
            formData.append("category", selectedCategory ?? "");
            formData.append("status", selectedStatus ?? "");
            formData.append("roleid", id ?? "");
            formData.append("usertype", user_type ?? "");
            formData.append("amenities", JSON.stringify(amenities));
    
            // ✅ Ensure `step2Data` is not null before accessing `historydate`
            formData.append("historydate", JSON.stringify(step2Data?.historydate ?? []));
    
            // Append coordinates
            const locationData = JSON.stringify({
                Latitude: coordinates.latitude,
                Longitude: coordinates.longitude,
            });
            formData.append("location", locationData);
    
            // Add main image
            if (mainImage) {
                const fileType = mainImage.split('.').pop();
                formData.append("thumbnailImages", {
                    uri: mainImage,
                    type: `image/${fileType}`,
                    name: `mainImage-thumbnail.${fileType}`,
                });
            }
            formData.append("bedroom", step3Data?.bedroom ?? "");

            // Add videos
            formData.append("propertyvideos", formattedVideos || "");
    
            // Add gallery images
            formData.append("galleryImages", formattedGalleryImages || "");
    
            // Store only filenames in form data
            formData.append("documents", formattedPropertyDocs || "");
            formData.append("masterplandocument", formattedMasterPlanDocs || "");
    
            console.log("Uploading FormData:", formData);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            
            // Send data
            const response = await axios.post("https://investorlands.com/api/insertlisting", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${userToken}`,
                },
            });
            console.log("API Response:", response.data); // ✅ Check what API is returning
            if (response.status === 200) {
                Alert.alert("Success", "Property added successfully!", [{ text: "OK" }]);
            } else {
                Alert.alert("Error", "Failed to add property.");
            }
        } catch (error) {
            console.error("API Error:", error?.response?.data || error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    

    // Reset Form Function
    const resetForm = () => {
        setStep1Data({ 
            property_name: '', 
            description: '', 
            nearbylocation: '', 
            approxrentalincome: '', 
            price: '' 
        });
    
        setStep3Data({ 
            price: '', 
            amenities: '', 
            sqfoot: '', 
            bathroom: '', 
            floor: '', 
            city: '', 
            officeaddress: '' 
        });
    
        // ✅ Instead of `null`, initialize step2Data with an empty object that includes `historydate`
        setStep2Data({ historydate: [] });
    
        setSelectedCategory(null);
        setSelectedStatus(null);
        setMainImage(null);
        setGalleryImages([]);
        setPropertyDocuments([]);
        setMasterPlanDoc([]);
        setVideos([]);
    };
    



    return (
        <SafeAreaView style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={icons.backArrow} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                    Add New Property
                </Text>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Image source={icons.bell} className='size-6' />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <ProgressSteps>
                    <ProgressStep label="General"
                        nextBtnTextStyle={buttonNextTextStyle}
                    // onNext={() => onNextStep(1)}
                    // errors={errors}
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
                            <View className="flex flex-row">
                                <TouchableOpacity onPress={pickMainImage} style={styles.dropbox}>
                                    <Text style={{ textAlign: 'center' }}>Pick an image from gallery</Text>
                                </TouchableOpacity>
                                {mainImage && <Image source={{ uri: mainImage }} style={styles.image} />}
                            </View>

                            {/* select category */}
                            <Text style={styles.label}>Select category</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setSelectedCategory(value)}
                                    items={categories}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>

                            {/* enter near by location */}
                            <Text style={styles.label}>Near By Location</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter near by location"
                                value={step1Data.nearbylocation}
                                onChangeText={text => setStep1Data({ ...step1Data, nearbylocation: text })}
                            />


                        </View>
                    </ProgressStep>

                    <ProgressStep label="Price"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                    // onNext={() => onNextStep(2)}
                    // errors={errors}
                    >
                        <View>
                            <Text style={{ textAlign: 'center', fontFamily: 'Rubik-Bold' }}>Pricing & Other Details</Text>
                        </View>

                        <View style={styles.stepContent}>
                            {/* enter rental income */}
                            <Text style={styles.label}>Approx Rental Income</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter approx rental income"
                                value={step1Data.approxrentalincome} // Create a separate state variable
                                onChangeText={text => setStep1Data({ ...step1Data, approxrentalincome: text })}
                            />

                            <Text style={styles.label}>Current Property Price</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter approx rental income"
                                value={step1Data.price} // Create a separate state variable
                                onChangeText={text => setStep1Data({ ...step1Data, price: text })}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>

                                    {/* enter property price */}
                                    <Text style={styles.label}>Property Price</Text>

                                    {/* Enter Price */}
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Property Price"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={{ flex: 1 }}>

                                    {/* Select Date */}
                                    <Text style={styles.label}>Price History</Text>
                                    <TouchableOpacity onPress={() => setShow(true)}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD-MM-YYYY"
                                            value={selectedDate}
                                            editable={false}
                                        />
                                    </TouchableOpacity>

                                    {show && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                                            onChange={handleDateChange}
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Add to Price History */}
                            <TouchableOpacity style={styles.addButton} onPress={addPriceHistory}>
                                <Text style={styles.addButtonText}>Add to Table</Text>
                            </TouchableOpacity>

                            {/* Show Table */}
                            {step2Data.historydate.length > 0 &&
                                <View style={{ flexGrow: 1, minHeight: 1, marginTop: 10 }}>
                                    <ScrollView contentContainerStyle={{ flexGrow: 1, borderWidth: 1, borderColor: '#c7c7c7', borderRadius: 10, }}>
                                        <View>
                                            <Text className='text-center font-rubik-bold my-2 border-b border-gray-300'>Price data for graph</Text>
                                        </View>
                                        {step2Data.historydate.map((item, index) => (
                                            <View key={index} style={styles.tableRow}>
                                                <Text style={styles.tableCell}>Rs. {parseInt(item.priceValue).toLocaleString()}</Text>
                                                <Text style={styles.tableCell}>{item.dateValue}</Text>
                                                <TouchableOpacity onPress={() => removePriceHistory(index)}>
                                                    <Text style={styles.removeBtn}>❌</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            }
                        </View>
                    </ProgressStep>

                    <ProgressStep label="Details"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                    // onNext={() => onNextStep(3)}
                    // errors={errors}
                    >

                        <View style={styles.stepContent}>

                            {/* enter amenities */}
                            <View className='flex flex-row items-center'>

                                <Text style={styles.label}>Features & Amenities</Text>
                                <Text className='text-sm mt-3'>(Press Enter to add multiple)</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter to Add Amenities"
                                value={amenity}
                                onChangeText={setAmenity}
                                onSubmitEditing={handleAddAmenity} // Adds item on Enter key press
                            />
                            <View style={{ flexGrow: 1, minHeight: 1 }}>
                                <ScrollView horizontal nestedScrollEnabled={true} contentContainerStyle={{ flexDirection: "row" }}>
                                    {amenities.map((item, index) => (
                                        <View key={index} style={styles.amenityItem}>
                                            <Text className='font-rubik-bold px-2 capitalize text-nowrap'>{item}</Text>
                                            <TouchableOpacity onPress={() => setAmenities(amenities.filter(a => a !== item))}>
                                                <Text style={styles.removeBtn}>❌</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>

                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {/* enter squre foot area */}
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.label}>Square Foot</Text>
                                    <TextInput style={styles.input} placeholder="Square Foot" value={step3Data.sqfoot} onChangeText={text => setStep3Data({ ...step3Data, sqfoot: text })} />
                                </View>

                                {/* enter number of bathrooms */}
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.label}>Bathroom</Text>
                                    <TextInput style={styles.input} placeholder="Bathroom" value={step3Data.bathroom} onChangeText={text => setStep3Data({ ...step3Data, bathroom: text })} />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {/* enter number of floors */}
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.label}>Floor</Text>
                                    <TextInput style={styles.input} placeholder="Floor" value={step3Data.floor} onChangeText={text => setStep3Data({ ...step3Data, floor: text })} />
                                </View>

                                {/* enter property city */}
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.label}>City</Text>
                                    <TextInput style={styles.input} placeholder="Enter City" value={step3Data.city} onChangeText={text => setStep3Data({ ...step3Data, city: text })} />
                                </View>
                            </View>

                            {/* enter property address */}
                            <Text style={styles.label}>Property Address</Text>
                            <TextInput style={styles.textarea} placeholder="Property Address" value={step3Data.officeaddress} onChangeText={text => setStep3Data({ ...step3Data, officeaddress: text })} multiline numberOfLines={5} maxLength={120} />

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

                    <ProgressStep label="Documents"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                        onSubmit={handleSubmit}>
                        {/* select status */}
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Select Status</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect onValueChange={(value) => setSelectedStatus(value)} items={status} style={pickerSelectStyles} placeholder={{ label: 'Choose an option...', value: null }} />
                            </View>
                        </View>

                        {/* upload gallery */}
                        <Text style={styles.label}>Property Gallery</Text>
                        <View style={{ flexGrow: 1, minHeight: 1 }}>
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
                        </View>
                        <TouchableOpacity onPress={pickGalleryImages} style={styles.dropbox}>
                            <Text style={{ textAlign: 'center' }}>Pick images from gallery</Text>
                        </TouchableOpacity>

                        {/* Upload video */}
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Upload Videos</Text>
                            <View style={{ flexGrow: 1, minHeight: 1 }}>
                                <FlatList
                                    data={videos}
                                    horizontal
                                    keyExtractor={(item) => item.id.toString()}
                                    nestedScrollEnabled={true}
                                    contentContainerStyle={styles.fileContainer}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.thumbnailBox} className="border border-gray-300">
                                            <Image
                                                source={{ uri: `${item.thumbnailImages}?update=${new Date().getTime()}` }}
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
                            </View>

                            <TouchableOpacity onPress={pickVideo} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick videos from gallery</Text>
                            </TouchableOpacity>

                        </View>

                        {/* upload doc */}
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Upload Property Documents</Text>
                            <View style={{ flexGrow: 1, minHeight: 1 }}>
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
                            </View>
                            <TouchableOpacity onPress={pickDocument} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick Doc from gallery</Text>
                            </TouchableOpacity>
                        </View>

                        {/* upload marster plan */}
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Upload Master Plan of Property</Text>
                            <View style={{ flexGrow: 1, minHeight: 1 }}>
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
                            </View>
                            <TouchableOpacity onPress={pickMasterPlan} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick Master Plan from gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </ProgressStep>
                </ProgressSteps>
            </View>
            
        </SafeAreaView>
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
    amenityItem: {
        flexDirection: 'row',
        justifyContent: 'start',
        padding: 5,
        borderRadius: 50,
        marginRight: 5,
        borderColor: 'gray',
        backgroundColor: '#edf5ff',

    },
    removeBtn: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
        marginEnd: 5,
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
        marginRight: 10,
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
    },
    map: {
        width: '100%',
        height: 150,
        marginTop: 10
    },
    addButton: {
        backgroundColor: '#D3D3D3', padding: 10, marginTop: 10, borderRadius: 5
    },
    addButtonText: { color: 'black', textAlign: 'center', fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
    tableCell: { flex: 1, textAlign: 'center', borderEnd: 1, borderColor: '#c7c7c7', fontWeight: 600, },
    pickerContainer: {
        borderRadius: 10, // Apply borderRadius here
        overflow: 'hidden',
        backgroundColor: '#edf5ff',
        marginTop: 10,
        // marginBottom: 20,
    },

});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
    },
});
