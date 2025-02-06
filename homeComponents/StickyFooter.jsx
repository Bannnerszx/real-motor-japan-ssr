'use client'
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Pressable } from "react-native";
import { BsFacebook, BsInstagram } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";

const StickyFooter = ({ setContactUsOpen, handlePolicyClick }) => {
    const [screenWidth, setScreenWidth] = useState(0);
    useEffect(() => {
        const updateWidth = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", updateWidth);
        updateWidth(); // Update immediately on mount
        return () => window.removeEventListener("resize", updateWidth);
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
                    {/* <Image
                        source={{ uri: gifLogo }}
                        resizeMode='contain'
                        style={styles.logo}
                    /> */}
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
                                <Text style={styles.linkText}>Car Stock</Text>
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

                    <Link href="https://www.facebook.com/RealMotorJP">
                        <BsFacebook size={24} color="#0642F4" />
                    </Link>
                    <Link href="https://www.instagram.com/realmotorjp">
                        <BsInstagram size={24} color="#0642F4" />
                    </Link>

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

const styles = StyleSheet.create({
    footerContainer: {
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        padding: 20,
        marginTop: "5%",
        backgroundColor: "#fff",
    },
    sectionContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        maxWidth: 1300,
        alignSelf: "center",
        width: "100%",
    },
    infoSection: {
        flex: 2,
        maxWidth: 250,
        marginRight: 20,
    },
    logo: {
        width: "100%",
        height: 60,
        marginBottom: 20,
    },
    companyAddress: {
        marginBottom: 10,
    },
    companyContact: {
        marginBottom: 5,
    },
    contactButton: {
        backgroundColor: "blue",
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    contactButtonText: {
        color: "white",
    },
    policyLinks: {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: "#ddd",
        paddingVertical: 5,
        marginTop: 10,
    },
    policyText: {
        marginBottom: 5,
    },
    linkSection: {
        flex: 1,
        padding: 10,
    },
    sectionTitle: {
        fontWeight: "bold",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingBottom: 5,
        marginBottom: 10,
    },
    linkText: {
        marginBottom: 5,
    },
    socialMediaSection: {
        alignItems: "center",
        marginTop: 20,
    },
    iconsRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
    },
    copyRightText: {
        textAlign: "center",
        fontSize: 14,
        marginTop: 10,
    },
});

export default StickyFooter;
