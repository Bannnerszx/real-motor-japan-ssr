
'use client'
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Platform, View, Text, TouchableWithoutFeedback, Image, Easing, TouchableOpacity, Button, StyleSheet, ScrollView, Dimensions, Linking, FlatList, Pressable, TextInput, Modal, Animated as AnimatedRN, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'next/router';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, Fontisto, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { doc, getDoc, onSnapshot, serverTimestamp, addDoc, collection, getDocs, setDoc, query, orderBy, limit, arrayUnion, updateDoc, where, count } from "firebase/firestore";
import { AuthContext } from '../apiContext/AuthProvider';
import carSample from '../assets/2.webp'
import { projectExtensionFirestore } from '../firebaseConfig/firebaseConfig';
import axios from 'axios';
import { FlatGrid } from 'react-native-super-grid';
import gifLogo from '../assets/rename.gif'
import moment from 'moment';
import Svg, { Path, } from "react-native-svg";
import ImageGallery from "react-image-gallery";
import { Feather } from '@expo/vector-icons';
import 'react-image-gallery/styles/css/image-gallery.css'; 

const checkChatExists = process.env.NEXT_PUBLIC_CHECK_CHAT_EXISTS;
const ipInfo = process.env.NEXT_PUBLIC_IP_INFO;
const timeApi = process.env.NEXT_PUBLIC_TIME_API;
const addChatData = process.env.NEXT_PUBLIC_ADD_CHAT_DATA;

const DropDownCurrency = ({ height, currentCurrencyGlobal, setCurrentCurrencyGlobal, selectedCurrency, setSelectedCurrency, userEmail }) => {


    const [modalVisible, setModalVisible] = useState(false);

    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const pressableRef = useRef(null);

    const currencies = [
        { label: 'US Dollar', value: 'USD', symbol: '$' },
        { label: 'Euro', value: 'EUR', symbol: '€' },
        { label: 'Australian Dollar', value: 'AUD', symbol: 'A$' },
        { label: 'British Pound', value: 'GBP', symbol: '£' },
        { label: 'Canadian Dollar', value: 'CAD', symbol: 'C$' },
        { label: 'Japanese Yen', value: 'JPY', symbol: '¥' }
    ];

    const handlePress = () => {
        pressableRef.current.measure((fx, fy, width, height, px, py) => {
            setModalPosition({ top: py + height, left: px });
            setModalVisible(true);
        });
    };

    const handleCurrencySelect = async (currency) => {
        setSelectedCurrency(currency.value);  // Assuming this sets state locally to reflect the UI change
        setModalVisible(false);  // Assuming this controls the visibility of a modal

        try {
            const userDocRefAuth = doc(projectExtensionFirestore, 'accounts', userEmail);
            // Update the document in Firestore with the selected currency value
            await updateDoc(userDocRefAuth, {
                selectedCurrencyExchange: currency.value  // Use the value from the selected currency
            });
        } catch (error) {
            console.error("Failed to update currency:", error);  // Log the error if the update fails
        }
    };

    return (
        <Pressable
            ref={pressableRef}
            onPress={handlePress}
            style={{
                margin: 5,
                padding: 3,
                borderWidth: 1,
                borderColor: '#eee',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                flex: 2,
                width: 70,
            }}
        >
            <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                <Text style={{ fontWeight: '500' }}>{selectedCurrency ? selectedCurrency : currentCurrencyGlobal?.selectedCurrencyExchange}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                <AntDesign
                    name="down"
                    size={15}
                    color={'blue'}
                    style={[
                        { transitionDuration: '0.3s' },
                        modalVisible && {
                            transform: [{ rotate: '180deg' }],
                        },
                    ]}
                />
            </View>
            {
                modalVisible && (
                    <Modal
                        transparent={true}
                        animationType="none"
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setModalVisible(false)}>
                            <View style={[{
                                position: 'absolute',
                                backgroundColor: '#fff',
                                padding: 5,
                                margin: 5,
                                width: '100%',
                                maxWidth: 70
                            }, { top: modalPosition.top * 1.05, left: modalPosition.left * 0.998, maxHeight: 190 }]}>
                                <FlatList
                                    data={currencies}
                                    keyExtractor={(item) => item.value}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={{
                                                padding: 5,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#eee',
                                            }}
                                            onPress={() => handleCurrencySelect(item)}
                                        >
                                            <Text>{item.value}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )
            }
        </Pressable>
    );
};

const Insurance = ({ setInsurance, insurance, handleToggleInsurance, selectedCountry }) => {
    const styles = StyleSheet.create({
        switch: {
            width: 50, // Width of the outer switch component
            height: 26, // Height of the outer switch component
            borderRadius: 13, // Half of the height to make it rounded
            padding: 2, // Padding inside the switch component
            justifyContent: 'center'
        },
        toggle: {
            width: 22, // Width of the inner toggle button
            height: 22, // Height of the inner toggle button
            borderRadius: 11, // Half of the height to make it circular
            backgroundColor: 'white', // Color of the toggle button
        }
    });

    const [insuranceAvailable, setInsuranceAvailable] = useState(null);
    console.log('insurance avail', insuranceAvailable)
    useEffect(() => {
        async function fetchInsurance() {
            try {
                // Reference to the document in Firestore
                const docRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Check if the selected country exists in the document
                    if (data[selectedCountry]) {
                        // Access the `insurance` field for the selected country
                        const insurance = data[selectedCountry]?.insurance
                        setInsuranceAvailable(insurance);
                    } else {
                        console.log('Selected country not found in the document');
                        setInsuranceAvailable(null);
                    }
                } else {
                    console.log('No such document found!');
                }
            } catch (error) {
                console.error('Error fetching insurance data:', error);
            }
        }

        if (selectedCountry) {
            fetchInsurance();
        }
    }, [selectedCountry]);
    const disabled = insuranceAvailable === true || insuranceAvailable
    const [toggle, setToggle] = useState(false);
    const toggleAnim = useRef(new AnimatedRN.Value(0)).current;

    const handleToggle = () => {
        if (disabled) {
            return;
        }

        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 0 : 1,
            duration: 10,
            useNativeDriver: false,
        }).start();

        setToggle(!toggle);
        handleToggleInsurance();

    };
    useEffect(() => {
        AnimatedRN.timing(toggleAnim, {
            toValue: insurance ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [insurance, toggleAnim]);

    // Interpolate values for moving the switch and changing the background color
    const switchTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values based on the size of your switch
    });

    const switchColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['grey', '#7b9cff'] // Change colors as needed
    });

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Pressable onPress={handleToggle} disabled={disabled}>
                <AnimatedRN.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <AnimatedRN.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </AnimatedRN.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Insurance</Text>
        </View>
    )
}
const Inspection = ({ isToggleDisabled, toggle, handleToggleInspection, selectedCountry, setToggle, toggleAnim, switchTranslate, switchColor, handleToggle }) => {
    const styles = StyleSheet.create({
        switch: {
            width: 50, // Width of the outer switch component
            height: 26, // Height of the outer switch component
            borderRadius: 13, // Half of the height to make it rounded
            padding: 2, // Padding inside the switch component
            justifyContent: 'center'
        },
        toggle: {
            width: 22, // Width of the inner toggle button
            height: 22, // Height of the inner toggle button
            borderRadius: 11, // Half of the height to make it circular
            backgroundColor: 'white', // Color of the toggle button
        }
    });





    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Pressable onPress={handleToggle} disabled={isToggleDisabled || !selectedCountry}>
                <AnimatedRN.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <AnimatedRN.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </AnimatedRN.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Inspection</Text>
        </View>
    )
}
const Warranty = () => {
    const styles = StyleSheet.create({
        switch: {
            width: 50, // Width of the outer switch component
            height: 26, // Height of the outer switch component
            borderRadius: 13, // Half of the height to make it rounded
            padding: 2, // Padding inside the switch component
            justifyContent: 'center'
        },
        toggle: {
            width: 22, // Width of the inner toggle button
            height: 22, // Height of the inner toggle button
            borderRadius: 11, // Half of the height to make it circular
            backgroundColor: 'white', // Color of the toggle button
        }
    });



    const [toggle, setToggle] = useState(false);
    const toggleAnim = useRef(new AnimatedRN.Value(0)).current;

    const handleToggle = () => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 0 : 1,
            duration: 10,
            useNativeDriver: false,
        }).start();

        setToggle(!toggle);
    };

    // Interpolate values for moving the switch and changing the background color
    const switchTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values based on the size of your switch
    });

    const switchColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['grey', '#7b9cff'] // Change colors as needed
    });

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Pressable onPress={handleToggle}>
                <AnimatedRN.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <AnimatedRN.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </AnimatedRN.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Warranty</Text>
        </View>
    )
}
const Calculate = ({ selectedCountry, selectedPort, setProfitMap, totalPriceCalculation, setCalculatePrice, insurance }) => {

    const handleCalculate = () => {
        // Check if selectedPort is missing
        if (!selectedPort) {
            setCalculatePrice(0);
            console.log('selectedPort is blank. Setting calculatePrice to 0.');
            return;
        }

        // Check if selectedPort is "Others"
        if (selectedPort === 'Others') {
            setCalculatePrice(0);
            console.log('selectedPort is "Others". Setting calculatePrice to 0.');
            return;
        }

        // Calculate price if both selectedPort and selectedCountry are valid
        const formattedTotalPrice = parseInt(totalPriceCalculation, 10);

        if (isNaN(formattedTotalPrice)) {
            console.log('Invalid totalPriceCalculation. Setting calculatePrice to 0.');
            setCalculatePrice(0); // Default to 0 if the calculation is invalid
            return;
        }

        setCalculatePrice(formattedTotalPrice);
        console.log('Calculated total price:', formattedTotalPrice);
    };

    useEffect(() => {
        if (selectedPort) {
            handleCalculate();
        }
    }, [selectedPort, selectedCountry, totalPriceCalculation, insurance]); // Includes insurance dependency
};



