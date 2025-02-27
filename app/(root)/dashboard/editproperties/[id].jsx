import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, ActivityIndicator, Platform, FlatList } from 'react-native'
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
import DateTimePicker from '@react-native-community/datetimepicker';
import 'react-native-get-random-values';
import * as DocumentPicker from 'expo-document-picker';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";
import MapView, { Marker } from "react-native-maps";


const Editproperty = () => {
    const { id } = useLocalSearchParams();
    const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;
    const [step1Data, setStep1Data] = useState({ property_name: '', description: '', thumbnail: images.avatar });
    const [step2Data, setStep2Data] = useState({ Price: '', historydate: [], squarefoot: '', Bathroom: '', Floor: '', City: '', Address: '' });
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
    const [show, setShow] = useState(false);
    const [price, setPrice] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [amenity, setAmenity] = useState('');
    const [image, setImage] = useState(null);
    const [videos, setVideos] = useState([]);
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
    const buttonTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: 'lightgray',
        color: 'black',
    };
    const [galleryImages, setGalleryImages] = useState([]);
    const [propertyDocuments, setPropertyDocuments] = useState([]);
    const [masterPlanDoc, setMasterPlanDoc] = useState([]);

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

    const onNextStep = () => {
        if (!isValid) {
            setErrors(true);
        } else {
            setErrors(false);
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

    // Handle Date Change
    const handleDateChange = (event, date) => {
        setShow(false);
        if (date) {
            const formattedDate = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
            setSelectedDate(formattedDate);
        }
    };

    // Add Price History Entry
    const addPriceHistory = () => {
        if (selectedDate && price) {
            // Convert selectedDate to DD-MM-YYYY format
            const formattedDate = new Date(selectedDate).toLocaleDateString("en-GB");

            const newHistoryEntry = { dateValue: formattedDate, priceValue: price };

            // Ensure historydate is initialized as an array
            const updatedHistory = Array.isArray(step2Data.historydate) ? [...step2Data.historydate, newHistoryEntry] : [newHistoryEntry];

            setStep2Data({ ...step2Data, historydate: updatedHistory });

            setSelectedDate('');
            setPrice('');
        }
    };

    // Function to remove a specific price history entry
    const removePriceHistory = (index) => {
        const updatedHistory = step2Data.historydate.filter((_, i) => i !== index);
        setStep2Data({ ...step2Data, historydate: updatedHistory });
    };

    const handleAddAmenity = () => {
        if (amenity.trim() !== '') {
            setAmenities([...amenities, amenity.trim()]);
            setAmenity('');
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
                    property_name: apiData.property_name || '',
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
                property_name: propertyData.property_name || '',
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
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Image source={icons.bell} className='size-6' />
                </TouchableOpacity>
            </View>

            <View className="flex justify-between items-center pt-3 flex-row">
                <Text className="font-rubik-bold text-lg">{step1Data.property_name}</Text>
                <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik-bold border ${selectedStatus === 'published' ? ' bg-green-50  text-green-700  border-green-600 ' : 'bg-red-50  text-red-700 border-red-600'}`}>{selectedStatus}</Text>
            </View>

            <View style={styles.container}>
                <ProgressSteps>
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

                            {/* upload document */}
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
                </ProgressSteps>
            </View>
        </SafeAreaView>
    )
}

export default Editproperty

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
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, },
    tableCell: { flex: 1, textAlign: 'center', borderyWidth: 1, },
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