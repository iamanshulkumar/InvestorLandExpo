import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Button } from 'react-native'
import React, { useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import Textarea from 'react-native-textarea';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';

const Addproperty = () => {
    const [step1Data, setStep1Data] = useState({ name: '', description: '' });
    const [step2Data, setStep2Data] = useState({ email: '', username: '' });
    const [step3Data, setStep3Data] = useState({ password: '', retypePassword: '' });
    const textareaRef = useRef(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [isValid, setIsValid] = useState(false);

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

    return (
        <SafeAreaView className='bg-white h-full px-5'>
            <View className='flex flex-row items-center ml-2 justify-between'>
                <TouchableOpacity onPress={() => router.back()} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center" >
                    <Image source={icons.backArrow} className='size-5' />
                </TouchableOpacity>
                <Text className='text-base mr-2 text-center font-rubik-medium text-black-300'>
                    Add New Property
                </Text>
                <Image source={icons.bell} className='size-6' />
            </View>

            <View style={styles.container}>
                <ProgressSteps>
                    <ProgressStep label="General" nextBtnTextStyle={buttonTextStyle}>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Property Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter property name"
                                value={step1Data.name}
                                onChangeText={text => setStep1Data({ ...step1Data, name: text })}
                            />

                            <Text style={styles.label}>Property Description</Text>
                            <TextInput
                                style={styles.textarea}
                                value={step1Data.description}
                                onChangeText={text => setStep1Data({ ...step1Data, description: text })}
                                maxLength={120}
                                placeholder="Enter property description"
                                multiline
                                numberOfLines={5}
                            />


                            <Text style={styles.label}>Property Thumbnail</Text>
                            {image && <Image source={{ uri: image }} style={styles.image} />}
                            <TouchableOpacity onPress={pickImage} style={styles.dropbox}>
                                <Text className="text-center">Pick an image from gallery</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Select category</Text>
                            <RNPickerSelect
                                onValueChange={(value) => setSelectedValue(value)}
                                items={categories}
                                style={pickerSelectStyles}
                                placeholder={{ label: 'Choose an option...', value: null }}
                            />

                        </View>
                    </ProgressStep>

                    <ProgressStep label="Details" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle}>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={step2Data.email}
                                onChangeText={text => setStep2Data({ ...step2Data, email: text })}
                            />
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                value={step2Data.username}
                                onChangeText={text => setStep2Data({ ...step2Data, username: text })}
                            />
                        </View>
                    </ProgressStep>

                    <ProgressStep label="Documents" nextBtnTextStyle={buttonTextStyle} previousBtnTextStyle={buttonTextStyle}>
                        <View style={styles.stepContent}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={true}
                                value={step3Data.password}
                                onChangeText={text => setStep3Data({ ...step3Data, password: text })}
                            />
                            <Text style={styles.label}>Retype Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Retype Password"
                                secureTextEntry={true}
                                value={step3Data.retypePassword}
                                onChangeText={text => setStep3Data({ ...step3Data, retypePassword: text })}
                            />
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