const SquareGrays = () => {
    const styles = StyleSheet.create({
        container: {
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        square: {
            width: 8,
            height: 8,
            backgroundColor: 'gray',
            marginLeft: 1,
        },
    });

    const createOddRowOfSquares = () => (
        Array.from({ length: 20 }, (_, index) => {
            const backgroundColor = (index % 2 === 0) ? 'gray' : 'transparent';
            return (
                <View key={`odd-${index}`} style={[styles.square, { backgroundColor }]} />
            );
        })
    );

    // Function to create a row of gray squares at even positions
    const createEvenRowOfSquares = () => (
        Array.from({ length: 20 }, (_, index) => {
            const backgroundColor = (index % 2 !== 0) ? 'gray' : 'transparent';
            return (
                <View key={`even-${index}`} style={[styles.square, { backgroundColor }]} />
            );
        })
    );

    return (
        <View style={styles.container}>
            <View style={styles.row}>{createOddRowOfSquares()}</View>
            <View style={styles.row}>{createEvenRowOfSquares()}</View>
        </View>
    );
};
const GetDataFeature = ({ productId }) => {


    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const [featureStatusSafety, setFeatureStatusSafety] = useState(false);
    const [featureStatusComfort, setFeatureStatusComfort] = useState(false);
    const [featureStatusInterior, setFeatureStatusInterior] = useState(false);
    const [featureStatusExterior, setFeatureStatusExterior] = useState(false);
    const [featureStatusSelling, setFeatureStatusSelling] = useState(false);
    const vehicleId = productId;


    // Define allData before using it
    const featureData = [
        {
            category: 'Safety System',
            data: [
                { name: 'Anti-Lock Braking System (ABS)', value: featureStatusSafety.SafetySystemAnBrSy },
                { name: 'Driver Airbag', value: featureStatusSafety.SafetySystemDrAi },
                { name: 'Passenger Airbag', value: featureStatusSafety.SafetySystemPaAi },
                { name: 'Safety Airbag', value: featureStatusSafety.SafetySystemSiAi }
            ]
        },
        {
            category: 'Comfort',
            data: [
                { name: 'Air Conditioner (Front)', value: featureStatusComfort.ComfortAiCoFr }, // Initialize with null
                { name: 'Air Conditioner (Rear)', value: featureStatusComfort.ComfortAiCoRe },
                { name: 'AM/FM Radio', value: featureStatusComfort.ComfortAMFMRa },
                { name: 'AM/FM Stereo', value: featureStatusComfort.ComfortAMFMSt },
                { name: 'CD Player', value: featureStatusComfort.ComfortCDPl },
                { name: 'CD Changer', value: featureStatusComfort.ComfortCDCh },
                { name: 'Cruise Speed Control', value: featureStatusComfort.ComfortCrSpCo },
                { name: 'Digital Speedometer', value: featureStatusComfort.ComfortDiSp },
                { name: 'DVD Player', value: featureStatusComfort.ComfortDVDPl },
                { name: 'Hard Disk Drive', value: featureStatusComfort.ComfortHDD },
                { name: 'Navigation System (GPS)', value: featureStatusComfort.ComfortNaSyGPS },
                { name: 'Power Steering', value: featureStatusComfort.ComfortPoSt },
                { name: 'Premium Audio System', value: featureStatusComfort.ComfortPrAuSy },
                { name: 'Remote Keyless System', value: featureStatusComfort.ComfortReKeSy },
                { name: 'Tilt Steering Wheel', value: featureStatusComfort.ComfortTiStWh },
            ],
        },
        {
            category: 'Interior',
            data: [
                { name: 'Leather Seats', value: featureStatusInterior.InteriorLeSe },
                { name: 'Power Door Locks', value: featureStatusInterior.InteriorPoDoLo },
                { name: 'Power Mirrors', value: featureStatusInterior.InteriorPoMi },
                { name: 'Power Seats', value: featureStatusInterior.InteriorPose },
                { name: 'Power Windows', value: featureStatusInterior.InteriorPoWi },
                { name: 'Rear Window Defroster', value: featureStatusInterior.InteriorReWiDe },
                { name: 'Rear Window Wiper', value: featureStatusInterior.InteriorReWiWi },
                { name: 'Third Row Seats', value: featureStatusInterior.InteriorThRoSe },
                { name: 'Tinted Glass', value: featureStatusInterior.InteriorTiGl }
            ]
        },
        {
            category: 'Exterior',
            data: [
                { name: 'Alloy Wheels', value: featureStatusExterior.ExteriorAlWh },
                { name: 'Power Sliding Door', value: featureStatusExterior.ExteriorPoSlDo },
                { name: 'Sunroof', value: featureStatusExterior.ExteriorSuRo }
            ]
        },
        {
            category: 'Selling Points',
            data: [
                { name: 'Customized Wheels', value: featureStatusSelling.SellingPointsCuWh },
                { name: 'Fully Loaded', value: featureStatusSelling.SellingPointsFuLo },
                { name: 'Maintenance History Available', value: featureStatusSelling.SellingPointsMaHiAv },
                { name: 'Brand New Tires', value: featureStatusSelling.SellingPointsBrNeTi },
                { name: 'No Accident History', value: featureStatusSelling.SellingPointsNoAcHi },
                { name: 'Non-Smoking Previous Owner', value: featureStatusSelling.SellingPointsNoSmPrOw },
                { name: 'One Owner History', value: featureStatusSelling.SellingPointsOnOwHi },
                { name: 'Performance-Rated Tires', value: featureStatusSelling.SellingPointsPeRaTi },
                { name: 'Repainted Body', value: featureStatusSelling.SellingPointsReBo },
                { name: 'Turbo Engine', value: featureStatusSelling.SellingPointsTuEn },
                { name: 'Upgraded Audio System', value: featureStatusSelling.SellingPointsUpAuSy }
            ]
        }
        // Add more categories and their features as needed
    ];

    const renderVehicleFeaturesCategory = ({ item }) => {
        const styles = StyleSheet.create({
            container: {
                paddingTop: "60px",
                margin: 'auto',
            },
            containerBox: {
                justifyContent: 'center',
                borderRadius: 5,
                alignItems: 'flex-start',
            },
            categoryContainer: {
                marginBottom: 20,
            },
            category: {
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
            },
            specificationItem: {
                fontSize: 16,
                marginBottom: 5,
            },
            category: {
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
            },
            rowContainer: {
                flexDirection: 'row',
                marginBottom: 5,
            },
            columnContainer: {
                paddingHorizontal: 5,
            },
            createButton: {
                backgroundColor: 'blue',
                color: 'white',
                padding: 10,
                borderRadius: 5,
            },
        });

        // Create rows with four items in each row
        const numColumns = screenWidth < 768 ? 2 : 4;
        const rows = [];

        for (let i = 0; i < item.data.length; i += numColumns) {
            const rowData = item.data.slice(i, i + numColumns);
            rows.push(
                <View key={i} style={styles.rowContainer}>
                    {rowData.map((feature, index) => (
                        <View key={index} style={[styles.columnContainer, { width: screenWidth < 768 ? '50%' : '25%' }]}>
                            <View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: feature.value ? '#454545' : '#fff',
                                        borderWidth: 1,
                                        borderColor: feature.value ? '#454545' : '#D5D5D5',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 40,
                                        marginBottom: 5,
                                        maxWidth: '100%',
                                        margin: 5,
                                        padding: 2,
                                    }}
                                >
                                    <Text adjustsFontSizeToFit numberOfLines={2} style={{ textAlign: 'center', color: feature.value ? 'white' : '#D5D5D5', fontSize: 12, fontWeight: '600' }}>{feature.name}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            );
        }

        return (
            <View style={styles.categoryContainer}>
                <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    color: '#706E6E'
                }}>{item.category}</Text>
                {rows}
            </View>
        );
    };

    useEffect(() => {
        const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', vehicleId);
        const unsubscribe = onSnapshot(vehicleDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();

                    if (data && data.comfort) {
                        setFeatureStatusComfort(data.comfort);
                        // Update state with comfortData
                    }
                    if (data && data.safetySystem) {
                        setFeatureStatusSafety(data.safetySystem);
                    }
                    if (data && data.interior) {
                        setFeatureStatusInterior(data.interior)
                    }
                    if (data && data.exterior) {
                        setFeatureStatusExterior(data.exterior)
                    }
                    if (data && data.sellingPoints) {
                        setFeatureStatusSelling(data.sellingPoints)
                    }
                } else {
                    console.log('Document does not exist.');
                }
            },
            (error) => {
                console.error('Error getting document:', error);
            }
        );

        // Return a cleanup function to unsubscribe from the snapshot listener when the component unmounts
        return () => unsubscribe();
    }, [vehicleId]);


    return (
        <View style={{ flex: 1 }}>

            <View style={{ flexDirection: screenWidth <= 425 ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                {screenWidth <= 425 && (<View style={{ alignSelf: 'flex-end' }}><SquareGrays /></View>)}
                <Text style={{ color: 'black', fontWeight: '700', fontSize: '2em', marginRight: '3%' }}>Features</Text>
                {screenWidth > 425 && (<SquareGrays />)}

            </View>
            <FlatList
                style={{ marginTop: '3%' }}
                data={featureData}
                renderItem={renderVehicleFeaturesCategory}
                keyExtractor={(item, index) => `${item.category}-${index}`}
            />
        </View>
    );
};
const GetDataSpecifications = ({ productId }) => {


    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const vehicleId = productId;
    const [vehicleData, setVehicleData] = useState({});

    const specsData = [
        {
            category: 'Full Vehicle Specifications',
            data: [
                { name: 'Make', value: vehicleData.make },
                { name: 'Model', value: vehicleData.model },
                { name: 'Registration Year', value: `${vehicleData.regYear} / ${vehicleData.regMonth}` },
                { name: 'Reference Number', value: vehicleData.referenceNumber },
                { name: 'Chassis/Frame Number', value: vehicleData.chassisNumber },
                { name: 'Model Code', value: vehicleData.modelCode },
            ]
        },
        {
            category: 'Engine and Perfomance',
            data: [
                { name: 'Engine Displacement (cc)', value: `${vehicleData.engineDisplacement}cc` },
                { name: 'Steering', value: vehicleData.steering },
                { name: 'Mileage', value: `${vehicleData.mileage} km` },
                { name: 'Transmission', value: vehicleData.transmission },
                { name: 'External Color', value: vehicleData.exteriorColor }
            ]
        },
        {
            category: 'Interior and Seating',
            data: [
                { name: 'Number of Seats', value: vehicleData.numberOfSeats },
                { name: 'Doors', value: vehicleData.doors }
            ]
        },
        {
            category: 'Fuel and Drivetrain',
            data: [
                { name: 'Fuel', value: vehicleData.fuel },
                { name: 'Drive Type', value: vehicleData.driveType },
            ],

        },
        {
            category: 'Dimensions and Weight',
            data: [
                { name: 'Dimension', value: `${vehicleData.dimensionLength}cm x ${vehicleData.dimensionWidth}cm x ${vehicleData.dimensionHeight}cm (${vehicleData.dimensionCubicMeters}m³) ` },
            ]
        },
        {
            category: 'Body Type',
            data: [
                { name: 'Body Type', value: vehicleData.bodyType },
            ]
        }
    ]

    useEffect(() => {
        const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', vehicleId);
        const unsubscribe = onSnapshot(vehicleDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setVehicleData(data);
                } else {
                    console.log('Document does not exist');
                    return (
                        <View style={{ justifyContent: 'center' }}>
                            <Text>NO VIEW HERE!</Text>
                        </View>
                    )
                }
            },
            (error) => {
                console.error('Error getting document', error);
            }
        );
        return () => unsubscribe();

    }, [vehicleId]);

    const renderSpecificationItem = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, backgroundColor: '#454545', padding: 10, margin: 5, }}>
                    <Text style={[styles.specificationItem, { color: 'white' }]}>{item.name}</Text>
                </View>
                <View style={{ flex: 1, padding: 10, margin: 5, borderWidth: 1, borderColor: '#706E6E' }}>
                    <Text style={{ fontSize: 16, color: '#000', fontWeight: '500' }}>{item.value || ''}</Text>
                </View>
            </View>
        );
    };

    const renderSpecificationCategory = ({ item }) => {
        return (
            <View style={[styles.categoryContainer]}>


                <FlatList
                    style={{ marginTop: '3%' }}
                    data={item.data}
                    renderItem={renderSpecificationItem}
                    keyExtractor={(specItem) => specItem.name}
                />
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: screenWidth <= 425 ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                {screenWidth <= 425 && (<View style={{ alignSelf: 'flex-end' }}><SquareGrays /></View>)}
                <Text style={{ color: 'black', fontWeight: '700', fontSize: '2em', marginRight: '3%' }}>Full Vehicle Specifications</Text>
                {screenWidth > 425 && (<SquareGrays />)}

            </View>
            <FlatList
                data={specsData}
                renderItem={renderSpecificationCategory}
                keyExtractor={(item) => item.category}
            />
        </View>
    )

};

