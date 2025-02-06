'use client';

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Head from 'next/head';

import { FaRocket } from 'react-icons/fa';


const OpenDetailsModal = ({
    openDetails,
    setOpenDetails,
    policies,
    currentPolicy,
}) => {
    return (
        <Modal
            transparent={true}
            animationType='fade'
            visible={openDetails}
            onRequestClose={() => setOpenDetails(false)}
        >
            <View style={{
                flex: 3,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                paddingHorizontal: 5// Ensure this is positioned relatively to contain absolute children
            }}>
                <Pressable onPress={() => setOpenDetails(false)} style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                }} />

                <View
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 8,
                        padding: 5,
                        width: '100%',
                        maxWidth: 625,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <View style={{ padding: 15, backgroundColor: 'white', borderRadius: 8 }}>
                        <Pressable onPress={() => setOpenDetails(false)} style={{ alignSelf: 'flex-end' }}>
                            <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#555' }}>×</Text>
                        </Pressable>
                        <ScrollView
                            style={{
                                height: '60vh',
                                width: '100%',
                                padding: 5,
                            }}
                        >
                            {policies[currentPolicy]}
                        </ScrollView>
                    </View>
                </View>

            </View>

        </Modal>
    )
}
const ContactUsModal = ({ contactUsOpen, setContactUsOpen }) => {

    return (
        <Modal
            transparent={true}
            animationType='fade'
            visible={contactUsOpen}
            onRequestClose={() => setContactUsOpen(false)}
        >

            <View style={{
                flex: 3,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                paddingHorizontal: 5// Ensure this is positioned relatively to contain absolute children
            }}>
                <Pressable onPress={() => setContactUsOpen(false)} style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                }} />

                <View
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 8,
                        padding: 20,
                        width: '100%',
                        maxWidth: 425,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                            Contact Us
                        </Text>
                        <Pressable onPress={() => setContactUsOpen(false)}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#555' }}>×</Text>
                        </Pressable>
                    </View>


                    <View style={{ marginBottom: 16, alignItems: 'flex-start' }}>

                        <Text
                            onPress={async () => {
                                const url = 'https://mail.google.com/mail/?view=cm&to=info@realmotor.jp&su=Inquiry&body=Hello, I have a question about...'
                                try {
                                    const canOpen = await Linking.canOpenURL(url);
                                    if (canOpen) {
                                        await Linking.openURL(url);
                                    } else {
                                        alert('Cannot open email application. Please ensure the appropriate app is installed or accessible.');
                                    }
                                } catch (err) {
                                    console.error('Error opening email app:', err);
                                    alert('An error occurred. Please check your email configuration.');
                                }
                            }}
                            style={{ fontSize: 16, color: '#7b9cff', marginBottom: 8, textDecorationLine: 'underline' }}>
                            📧 info@realmotor.jp
                        </Text>


                        <Text
                            onPress={async () => {
                                const phoneNumber = '+818035419928'; // Ensure this includes the country code
                                const url = `https://wa.me/${phoneNumber}`;

                                try {
                                    const canOpen = await Linking.canOpenURL(url);
                                    if (canOpen) {
                                        await Linking.openURL(url);
                                    } else {
                                        alert('Cannot open WhatsApp. Please ensure it is installed on your device.');
                                    }
                                } catch (err) {
                                    console.error('Error opening WhatsApp:', err);
                                    alert('An error occurred. Please try again later.');
                                }
                            }}
                            style={{ fontSize: 16, color: '#7b9cff', marginBottom: 8, textDecorationLine: 'underline' }}>
                            📱 WhatsApp: +81 803 541 9928
                        </Text>

                        <Text style={{ fontSize: 16, color: '#555', marginBottom: 16 }}>
                            ☎ Telephone: +81 565 85 0602
                        </Text>
                        <Text
                            style={{ fontSize: 16, color: '#007bff', marginBottom: 8 }}
                            onPress={() => Linking.openURL('https://www.facebook.com/RealMotorJP')}
                        >
                            📘 Facebook Page
                        </Text>
                        <Text
                            style={{ fontSize: 16, color: '#007bff' }}
                            onPress={() => Linking.openURL('https://www.instagram.com/realmotorjp')}
                        >
                            📷 Instagram Profile
                        </Text>
                    </View>
                </View>

            </View>

        </Modal>
    )
}



