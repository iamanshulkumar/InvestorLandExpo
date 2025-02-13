import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Button } from 'react-native'
import React, { useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Link, router, useLocalSearchParams } from 'expo-router';


const Editproperty = () => {
    const [step1Data, setStep1Data] = useState({ name: '', description: '' });
    const [step2Data, setStep2Data] = useState({ email: '', username: '' });
    const [step3Data, setStep3Data] = useState({ password: '', retypePassword: '' });
    const textareaRef = useRef(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const { id } = useLocalSearchParams();

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
        { label: 'Unpublished', value: 'Unpublished' },
        { label: 'Published', value: 'Published' },
    ];

    return (
        <SafeAreaView style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={icons.backArrow} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                    Add New Property {id}
                </Text>
                <Link href={'/notifications'}>
                    <Image source={icons.bell} className='size-6' />
                </Link>
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
                            {image && <Image source={{ uri: image }} style={styles.image} />}
                            <TouchableOpacity onPress={pickImage} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick an image from gallery</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Select category</Text>
                            <RNPickerSelect onValueChange={(value) => setSelectedValue(value)} items={categories} style={pickerSelectStyles} placeholder={{ label: 'Choose an option...', value: null }} />
                        </View>
                    </ProgressStep>
                    <ProgressStep label="Details" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle}>
                        <View>
                            <Text style={{ textAlign: 'center', fontFamily: 'Rubik-Bold' }}>Pricing & Other Details</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Property Price</Text>
                            <TextInput style={styles.input} placeholder="Property Price" value={step2Data.email} onChangeText={text => setStep2Data({ ...step2Data, Price: text })} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.label}>Square Foot</Text>
                                    <TextInput style={styles.input} placeholder="Square Foot" value={step2Data.username} onChangeText={text => setStep2Data({ ...step2Data, squarefoot: text })} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.label}>Bathroom</Text>
                                    <TextInput style={styles.input} placeholder="Bathroom" value={step2Data.username} onChangeText={text => setStep2Data({ ...step2Data, Bathroom: text })} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.label}>Floor</Text>
                                    <TextInput style={styles.input} placeholder="Floor" value={step2Data.username} onChangeText={text => setStep2Data({ ...step2Data, Floor: text })} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.label}>City</Text>
                                    <TextInput style={styles.input} placeholder="Enter City" value={step2Data.username} onChangeText={text => setStep2Data({ ...step2Data, City: text })} />
                                </View>
                            </View>
                            <Text style={styles.label}>Property Address</Text>
                            <TextInput style={styles.textarea} placeholder="Property Address" value={step2Data.username} onChangeText={text => setStep2Data({ ...step2Data, Address: text })} multiline numberOfLines={5} maxLength={120} />
                        </View>
                    </ProgressStep>
                    <ProgressStep label="Documents" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle}>
                        <Text style={styles.label}>Property Gallery</Text>
                        {image && <Image source={{ uri: image }} style={styles.image} />}
                        <TouchableOpacity onPress={pickImage} style={styles.dropbox}>
                            <Text style={{ textAlign: 'center' }}>Pick an image from gallery</Text>
                        </TouchableOpacity>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Select Status</Text>
                            <RNPickerSelect onValueChange={(value) => setSelectedValue(value)} items={status} style={pickerSelectStyles} placeholder={{ label: 'Choose an option...', value: null }} />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Upload Videos</Text>
                            <TouchableOpacity onPress={pickVideo} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick videos from gallery</Text>
                            </TouchableOpacity>
                            {videos.length > 0 && videos.map((video, index) => (
                                <View key={index} style={styles.videoContainer}>
                                    <Text>{video.uri}</Text>
                                </View>
                            ))}
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
        padding: 10,
        paddingBottom: 40,
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
        width: 200,
        height: 200,
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
