import { ScrollView, StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import axios from 'axios';

const EditProfile = () => {
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [usertype, setUsertype] = useState('');
    const [companyDoc, setCompanyDoc] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch existing profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://investorlands.com/api/userprofile?id=6');
                const data = response.data.data;
                console.log(data);
                setUsername(data.name);
                setUsertype(data.user_type);
                setEmail(data.email);
                setPhoneNumber(data.mobile);
                setCompanyName(data.company_name);
                setCompanyDoc(data.company_document);

                // If profile_photo_path exists, prepend the base URL
                if (data.profile_photo_path) {
                    setImage(`https://investorlands.com/assets/images/Users/${data.profile_photo_path}`);
                } else {
                    setImage(null);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);


    // Handle image selection
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Handle document selection
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success') {
                setCompanyDoc(result);
            }
        } catch (error) {
            console.error('Error picking document:', error);
        }
    };

    // Handle profile update submission
    const handleSubmit = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', username);
            formData.append('email', email);
            formData.append('mobile', phoneNumber);
            formData.append('company_name', companyName);


            if (image && !image.startsWith('http')) {
                formData.append('image', {
                    uri: image,
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                });
            }

            if (companyDoc && companyDoc.uri) {
                formData.append('companyDoc', {
                    uri: companyDoc.uri,
                    name: companyDoc.name || 'document.pdf',
                    type: companyDoc.mimeType || 'application/pdf',
                });
            }

            await axios.put('https://investorlands.com/api/userprofile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Image source={icons.backArrow} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.headerText} className="capitalize">Edit {usertype} Profile</Text>
                <View></View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.profileImageContainer}>
                        <Image source={image ? { uri: image } : images.avatar} style={styles.profileImage} />
                        <TouchableOpacity onPress={pickImage} style={styles.editIconContainer}>
                            <Image source={icons.edit} style={styles.editIcon} />
                        </TouchableOpacity>
                        <Text style={styles.roleText} className="capitalize text-black font-rubik-bold">{username}</Text>
                        <Text style={styles.roleText} className="capitalize font-rubik">{usertype}</Text>
                    </View>

                    <View>
                        <Text style={styles.label}>Username</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter your name" />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email address" />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Enter phone number" />

                        <Text style={styles.label}>Company Name</Text>
                        <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Enter company name" />

                        <Text style={styles.label}>Company Document</Text>
                        {companyDoc ? (
                            <View>
                                <Text>{companyDoc.split('/').pop()}</Text>
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(`https://investorlands.com/assets/images/Users/${companyDoc}`)}
                                    style={styles.dropbox}
                                >
                                    <Text style={styles.downloadText}>Download Company Document</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={pickDocument} style={styles.dropbox}>
                                <Text style={styles.downloadText}>Select Company Document</Text>
                            </TouchableOpacity>
                        )}

                    </View>
                </ScrollView>
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'UPDATING...' : 'UPDATE PROFILE'}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    backButton: {
        backgroundColor: '#ccc',
        borderRadius: 20,
        padding: 10,
    },
    icon: {
        width: 20,
        height: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 70,
        right: 135,
    },
    editIcon: {
        width: 30,
        height: 30,
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'normal',
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        marginVertical: 5,
    },
    input: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    dropbox: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    downloadText: {
        color: '#007bff',
    },
    submitButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