const DropDownMake = ({
    id,
    data,
    selectedValue,
    handleSelect,
    placeholder,
    isActive,
    toggleDropdown,
    error,
    refSection,
    scrollToSectionWithOffset
}) => {

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState(selectedValue ? selectedValue : '');
    useEffect(() => {
        if (selectedValue) {
            setSearchQuery('');
        }
    }, [selectedValue])
    const filteredData = (data || []).filter((item) => {
        const itemText = typeof item === 'string' ? item : item?.name || ''; // Adjust based on your data structure
        return itemText.toLowerCase().includes(searchQuery.toLowerCase());
    });
    console.log('filtered data', filteredData)
    const textInputRef = useRef(null); // Create a reference for TextInput
    const handlePress = () => {
        if (!isActive) {
            toggleDropdown(id); // Toggle the dropdown
            // Log filteredData when dropdown is toggled
        } else {
            const isInputFocused = textInputRef.current?.isFocused();
            // Perform additional actions based on focus state
            if (!isInputFocused) {
                textInputRef.current?.focus();
            }
        }
    };
    useEffect(() => {
        textInputRef.current?.focus();
    }, [isActive]);

    const [viewDimensions, setViewDimensions] = useState({ width: 0, height: 0 });

    const handleViewLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setViewDimensions({ width, height });
    };
    const shakeAnimation = useRef(new AnimatedRN.Value(0)).current;

    // Trigger shake animation when there's an error
    useEffect(() => {
        if (error && refSection.current) {
            // Check if section is in the viewport
            const elementTop = refSection.current.getBoundingClientRect().top;
            const elementBottom = refSection.current.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            const isInView = elementTop >= 0 && elementBottom <= windowHeight;

            if (!isInView) {
                // Scroll to the section if not in view
                scrollToSectionWithOffset(refSection);
            }

            // Trigger shake animation
            AnimatedRN.sequence([
                AnimatedRN.timing(shakeAnimation, {
                    toValue: 20, // Move 20px to the right
                    duration: 50,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shakeAnimation, {
                    toValue: -20, // Move 20px to the left
                    duration: 50,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shakeAnimation, {
                    toValue: 20, // Back to the right
                    duration: 50,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shakeAnimation, {
                    toValue: 0, // Reset to original position
                    duration: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [error, refSection]);
    return (
        <AnimatedRN.View
            accessibilityState={{ expanded: isActive }}
            style={[
                { flex: 1, padding: 5, zIndex: -99, transform: [{ translateX: shakeAnimation }], },
                // Apply shake animation
            ]}
        >
            <View style={{ position: 'relative' }}>
                {!selectedValue && error ? (
                    <View style={{ position: 'absolute', top: -16, left: 4 }}>
                        <Text style={{ color: 'red', fontSize: 12 }}>
                            {id === 'selectPort'
                                ? 'Please select a Port.'
                                : 'Please select a Country.'}
                        </Text>
                    </View>
                ) : null}


                <Pressable
                    onLayout={handleViewLayout}
                    onPress={handlePress}
                    style={{
                        padding: 10,
                        borderWidth: selectedValue ? 2 : error ? 1 : 2,
                        borderColor: selectedValue
                            ? '#0642F4' // Or the color for a valid selection
                            : error
                                ? 'red'
                                : isActive
                                    ? '#0642F4'
                                    : '#eee',
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                    }}


                >
                    <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                        {isActive ? (
                            <TextInput
                                ref={textInputRef} // Attach the reference to TextInput
                                value={searchQuery}
                                onChangeText={(text) => setSearchQuery(text)}
                                placeholder={`${placeholder}...`}
                                onFocus={() => {
                                    if (textInputRef.current) {
                                        textInputRef.current.focus(); // Ensure the TextInput gains focus
                                    }
                                }}
                                placeholderTextColor={'#a5a5a5'}
                                style={{
                                    position: 'absolute',
                                    paddingLeft: 10,
                                    height: viewDimensions.height,
                                    width: viewDimensions.width - 30,
                                    marginLeft: -10,
                                    top: -20,
                                    outlineStyle: 'none',
                                }}
                            />

                        ) : (
                            <Text
                                selectable={false}
                                style={{ fontWeight: '500' }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {selectedValue || placeholder}
                            </Text>
                        )}



                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                        <AntDesign
                            name="down"
                            color="blue"
                            size={15}
                            style={[
                                { transitionDuration: '0.3s' },
                                isActive && { transform: [{ rotate: '180deg' }] },
                            ]}
                        />
                    </View>
                </Pressable>
            </View>
            {isActive && (
                <View style={{
                    position: 'absolute',
                    top: 43,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    maxHeight: 200,
                    margin: 5,
                    zIndex: 99,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5, // For Android
                }}>
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onHoverIn={() => setHoveredIndex(index)}
                                onHoverOut={() => setHoveredIndex(null)}
                                style={{
                                    backgroundColor: hoveredIndex === index ? 'blue' : 'transparent'
                                }}
                                onPress={() => {
                                    if (item === placeholder) {
                                        handleSelect(''); // Set empty value if the placeholder is selected
                                    } else {
                                        handleSelect(item); // Set the selected item
                                    }
                                    toggleDropdown(null); // Close the dropdown in both cases
                                }}
                            >
                                <Text selectable={false} style={{
                                    padding: 10,
                                    fontWeight: '600',
                                    color: hoveredIndex === index ? 'white' : 'black',
                                }}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            )}
        </AnimatedRN.View>
    );
};

const MakeAChat = ({ modalTrue, setModalTrue, section1Ref, scrollToSectionWithOffset, setIsErrorCountry, setIsErrorCheck, chatFieldCurrency, allImageUrl, setIsErrorPort, setIsError, insurance, textInputRef, isCheck, ip, ipCountry, freightOrigPrice, JapanPort, selectedCountry, selectedPort, profitMap, currency, productId, carName, userEmail, inspectionIsRequired, inspectionName, toggleInspection, toggleWarranty, toggleInsurance, portPrice, currentCurrency, toggle, setToggle }) => {
    //MAKE MODAL

    const addOrUpdatePaidStats = async () => {
        try {
            const response = await axios.get('https://asia-northeast2-samplermj.cloudfunctions.net/serverSideTimeAPI/get-tokyo-time');
            const datetime = response.data.datetime; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.ssssss±hh:mm
            const year = datetime.slice(0, 4);
            const month = datetime.slice(5, 7);
            const day = datetime.slice(8, 10);

            const docId = `${year}-${month}`; // YYYY-MM
            const dayField = day; // 01-31
            const docRef = doc(projectExtensionFirestore, 'OfferStats', docId);

            try {
                const newData = {
                    carName: selectedChatData.carData.carName,
                    customerEmail: selectedCustomerData.textEmail,
                    imageUrl: carImageUrl,
                    referenceNumber: selectedChatData.carData.stockID,
                };

                await setDoc(docRef, {
                    [dayField]: arrayUnion(newData)
                }, { merge: true });
                console.log(`Data added/updated in document ${docId} for day ${dayField}`);
            } catch (error) {
                console.error("Error adding/updating data: ", error);
            }

        } catch (error) {

        }
    }

    const { login } = useContext(AuthContext);
    //SEND INQUIRY
    const [modalVisible, setModalVisible] = useState(false);
    const [alreadyInquiredModalVisible, setAlreadyInquiredModalVisible] = useState(false);
    // Function to open the modal
    const openModal = () => {
        setModalVisible(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setModalVisible(false);
    };
    const openAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(true);
    };

    // Function to close the "Already Inquired" modal
    const closeAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(false);
    };



    useEffect(() => {
        // Check if userEmail is available before proceeding
        if (userEmail) {
            // Fetch user transactions only when userEmail is available
            const fetchUserTransactions = async () => {
                try {
                    const transactionsSnapshot = await getDocs(collection(projectExtensionFirestore, 'accounts', userEmail, 'transactions'));
                    const transactionsDataArray = transactionsSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setUserTransactions(transactionsDataArray);
                } catch (error) {
                    console.log('Error fetching user transactions:', error);
                }
            };
            // Call the fetchUserTransactions function to populate userTransactions
            fetchUserTransactions();
        }
    }, [userEmail]);
    //MAKE MODAL HERE
    const navigate = ''; // Use the useNavigate hook here

    const [carData, setCarData] = useState([]);
    console.log('CHECK THE CHASSIS:', carData.chassisNumber);
    const [carRefNumber, setCarRefNumber] = useState('');
    useEffect(() => {
        const fetchRefNumber = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', productId);
            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarRefNumber(vehicleData.referenceNumber);
                }
            } catch (error) {
                console.error('Error fetching vehicle data: ', error);
            }
        };
        if (productId) {
            fetchRefNumber();
        }
    }, [productId])
    //FETCH CAR DATA
    useEffect(() => {
        const fetchCarData = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', productId);
            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarData(vehicleData);
                } else {
                    // Vehicle data not found, set a specific message or data
                    navigate('/vehicle-not-found');// You can set a custom message or data here
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                // Handle the error, e.g., display an error message.
            }
        };

        if (productId) {
            fetchCarData();
        }
    }, [productId]);
    const [userTransactions, setUserTransactions] = useState([]);

    const { user, isFormComplete } = useContext(AuthContext)

    const [isLoading, setIsLoading] = useState(false)
    console.log('currency now', chatFieldCurrency)
    // setIsErrorCheck(false);
    // setIsErrorCountry(false);
    // setIsErrorPort(false);

    console.log('Check Chat Exists URL:', checkChatExists);

    const handleCreateConversation = async () => {

        // Dynamically import Firebase Auth methods
        const { getAuth, createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");
        const auth = getAuth();

        if (!auth) {
            setModalTrue(false);
            navigate('/LoginForm', { state: { from: { pathname: `/ProductScreen/${productId}` } } });
            return;
        }

        const user = auth.currentUser;

        if (!user) {
            setModalTrue(false);
            navigate('/LoginForm', { state: { from: { pathname: `/ProductScreen/${productId}` } } });
            return;
        }

        await user.reload();
        setModalTrue(true);

        // Email verification check
        if (!user?.emailVerified) {
            console.error("User's email is not verified.");
            try {
                await sendEmailVerification(user);
                alert(
                    "Your email is not verified. We have sent a verification email to your registered email address. Please verify your email and try again."
                );
            } catch (error) {
                if (error.code === 'auth/too-many-requests') {
                    console.error("Too many requests have been made.");
                    alert(
                        "Too many requests have been made. Please check your email for the verification link, or try again later."
                    );
                } else {
                    console.error("Error sending verification email:", error);
                    alert("Failed to send verification email. Please try again later.");
                }
            }
            setModalTrue(false);
            return; // Stop execution if email is not verified
        }

        // User authentication and basic validation
        if (!userEmail) {
            console.error("User is not authenticated.");
            setModalTrue(false);
            navigate('/LoginForm', { state: { from: { pathname: `/ProductScreen/${productId}` } } });
            return;
        }

        if (!carData) {
            console.error('Invalid product data or missing id:', carData);
            setModalTrue(false);
            return;
        }

        let hasError = false;

        if (!isCheck) {
            setIsErrorCheck(true);
            scrollToSectionWithOffset(section1Ref);
            hasError = true;
        }

        if (!selectedCountry) {
            setIsErrorCountry(true);
            scrollToSectionWithOffset(section1Ref);
            hasError = true;
        }

        if (!selectedPort) {
            setIsErrorPort(true);
            scrollToSectionWithOffset(section1Ref);
            hasError = true;
        }

        if (!isFormComplete) {
            console.error("User's form is not complete.");
            setModalTrue(false);
            navigate('/LoginForm', { state: { from: { pathname: `/ProductScreen/${productId}` } } });
            return;
        }

        if (hasError) {
            setModalTrue(false);
            return;
        }

        setIsLoading(true);

        try {
            // Check if chat exists
            const chatResponse = await axios.post(
                checkChatExists,
                { productId, userEmail },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (chatResponse.data.exists) {
                console.log("Chat already exists for this inquiry.");
                alert(chatResponse.data.message); // Notify the user if chat exists
                setModalTrue(false);
                setIsLoading(false);
                navigate(`/ProfileFormChatGroup/chat_${productId}_${userEmail}`); // Navigate to existing chat
                return; // Stop further execution
            }

            // Fetch IP and time information
            const [ipResponse, timeResponse] = await Promise.all([
                axios.get(ipInfo),
                axios.get(timeApi),
            ]);

            const ipData = ipResponse.data;
            const { datetime } = timeResponse.data;

            if (!datetime) {
                console.error('Unable to retrieve server time.');
                return;
            }

            const momentDate = moment(datetime);
            const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
            const docId = `${momentDate.format('YYYY')}-${momentDate.format('MM')}`;
            const dayField = momentDate.format('DD');
            const addTransaction = {
                stockId: carData?.stockID,
                dateOfTransaction: formattedTime,
                carName: carData?.carName,
                referenceNumber: carData?.referenceNumber,
            };

            const chatData = {
                productId,
                userEmail,
                carData,
                formattedTime,
                recipientEmail: [
                    'marc@realmotor.jp',
                    'carl@realmotor.jp',
                    '510@realmotor.jp',
                    'yusuke.k@realmotor.jp',
                    'qiong.han@realmotor.jp',
                ],
                selectedCountry,
                selectedPort,
                chatFieldCurrency,
                inspectionIsRequired,
                inspectionName,
                toggle,
                insurance,
                currency,
                profitMap,
                freightOrigPrice,
                textInput: textInputRef.current,
                ip: ipData.ip,
                ipCountry: ipData.country_name,
                ipCountryCode: ipData.country_code,
                addTransaction,
            };

            // Create new chat if it doesn't exist
            await axios.post(
                addChatData,
                chatData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            openModal();

        } catch (error) {
            console.error('Error during conversation creation:', error);
        } finally {
            setModalTrue(false);
            setIsErrorPort(false);
            setIsErrorCountry(false);
            setIsErrorCheck(false);
            setIsLoading(false);
            navigate(`/ProfileFormChatGroup/chat_${productId}_${userEmail}`);
        }
    };
    /*
     const [isLoadingImage, setIsLoadingImage] = useState(true);
        useEffect(() => {
            const preloadImages = async () => {
                try {
                    setIsLoading(true)
                    const imagePromises = displayItems.map((item) => {
                        const carImages = allImageUrl?.[item?.id];
                        const firstImageUri = carImages && carImages.length > 0 ? carImages[0] : carSample;
     
                        if (firstImageUri) {
                            return Image.prefetch(firstImageUri); // Preload image
                        }
                        return Promise.resolve(); // Skip if no image URL
                    });
     
                    await Promise.all(imagePromises); // Wait for all images to preload
                    setIsLoadingImage(false);
                    setIsLoading(false) // All images are loaded
                } catch (error) {
                    console.error("Error preloading images:", error);
                    setIsLoadingImage(false); // Fail gracefully
                } finally {
                    setIsLoading(false)
                }
            };
     
            if (displayItems?.length > 0) {
                preloadImages();
            } else {
                setIsLoadingImage(false); // No items to preload
                setIsLoading(false);
            }
        }, [displayItems, allImageUrl,]);*/
    return (
        <View>

            <TouchableOpacity
                disabled={
                    isLoading ||
                    carData?.stockStatus === 'Sold' ||
                    carData?.stockStatus === 'Reserved'
                }
                onPress={handleCreateConversation}
                style={[
                    {
                        backgroundColor: 'blue',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 50,
                        borderRadius: 3,
                        marginVertical: 20,
                    },
                    // If disabled, override the background color with gray
                    (isLoading ||
                        carData?.stockStatus === 'Sold' ||
                        carData?.stockStatus === 'Reserved') && {
                        backgroundColor: 'gray',
                    },
                ]}
            >

                <Text style={{ textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 16, fontStyle: 'italic' }}>Send Inquiry</Text>


            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={alreadyInquiredModalVisible}
                onRequestClose={closeAlreadyInquiredModal}
            >
                <TouchableOpacity
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    activeOpacity={1}
                    onPress={closeAlreadyInquiredModal}
                >
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            You've already inquired about this vehicle.
                        </Text>
                        <Text style={{ fontSize: 16, marginBottom: 20 }}>
                            Please review your inquiry history in your profile.
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#007BFF', padding: 10, borderRadius: 5 }}
                            onPress={() => {
                                closeAlreadyInquiredModal();
                                navigate('/ProfileFormTransaction');
                            }}
                        >
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Go to Profile</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};




const FullscreenImageView = ({ src, onClose }) => (
    <div className="fullscreen-container" onClick={onClose}>
        <img src={src} alt="Fullscreen" className="fullscreen-image" />
    </div>
);

const LoadingImageGallery = () => {

    const [isFullscreen, setIsFullscreen] = useState(false);
    const renderCustomImage = (item) => {


        return (

            <img src={item.original} alt={item.originalAlt} className="custom-image" loading="lazy" />

        );
    };
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const blankItems = [
        { original: carSample, thumbnail: carSample, originalAlt: '' }, // Add as many blank items as needed
    ];
    const renderCustomLeftNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                left: '10px', // Adjust this value as needed
            }}

        >
            <AntDesign name="left" size={25} color="#fff" />
        </button>
    );

    const renderCustomRightNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                right: '10px', // Adjust this value as needed
            }}
        >
            <AntDesign name="right" size={25} color="#fff" />
        </button>


    );
    const thumbnailPosition = screenWidth >= 1280 ? 'bottom' : (screenWidth >= 992 ? 'right' : (screenWidth >= 768 ? 'right' : 'bottom'));

    return (
        <ImageGallery
            items={blankItems}
            showFullscreenButton={true}
            showPlayButton={false} // Hide autoplay button
            showThumbnails={true} // Hide thumbnails
            thumbnailPosition={thumbnailPosition}
            renderLeftNav={isFullscreen ? undefined : renderCustomLeftNav}
            renderRightNav={isFullscreen ? undefined : renderCustomRightNav}
            infinite={true}
            renderItem={renderCustomImage}
        />
    );
};

const CarouselSample = ({ allImageUrl, isFullscreen, setIsFullscreen }) => {

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);





    const [imagesLoading, setImagesLoading] = useState(true);
    useEffect(() => {
        if (allImageUrl && allImageUrl.length > 0) {
            setImagesLoading(false);
        } else {
            setImagesLoading(true);
        }
    }, [allImageUrl]);


    const formattedImages = allImageUrl.map(url => ({
        original: url,
        thumbnail: url, // You can set thumbnail to the same URL if thumbnails are not available
        // You can add more properties like description, alt text, etc. if needed
    }));
    const renderCustomLeftNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                left: '10px', // Adjust this value as needed
            }}
        >
            <AntDesign name="left" size={25} color="#fff" />
        </button>
    );
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const FullScreenButton = () => {
        return (
            <View style={{ width: '100%', height: '100%', zIndex: 999 }}>
                <button
                    onClick={openModal}
                    className="custom-fullscreen"
                    style={{
                        right: '10px', // Adjust this value as needed
                    }}
                >
                    <Feather name='check-square' size={20} />
                </button>
                {modalVisible === true && (
                    <View style={{ backgroundColor: 'white', width: '100%', height: '100%', position: 'absolute', top: '150%', left: 0 }}>
                        <Image
                            source={{ uri: formattedImages[0].original }}
                            style={{ width: 750, height: 550 }} // Set your modal image dimensions here
                            resizeMode="contain"
                        />
                    </View>

                )}
            </View>
        );
    };
    const renderCustomRightNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                right: '10px', // Adjust this value as needed
            }}
        >
            <AntDesign name="right" size={25} color="#fff" />
        </button>
    );
    const thumbnailPosition =
        screenWidth >= 1280
            ? 'right'

            : 'bottom';

    const [fullscreenImage, setFullscreenImage] = useState(null);
    console.log('IS IT FULLSCREEN?', isFullscreen)
    useEffect(() => {
        const handleFullscreenChange = () => {
            console.log("Fullscreen changed:", !!document.fullscreenElement);
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);
    const renderCustomImage = (item) => {
        const handleImagePress = () => {
            setFullscreenImage(item.original);
            setIsFullscreen(true);
        };

        return (
            <Pressable onPress={handleImagePress} style={{ zIndex: 9999 }}>
                <img src={item.original} alt={item.originalAlt} className='custom-image' />
            </Pressable>
        );
    };
    const [onClick, setOnClick] = useState(false)

    if (imagesLoading) {

        return <LoadingImageGallery />;
    } else {
        return (
            <View style={{ width: '100%', height: 'auto', alignSelf: 'flex-start' }}>
                <ImageGallery
                    showFullscreenButton={false}
                    items={formattedImages}
                    showPlayButton={false} // Hide autoplay button
                    showThumbnails={true} // Hide thumbnails
                    thumbnailPosition={thumbnailPosition}
                    renderLeftNav={isFullscreen ? undefined : renderCustomLeftNav}
                    renderRightNav={isFullscreen ? undefined : renderCustomRightNav}
                    infinite={true}
                    renderItem={renderCustomImage}

                />
                {isFullscreen && <FullscreenImageView src={fullscreenImage} onClose={() => setIsFullscreen(false)} />}
            </View>
        );

    }

}

const SearchByTypes = ({ carItems, navigate }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);

    const styles = StyleSheet.create({
        container: {
            padding: 15,
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginVertical: 20,
            color: 'white',
            marginLeft: 20,
            marginRight: 20
        },
        itemContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        button: {
            backgroundColor: 'blue',
            borderRadius: 5,
            height: 40,
            maxWidth: 150,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        },

        cardPressable: {
            alignSelf: 'center',
            shadowColor: '#333',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: 10,
            maxWidth: screenWidth < 700 ? 290 : 360,
            width: '100%',
            height: '100%',
            maxHeight: 320

        },
        card: {
            overflow: 'hidden',
            backgroundColor: 'transparent',
        },
        cardImage: {
            width: '100%',
            aspectRatio: 1.5,
            resizeMode: 'cover',
        },
        textContainer: {
            padding: 10,

        },
        carName: {
            alignSelf: 'flex-start',
            fontWeight: '600',
            fontSize: 18,
            color: 'white'
        },
    });
    const renderItem = useCallback(({ item }) => {
        const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0, // No decimal places
            maximumFractionDigits: 0, // No decimal places
        }).format(item.fobPrice * 0.0068).replace('.00', '');
        return (
            <Pressable
                onPress={() => { navigate(`/ProductScreen/${item.stockID}`) }}
                style={({ pressed }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                    },
                    styles.cardPressable
                ]}
            >
                <View style={styles.card}>

                    <Image
                        source={{ uri: item?.images?.[0] }}
                        style={styles.cardImage}
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.carName} >
                            {item.carName}
                        </Text>
                        <Text style={{ fontSize: 14, marginTop: 20, color: 'white' }}>
                            {item.regYear}/{item.regMonth}
                        </Text>
                        <Text style={{ fontSize: 14, color: 'blue', color: 'white' }}>
                            {`FOB. US${formattedPrice}`}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }, []);
    let numberOfItemsPerRow;
    if (screenWidth > 992) {
        numberOfItemsPerRow = 6;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 3;
    } else {
        numberOfItemsPerRow = 2;
    }
    const spacing = screenWidth > 440 ? 15 : 10;
    const totalSpacing = spacing * (numberOfItemsPerRow - 1);


    const itemDimension = (screenWidth - totalSpacing) / numberOfItemsPerRow;
    return (
        <View style={styles.container}>
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'flex-end',
                    marginTop: -15,
                    marginRight: -15
                }}>
                    <SquareGrays />
                </View>
            )}
            {screenWidth >= 644 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginLeft: -35 }}>

                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'white' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>Recommended Items</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => navigate('/SearchCarDesign')}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all</Text>
                    </TouchableOpacity>
                </View>
            )}

            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>Search by Type</Text>
                </View>
            )}
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={carItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={itemDimension}
                    spacing={spacing}
                />
            </View>
            {screenWidth < 644 && (
                <TouchableOpacity style={[{
                    marginTop: screenWidth < 644 ? 10 : 0,
                    alignSelf: 'center',
                }, styles.button]}>
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Type</Text>
                </TouchableOpacity>
            )}
        </View>
    )

};
const StickyFooter = ({ handlePolicyClick, setContactUsOpen }) => {
    const navigate = '';
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
            navigate(`/SearchCarDesign?keywords=&carModels=&carMakes=${item.key}&carBodyType=&carMinYear=&carMaxYear=&minMileage=&maxMileage=&minPrice=&maxPrice=`);  // Pass selected carMake in URL
        };

        return (
            <TouchableOpacity
                style={[styles.item, isFirstColumn ? styles.firstColumn : styles.secondColumn]} // Conditional column styling
                onPress={() => { handleSearch(); }}  // Trigger search on press
            >
                <Text style={styles.title}>{item.key}</Text>
            </TouchableOpacity>
        );
    };
    const numColumns = screenWidth < 992 ? 1 : 2;

    const renderItemBodyType = ({ item, index }) => {
        const handleSearch = () => {
            navigate(`/SearchCarDesign?keywords=&carModels=&carMakes=&carBodyType=${item.key}&carMinYear=&carMaxYear=&minMileage=&maxMileage=&minPrice=&maxPrice=`);  // Pass selected carMake in URL
        };
        return (
            <TouchableOpacity style={[styles.item, styles.firstColumn]}
                onPress={() => { handleSearch(); }}
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
                                <Text style={styles.linkText}>Car Stock</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate('/', { replace: true }) }}>
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
const SocialMedia = ({ carData, userEmail }) => {
    const navigate = '';
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    // Car ID from the URL
    const [isFavorited, setIsFavorited] = useState(false); // Favorited state
    const [isAnimating, setIsAnimating] = useState(false); // Animation state
    const [currentScreenWidth, setCurrentScreenWidth] = useState(Dimensions.get('window').width);
    const animationValue = useRef(new AnimatedRN.Value(0)); // Animation value for background color
    const textOpacityValue = useRef(new AnimatedRN.Value(1)); // Animation value for text opacity
    const [showHeart, setShowHeart] = useState(false);
    const [heartVisible, setHeartVisible] = useState(false);
    const animateButton = () => {
        AnimatedRN.timing(animationValue.current, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start(() => {
            setIsAnimating(false); // Stop animating after the button animation completes
        });
    };
    const animateTextChange = () => {
        AnimatedRN.sequence([
            AnimatedRN.timing(textOpacityValue.current, {
                toValue: 0, // Fade out
                duration: 800,
                useNativeDriver: true,
            }),
            AnimatedRN.timing(textOpacityValue.current, {
                toValue: 1, // Fade in
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    };
    // Fetch favorited state on load
    useEffect(() => {
        if (!userEmail) {
            return;
        }
        const fetchFavorites = async () => {
            try {
                const accountTransaction = doc(projectExtensionFirestore, 'accounts', userEmail);
                const accountSnap = await getDoc(accountTransaction);

                if (accountSnap.exists()) {
                    const userData = accountSnap.data();
                    const isCarFavorited = userData.favorites?.some((fav) => fav.stockId === carData?.stockID);
                    setIsFavorited(isCarFavorited || false);
                }
            } catch (error) {
                console.error('Failed to fetch favorites:', error);
            }
        };

        fetchFavorites();
    }, [carData?.stockID, userEmail]);

    const addToFavorites = async () => {
        try {
            const response = await axios.get(timeApi);
            const datetime = response.data.datetime;

            const newFavorite = {
                carName: carData?.carName,
                imageUrl: carData?.images?.[0] || 'No image yet',
                referenceNumber: carData?.referenceNumber,
                stockId: carData?.stockID,
                fobPrice: carData?.fobPrice,
                regYear: carData?.regYear,
                regMonth: carData?.regMonth,
                mileage: carData?.mileage,
                steering: carData?.steering,
                color: carData?.exteriorColor,
                dateOfTransaction: datetime,
            };

            const accountTransaction = doc(projectExtensionFirestore, 'accounts', userEmail);
            await updateDoc(accountTransaction, {
                favorites: arrayUnion(newFavorite),
            });

            setIsFavorited(true); // Update state after adding
            setIsAnimating(false); // Stop animation after adding
        } catch (error) {
            console.error('Failed to add to favorites:', error);
        }
    };

    const handleFavorite = () => {
        if (!userEmail) {
            // Redirect to LoginForm if user is not logged in
            navigate('/LoginForm', { state: { from: { pathname: `/ProductScreen/${productId}` } } });

            return;
        }

        if (isFavorited) {
            console.log('Car is already in favorites.');
            return;
        }

        // Start animations
        setIsAnimating(true); // Start the button animation
        setShowHeart(false);  // Hide heart initially
        setHeartVisible(false); // Ensure the heart is not visible

        animateButton(); // Trigger button animation
        animateTextChange(); // Trigger text animation

        // Add to favorites after animations are initiated
        addToFavorites({
            car: carData, // Pass car data
            firstImageUri: carData?.images?.[0], // Use the first image URL if available
        });

        setIsFavorited(true); // Mark as favorited
    };

    const isDisabled = carData?.stockStatus === 'Sold' || carData?.stockStatus === 'Reserved';

    const backgroundColor = isDisabled
        ? 'gray' // Gray when disabled
        : isFavorited
            ? 'red' // Always red if favorited
            : isAnimating
                ? animationValue.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['blue', 'red'], // Animate from blue to red
                })
                : 'blue'; // Default to blue if not favorited and not animating
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: screenWidth < 358 ? 0 : 15,
                marginBottom: screenWidth < 358 && 10
            }}
        >
            <AnimatedRN.View
                style={{
                    width: 'auto',
                    maxWidth: screenWidth <= 600 ? null : 140,
                    borderRadius: 5,
                    backgroundColor,
                }}
            >
                <TouchableOpacity
                    style={{
                        padding: 10,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                    onPress={handleFavorite}
                    disabled={carData?.stockStatus === 'Sold' || carData?.stockStatus === 'Reserved'}
                >
                    <AnimationFavorites
                        screenWidth={screenWidth}
                        isAnimating={isAnimating} // Pass isAnimating as a prop
                        isFavorited={isFavorited}
                        showHeart={showHeart}
                        setShowHeart={setShowHeart}
                        heartVisible={heartVisible}
                        setHeartVisible={setHeartVisible}
                    />
                    {screenWidth > 600 && (
                        <AnimatedRN.Text
                            style={{
                                color: 'white',
                                marginLeft: 5,
                                fontWeight: '600',
                                opacity: textOpacityValue.current, // Use animated opacity value
                            }}
                        >
                            {isFavorited ? 'On favorites' : 'Add to favorites'}
                        </AnimatedRN.Text>
                    )}
                </TouchableOpacity>
            </AnimatedRN.View>

        </View>
    );
};




const AnimationFavorites = ({ isFavorited, isAnimating, setFaveAnimation, setShowHeart, showHeart, setHeartVisible, heartVisible, screenWidth }) => {

    const rotateAnim = useRef(new AnimatedRN.Value(0)).current;
    const scaleAnim = useRef(new AnimatedRN.Value(1)).current;
    const fadeAnim = useRef(new AnimatedRN.Value(1)).current;
    const heartFadeAnim = useRef(new AnimatedRN.Value(0)).current;
    const heartPopAnim = useRef(new AnimatedRN.Value(0.4)).current;

    useEffect(() => {
        if (isAnimating) {
            // Animate the "plus" icon (spin, scale down, fade out)
            AnimatedRN.sequence([
                AnimatedRN.parallel([
                    AnimatedRN.timing(rotateAnim, {
                        toValue: 1,
                        duration: 500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    AnimatedRN.timing(scaleAnim, {
                        toValue: 0.4,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    AnimatedRN.timing(fadeAnim, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                // Show the "heart" without animations immediately
                setShowHeart(true);
                setHeartVisible(true);
            });
        }
    }, [isAnimating]); // Trigger this effect when `heartVisible` changes


    useEffect(() => {
        if (heartVisible) {
            // Fade in first
            AnimatedRN.timing(heartFadeAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                // After fade-in, perform the pop-up animation
                AnimatedRN.sequence([
                    AnimatedRN.timing(heartPopAnim, {
                        toValue: 1.2, // Expand slightly larger
                        duration: 300,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    AnimatedRN.timing(heartPopAnim, {
                        toValue: 1, // Shrink back to normal size
                        duration: 200,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }
    }, [heartVisible]);




    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });


    const svgs = {
        heart: (
            <Svg
                width="19px"
                height="19px"
                viewBox="0 0 24 24"
                fill="none"
            >
                <Path
                    d="M2 9.137C2 14 6.02 16.591 8.962 18.911 10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138c0-4.863-5.5-8.312-10-3.636C7.5.825 2 4.274 2 9.137z"
                    fill="#fff"
                />
            </Svg>
        ),
        plus: (
            <Svg width="17px" height="17px" viewBox="0 0 32 32" fill="white">
                <Path
                    d="M390 1049h-8v-8a4 4 0 10-8 0v8h-8a4 4 0 100 8h8v8a4 4 0 108 0v-8h8a4 4 0 100-8"
                    transform="translate(-362 -1037)"
                    fill="#fff"
                    stroke="none"
                    strokeWidth={1}
                    fillRule="evenodd"
                />
            </Svg>
        ),
    };

    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                marginRight: screenWidth <= 600 ? 0 : 5,
            }}
        >
            {isFavorited && !isAnimating ? (
                // Static heart when favorited
                <AnimatedRN.View
                    style={{
                        opacity: 1, // Always visible when favorited
                        transform: [{ scale: 1 }], // No animation for static heart
                    }}
                >
                    {svgs.heart}
                </AnimatedRN.View>
            ) : showHeart ? (
                // Heart animation
                <AnimatedRN.View
                    style={{
                        opacity: heartFadeAnim,
                        transform: [{ scale: heartPopAnim }],
                    }}
                >
                    {svgs.heart}
                </AnimatedRN.View>
            ) : (
                // Plus animation
                <AnimatedRN.View
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            { rotate: rotateInterpolate },
                            { scale: scaleAnim },
                        ],
                    }}
                >
                    {svgs.plus}
                </AnimatedRN.View>
            )}
        </View>

    );
};

const formatWithCommas = (value) => {
    if (isNaN(value)) {
        return '0'; // Fallback in case value is not a valid number
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const AnimatedCounter = ({ value, profitMap, selectedCountry, selectedPort, context, toggle, insurance }) => {
    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        counterText: {
            fontSize: '3em',
            fontWeight: 'bold',
        },
    });

    // Use a separate animated value for each instance of the counter
    const animatedValue = useRef(new AnimatedRN.Value(0)).current;
    const [displayValue, setDisplayValue] = useState('0');
    const loadingAnimationRef = useRef(null);
    useEffect(() => {
        // Debugging log

        if (profitMap === 0
            && context === 'total'
            && selectedCountry
            && selectedPort) {
            console.log('this is true')
            setDisplayValue(' ASK');
            return;
        }

        const numericValue = Number(value?.replace(/,/g, ''));

        if (!value || isNaN(numericValue)) {
            console.log('Value is invalid or NaN. Starting loading animation.');

            // Start loading animation if value is not ready
            if (!loadingAnimationRef.current) {
                loadingAnimationRef.current = AnimatedRN.loop(
                    AnimatedRN.timing(animatedValue, {
                        toValue: 99999, // Placeholder value for loading effect
                        duration: 1500,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    })
                );
                loadingAnimationRef.current.start();
            }
        } else {
            console.log('Value is valid. Stopping loading animation and animating.');

            // Stop loading animation if active
            if (loadingAnimationRef.current) {
                loadingAnimationRef.current.stop();
                loadingAnimationRef.current = null;
            }

            // Animate to the actual numeric value
            AnimatedRN.timing(animatedValue, {
                toValue: numericValue,
                duration: 1000,
                easing: Easing.out(Easing.ease), // Adding easing for smooth animation
                useNativeDriver: false,
            }).start();
        }
    }, [value, profitMap, selectedPort, toggle, insurance, context]);



    useEffect(() => {
        const listener = animatedValue.addListener(({ value }) => {
            const formattedValue = formatWithCommas(Math.round(value));
            setDisplayValue(formattedValue);
        });

        return () => {
            animatedValue.removeListener(listener);
        };
    }, [animatedValue]);

    return (
        <View style={styles.container}>
            <Text style={styles.counterText}>{displayValue}</Text>
        </View>
    );
};


const ProductDetailScreen = ({ productId }) => {


    const location = '';
    useEffect(() => {
        // Scroll to the top of the page whenever location changes
        window.scrollTo(0, 0);
    }, [location]);
    const { country, city } = location.state || {};


    const [countryData, setCountryData] = useState([]);
    useEffect(() => {
        const fetchCountries = async () => {
            const countryRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

            try {
                const docSnapshot = await getDoc(countryRef);
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    const prioritizedCountries = ['Zambia', 'Tanzania', 'Mozambique', 'Kenya', 'Uganda', 'Zimbabwe', 'D_R_Congo'];
                    const prioritizedSorted = prioritizedCountries.filter(country => country in data);

                    // Sort the rest of the countries alphabetically
                    const otherCountriesSorted = Object.keys(data)
                        .filter(country => !prioritizedCountries.includes(country))
                        .sort();

                    // Combine the arrays
                    const sortedCountries = [...prioritizedSorted, ...otherCountriesSorted];

                    setCountryData(sortedCountries);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
            }
        };

        fetchCountries();
    }, []);
    const [selectedCountry, setSelectCountry] = useState(null);
    const handleSelectCountry = (option) => {
        setSelectCountry(option)
    }
    //dropdown Country

    //dropdown Port
    const [ports, setPorts] = useState([]);
    useEffect(() => {
        if (selectedCountry) {
            const fetchPorts = async () => {
                const countriesDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

                try {
                    const docSnapshot = await getDoc(countriesDocRef);
                    if (docSnapshot.exists()) {
                        const countriesData = docSnapshot.data();
                        // Assuming each country's data is structured as an object within CountriesDoc
                        const countryData = countriesData[selectedCountry];
                        if (countryData && countryData.nearestPorts) {
                            setPorts(countryData.nearestPorts); // Set ports with the nearestPorts array
                        } else {
                            console.log(`No nearestPorts data found for ${selectedCountry}`);
                            setPorts(['Others']); // Reset ports if no data is found
                        }
                    } else {
                        console.log("CountriesDoc document does not exist!");
                        setPorts([]);
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                }
            };

            fetchPorts();
        } else {
            return;
        }
    }, [selectedCountry]);
    const [selectedPort, setSelectPort] = useState(null);
    const handleSelectPort = (option) => {
        setSelectPort(option)
    };

    useEffect(() => {
        // Initialize selectedCountry and selectedPort from location.state
        if (country) {
            setSelectCountry(country); // Set the selectedCountry
            if (city) {
                setSelectPort(city); // Set the selectedPort
            }
        }
    }, [country, city]);





    const [isFullscreen, setIsFullscreen] = useState(false);
    //FETCH NEW ARRIVALS
    const [carItems, setCarItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

                // Add where clause to filter documents where 'imageCount' is greater than 0
                const q = query(
                    vehicleCollectionRef,
                    where('imageCount', '>', 0), // Added where clause
                    where('stockStatus', '==', 'On-Sale'),
                    orderBy('dateAdded', 'desc'),
                    limit(5)                    // Limit to 5 results
                );

                const querySnapshot = await getDocs(q);
                const newItems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setCarItems(newItems);
            } catch (error) {
                console.error("Error fetching documents: ", error);
            }
            setIsLoading(false);
        };

        fetchItems();
    }, []);

    //FETCH NEW ARRIVALS


    // const totalPriceCalculation = (selectedChatData.fobPrice * selectedChatData.jpyToUsd) + (selectedChatData.m3 * selectedChatData.freightPrice);

    const navigate = '';
    const [carData, setCarData] = useState({});
    const JapanPort = carData.port
    const carName = carData.carName;
    const { userEmail } = useContext(AuthContext);
    console.log('user email', userEmail)
    const [userTransactions, setUserTransactions] = useState([]);

    //SEND INQUIRY
    const [modalVisible, setModalVisible] = useState(false);
    const [alreadyInquiredModalVisible, setAlreadyInquiredModalVisible] = useState(false);
    // Function to open the modal
    const openModal = () => {
        setModalVisible(true);
    };
    // Function to close the modal
    const closeModal = () => {
        setModalVisible(false);
    };
    const openAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(true);
    };

    // Function to close the "Already Inquired" modal
    const closeAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(false);
    };

    useEffect(() => {
        // Check if userEmail is available before proceeding
        if (userEmail) {
            // Fetch user transactions only when userEmail is available
            const fetchUserTransactions = async () => {
                try {

                    const transactionsSnapshotExtension = await getDocs(collection(projectExtensionFirestore, 'accounts', userEmail, 'transactions'));

                    const transactionsDataArrayExtension = transactionsSnapshotExtension.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))

                    setUserTransactions(transactionsDataArrayExtension);
                } catch (error) {
                    console.log('Error fetching user transactions:', error);
                }
            };
            // Call the fetchUserTransactions function to populate userTransactions
            fetchUserTransactions();
        }
    }, [userEmail]);



    //FETCH CAR DATA

    const [allImageUrl, setAllImageUrl] = useState([]);

    useEffect(() => {
        const fetchCarData = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', productId);

            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarData(vehicleData);
                    setAllImageUrl(vehicleData?.images || [])
                } else {
                    // Vehicle data not found, set a specific message or data
                    navigate('/vehicle-not-found');// You can set a custom message or data here
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                // Handle the error, e.g., display an error message.
            }
        };

        if (productId) {
            fetchCarData();
        }
    }, [productId]); // Empty dependency array to ensure it runs only once


    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //BREAKPOINT
    //save screen


    //save screen


    //COMMENTS TO CARS HERE

    //make comments for cars

    //make comments for cars here **



    //CUSTOMER MESSAGE HERE


    const textInputRef = useRef(null);
    const handleTextChange = (value) => {
        textInputRef.current = value

    };
    //CUSTOMER MESSAGE HERE
    //CHECKMARK
    const [isCheck, setIsCheck] = useState(false);
    const checkButton = (option) => {
        setIsCheck(option);

    }
    //CHECKMARK



    const [currentCurrency, setCurrentCurrency] = useState('');
    useEffect(() => {
        const fetchCurrency = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'currency', 'currency');

            try {
                const docSnapshot = await getDoc(vehicleDocRef);

                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();

                    setCurrentCurrency(data);
                } else {
                    console.log('Document does not exist!');
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            }
        };

        fetchCurrency();
    }, []);
    //FETCH PORTS DOC
    const [profitMap, setProfitMap] = useState('');
    //FETCH PORTS DOC
    //DOLLAR CONVERSION
    const fobDollar = currentCurrency.jpyToUsd * parseFloat(carData.fobPrice);
    const formattedFobDollar = fobDollar ? parseInt(fobDollar).toLocaleString() : '000';
    const [calculatePrice, setCalculatePrice] = useState(0);

    //DOLLAR CONVERSION
    const getFlexDirection = (screenWidth) => {
        if (screenWidth <= 523) {
            return 'column'; // For very small screens
        } else if (screenWidth <= 992) {
            return 'row'; // For small to medium screens
        } else if (screenWidth <= 1075) {
            return 'column'; // For medium screens
        } else {
            return 'row'; // For large screens
        }
    };



    //check inspection
    const [toggle, setToggle] = useState(false);
    const handleToggleInspection = (item) => {
        setToggle(item);

    };

    const toggleAnim = useRef(new AnimatedRN.Value(0)).current;
    const [isToggleDisabled, setIsToggleDisabled] = useState(false);
    const handleToggle = () => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 0 : 1,
            duration: 100, // Increased duration for a more noticeable animation
            useNativeDriver: true, // Change this based on what you are animating
        }).start();

        setToggle(prevToggle => !prevToggle); // Using a callback for the state update
    };

    // Interpolate values for moving the switch and changing the background color
    const switchTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values based on the size of your switch
    });

    const switchColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['grey', '#7b9cff'] // Change colors as needed
    });

    const [inspectionIsRequired, setInspectionIsRequired] = useState('');
    const [inspectionName, setInspectionName] = useState('');
    console.log('PRODUCT DETAILS SCREEN', inspectionIsRequired)
    console.log('PRODUCT DETAILS SCREEN INSPECTION NAME', inspectionName)

    useEffect(() => {
        const fetchInspection = async () => {
            if (selectedCountry === '') {
                setToggle(false);
                return;
            }

            const countriesDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

            try {
                const docSnap = await getDoc(countriesDocRef);
                if (docSnap.exists()) {
                    const selectedCountryData = docSnap.data()[selectedCountry];

                    if (selectedCountryData) {
                        setInspectionIsRequired(selectedCountryData.inspectionIsRequired);
                        setInspectionName(selectedCountryData.inspectionName);
                        switch (selectedCountryData.inspectionIsRequired) {
                            case "Required":
                                setToggle(true); // Ensure the toggle is on for "Required"
                                setIsToggleDisabled(true); // Disable toggle interaction for "Required"
                                break;
                            case "Not-Required":
                                setToggle(false); // Ensure the toggle is off for "Not-Required"
                                setIsToggleDisabled(true); // Disable toggle interaction for "Not-Required"
                                break;
                            case "Optional":
                            default:
                                setIsToggleDisabled(false); // Enable toggle interaction otherwise
                                break;
                        }
                    } else {
                        setToggle(false);
                        setIsToggleDisabled(false);
                    }
                } else {
                    console.log("CountriesDoc does not exist, setting toggle to false");
                    setToggle(false);
                    setIsToggleDisabled(false);
                }
            } catch (error) {
                console.error("Error fetching document:", error);
                setToggle(false);
                setIsToggleDisabled(false);
            }
        };

        fetchInspection();
    }, [selectedCountry]);

    // Separate effect for handling the animation when the toggle state changes
    useEffect(() => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [toggle, toggleAnim]);


    //check inspection

    //check insurance
    const [insurance, setInsurance] = useState(false);
    const handleToggleInsurance = (item) => {
        setInsurance(!insurance);
    };

    useEffect(() => {
        const fetchInsurance = async () => {
            if (selectedCountry === '') {
                setInsurance(false);
                return;
            }


            const countriesDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

            try {
                const docSnap = await getDoc(countriesDocRef);
                if (docSnap.exists()) {
                    const selectedCountryData = docSnap.data()[selectedCountry];

                    if (selectedCountryData) {

                    } else {
                        setInsurance(false);

                    }
                } else {
                    console.log("CountriesDoc does not exist, setting toggle to false");
                    setToggle(false);
                    setIsToggleDisabled(false);
                }
            } catch (error) {
                console.error("Error fetching document:", error);
                setToggle(false);
                setIsToggleDisabled(false);
            }
        };

        fetchInsurance();
    }, [selectedCountry]);


    //check insurance

    //get currency I HAVE ALREADY THIS ONE
    const [currency, setCurrency] = useState({})
    useEffect(() => {
        const fetchCurrencyData = async () => {
            const currencyDocRef = doc(projectExtensionFirestore, 'currency', 'currency');

            try {
                const docSnap = await getDoc(currencyDocRef);
                if (docSnap.exists()) {
                    const currency = docSnap.data()
                    setCurrency(currency);
                } else {
                    console.log('No such document in the database!');
                }
            } catch (error) {
                console.error('Error fetching currency data:', error);
            }
        };

        fetchCurrencyData();
    }, [])


    //get currency

    //profit map

    const [freightOrigPrice, setFreightOrigPrice] = useState('');


    console.log('PROFIT PRICE DAR ES', freightOrigPrice)
    useEffect(() => {
        const fetchInspection = async () => {

            const portDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'PortsDoc');

            try {
                const docSnap = await getDoc(portDocRef);

                if (docSnap.exists()) {
                    const selectedPortData = docSnap.data()[selectedPort];

                    if (selectedPortData) {

                        const profitPrice =
                            selectedPort === 'Others'
                                ? 0 // If selectedPort is "Others", set profitPrice to 0
                                : selectedPortData?.profitPrice !== undefined
                                    ? selectedPortData.profitPrice
                                    : 0; // If selectedPortData exists but profitPrice is undefined, set to 0

                        setProfitMap(profitPrice);
                        if (!JapanPort) {
                            console.error('NO PORT DETECTED')
                            return;
                        } else {
                            if (JapanPort === "Nagoya") {
                                setFreightOrigPrice(selectedPortData.nagoyaPrice || ''); // Use fallback if undefined
                            } else if (JapanPort === "Kobe") {
                                setFreightOrigPrice(selectedPortData.kobePrice || ''); // Use fallback if undefined
                            } else if (JapanPort === "Yokohama") {
                                setFreightOrigPrice(selectedPortData.yokohamaPrice || ''); // Use fallback if undefined
                            } else if (JapanPort === "Kyushu") {
                                setFreightOrigPrice(selectedPortData.kyushuPrice || ''); // Use fallback if undefined
                            }
                        }
                    } else {
                    }
                } else {
                    console.log("PortDoc does not exist, setting toggle to false");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchInspection();
    }, [selectedPort]);
    //profit map

    //fetch ip address
    const [ip, setIp] = useState('');
    const [ipCountry, setIpCountry] = useState('');




    //is check PRIVACY
    const [isError, setIsError] = useState(false);
    const [isErrorPort, setIsErrorPort] = useState(false);
    //is check PRIVACY


    //check currency
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [currentCurrencyGlobal, setCurrentCurrencyGlobal] = useState({});
    useEffect(() => {
        if (userEmail) {

            const fetchAccount = async () => {
                try {
                    const userDocRefAuth = doc(projectExtensionFirestore, 'accounts', userEmail);
                    const docSnap = await getDoc(userDocRefAuth);
                    if (docSnap.exists()) {
                        let data = docSnap.data();

                        // Check if selectedCurrencyExchange is undefined, null, or empty, then update
                        if (!data.selectedCurrencyExchange) {
                            // Update the document in Firestore to set selectedCurrencyExchange to "USD"
                            await updateDoc(userDocRefAuth, {
                                selectedCurrencyExchange: "USD"
                            });
                            data.selectedCurrencyExchange = "USD"; // Update local data for immediate UI update
                        }

                        setCurrentCurrencyGlobal({
                            id: docSnap.id,
                            ...data,
                            selectedCurrencyExchange: data.selectedCurrencyExchange === 'YEN' ? 'JPY' : data.selectedCurrencyExchange,
                        });

                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching account:', error);
                }
            };

            fetchAccount();
        }
    }, [userEmail]);
    const chatFieldCurrency = selectedCurrency
        ? selectedCurrency
        : currentCurrencyGlobal?.selectedCurrencyExchange;

    // Normalize currency codes for internal calculations
    const normalizeCurrency = (currency) => {
        const currencyMap = {
            'JPY': 'JPY', // Treat JPY as YEN internally
        };
        return currencyMap[currency] || currency;
    };
    console.log('selected now', selectedCurrency)
    const convertedCurrency = (yenValue) => {
        const value = Number(yenValue);
        const rawCurrency = selectedCurrency || currentCurrencyGlobal?.selectedCurrencyExchange || 'USD';
        const currency = normalizeCurrency(rawCurrency); // Normalize for internal use

        const rates = {
            'EUR': currentCurrency.usdToEur,
            'AUD': currentCurrency.usdToAud,
            'GBP': currentCurrency.usdToGbp,
            'CAD': currentCurrency.usdToCad,
            'USD': 1,
            'JPY': currentCurrency.usdToJpy,
        };
        const conversionRate = rates[currency] || 1;
        const convertedValue = Math.round(value * conversionRate).toLocaleString('en-US', { useGrouping: true });

        const currencySymbols = {
            'EUR': '€',
            'AUD': 'A$',
            'GBP': '£',
            'CAD': 'C$',
            'USD': 'US$',
            'JPY': '¥', // Keep JPY for external use
        };

        // Return the external representation of the currency
        const displayCurrency = rawCurrency === 'YEN' ? 'JPY' : rawCurrency;

        return { symbol: currencySymbols[displayCurrency], value: convertedValue };
    };

    const [inspectionPrice, setInspectionPrice] = useState(0)
    const fetchInspectionPrice = async () => {
        try {
            // Dynamically import Firestore
            const { getDoc, doc } = await import('firebase/firestore');
            const { projectExtensionFirestore } = await import('../firebaseConfig/firebaseConfig'); // Adjust path to your Firebase config

            // Reference to the Inspection document
            const inspectionDocRef = doc(projectExtensionFirestore, 'Inspection', 'inspectionPrice');
            const inspectionDoc = await getDoc(inspectionDocRef);

            if (inspectionDoc.exists()) {
                const data = inspectionDoc.data();

                const price = data[inspectionName]; // Match the inspectionName key

                if (price !== undefined) {
                    return setInspectionPrice(parseFloat(price)); // Return the matched price as a float
                } else {
                    console.error(`Inspection name "${inspectionName}" not found`);
                    return 0; // Default to 0 if the inspection name is not found
                }
            } else {
                console.error('Inspection document not found');
                return 0; // Default to 0 if the document is not found
            }
        } catch (error) {
            console.error('Error fetching inspection price:', error);
            return 0; // Default to 0 if there's an error
        }
    };
    useEffect(() => {
        fetchInspectionPrice()
    }, [inspectionName])
    const fobBaseDollar = (carData.fobPrice) * currentCurrency.jpyToUsd;
    console.log('selected Port', selectedPort, city)
    const totalPriceCalculation =
        carData.fobPrice * currentCurrency.jpyToUsd +
        parseFloat(carData.dimensionCubicMeters) * parseFloat(profitMap) +
        (toggle ? inspectionPrice : 0) + (insurance ? 50 : 0);



    const fobCurrencyTotal = convertedCurrency(calculatePrice);
    console.log('CALCULATE PRICE', totalPriceCalculation)
    const fobCurrency = convertedCurrency(fobBaseDollar);

    //check currency
    useEffect(() => {
        setTimeout(() => {
            document.documentElement.scrollTop = 0;  // Scroll to the top
            document.body.scrollTop = 0;  // For older browsers (or in case body is scrollable)
        }, 0);
    }, []);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null);
    console.log('Ports', selectedPort)
    const toggleDropdown = (id) => {
        setActiveDropdown((prevId) => {
            const isSameDropdown = prevId === id;
            const newActiveDropdown = isSameDropdown ? null : id;

            // Reset logic when toggling 'selectCountry'
            if (id === 'selectCountry') {
                setPorts([]); // Clear ports
                setSelectPort('');
                setSelectCountry('');
                setCalculatePrice(0);
                setProfitMap(0)
                setInsurance(false);
                setToggle(false);
            }

            return newActiveDropdown;
        });
    };


    const currentYear = new Date().getFullYear();
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    // useEffect(() => {

    //     setSelectPort('');
    //     setPorts([])
    // }, [selectedCountry]);
    const [isActive, setIsActive] = useState(false);
    const handleOutsidePress = () => {
        setActiveDropdown(null);
        setIsProfileDropdownOpen(false) // Close dropdowns on outside press
    };
    const [isErrorCheck, setIsErrorCheck] = useState(false);
    const [isErrorCountry, setIsErrorCountry] = useState(false);
    const [viewLocation, setViewLocation] = useState({ x: 0, y: 0 });
    const handleSetViewLocation = (event) => {
        const { x, y } = event.nativeEvent.layout; // Get x and y positions
        setViewLocation({ x, y });
    };
    const section1Ref = useRef(null);
    const scrollToSectionWithOffset = (ref, offset = -85) => {
        if (ref.current) {
            const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition + offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'instant',
            });
        }
    };
    const shakeAnimation = useRef(new AnimatedRN.Value(0)).current;

    // Trigger shake animation when there's an error
    useEffect(() => {
        if (isErrorCheck && section1Ref.current) {
            // Check if section is in the viewport
            const elementTop = section1Ref.current.getBoundingClientRect().top;
            const elementBottom = section1Ref.current.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            const isInView = elementTop >= 0 && elementBottom <= windowHeight;

            if (!isInView) {
                // Scroll to the section if not in view
                scrollToSectionWithOffset(section1Ref);
            }

            // Trigger shake animation
            AnimatedRN.sequence([
                AnimatedRN.timing(shakeAnimation, {
                    toValue: 20, // Move 20px to the right
                    duration: 50,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shakeAnimation, {
                    toValue: -20, // Move 20px to the left
                    duration: 50,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shakeAnimation, {
                    toValue: 20, // Back to the right
                    duration: 50,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shakeAnimation, {
                    toValue: 0, // Reset to original position
                    duration: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isErrorCheck, section1Ref]);


    const [modalTrue, setModalTrue] = useState(false);
    const handleCreatConversation2 = () => {
        setModalTrue(!modalTrue)
    }

    // const scaleAnimation = useRef(new AnimatedRN.Value(0)).current;
    // const circleDashOffset = useRef(new AnimatedRN.Value(166)).current;
    // const checkDashOffset = useRef(new AnimatedRN.Value(48)).current;
    // useEffect(() => {
    //     if (modalTrue) {
    //         // Reset animated values before starting
    //         scaleAnimation.setValue(0);
    //         circleDashOffset.setValue(166);
    //         checkDashOffset.setValue(48);

    //         // Start scale animation loop
    //         const scaleAnimationLoop = AnimatedRN.loop(
    //             AnimatedRN.sequence([
    //                 AnimatedRN.timing(scaleAnimation, {
    //                     toValue: 1.1,
    //                     duration: 150,
    //                     useNativeDriver: true,
    //                 }),
    //                 AnimatedRN.timing(scaleAnimation, {
    //                     toValue: 1,
    //                     duration: 150,
    //                     useNativeDriver: true,
    //                 }),
    //             ])
    //         );

    //         // Circle animation
    //         const circleAnimation = AnimatedRN.timing(circleDashOffset, {
    //             toValue: 0,
    //             duration: 600,
    //             delay: 400,
    //             useNativeDriver: false,
    //         });

    //         // Checkmark animation
    //         const checkmarkAnimation = AnimatedRN.timing(checkDashOffset, {
    //             toValue: 0,
    //             duration: 300,
    //             delay: 800,
    //             useNativeDriver: false,
    //         });

    //         // Start animations in parallel
    //         scaleAnimationLoop.start();
    //         AnimatedRN.parallel([circleAnimation, checkmarkAnimation]).start();
    //     }
    // }, [modalTrue]);

    console.log('fob price', fobCurrencyTotal.value)
    const displayCountryData = countryData.map(country =>
        country === "D_R_Congo" ? "D.R. Congo" : country
    );

    const valueToDisplayMap = {
        "D_R_Congo": "D.R. Congo"
    };

    // Inverse mapping to get the original value back
    const displayToValueMap = Object.fromEntries(
        Object.entries(valueToDisplayMap).map(([key, value]) => [value, key])
    );
    const [contactUsOpen, setContactUsOpen] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState(''); // Track the selected policy
    const policies = {
        termsOfUse: (
            <>
                {/* Title (H1) */}
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#333',
                        marginBottom: 16,
                    }}
                >
                    Terms of Use
                </Text>

                {/* Article Title (H2) */}
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 1 (Scope of these Regulations)
                </Text>


                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24, // For better readability
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    All of other terms of use, special agreements, rules etc. provided by
                    RealMotorJapan regarding the Service are deemed to be applied as one
                    unit with these Regulations (the "Rules and Regulations"). In such
                    case, if the contents of these Regulations differ from the contents
                    of other terms of use, special agreements, or rules etc., the
                    provisions of such other terms of use, special agreements, or rules
                    etc. will take precedence. Unless particularly stated otherwise,
                    terms defined in these Regulations have the same meaning in the terms
                    of use, special agreements, and rules etc.
                </Text>

                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan may change the contents of the Rules and Regulations.
                    In this case, RealMotorJapan shall display the changed contents on
                    the Site and subsequently the User will be bound by the changed Rules
                    and Regulations at the earlier of the point when a User uses the
                    Service for the first time or the point when the notification period
                    provided by RealMotorJapan has passed.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 2 (Provision of the Service)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan provides the Service to Users through the Site, the
                    Affiliate Sites, or through other methods in order to support the
                    realization of an enriched car life and the sale and purchase of
                    Users' cars.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The types, contents, and details of the Service are as provided and
                    posted on the Site by RealMotorJapan.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan shall post the environment necessary or recommended in
                    order to use the Service on the Site. Users shall maintain this usage
                    environment at their own expense and responsibility.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 3 (Consideration for the Service)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Consideration for the Service is free of charge except if otherwise
                    provided.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    If RealMotorJapan provides a service for a fee it shall provide that
                    information in the Rules and Regulations and shall post the amount of
                    the fee, the method of payment, and other necessary information on the
                    Site.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 4 (User Registration and Authentication)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    For the parts of the service that require User registration as
                    prescribed by RealMotorJapan, Users shall complete User registration in
                    accordance with the procedures prescribed by RealMotorJapan.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Users shall confirm and warrant to RealMotorJapan that all of the
                    information they submit, as a true statement, to RealMotorJapan at the
                    time of User registration is accurate, true, and up-to-date. Further,
                    if a change occurs after User registration the User shall promptly
                    change their registration in accordance with the procedures prescribed
                    by RealMotorJapan.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan may refuse an application for User registration at its
                    discretion. In such case, the User may not make any claim or objection
                    and RealMotorJapan does not have any obligations, such as to explain
                    the reason for refusal.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan shall give registered Users ("Registered Users") an ID,
                    password, and other authentication key ("Authentication Key"), or if
                    the Authentication Key is set by the Registered User itself, the
                    Registered User shall strictly manage the Authentication Key and shall
                    not disclose, divulge, or allow another person to use the Authentication
                    Key.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan may treat all communications conducted correctly using
                    the Registered User's Authentication Key as being deemed to have been
                    conducted by the Registered User itself or by a person given the
                    appropriate authority by the Registered User. In such case,
                    RealMotorJapan is not liable for any damage that occurs to the
                    Registered User, even if it occurs due to misuse of the Authentication
                    Key or due to another reason.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    Registered Users may cancel their User registration in accordance with
                    RealMotorJapan's prescribed procedures at any time.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 5 (Contact Information)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If RealMotorJapan judges that notice is required to be made to a
                    Registered User, it will make the notice to the registered address
                    using electronic mail, postal mail, telephone, fax, or another
                    appropriate method. In this case the notice will be deemed to have
                    arrived when it would normally have arrived, even if it does not arrive
                    or arrives late.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    Questions and enquiries about the Service should be directed to
                    RealMotorJapan by electronic mail or postal mail. RealMotorJapan does
                    not accept enquiries made by telephone, directly visiting
                    RealMotorJapan, or any other method.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 6 (Handling User Information)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan handles the personal information of Users appropriately,
                    in accordance with the Act on the Protection of Personal Information
                    and the ("Privacy Policy") provided by RealMotorJapan and posted on the
                    Site.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    In addition to Article 6.1, if RealMotorJapan handles a User's business
                    secrets it shall handle them with the due care of a good manager in
                    accordance with the spirit of the Service.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 7 (Intellectual Property Rights)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Trademarks such as RealMotorJapan (written in English or Japanese) are
                    RealMotorJapan's trademarks or registered trademarks in Japan and other
                    countries.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The copyrights, image rights, or other rights for all written materials,
                    photographs, video, and other content posted on the Site or in
                    RealMotorJapan Mail ("RealMotorJapan Web Content") belong to
                    RealMotorJapan or an approved third party, and do not belong to the
                    Users. Unless otherwise stated by RealMotorJapan, Users are only
                    permitted to peruse these contents in the methods prescribed by
                    RealMotorJapan and copying, redistributing, or using the contents in any
                    other way, or changing, or creating derivative works using the contents
                    is prohibited.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    All copyrights or other rights such as for software and files attached
                    to RealMotorJapan Mail or able to be downloaded or used on the Site
                    belong to RealMotorJapan or an approved third party, and do not belong
                    to the Users. Unless otherwise stated by RealMotorJapan, Users are only
                    permitted unassignable usage rights regarding the software, to peruse
                    the Site, or within the minimum required scope in order to use the
                    Service for personal use, and not for profit. RealMotorJapan may cancel
                    the license at any time and in such case the User shall immediately
                    suspend use of the software and delete it from all memory devices
                    managed by the User.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Copyrights for messages or files etc. contributed to the Site by Users
                    ("Messages") (including the rights set out in Articles 27 and 28 of the
                    Copyright Act) are transferred to and belong to RealMotorJapan as a
                    result of the contribution. Further, Users license the use of Messages
                    by RealMotorJapan (including use for the Service and for advertisements,
                    publication, or other commercial use) and the User shall not exercise an
                    author's personal rights regarding the use. Further, by contributing
                    Messages to the Site, Users represent and warrant that they have all the
                    rights required to use the Messages and to license RealMotorJapan to use
                    them (including copyright for the Messages, and the consent of any
                    individuals that could be identified from inclusion in the subject or
                    model for the Messages, or from the information in the Messages).
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 8 (Transactions and Communication with Other Operators)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If anyone other than RealMotorJapan, whether an operator other than
                    RealMotorJapan (regardless of the existence of any capital ties,
                    tie-ups, or contractual relationships with RealMotorJapan.), another
                    User, or another corporation or individual ("Other Operators"), directly
                    provide Users with information within the Service, such as regarding
                    products or transaction conditions, the Service is limited to the
                    provision of the information provided by the Other Operators to Users as
                    it is, and all confirmation and judgment of the contents of the
                    information is conducted at the liability of the Users themselves.
                    RealMotorJapan does not make any warranties or bear any responsibility
                    regarding whether the information is accurate, up-to-date, true,
                    lawful, or compatible for a purpose or otherwise.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If Users conduct transactions with Other Operators through the Service,
                    RealMotorJapan will not make any warranties, endorse, act as an agent,
                    mediate, intercede, or conduct any canvassing regarding the transaction
                    between the User and the Other Operator. Further all confirmation of the
                    contents of the transaction and judgment regarding the execution of the
                    transaction is conducted at the liability of the Users themselves.
                    RealMotorJapan does not make any warranties or bear any responsibility
                    regarding the actual existence of the Other Operators, their identity or
                    other attributes, whether they have authority, likelihood of performance
                    of obligations, or performance or non-performance, the transaction's
                    effectiveness, compatibility, actual existence of products, or whether
                    or not the products have flaws.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If a User contacts a specified or unspecified Other Operator through the
                    service and exchanges Messages or otherwise communicates with them, the
                    User shall make judgments regarding whether or not to disclose
                    information about the User themselves or the User's assets etc. to the
                    other party, or whether files provided by the other party contain
                    harmful programs etc., at their own liability.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Any disputes between the User and the Other Operators regarding
                    transactions, communication etc. will be resolved at the expense and
                    liability of the User.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    The User acknowledges and agrees that RealMotorJapan, within the
                    limitation of applicable law, monitors the User's communications with
                    the Other Operators for the purpose of ensuring Use's compliance with
                    its obligations under the Regulation, and that RealMotorJapan may
                    restrict, delete, or prohibit such communications, if RealMotorJapan
                    decides it is necessary to do so, based on its sole discretion.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 9 (Links and Advertisements)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan sometimes posts links from the RealMotorJapan Web Content
                    to other sites. Even in this case RealMotorJapan will not make any
                    warranties, endorse, act as an agent, mediate, intercede, or conduct any
                    canvassing, and does not bear any responsibility regarding the
                    information and services etc. provided at the linked site. Further,
                    whether authorized or not, the same applies for sites that link to the
                    Site.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan sometimes posts advertisements for Other Operators on the
                    Site. Even in this case RealMotorJapan will not make any warranties,
                    endorse, act as an agent, mediate, intercede, or conduct any canvassing,
                    and does not bear any responsibility regarding the products and services
                    etc. provided by the advertiser.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 10 (RealMotorJapan's Obligations and Liability)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan may suspend or terminate part or all of the Service
                    without prior notice due to system failure, software or hardware
                    breakdown, fault, malfunction, or failure of telecommunication lines.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The information provided through the Service and communications and
                    other exchanges may be delayed or interrupted as a result of
                    RealMotorJapan or Other Operators not being open for business, the
                    occurrence of any of the events set out in Article 10.1, or for other
                    reasons.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The information, data, software, products, and services provided by
                    RealMotorJapan through the service may include inaccuracies or faults.
                    Further, RealMotorJapan may add to, change, or delete all or part of
                    this information etc. without prior warning.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan will take security measures at the level it judges
                    reasonable regarding the server and other network equipment managed by
                    RealMotorJapan, but it is possible that incidents such as unlawful
                    access, information leakage, or distribution of harmful programs could
                    occur, in spite of these measures. Further, as RealMotorJapan does not
                    take security measures regarding information that travels over the
                    Internet or other open networks unless specifically stated, and since
                    even if security measures are taken they could be overridden, it is
                    possible that information could be stolen, falsified etc.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan does not bear any obligation to protect information
                    posted on the site by Users and may arrange, move, or delete the
                    information as appropriate.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan does not bear any liability regarding damage suffered by
                    Users resulting from the events set out in each of the above items.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan does not bear any liability regarding damage suffered by
                    Users resulting from the parts of the service that are provided free of
                    charge. Further, even if a User suffers damage resulting from
                    RealMotorJapan's negligence in a part of the service that is provided
                    for a fee, RealMotorJapan's liability will be limited to the amount of
                    payment actually received regarding the service that was the direct
                    cause of the occurrence of damage, whether or not any cause for
                    liability exists, such as non-performance of obligations, defect
                    warranty, or illegal acts, excluding damage arising due to special
                    circumstances and lost profits damage.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 11 (Prohibited Acts)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Users shall not conduct any of the actions that fall under the following
                    items in their use of the Service:
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.1 breaching the copyrights, trademark rights, or other intellectual
                    property rights, privacy rights, image rights, or other rights of
                    another person, damaging the honor, credibility, or assets of another
                    person, or actions that contribute to this;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.2 exposing information, or know-how etc. that is kept confidential by
                    another person;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.3 actions whereby the User behaves threateningly, provocatively, or
                    insultingly to another party, or otherwise causes mental anguish;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.4 forcing another person to enter into an association, activity, or
                    organization, or to furnish transactions, profits etc., or to provide a
                    service, or actions that request such things even though the other
                    person has refused;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.5 registering or posting information which is untrue, or that contains
                    mistakes, or actions that could possibly cause another person to
                    misunderstand the User's identity, products, contents of the service,
                    or transaction conditions;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.6 regarding transactions conducted with Other Operators through the
                    Service, actions that delay performance of obligations, make performance
                    impossible, or imperfect or flawed performance;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.7 collecting, stockpiling, altering, or deleting another person's
                    information;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.8 using the Service under the guise of another person, having multiple
                    people use the same account, or an individual establishing several
                    accounts;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.9 unauthorized access or attempting to use unauthorized access,
                    sending computer viruses, back-door or other unauthorized commands,
                    programs, data, etc. to another person's computer, or leaving harmful
                    computer programs, etc. in a position whereby another person could
                    receive them;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.10 actions that exceed the scope of normal use and place a burden on
                    the server;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.11 using, gathering, or processing the information provided in the
                    Service by a method other than the method provided by RealMotorJapan,
                    whether legal or illegal, and whether or not it infringes upon rights,
                    or using the Service by a method other than the method provided by
                    RealMotorJapan, for profit or for commercial purposes;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.12 posting information considerably lacking in quality, information
                    for which the meaning is unclear, or other Messages that deviate from
                    the purpose of the Service, or repeatedly posting Messages with the same
                    or similar content;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.13 actions that damage the credibility of RealMotorJapan, the Site, or
                    the Service, or actions that demean the reputation of RealMotorJapan,
                    the Site, or the Service;
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    1.14 actions other than the items set out above that violate laws and
                    ordinances, public standards, or the Rules and Regulations, actions that
                    impede the operation of the Service, and actions particularly provided
                    by RealMotorJapan and posted on the Site.
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 }}>
                    RealMotorJapan is not obliged to monitor whether or not the actions set
                    out in the items in Article 11.1 are being conducted in respect of the
                    Site or the Service. Further, RealMotorJapan is not liable for any
                    damage suffered by a User as a result of another User conducting the
                    actions set out in the items in Article 11.1.
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#555' }}>
                    RealMotorJapan may request cooperation from Users regarding the
                    submission of materials, or obtaining information in order to
                    investigate whether or not the actions set out in the items in Article
                    11.1 have taken place and the details thereof, and Users shall cooperate
                    with such requests; provided, however, that RealMotorJapan is not
                    obliged to conduct such investigations.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 12 (Termination of Use)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan may, at its discretion, take any or several of the
                    measures set out below in respect of a particular User without any
                    notice; provided, however, that RealMotorJapan has no obligation to take
                    such measures:
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.1 suspension or restriction of all or part of the Service.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.2 refusal or restriction of access to the Site;
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.3 cancellation of User registration and subsequent refusal of User
                    registration;
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.4 amendment or deletion of all or part of messages submitted by a
                    User;
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.5 cooperation with criminal or other investigations by investigation
                    agencies and administrative agencies; and
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.6 any other measures RealMotorJapan judges appropriate.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    Users may not make any claims or objections regarding the measures in
                    Article 12.1 and RealMotorJapan does not bear any obligation or
                    responsibility such as to explain its reasons for taking the measures.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 13 (Damages)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    If a User breaches the representations and warranties it made in respect
                    of these Rules and Regulations or RealMotorJapan, or if RealMotorJapan
                    suffers damage due to a User's willful misconduct or neglect, the User
                    shall compensate RealMotorJapan for all damage suffered by RealMotorJapan
                    (including legal fees).
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 14 (Entire Agreement and Severability)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If part of the provisions of these Rules and Regulations are judged
                    invalid or unenforceable, the provision will be deemed to have been
                    replaced with an effective and enforceable provision, the details of
                    which are as close as possible to the purpose of the original provision.
                    Further, in such case, the other provisions of these Rules and
                    Regulations will survive and will not be influenced in any way.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    These Rules and Regulations constitute the entire agreement between the
                    User and RealMotorJapan regarding the service and the Site and take
                    precedence over all previous or current communications or suggestions
                    made either electronically, in writing, or verbally.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Article 15 (Target Regions, Governing Law, and Jurisdiction)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The Service is only provided for residents of the target regions
                    provided by RealMotorJapan and posted on the Site and is not aimed at
                    residents of any other countries or regions. Use of the Service from
                    outside the target regions is prohibited.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The governing law for these Rules and Regulations, the Site, and the
                    Service is the law of Japan.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    The Tokyo District Court has exclusive jurisdiction as a court of first
                    instance regarding any dispute concerning these Rules and Regulations,
                    the Site, or the Service.
                </Text>
            </>
        ),
        privacyPolicy: (
            <>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#333',
                        marginBottom: 16,
                    }}
                >
                    Privacy Policy
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Overview
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan Corporation ("RealMotorJapan") fully understands your
                    concern over protecting privacy and the way of our use of your personal
                    information. Whether you visit our website, RealMotorJapan (the or our
                    "Site"), to utilize our services, or you simply browse through our
                    website, we assure you of protecting your personal information.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    What This Privacy Policy Covers
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    This policy covers how RealMotorJapan treats personal information that
                    RealMotorJapan collects and receives. Personal information is
                    information about you that is personally identifiable like your name,
                    address, email address, or phone number, and that is not otherwise
                    publicly available.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    By visiting our Site, you are deemed to have agreed to the terms and
                    conditions of this Privacy Policy. If you do not agree, please do not
                    use or access our Site.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Membership Eligibility
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    Our services are available only to, and may only be used by individuals
                    who can form legally binding contracts under applicable law. Without
                    limiting the foregoing, our services are not available to children,
                    i.e. persons under the age of 16.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Information Collection and Use
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan collects personal information when you register with the
                    Site, when you use the Site's services or when you visit pages of the
                    Site.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    When you register, we ask for information such as your name, email
                    address, birth date, zip code. Once you register with the Site and sign
                    in to our services, you are not anonymous to us.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan uses information for the following general purposes: to
                    fulfill your requests for services, improve our services, contact you,
                    conduct research, and provide anonymous reporting for internal and
                    external clients.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Information Sharing and Disclosure
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan does not rent, sell, or share personal information about
                    you with other people or non-affiliated companies except to provide
                    services you've requested, when we have your permission, or under the
                    following circumstances:
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    - We provide the information to trusted partners who work with
                    RealMotorJapan under confidentiality agreements.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    - We respond to subpoenas, court orders, or legal process, or to
                    establish or exercise our legal rights or defend against legal claims.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    - We believe it is necessary to share information in order to
                    investigate, prevent, or take action regarding illegal activities,
                    suspected fraud, situations involving potential threats to the physical
                    safety of any person, violations of RealMotorJapan's terms of use, or as
                    otherwise required by law.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan uses information for the following general purposes: to
                    fulfill your requests for services, improve our services, contact you,
                    conduct research, and provide anonymous reporting for internal and
                    external clients.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Cookies
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    RealMotorJapan may set and access RealMotorJapan cookies on your
                    computer.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    We use data collection devices called "cookies" on certain pages of the
                    Site to help analyze the Site page flow, measure promotional
                    effectiveness, and promote trust and safety. "Cookies" are small files
                    placed on your hard drive that assist us in providing our services. We
                    offer certain features that are only available through the use of a
                    "cookie".
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    We also use cookies to allow you to enter your password less frequently
                    during connecting with the Site. Cookies can also help us provide
                    information that is targeted to your interests. You are always free to
                    decline our cookies if your browser permits, although in that case you
                    may not be able to use certain features on the Site and you may be
                    required to reenter your password more frequently during connecting with
                    the Site.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Your Right to Edit and Delete Your Personal Information
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    You can edit or delete your personal information at any time by either
                    contacting us or accessing your settings in the Site.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    We reserve the right to send you certain communications relating to the
                    Site service, such as service announcements and administrative messages
                    that are considered part of the RealMotorJapan account, without offering
                    you the opportunity to opt out of receiving them.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Confidentiality and Security
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    We limit access to personal information about you to our employees who
                    we believe reasonably need to come into contact with that information to
                    provide products or services to you or in order to do their jobs.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    We have physical, electronic, and procedural safeguards that comply with
                    regulations in Japan to protect personal information about you.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Changes or Revision to this Privacy Policy
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan reserves the right to update this policy at any time by
                    revising the terms and conditions herein. Users are responsible for
                    regularly reviewing these terms and conditions. Continued use of the
                    Site following any such changes shall constitute the users' acceptance
                    of such changes.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Questions and Suggestions
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If you have any questions regarding privacy, security, opting-out of
                    e-mail offers or understanding how your personal information is being
                    used, please contact our Buyer Privacy advocate at +81-565-85-0601 or
                    send e-mail at info@realmotor.jp.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    If you do not receive acknowledgement of your inquiry in a prompt
                    fashion or within 10 days, or your inquiry has not been properly
                    addressed, you may contact us with info@realmotor.jp.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    Criteo's Service
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    The purpose of Criteo's service is to find visitors of Criteo advertising
                    clients' properties (websites, apps and newsletters) and send them
                    personalized emails or serve them personalized ads. Criteo uses cookies
                    to single out users and then personalize ads based on their browsing
                    experience.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    To learn more or opt out of Criteo services, please click here:{" "}
                    <Text
                        style={{
                            color: 'blue',
                            textDecorationLine: 'underline',
                        }}
                        onPress={() => {
                            Linking.openURL("http://www.criteo.com/privacy/");
                        }}
                    >
                        Criteo Privacy Policy
                    </Text>
                    .
                </Text>
            </>
        ),
        cookiePolicy: (
            <>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#333',
                        marginBottom: 16,
                    }}
                >
                    Terms of Member's ID Agreement
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    Before you register with our website and use all the service that is
                    provided by RealMotorJapan Corporation ("RealMotorJapan"), make sure you
                    read the Terms of Use and the Terms of Member's ID Agreement stated
                    below:
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    This Terms of Member's ID Agreement (the "Agreement") describes the
                    terms and conditions applicable to your use of RealMotorJapan's website
                    which is identified by the uniform resource locator,{" "}
                    <Text
                        style={{
                            color: 'blue',
                            textDecorationLine: 'underline',
                        }}
                        onPress={() => {
                            Linking.openURL("https://www.realmotor.jp/");
                        }}
                    >
                        https://www.realmotor.jp/
                    </Text>{" "}
                    and{" "}
                    <Text
                        style={{
                            color: 'blue',
                            textDecorationLine: 'underline',
                        }}
                        onPress={() => {
                            Linking.openURL("http://www.realmotor.jp/");
                        }}
                    >
                        http://www.realmotor.jp/
                    </Text>{" "}
                    ("website"). This Agreement is entered into between you as the user of
                    the website ("User") and RealMotorJapan.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    1. Person Who Registers with the Website
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.1 Person who registers with the website must personally register. The
                    substitution's registration is not permitted.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.2 User shall represent and warrant that the information they offer to
                    RealMotorJapan as a true statement is true, accurate, current and
                    complete, and shall not give any false information when they register.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.3 User under 16 years cannot register in Member's ID service (except
                    with RealMotorJapan's permission).
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    1.4 User shall register a user name that is not used by another User.
                    RealMotorJapan may delete a member's user name, based on the member's
                    using history or this Agreement, despite of deliberation or fault.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    1.5 When there is any change in the User's information offered to
                    RealMotorJapan, User shall report such change to RealMotorJapan
                    promptly.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    2. ID and Password
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    2.1 User shall take the whole responsibility for their own ID and
                    Password. (Please keep your account ID and password very carefully.)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    2.2 It is not allowed to share user's ID and password with a third party
                    (individual or corporate) or give user's ID or password to a third
                    party.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    2.3 User shall not make a third party use ID and password, and shall not
                    disclose user's ID and password to a third party.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    2.4 RealMotorJapan will never disclose User's password to a third party.
                    RealMotorJapan cannot and will not be liable for any loss or damage
                    arising from User's failure and/or carelessness regarding appropriation,
                    fraudulent use of User's password. User shall agree that any person who
                    has transmitted ID and password corresponding to the registered
                    information, shall be deemed to be a true User by RealMotorJapan and
                    that User shall be responsible for any result or effect of the
                    activities between login and logout conducted by such person.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    3. Account Settings Information
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    User can change their profile information after login, and choose
                    "Account Settings," to change registered information, and it is User's
                    personal responsibility.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    4. Delete Account (Withdrawal)
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    User can choose "Delete Account" to withdraw their membership, and the
                    automated emails will be stopped. (If you registered to receive mail
                    magazine from RealMotorJapan, it will be stopped after your withdrawal
                    of your user account.)
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    5. Damage for Delay, Interruption, and Discontinuance of Internet
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan does not take any responsibility for the damage that
                    occurs because of the delay, interruption, and discontinuance of
                    providing internet service.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    6. Individual Information Registered
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan uses User's information for fulfilling User's requests
                    for necessary service, improving our services, contacting Users,
                    conducting research, and providing anonymous reporting for internal and
                    external clients, but does not disclose registered individual
                    information to any third party without User's agreement or permission.
                    Notwithstanding this provision, if there is an indication claim under
                    law, RealMotorJapan will respond to legal requirements based upon
                    applicable law.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    7. Regulations concerning the Use of Membership
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    RealMotorJapan reserves the right to restrict the use of service (For
                    instance, the capacity of the disk and the access time, the contribution
                    frequency and the material etc.). RealMotorJapan doesn't assume the
                    responsibility for the contents that are deleted or not saved in User's
                    listing pages or BBS in the communication. RealMotorJapan reserves the
                    right to delete member's ID that has not been used for a certain period
                    of time.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    8. De-registration and Stoppage of Member's ID
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    If User corresponds to any of the following events, RealMotorJapan will
                    stop the service and delete the membership immediately without notifying
                    the User beforehand. RealMotorJapan reserves the right to refuse their
                    use of service in the future. In such case, RealMotorJapan shall not be
                    liable to User for the disadvantages or damages that may be caused from
                    deleting the membership of User.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    8.1 When RealMotorJapan figures that User's registration is not the User
                    oneself.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    8.2 When the registered information is false.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    8.3 When User violates this Agreement or other agreement of
                    RealMotorJapan, and when User acts against law or does anything
                    illegally.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    8.4 When User disagrees with the Agreement.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    8.5 Other cases that RealMotorJapan figures not proper.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    9. Prohibition
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    As Member's ID user, the following activities are not allowed:
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.1 Give false information when registering or editing profile
                    information.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.2 Use Member's ID and password illegally.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.3 Use the service and/or the access of service provided by
                    RealMotorJapan for commercial purpose (Irrespective of the forms of use,
                    reproduction, duplicate, copy, sales, and re-sales, etc.).
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.4 Violate copyright, trademark right, design, and all other
                    intellectual property rights of RealMotorJapan, its partner companies,
                    manufacturers, shops, or third parties.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.5 Violate the privacy of RealMotorJapan, our partner companies,
                    manufacturers, shops, and third parties.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.6 Slander or abuse RealMotorJapan, our partner companies,
                    manufacturers, shops, and third parties (Including slandering acts that
                    don't correspond to defamation).
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.7 Disadvantaging or causing any damage to RealMotorJapan, our partner
                    companies, manufacturers, shops, and third parties.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.8 All acts of obstructing the operation of this service.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.9 Use a name or nickname that may introduce oneself as another person,
                    organization, or corporation without the representation right, giving a
                    misunderstanding or remarkable unpleasantness to other Users or third
                    parties.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    9.10 Own several IDs by one person/company.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    9.11 Violate the law or act in a manner impairing customs of goodness or
                    public order.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    10. Validity of this Agreement on User Whose Registration is Cancelled
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    Even after User's registration has been cancelled, User shall assume the
                    obligations of this Agreement with regard to the activities during
                    registration.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    11. Indemnity
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    When User caused any damage to RealMotorJapan, other Users, or a third
                    party by an act against this Agreement or any illegal act, User shall
                    indemnify for such damage.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    12. Discharge
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    Under no circumstances shall RealMotorJapan be held liable for any delay
                    or failure or disruption of the services resulting directly or
                    indirectly from acts of nature, forces or causes beyond its reasonable
                    control, including without limitation, internet failures, computer,
                    telecommunications or any other equipment failures, electrical power
                    failures, strikes, labor disputes, riots, insurrections, civil
                    disturbances, shortages of labor or materials, fires, floods, storms,
                    explosions, war, governmental actions, orders of domestic or foreign
                    courts or tribunals, or non-performance of third parties, except when
                    there is gross negligence caused by RealMotorJapan.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    13. End of Service
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    13.1 RealMotorJapan reserves the right to end the service without
                    notifying User concerned beforehand.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    13.2 RealMotorJapan doesn't assume the responsibility of disadvantage
                    that User may have from ending this service.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    14. Dispute Settlement
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    The User shall settle the dispute by their own responsibility when the
                    dispute is caused with another User, the affiliated companies, or third
                    parties of this service. RealMotorJapan shall not assume the
                    responsibility for settling disputes concerned.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    15. Copyright and Trademark
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    The copyright of all information and contents that have been described
                    by RealMotorJapan in the website shall belong to RealMotorJapan or the
                    third party that obtains permission from RealMotorJapan. The act of
                    using, reproducing, and modifying without prior permission from
                    RealMotorJapan is prohibited. The intellectual property right (trademark,
                    logo, and servicemark, etc.) on the website is RealMotorJapan's
                    registered trademark or trademark in the procedure for the registry.
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#444',
                        marginBottom: 8,
                    }}
                >
                    16. Governing Law, Jurisdiction and Revision
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    16.1 This Agreement is construed based on laws of Japan and shall be
                    governed by the laws of Japan.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                        marginBottom: 16,
                    }}
                >
                    16.2 The Aichi District Court has exclusive jurisdiction as a court of
                    first instance regarding any dispute concerning this Agreement.
                </Text>
                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: '#555',
                    }}
                >
                    16.3 RealMotorJapan may revise this Agreement when necessary, and User
                    shall be bound by the revised version accordingly.
                </Text>
            </>
        ),
    };
    console.log('profit map', profitMap)
    const handlePolicyClick = (policy) => {
        setCurrentPolicy(policy); // Set the current policy content
        setOpenDetails(true); // Open the modal
    };

    console.log('stock status', carData.stockStatus)
    const isReservedOrSold = (carData.stockStatus === "Reserved" || carData.stockStatus === "Sold");

    return (
        <TouchableWithoutFeedback onPress={() => { setIsProfileDropdownOpen(null); handleOutsidePress() }}>
            <View style={{ flex: 3 }}>
                <View style={{ backgroundColor: 'blue', alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Currency: </Text>
                        <DropDownCurrency currentCurrencyGlobal={currentCurrencyGlobal} setCurrentCurrencyGlobal={setCurrentCurrencyGlobal} selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} userEmail={userEmail} />
                    </View>
                </View>


                {
                    contactUsOpen && (
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
                {
                    openDetails && (
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
                                <TouchableOpacity onPress={() => setOpenDetails(false)} style={{
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
                <View style={{
                    zIndex: isFullscreen === true ? 999 : 5,
                    flex: 1, maxWidth: 1500, width: '100%', margin: 'auto', flexDirection: screenWidth < 992 ? 'column' : 'row', padding: '2%',
                }}>

                    <View style={{
                        flex: screenWidth < 992 ? null : 3,
                        alignSelf: screenWidth < 992 ? null : 'flex-start'
                    }}>
                        <View style={{ flex: 2 }} />

                        <Text style={{ fontSize: '2.5em', fontWeight: 'bold', }}>{carName}</Text>
                        <Text style={{ fontSize: 13, color: 'blue', paddingVertical: 5 }}>
                            {carData?.carDescription || ''}
                        </Text>

                        {screenWidth < 992 && (
                            <SocialMedia carData={carData} userEmail={userEmail} screenWidth={screenWidth} />
                        )}
                        <View style={{ flex: 1 }} />

                        <CarouselSample allImageUrl={allImageUrl} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />

                    </View>

                    {screenWidth > 992 && (
                        <View
                            style={{ marginHorizontal: '1%' }}
                        />
                    )}

                    <View style={{ flex: 3, width: '100%', zIndex: -100, marginTop: screenWidth < 992 ? 10 : null }}>

                        {(carData?.stockStatus === 'Sold' || carData?.stockStatus === 'Reserved') && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    pointerEvents: 'none',
                                    zIndex: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <Text
                                    style={{
                                        // Use gold if Reserved, red if Sold
                                        color:
                                            carData.stockStatus === 'Reserved'
                                                ? 'rgba(255, 215, 0, 0.5)' // gold w/ 20% opacity
                                                : 'rgba(239, 68, 68, 0.2)', // red w/ 20% opacity

                                        // Slightly smaller for "Reserved"
                                        fontSize: carData.stockStatus === 'Reserved' ? 100 : 128,
                                        fontWeight: 'bold',
                                        transform: [{ rotate: '-45deg' }],
                                    }}
                                >
                                    {carData.stockStatus?.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {screenWidth > 992 && (
                            <SocialMedia carData={carData} userEmail={userEmail} screenWidth={screenWidth} />
                        )}
                        <View style={{ backgroundColor: '#E5EBFD', borderTopRightRadius: 5, borderTopLeftRadius: 5 }}>
                            <View style={{ flexDirection: screenWidth <= 375 ? 'column' : 'row', padding: 10, zIndex: 50, flex: 1, paddingHorizontal: 20 }}>
                                <View style={{ flex: 1, marginLeft: 5 }}>

                                    <Text style={{ fontWeight: '700' }}>
                                        <Text style={{ fontSize: '1.2em' }}>{fobCurrency.symbol}</Text>
                                        {/* <Text style={{ fontSize: '3em', fontWeight: '700' }}>{fobCurrency.value}</Text> */}
                                        <AnimatedCounter value={fobCurrency.value} context='fob' />

                                    </Text>
                                    <Text style={{ color: '#a5a5a5' }}>Current FOB Price</Text>


                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}>


                                    <Text style={{ fontWeight: '700' }}>
                                        <Text style={{ fontSize: '1.2em' }}>{fobCurrencyTotal.symbol}</Text>
                                        {/* <Text style={{ fontSize: '3em', fontWeight: '700' }}>{AnimatedCounter(fobCurrencyTotal.value)}</Text> */}
                                        <AnimatedCounter context='total' value={fobCurrencyTotal.value} profitMap={profitMap} selectedCountry={selectedCountry} selectedPort={selectedPort} toggle={toggle} insurance={insurance} />
                                    </Text>
                                    <Text style={{ color: '#a5a5a5' }}>Total Estimated Price</Text>

                                </View>
                            </View>



                        </View>


                        <View onLayout={handleSetViewLocation} ref={section1Ref} style={{ padding: 10, backgroundColor: '#F2F5FE', paddingHorizontal: 20, zIndex: 5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                            <View style={{ zIndex: 5, flexDirection: screenWidth <= 360 ? 'column' : 'row', justifyContent: 'space-evenly', alignItems: screenWidth <= 360 ? null : 'center' }}>
                                <View style={{ width: screenWidth <= 360 ? '100%' : null, flex: 1, zIndex: 5 }}>
                                    <DropDownMake
                                        scrollToSectionWithOffset={scrollToSectionWithOffset}
                                        refSection={section1Ref}
                                        id="selectCountry"
                                        data={[
                                            "Select Country",
                                            ...displayCountryData // Use the display-friendly names
                                        ]}
                                        selectedValue={
                                            valueToDisplayMap[selectedCountry] || selectedCountry
                                        } // Convert the actual value to display-friendly name
                                        handleSelect={(selected) => {
                                            const actualValue = displayToValueMap[selected] || selected; // Convert back to original value
                                            handleSelectCountry(actualValue); // Pass the actual value to the handler
                                        }}
                                        placeholder="Select Country"
                                        isActive={activeDropdown === "selectCountry"}
                                        toggleDropdown={toggleDropdown}
                                        error={isErrorCountry}
                                    />
                                </View>
                                {screenWidth <= 360 && (<View style={{ marginVertical: 2 }} />)}
                                <View style={{ width: screenWidth <= 360 ? '100%' : null, flex: 1, zIndex: 4 }}>
                                    <DropDownMake
                                        scrollToSectionWithOffset={scrollToSectionWithOffset}
                                        refSection={section1Ref}
                                        id="selectPort"
                                        error={isErrorPort}
                                        data={[`Select Port`, ...ports]} // Pass ports data with a default placeholder
                                        selectedValue={selectedPort} // Pass the selected port
                                        handleSelect={handleSelectPort} // Pass the handler function
                                        placeholder="Select Port"
                                        isActive={activeDropdown === "selectPort"} // Ensure dropdown toggling works
                                        toggleDropdown={toggleDropdown} // Handle toggling state
                                    />
                                </View>
                            </View>

                            <View style={{ zIndex: -2, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '2%' }}>
                                <View style={{ flex: 3, zIndex: -2, }}>
                                    <Inspection
                                        isToggleDisabled={isToggleDisabled}
                                        toggleAnim={toggleAnim}
                                        handleToggle={handleToggle}
                                        switchTranslate={switchTranslate}
                                        switchColor={switchColor}
                                        setToggle={setToggle} toggle={toggle}
                                        handleToggleInspection={handleToggleInspection}
                                        selectedCountry={selectedCountry} />
                                </View>
                                <View style={{ flex: 3, zIndex: -2, }}>
                                    <Insurance
                                        selectedCountry={selectedCountry}
                                        setInsurance={setInsurance}
                                        insurance={insurance}
                                        handleToggleInsurance={handleToggleInsurance}
                                    />
                                </View>
                            </View>
                            <Calculate toggle={toggle} insurance={insurance} selectedCountry={selectedCountry} selectedPort={selectedPort} setProfitMap={setProfitMap} setCalculatePrice={setCalculatePrice} totalPriceCalculation={totalPriceCalculation} />

                        </View>



                        <View style={{ padding: 16, backgroundColor: '#f5f5f5', marginTop: 5 }}>
                            <View style={{ paddingHorizontal: 12 }}>

                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#ddd',
                                        padding: 10,
                                        borderRadius: 5,
                                        marginBottom: 16,
                                        fontSize: 16,
                                        textAlignVertical: 'top',
                                        backgroundColor: 'white',
                                        height: 90
                                    }}
                                    placeholder="Write your message here"
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={handleTextChange}
                                />


                                <AnimatedRN.View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateX: shakeAnimation }] }}>
                                    {isCheck ? (
                                        <Feather name='check-square' size={20} onPress={() => checkButton(false)} />
                                    ) : (
                                        <Feather name='square' size={20} onPress={() => checkButton(true)} color={isErrorCheck ? 'red' : 'black'} />
                                    )}
                                    <Text style={{ marginLeft: 8, fontSize: 14 }}>I agree to Privacy Policy and Terms of Agreement</Text>
                                </AnimatedRN.View>

                                <View style={{
                                    marginHorizontal: '20%',
                                    justifyContent: 'center',
                                    flex: 1

                                }}>
                                    <MakeAChat
                                        setModalTrue={setModalTrue}
                                        handleCreatConversation2={handleCreatConversation2}
                                        section1Ref={section1Ref}
                                        scrollToSectionWithOffset={scrollToSectionWithOffset}
                                        allImageUrl={allImageUrl}
                                        setIsErrorPort={setIsErrorPort}
                                        setIsErrorCountry={setIsErrorCountry}
                                        setIsErrorCheck={setIsErrorCheck}
                                        textInputRef={textInputRef}
                                        isCheck={isCheck}
                                        insurance={insurance}
                                        ip={ip}
                                        ipCountry={ipCountry}
                                        freightOrigPrice={freightOrigPrice}
                                        JapanPort={JapanPort}
                                        selectedCountry={selectedCountry}
                                        selectedPort={selectedPort}
                                        currency={currency}
                                        profitMap={profitMap}
                                        inspectionIsRequired={inspectionIsRequired}
                                        inspectionName={inspectionName}
                                        productId={productId} carName={carName} userEmail={userEmail} setToggle={setToggle} toggle={toggle}
                                        chatFieldCurrency={chatFieldCurrency}
                                    />
                                </View>
                            </View>
                        </View>

                    </View>



                </View>

                <View style={{

                    paddingHorizontal: '2%',
                    marginRight: screenWidth > 1600 ? 20 : 0,
                    flexDirection: screenWidth <= 992 ? null : 'row',
                    maxWidth: 1500,
                    alignSelf: 'center',
                    width: screenWidth > 1600 ? '100%' : '97%',
                    zIndex: -99
                }}>
                    <View style={{ marginTop: 10, marginRight: 5, flex: screenWidth <= 992 ? null : 3, padding: 5 }}>
                        <GetDataSpecifications productId={productId} />
                    </View>
                    <View style={{ marginTop: 10, flex: screenWidth <= 992 ? null : 3, padding: 5 }}>
                        <GetDataFeature productId={productId} />
                    </View>
                </View>
                <View style={{ backgroundColor: 'black', marginTop: '2%', zIndex: -99 }}>
                    <SearchByTypes carItems={carItems} navigate={navigate} />
                </View>
                {/* <SuccessModal handleCreatConversation2={handleCreatConversation2} modalTrue={modalTrue} /> */}

                {modalTrue && (
                    <Modal
                        visible={modalTrue}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setModalTrue(false)}
                    >
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 20,
                        }}>
                            <TouchableOpacity style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                zIndex: -9
                            }} />
                            <View style={{

                                justifyContent: 'center',
                                alignItems: 'center',

                            }}>
                                <View style={{ transform: [{ scale: 1.5 }] }}>
                                    <ActivityIndicator size={'large'} color={'#fff'} />
                                </View>
                                <Text style={{
                                    fontSize: 20, // Larger font size for better visibility
                                    color: '#fff', // Same blue color to match the loading spinner
                                    marginTop: 20, // Add spacing between text and spinner
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}>
                                    Loading, please wait...
                                </Text>
                            </View>
                        </View>
                    </Modal>
                )}
                {/* 
                <View style={{ alignSelf: 'center' }}>
                    <View style={[{ flexDirection: screenWidth > 768 ? 'row' : 'column', width: screenWidth > 1280 ? 1188 : '100%', alignItems: 'flex-start' }, styles.containerBox]}>
                        <View style={[{ width: screenWidth > 1280 ? 594 : '50%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '50%' }]}>
                            <View style={{ width: '100%', }}>
                                <GetDataSpecifications />
                            </View>
                        </View>
                        <View style={[{ width: screenWidth > 1280 ? 594 : '50%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '50%' }]}>
                            <View style={{ width: '100%' }}>
                                <GetDataFeature />
                            </View>
                        </View>
                    </View>
                </View> */}


                <StickyFooter handlePolicyClick={handlePolicyClick} setContactUsOpen={setContactUsOpen} />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
    containerBox: {
        justifyContent: 'center',
        borderRadius: 5,
    },
    categoryContainer: {
        marginBottom: 0,
    },
    category: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    specificationItem: {
        fontSize: 16,
        marginBottom: 5,
    },
    category: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,

    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    columnContainer: {

        paddingHorizontal: 5
    },
    createButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },


});