const fetchCurrencyData = async (firestore) => {
    try {
        const vehicleDocRef = doc(firestore, 'currency', 'currency');
        const docSnapshot = await getDoc(vehicleDocRef);

        if (docSnapshot.exists()) {
            return docSnapshot.data();
        } else {
            console.log('Currency document does not exist!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching currency data:', error);
        throw error;
    }
};

const fetchVehicleItems = async (firestore) => {
    try {
        const vehicleCollectionRef = collection(firestore, 'VehicleProducts');
        const q = query(
            vehicleCollectionRef,
            where('imageCount', '>', 0),
            where('stockStatus', '==', 'On-Sale'),
            orderBy('dateAdded', 'desc'),
            limit(6)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching vehicle items: ", error);
        throw error;
    }
};

const StickyFooter = ({ setContactUsOpen, setOpenDetails, handlePolicyClick }) => {
    const navigate = useNavigate();
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const styles = StyleSheet.create({
        footerContainer: {
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            padding: 20,
            marginTop: '5%',
            backgroundColor: '#fff',

            // assuming a white background
        },
        linkSection: {
            flex: 1,
            flexDirection: 'row', // Ensures items are laid out in a row
            flexWrap: 'wrap', // Allows items to wrap to the next line
            padding: 10, // Adjusts padding around the entire section
            justifyContent: 'space-between', // Places space between the child items
        },
        item: {
            // Common style for all items
            flex: 1,// Each item takes up half the width of the container
            padding: 5,

            // Padding within each item
            // No justifyContent or alignItems here
        },
        firstColumn: {
            // Specific style for the first column
            alignItems: 'flex-start', // Aligns text to the start of the column
        },
        secondColumn: {
            // Specific style for the second column
            alignItems: 'flex-start',

        },
        title: {
            // Style for the text inside each item
            textAlign: 'left', // Center align text
            fontWeight: '500',
            flex: 1
        },
        sectionTitle: {
            // Style for the section title
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
            paddingBottom: 5,
            marginBottom: 10,
            fontWeight: 'bold'
            // Add other styling like font weight, text transform, etc.
        },
        sectionContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            maxWidth: 1300,
            alignSelf: 'center',
            width: '100%',
            padding: 10
        },
        infoSection: {
            flex: 2,
            maxWidth: screenWidth < 768 ? '100%' : 250,
            marginRight: 20// takes more space for the company info
        },
        logo: {
            width: '100%',
            height: 60, // Adjust height accordingly
            marginBottom: 20,
        },
        companyAddress: {
            marginBottom: 5,
            marginVertical: 10
        },
        companyContact: {
            marginBottom: 5,
            marginVertical: 10
        },
        contactButton: {
            backgroundColor: 'blue',
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginVertical: 10,
            marginTop: 10,
            marginHorizontal: -1,
            borderRadius: 5,
            alignItems: 'center'
        },
        contactButtonText: {
            color: 'white',
        },
        policyLinks: {
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor: '#ddd',
            paddingTop: 5,
            marginTop: 10,
            paddingBottom: 5,
        },
        policyText: {
            marginBottom: 5,
            paddingBottom: 5
        },
        linkSection: {
            flex: 1,
            padding: 5
        },

        linkText: {
            marginBottom: 5,
            fontWeight: '500'
        },
        socialMediaSection: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end', // Evenly space items apart
            padding: 10,
            paddingVertical: 10,
            alignSelf: 'center',
            maxWidth: 1300,
            width: '100%',

        },
        iconsRow: {
            flexDirection: 'row',
            justifyContent: 'space-evenly', // Center icons horizontally
            alignItems: 'center', // Center icons vertically
            width: '100%', // Take the full width to center icons on the screen
            marginBottom: screenWidth < 768 ? 10 : 5,
            maxWidth: 150,
            alignSelf: screenWidth < 768 ? 'center' : 'flex-end'// Adjust based on the screen width
        },
        copyRightSection: {
            alignItems: screenWidth < 768 ? 'center' : 'flex-end',
            justifyContent: screenWidth < 768 ? 'center' : 'flex-end',
            width: '100%'
        },
        copyRightText: {
            textAlign: 'center', // Center the text horizontally
            fontSize: screenWidth < 768 ? 12 : 14, // Adjust the font size based on the screen width
            marginTop: screenWidth < 768 ? 5 : 10, // Adjust the margin top based on the screen width
        },
        socialIcon: {
            marginHorizontal: screenWidth < 768 ? 5 : 10, // Adjust spacing between icons
        },
        // ... other styles you may need
    });
    const maker = [
        { key: 'TOYOTA' },
        { key: 'MAZDA' },
        { key: 'NISSAN' },
        { key: 'BMW' },
        { key: 'HONDA' },
        { key: 'LAND ROVER' },
        { key: 'MITSUBISHI' },
        { key: 'ISUZU' },
        { key: 'MERCEDES-BENZ' },
        { key: 'JEEP' },
        { key: 'VOLKSWAGEN' },
    ];
    const bodyType = [
        { key: 'Couper' },
        { key: 'Convertible' },
        { key: 'Sedan' },
        { key: 'Wagon' },
        { key: 'Hatchback' },
        { key: 'Van' },
        { key: 'Truck' },
        { key: 'SUV' },
    ];
    const renderItem = ({ item, index }) => {
        // Determine column based on index (if you have two columns in layout)
        const isFirstColumn = index % 2 === 0;

        // Handle search action when the user selects a car maker
        const handleSearch = () => {
            navigate(`/SearchCarDesign?keywords=&carMakes=${item.key}`);  // Pass selected carMake in URL
        };

        return (
            <TouchableOpacity
                style={[styles.item, isFirstColumn ? styles.firstColumn : styles.secondColumn]} // Conditional column styling
                onPress={handleSearch}  // Trigger search on press
            >
                <Text style={styles.title}>{item.key}</Text>
            </TouchableOpacity>
        );
    };
    const numColumns = screenWidth < 992 ? 1 : 2;

    const renderItemBodyType = ({ item, index }) => {
        const handleSearch = () => {
            navigate(`/SearchCarDesign?keywords=&carBodyType=${item.key}`);  // Pass selected carMake in URL
        };
        return (
            <TouchableOpacity style={[styles.item, styles.firstColumn]}
                onPress={handleSearch}
            >
                <Text style={styles.title}>{item.key}</Text>
            </TouchableOpacity>
        );
    };
    const handleSearch = () => {
        navigate(`/SearchCarDesign?keywords=&carModels=&carMakes=&carBodyType=&carMinYear=&carMaxYear=&minMileage=&maxMileage=&minPrice=&maxPrice=`);
    };
    return (
        <View style={styles.footerContainer}>
            <View style={styles.sectionContainer}>

                <View style={styles.infoSection}>
                    <Image
                        source={{ uri: gifLogo }}
                        resizeMode='contain'
                        style={styles.logo}
                    />
                    <Text style={styles.companyAddress}>5-2 Nishihaiagari, Kamigaoka-cho, Toyota City, Aichi Prefecture, 473-0931, Japan</Text>
                    <Text style={styles.companyContact}>Tel +81-565-85-0602</Text>
                    <Text>Fax +81-565-85-0606</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={() => setContactUsOpen(true)}>
                        <Text style={styles.contactButtonText}>Contact Us</Text>
                    </TouchableOpacity>
                    <View style={styles.policyLinks}>
                        <Pressable onPress={() => handlePolicyClick('termsOfUse')}>
                            <Text style={[styles.policyText, { borderBottomWidth: 2, borderBottomColor: '#DDD' }]}>Terms of Use</Text>
                        </Pressable>
                        <Pressable onPress={() => handlePolicyClick('privacyPolicy')}>
                            <Text style={[styles.policyText, { borderBottomWidth: 2, borderBottomColor: '#DDD' }]}>Privacy Policy</Text>
                        </Pressable>
                        <Pressable onPress={() => handlePolicyClick('cookiePolicy')}>
                            <Text style={[styles.policyText, { marginBottom: -2 }]}>Cookie Policy</Text>
                        </Pressable>
                    </View>
                </View>
                {screenWidth < 768 ? null : (
                    <>
                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Contents</Text>
                            <Pressable onPress={() => { navigate('/SearchCarDesign') }}>
                                <Text style={styles.linkText}>Used Car Stock</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate('/HowToBuy') }}>
                                <Text style={styles.linkText}>How to Buy</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate('/AboutUs') }}>
                                <Text style={styles.linkText}>About Us</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate('/LocalIntroduction') }}>
                                <Text style={styles.linkText}>Local Introduction</Text>
                            </Pressable>
                            <Pressable onPress={() => { setContactUsOpen(true) }}>
                                <Text style={styles.linkText}>Contact Us</Text>
                            </Pressable>

                        </View>

                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Makers</Text>
                            <FlatList
                                data={maker}
                                renderItem={renderItem}
                                keyExtractor={item => item.key}
                                numColumns={numColumns}
                                scrollEnabled={false}
                                key={numColumns}
                            />
                        </View>

                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Body Types</Text>
                            <FlatList
                                data={bodyType}
                                renderItem={renderItemBodyType}
                                keyExtractor={item => item.key}
                                scrollEnabled={false}
                            />

                        </View>

                        <View style={styles.linkSection}>
                            <Pressable onPress={handleSearch}>
                                <Text style={styles.sectionTitle}>Find Car</Text>
                            </Pressable>
                            <Pressable onPress={handleSearch}>
                                <Text style={styles.linkText}>Browse All Stock</Text>
                            </Pressable>
                            <Pressable onPress={handleSearch}>
                                <Text style={styles.linkText}>Sale Cars</Text>
                            </Pressable>
                            <Pressable onPress={handleSearch}>
                                <Text style={styles.linkText}>Recommended Cars</Text>
                            </Pressable>
                            <Pressable onPress={handleSearch}>
                                <Text style={styles.linkText}>Luxury Cars</Text>
                            </Pressable>
                        </View>
                    </>
                )}

            </View>

            <View style={styles.socialMediaSection}>
                <View style={styles.iconsRow}>

                    <Ionicons name="logo-facebook" size={20} color={'#0642F4'} onPress={() => Linking.openURL('https://www.facebook.com/RealMotorJP')} />
                    <Entypo name="instagram" size={20} color={'#0642F4'} onPress={() => Linking.openURL('https://www.instagram.com/realmotorjp')} />

                </View>
                <View style={styles.copyRightSection}>
                    <Text style={styles.copyRightText}>
                        Copyright © Real Motor Japan All Rights Reserved.
                    </Text>
                </View>
            </View>

        </View>
    );
};

const Home = ({ navigate }) => {
    const isWeb = Platform.OS === 'web';

    return (
        <View style={styles.container}>
         {isWeb && (
        <Head>
          <title>Home | React Motor Japan</title>
        </Head>
      )}

            <TouchableOpacity onPress={() => navigate('/AboutUs')}>
                <Text style={styles.link}>Go to About Us</Text>
            </TouchableOpacity>


       
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        color: 'blue',
        marginTop: 20,
        textDecorationLine: 'underline',
    },
});