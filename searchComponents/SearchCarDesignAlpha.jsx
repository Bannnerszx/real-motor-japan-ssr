'use client'
import React, { useState, useEffect, useContext, useRef, useCallback, use } from "react";
import { StyleSheet, Text, View, Animated as AnimatedRN, Easing, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image, } from "react-native";
import { projectExtensionFirestore, projectExtensionStorage } from "../firebaseConfig/firebaseConfig";
import { where, collection, doc, getDocs, getDoc, query, onSnapshot, limit, startAfter, orderBy, updateDoc, arrayUnion, getCountFromServer } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import carSample from '../assets/placeholder.png'
import { MaterialCommunityIcons, Ionicons, AntDesign, FontAwesome, Entypo } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { AuthContext } from "../apiContext/AuthProvider";
import gifLogo from '../assets/rename.gif'
import image from "../assets/banner.webp";
import axios from 'axios';
const imageSrc = "/banner.webp";
import { useRouter } from "next/router";

const timeApi = process.env.TIME_API
const DropDownCurrency = ({ height, setSelectedCurrency, selectedCurrency, setCurrentCurrencyGlobal, currentCurrencyGlobal }) => {
    const { userEmail } = useContext(AuthContext);


    useEffect(() => {
        if (!userEmail) {
            console.log('User email not available.');
            setSelectedCurrency('USD'); // Default to USD when not signed in
            return;
        }

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

                    setSelectedCurrency(data.selectedCurrencyExchange); // Set the state with the currency from Firestore
                    setCurrentCurrencyGlobal({
                        id: docSnap.id,
                        ...data
                    });
                } else {
                    console.log('No such document!');
                    setSelectedCurrency('USD'); // Default to USD if no document exists
                }
            } catch (error) {
                console.error('Error fetching account:', error);
                setSelectedCurrency('USD'); // Default to USD on error
            }
        };

        fetchAccount();
    }, [userEmail]);

    const [modalVisible, setModalVisible] = useState(false);

    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const pressableRef = useRef(null);

    const currencies = [
        { label: 'US Dollar', value: 'USD', symbol: '$' },
        { label: 'Euro', value: 'EUR', symbol: '€' },
        { label: 'Australian Dollar', value: 'AUD', symbol: 'A$' },
        { label: 'British Pound', value: 'GBP', symbol: '£' },
        { label: 'Canadian Dollar', value: 'CAD', symbol: 'C$' },
        { label: 'Japanese Yen', value: 'YEN', symbol: '¥' }
    ];

    const handlePress = () => {
        pressableRef.current.measure((fx, fy, width, height, px, py) => {
            setModalPosition({ top: py + height, left: px });
            setModalVisible(true);
        });
    };

    const handleCurrencySelect = async (currency) => {
        if (!userEmail) {
            return;
        }
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


    const [hoveredIndex, setHoveredIndex] = useState(null);
    useEffect(() => {
        const handleScroll = () => {
            setModalVisible(false);
        };

        // Add scroll listener to the window or a specific scrollable container
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <Pressable
            ref={pressableRef}
            onPress={handlePress}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderBottomWidth: 2,
                    borderBottomColor: 'blue',
                },
            ]}
        >

            <Text style={{ fontWeight: '500', width: '100%' }}>{selectedCurrency ? selectedCurrency : currentCurrencyGlobal?.selectedCurrencyExchange}</Text>


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
                                zIndex: 500,
                                backgroundColor: '#fff',
                                padding: 5,
                                margin: 5,
                                width: '100%',
                                maxWidth: 70,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 5, // For Android
                            }, { top: modalPosition.top, left: modalPosition.left * 0.998, maxHeight: 190 }]}>
                                <FlatList
                                    data={currencies}
                                    keyExtractor={(item) => item.value}
                                    renderItem={({ item, index }) => (
                                        <Pressable
                                            onHoverIn={() => setHoveredIndex(index)}
                                            onHoverOut={() => setHoveredIndex(null)}
                                            style={({ pressed, hovered }) => [
                                                {
                                                    backgroundColor: hovered ? 'blue' : null
                                                }
                                            ]}
                                            onPress={() => handleCurrencySelect(item)}
                                        >
                                            <Text style={{
                                                color: hoveredIndex === index ? 'white' : 'black'
                                            }}>
                                                {item.value}
                                            </Text>
                                        </Pressable>
                                    )}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )
            }
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                <AntDesign
                    name="down"
                    size={15}
                    color={'blue'}
                    style={[
                        { transitionDuration: '0.3s', marginLeft: 4 },
                        modalVisible && {
                            transform: [{ rotate: '180deg' }],
                        },
                    ]}
                />
            </View>
        </Pressable>
    );
};


const MasterRanking = ({ }) => {
    const [makerRankings, setMakerRankings] = useState([
        { id: '1', name: 'Toyota' },
        { id: '2', name: 'Nissan' },
        { id: '3', name: 'Honda' },
        { id: '4', name: 'Mitsubishi' },
        { id: '5', name: 'Mercedes-Benz' },
        { id: '6', name: 'BMW' },
        { id: '7', name: 'Mazda' },
        { id: '8', name: 'Subaru' },
        { id: '9', name: 'Volkswagen' },
        { id: '10', name: 'Suzuki' },
    ]);
    useEffect(() => {
        const fetchLogoUrls = async () => {
            const updatedRankings = await Promise.all(makerRankings.map(async (maker) => {
                try {
                    // Create a reference to the logo file in Firebase Storage
                    const logoRef = ref(projectExtensionStorage, `logos/${maker.name.toLowerCase()}.webp`);

                    // Fetch the download URL
                    const logoUrl = await getDownloadURL(logoRef);

                    // Return the updated maker object with the logoUrl
                    return { ...maker, logoUri: logoUrl };
                } catch (error) {
                    console.error('Error fetching logo URL for:', maker.name, error);
                    // Return the original maker object if there's an error
                    return { ...maker, logoUri: '' };
                }
            }));

            setMakerRankings(updatedRankings);
        };

        fetchLogoUrls();
    }, []);
    return (
        <View style={{
            width: '100%',
            maxWidth: 300,
            borderColor: '#000',
            borderRadius: 5,
            backgroundColor: '#fff',
            padding: 10,
            overflow: 'hidden',
            marginTop: 5
        }}>
            <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
            }}>
                Maker Ranking
            </Text>
            <FlatList
                data={makerRankings}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: '#eaeaea',
                        paddingVertical: 10,
                    }}>

                        <Text style={{
                            fontSize: 16,
                        }}>
                            {index + 1}.  {item.logoUri &&
                                <Image
                                    source={{ uri: item.logoUri }}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        marginRight: 10,
                                        resizeMode: 'cover'
                                    }}
                                />
                            }{item.name}
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}
const FilterChip = ({ label, onPress }) => {
    if (!label) return null; // Don't render anything if there's no label.

    return (
        <View style={{ flexDirection: 'row', backgroundColor: 'lightblue', borderRadius: 20, alignItems: 'center', padding: 5, marginLeft: label === 'carModels' ? 10 : 0 }}>
            <Text style={{ color: 'blue', marginHorizontal: 10 }}>{label}</Text>
            <TouchableOpacity onPress={onPress}>
                <AntDesign name="closecircleo" size={20} color={'blue'} style={{ paddingHorizontal: 4, paddingVertical: 2 }} />
            </TouchableOpacity>
        </View>
    );
};

const Insurance = ({ handleInsurance }) => {
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
        handleInsurance();
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
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Insurance</Text>
        </View>
    )
};
const Inspection = ({ isToggleDisabled,
    toggleAnim,
    handleToggle,
    switchTranslate,
    switchColor,
    setToggle,
    handleToggleInspection,
    selectedCountry }) => {
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



    // const [toggle, setToggle] = useState(false);
    // const toggleAnim = useRef(new AnimatedRN.Value(0)).current;

    // const handleToggle = () => {
    //     AnimatedRN.timing(toggleAnim, {
    //         toValue: toggle ? 0 : 1,
    //         duration: 10,
    //         useNativeDriver: false,
    //     }).start();

    //     setToggle(!toggle);
    // };

    // // Interpolate values for moving the switch and changing the background color
    // const switchTranslate = toggleAnim.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [2, 22], // Adjust these values based on the size of your switch
    // });

    // const switchColor = toggleAnim.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: ['grey', '#7b9cff'] // Change colors as needed
    // });

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
};


const DropDownMake = ({
    id,
    data,
    selectedValue,
    handleSelect,
    placeholder,
    isActive,
    toggleDropdown,
    setCarModels,
    setModels,

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
    return (
        <View

            accessibilityState={{ expanded: isActive }}
            style={{ flex: 1, padding: 5, zIndex: -99 }}>
            <Pressable
                onLayout={handleViewLayout}
                onPress={handlePress}
                style={{
                    padding: 10,
                    borderWidth: 2,
                    borderColor: isActive ? '#0642F4' : '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
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
                                        setCarModels('');
                                        setModels([]);
                                    } else {
                                        handleSelect(item); // Set the selected item
                                        setCarModels('');
                                        setModels([]);
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
        </View>
    );
};

const DropdownSearchFilter = ({
    id,
    data,
    selectedValue,
    handleSelect,
    placeholder,
    isActive,
    toggleDropdown,
    renderItem
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
    return (
        <View

            accessibilityState={{ expanded: isActive }}
            style={{ flex: 1, padding: 5, zIndex: -99 }}>
            <Pressable
                onLayout={handleViewLayout}
                onPress={handlePress}
                style={{
                    padding: 10,
                    borderWidth: 2,
                    borderColor: isActive ? '#0642F4' : '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
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
                            {renderItem ? renderItem(selectedValue) : selectedValue || placeholder}
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
                                    {renderItem ? renderItem(item) : item}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            )}
        </View>
    );
};





const MakerRanking = ({ fetchGeneralData, handleSelectMake }) => {
    const navigate = useRouter();
    const styles = StyleSheet.create({
        bookmarkRibbonDiamond: {
            borderWidth: 8,
            borderColor: 'gray',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        bookmarkRibbons: {
            borderRadius: 5,
            width: 23,
            height: 23,
            backgroundColor: '#ccc',
            transform: [
                { rotate: '45deg' }
            ],
            position: 'absolute',
            bottom: -10.8,
            right: 12,
        },
        bookmarkRibbon: {
            borderWidth: 12,
            borderColor: '#FFD700',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        container: {

            paddingTop: 10,
            padding: 5,
            zIndex: -5
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 20,
        },
        rankContainer: {
            marginRight: 10,
            borderRadius: 5,
            paddingVertical: 2,
            paddingHorizontal: 8,
        },
        rankText: {
            fontWeight: 'bold',
            color: 'white',
            fontSize: 16,
            position: 'absolute',
            bottom: -10,
            right: 7,
            transform: [
                { rotate: '-90deg' }, // Counter rotate the text to make it horizontal again
            ],
        },
        nameText: {
            fontSize: 18,
            fontWeight: 'bold',

        },
        rankBadgeContainer: {
            width: 25,
            height: 25,
            backgroundColor: 'gold', // Change color based on your preference
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomRightRadius: 10, // Adjust for desired curvature
            borderTopLeftRadius: 10, // Adjust for desired curvature
            elevation: 3, // this adds a shadow on Android
            shadowColor: '#000', // these shadow properties add a shadow on iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
    const rankings = [
        { key: '1', name: 'TOYOTA' },
        { key: '2', name: 'NISSAN' },
        { key: '3', name: 'HONDA' },
        { key: '4', name: 'MITSUBISHI' },
        { key: '5', name: 'MERCEDES-BENZ' },
        { key: '6', name: 'BMW' },
        { key: '7', name: 'MAZDA' },
        { key: '8', name: 'SUBARU' },
        { key: '9', name: 'VOLKSWAGEN' },
        { key: '10', name: 'SUZUKI' },

    ];
    const [hoverIndex, setHoverIndex] = useState(null);

    const renderItem = ({ item, index }) => {
        const handleSearch = () => {
            navigate.push(`/SearchCarDesign?carMakes=${item.name}`);
            fetchGeneralData();
            handleSelectMake(item.name) // Pass selected carMake in URL
        };

        let ribbonStyle, ribbonComponent;

        if (item.key === '2') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'gray' };
        } else if (item.key === '3') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'brown' };
        } else if (parseInt(item.key) >= 4 && parseInt(item.key) <= 10) {
            // For keys 4 to 10, use a different style or component
            ribbonComponent = <View style={styles.bookmarkRibbonDiamond}><View style={styles.bookmarkRibbons}></View></View>;
        } else {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: '#FFD700' };
        }

        const textStyle = [
            styles.nameText,
            hoverIndex === index && { textDecorationLine: 'underline' },

        ];

        return (
            <View style={styles.itemContainer}>
                {ribbonComponent || (
                    <View style={ribbonStyle}>
                        <Text style={styles.rankText}>{item.key}</Text>
                    </View>
                )}
                <Pressable
                    onHoverIn={() => setHoverIndex(index)}
                    onHoverOut={() => setHoverIndex(null)}
                    onPress={() => handleSearch()}
                    style={({ hovered }) => [{
                        alignItems: 'center',
                        padding: 5
                    }]}
                >
                    <Text style={textStyle}>{item.name}</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderColor: '#f5f5f5' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                    <Svg
                        height="64px"
                        width="64px"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 9687 15065"
                        fillRule="evenodd"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        clipRule="evenodd"
                        shapeRendering="geometricPrecision"
                    >
                        <Path
                            d="M5290 48c125 138-115 557-535 936-316 286-693 414-877 440-263 204-501 420-716 647l-23 27c154-85 549-208 989-154 561 68 998 273 976 458s-496 279-1057 211c-522-63-923-353-971-441l-258 298c-45 57-88 114-130 171l-117 166c-116 172-222 347-317 527 127-121 478-341 917-403 560-78 1035 8 1061 192s-408 397-968 475c-525 73-990-107-1053-179-215 423-372 866-477 1319 103-155 380-439 771-603 522-218 1003-256 1075-84s-293 487-815 705c-475 198-957 151-1057 99-82 394-125 795-132 1199 0 480 48 960 134 1429l79 288c8-178 106-576 375-922 346-447 747-717 894-603s-15 569-361 1016c-326 420-786 616-880 607l237 862c241 659 554 1285 953 1859-60-132-133-578 9-1039 167-540 447-934 624-879 178 55 186 538 19 1078s-567 897-624 879c-1 0-2-1-2-1 71 100 144 199 220 296l643 697c-73-193-145-521-100-877 70-561 277-997 462-974 184 23 277 497 206 1058-61 482-313 860-421 952l82 89 922 758c-109-174-247-490-269-859-34-564 89-1031 275-1042s363 438 397 1002c29 484-150 901-239 1013 358 233 732 422 1126 578-138-156-313-421-402-749-147-546-121-1028 58-1076 180-48 444 355 592 901 118 438 46 855-16 1012 70 25 141 49 213 73l985 230c-167-123-384-336-538-623-266-499-350-974-186-1062s513 246 779 745c219 409 239 843 210 1001l773 148c254 73 509 205 692 399l172 228c35 75 3 164-72 200-75 35-164 3-200-72-63-130-129-244-255-327-354-232-757-309-1163-380-51 149-284 519-681 768-479 301-947 417-1046 259-99-157 209-529 688-829 239-150 493-228 690-261-95-19-190-40-283-65-293-79-580-171-861-278-35 102-364 463-855 632-534 185-1017 192-1078 17-61-176 323-468 858-653 322-112 641-115 847-88-398-168-781-371-1142-614-63 96-455 376-963 443-561 73-1035-17-1059-202-24-184 411-393 972-466 351-46 674 21 869 93l-897-761c-33-32-67-65-100-97-48 75-501 298-1037 269-565-31-1014-207-1004-393s476-311 1041-280c372 21 691 158 865 267-312-321-605-666-861-1033-109 69-563 184-1049 70-551-129-963-380-920-561 42-181 523-223 1074-94 323 76 588 235 749 366-1-1-1-2-2-3l-579-1135c-53 54-567 117-1070-99-520-223-882-542-809-713s554-129 1074 94c390 167 663 454 765 610l-400-1106c-21-78-40-157-58-236-73 41-582 5-1031-296-470-314-767-695-664-849 103-155 568-25 1038 290 328 219 538 522 623 701-94-454-145-918-154-1382-1 5-3 9-5 11-43 42-562-91-958-494s-610-836-478-966c133-130 562 91 958 494 315 320 458 715 482 885-5-476 33-953 115-1420 130-743 447-1466 899-2070l43-49c152-226 322-460 469-626 148-167 307-307 438-421l8-9 268-259c-40-46 115-557 535-936s861-574 986-436zm-2164 2c186 9 313 475 284 1040s-328 1009-388 1006-313-475-284-1040S2941 41 3126 50zM1717 1357c182-38 424 379 541 932s-59 1059-118 1071-424-379-541-932-64-1033 118-1071zM699 2983c166-83 507 259 760 764 254 505 212 1039 159 1066-54 27-507-259-760-764-254-505-325-983-159-1066zm2461 2047c121 141-130 554-560 921s-958 455-997 409 130-554 560-921 876-550 997-409zm68 2450c165 85 90 562-169 1065-258 503-714 784-767 757s-90-562 169-1065c258-503 602-842 767-757z"
                            id="Layer_x0020_1"
                            fill="#b5b5b5"
                            stroke="#2b2a29"
                            strokeWidth={7.62}
                        />
                    </Svg>
                </View>
                <Text style={styles.header}>Maker Ranking</Text>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>

                    <Svg
                        height="64px"
                        width="64px"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 9687 15065"
                        fillRule="evenodd"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        clipRule="evenodd"
                        shapeRendering="geometricPrecision"
                        style={{ transform: [{ scaleX: -1 }] }}
                    >
                        <Path
                            d="M5290 48c125 138-115 557-535 936-316 286-693 414-877 440-263 204-501 420-716 647l-23 27c154-85 549-208 989-154 561 68 998 273 976 458s-496 279-1057 211c-522-63-923-353-971-441l-258 298c-45 57-88 114-130 171l-117 166c-116 172-222 347-317 527 127-121 478-341 917-403 560-78 1035 8 1061 192s-408 397-968 475c-525 73-990-107-1053-179-215 423-372 866-477 1319 103-155 380-439 771-603 522-218 1003-256 1075-84s-293 487-815 705c-475 198-957 151-1057 99-82 394-125 795-132 1199 0 480 48 960 134 1429l79 288c8-178 106-576 375-922 346-447 747-717 894-603s-15 569-361 1016c-326 420-786 616-880 607l237 862c241 659 554 1285 953 1859-60-132-133-578 9-1039 167-540 447-934 624-879 178 55 186 538 19 1078s-567 897-624 879c-1 0-2-1-2-1 71 100 144 199 220 296l643 697c-73-193-145-521-100-877 70-561 277-997 462-974 184 23 277 497 206 1058-61 482-313 860-421 952l82 89 922 758c-109-174-247-490-269-859-34-564 89-1031 275-1042s363 438 397 1002c29 484-150 901-239 1013 358 233 732 422 1126 578-138-156-313-421-402-749-147-546-121-1028 58-1076 180-48 444 355 592 901 118 438 46 855-16 1012 70 25 141 49 213 73l985 230c-167-123-384-336-538-623-266-499-350-974-186-1062s513 246 779 745c219 409 239 843 210 1001l773 148c254 73 509 205 692 399l172 228c35 75 3 164-72 200-75 35-164 3-200-72-63-130-129-244-255-327-354-232-757-309-1163-380-51 149-284 519-681 768-479 301-947 417-1046 259-99-157 209-529 688-829 239-150 493-228 690-261-95-19-190-40-283-65-293-79-580-171-861-278-35 102-364 463-855 632-534 185-1017 192-1078 17-61-176 323-468 858-653 322-112 641-115 847-88-398-168-781-371-1142-614-63 96-455 376-963 443-561 73-1035-17-1059-202-24-184 411-393 972-466 351-46 674 21 869 93l-897-761c-33-32-67-65-100-97-48 75-501 298-1037 269-565-31-1014-207-1004-393s476-311 1041-280c372 21 691 158 865 267-312-321-605-666-861-1033-109 69-563 184-1049 70-551-129-963-380-920-561 42-181 523-223 1074-94 323 76 588 235 749 366-1-1-1-2-2-3l-579-1135c-53 54-567 117-1070-99-520-223-882-542-809-713s554-129 1074 94c390 167 663 454 765 610l-400-1106c-21-78-40-157-58-236-73 41-582 5-1031-296-470-314-767-695-664-849 103-155 568-25 1038 290 328 219 538 522 623 701-94-454-145-918-154-1382-1 5-3 9-5 11-43 42-562-91-958-494s-610-836-478-966c133-130 562 91 958 494 315 320 458 715 482 885-5-476 33-953 115-1420 130-743 447-1466 899-2070l43-49c152-226 322-460 469-626 148-167 307-307 438-421l8-9 268-259c-40-46 115-557 535-936s861-574 986-436zm-2164 2c186 9 313 475 284 1040s-328 1009-388 1006-313-475-284-1040S2941 41 3126 50zM1717 1357c182-38 424 379 541 932s-59 1059-118 1071-424-379-541-932-64-1033 118-1071zM699 2983c166-83 507 259 760 764 254 505 212 1039 159 1066-54 27-507-259-760-764-254-505-325-983-159-1066zm2461 2047c121 141-130 554-560 921s-958 455-997 409 130-554 560-921 876-550 997-409zm68 2450c165 85 90 562-169 1065-258 503-714 784-767 757s-90-562 169-1065c258-503 602-842 767-757z"
                            id="Layer_x0020_1"
                            fill="#b5b5b5"
                            stroke="#2b2a29"
                            strokeWidth={7.62}
                        />
                    </Svg>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <FlatList
                    style={{ backgroundColor: '#f5f5f5' }}
                    data={rankings}
                    renderItem={renderItem}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
            </View>
        </View>
    );
};
const ModelRanking = ({ fetchGeneralData, handleSelectMake, handleSelectModel }) => {
    //screenwidth
    const navigate = useRouter();
    const [hoverIndex, setHoverIndex] = useState(null);


    //screendwidth
    const styles = StyleSheet.create({
        bookmarkRibbonDiamond: {
            borderWidth: 8,
            borderColor: 'gray',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        bookmarkRibbons: {
            borderRadius: 5,
            width: 23,
            height: 23,
            backgroundColor: '#ccc',
            transform: [
                { rotate: '45deg' }
            ],
            position: 'absolute',
            bottom: -10.8,
            right: 12,
        },
        bookmarkRibbon: {
            borderWidth: 12,
            borderColor: '#FFD700',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        container: {

            paddingTop: 10,
            padding: 5,
            zIndex: -5
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 20,
        },
        rankContainer: {
            marginRight: 10,
            borderRadius: 5,
            paddingVertical: 2,
            paddingHorizontal: 8,
        },
        rankText: {
            fontWeight: 'bold',
            color: 'white',
            fontSize: 16,
            position: 'absolute',
            bottom: -10,
            right: 7,
            transform: [
                { rotate: '-90deg' }, // Counter rotate the text to make it horizontal again
            ],
        },
        nameText: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        rankBadgeContainer: {
            width: 25,
            height: 25,
            backgroundColor: 'gold', // Change color based on your preference
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomRightRadius: 10, // Adjust for desired curvature
            borderTopLeftRadius: 10, // Adjust for desired curvature
            elevation: 3, // this adds a shadow on Android
            shadowColor: '#000', // these shadow properties add a shadow on iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
    const rankings = [
        { key: '1', make: 'MITSUBISHI', model: 'CANTER' },
        { key: '2', make: 'TOYOTA', model: 'VANGUARD' },
        { key: '3', make: 'HINO', model: 'Ranger' },
        { key: '4', make: 'ISUZU', model: 'ELF TRUCK' },
        { key: '5', make: 'MAZDA', model: 'DEMIO' },
        { key: '6', make: 'MERCEDES-BENZ', model: 'C-CLASS' },
        { key: '7', make: 'TOYOTA', model: 'RACTIS' },
        { key: '8', make: 'MAZDA', model: 'DEMIO' },
        { key: '9', make: 'TOYOTA', model: 'VITZ' },
        { key: '10', make: 'TOYOTA', model: 'MARK X' },
        // ... Add other makers here
    ];


    const renderItem = ({ item, index }) => {
        const handleSearch = () => {
            // Navigate to the search URL
            navigate.push(`/SearchCarDesign?carModels=${item.model}&carMakes=${item.make}`);

            // Handle selecting car make immediately
            handleSelectMake(item.make);

            // Add a delay of 500ms before selecting the model and fetching general data
            setTimeout(() => {
                handleSelectModel(item.model);
                fetchGeneralData(); // Fetch data after selecting the model
            }, 100); // Delay in milliseconds (e.g., 500ms)
        };

        let ribbonStyle, ribbonComponent;
        const textStyle = [
            styles.nameText,
            hoverIndex === index && { textDecorationLine: 'underline' },

        ];
        if (item.key === '2') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'gray' };
        } else if (item.key === '3') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'brown' };
        } else if (parseInt(item.key) >= 4 && parseInt(item.key) <= 10) {
            // For keys 4 to 10, use a different style or component
            ribbonComponent = <View style={styles.bookmarkRibbonDiamond}><View style={styles.bookmarkRibbons}></View></View>;
        } else {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: '#FFD700' };
        }


        return (
            <View style={styles.itemContainer}>

                {ribbonComponent || (
                    <View style={ribbonStyle}>
                        <Text style={styles.rankText}>{item.key}</Text>
                    </View>
                )}
                <Pressable
                    onHoverIn={() => setHoverIndex(index)}
                    onHoverOut={() => setHoverIndex(null)}
                    onPress={() => handleSearch()}
                    style={({ hovered }) => [{
                        alignItems: 'center',
                        padding: 5
                    }]}
                >
                    <Text style={textStyle}>{item.make} {item.model}</Text>
                </Pressable>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderColor: '#f5f5f5' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                    <Svg
                        height="64px"
                        width="64px"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 9687 15065"
                        fillRule="evenodd"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        clipRule="evenodd"
                        shapeRendering="geometricPrecision"
                    >
                        <Path
                            d="M5290 48c125 138-115 557-535 936-316 286-693 414-877 440-263 204-501 420-716 647l-23 27c154-85 549-208 989-154 561 68 998 273 976 458s-496 279-1057 211c-522-63-923-353-971-441l-258 298c-45 57-88 114-130 171l-117 166c-116 172-222 347-317 527 127-121 478-341 917-403 560-78 1035 8 1061 192s-408 397-968 475c-525 73-990-107-1053-179-215 423-372 866-477 1319 103-155 380-439 771-603 522-218 1003-256 1075-84s-293 487-815 705c-475 198-957 151-1057 99-82 394-125 795-132 1199 0 480 48 960 134 1429l79 288c8-178 106-576 375-922 346-447 747-717 894-603s-15 569-361 1016c-326 420-786 616-880 607l237 862c241 659 554 1285 953 1859-60-132-133-578 9-1039 167-540 447-934 624-879 178 55 186 538 19 1078s-567 897-624 879c-1 0-2-1-2-1 71 100 144 199 220 296l643 697c-73-193-145-521-100-877 70-561 277-997 462-974 184 23 277 497 206 1058-61 482-313 860-421 952l82 89 922 758c-109-174-247-490-269-859-34-564 89-1031 275-1042s363 438 397 1002c29 484-150 901-239 1013 358 233 732 422 1126 578-138-156-313-421-402-749-147-546-121-1028 58-1076 180-48 444 355 592 901 118 438 46 855-16 1012 70 25 141 49 213 73l985 230c-167-123-384-336-538-623-266-499-350-974-186-1062s513 246 779 745c219 409 239 843 210 1001l773 148c254 73 509 205 692 399l172 228c35 75 3 164-72 200-75 35-164 3-200-72-63-130-129-244-255-327-354-232-757-309-1163-380-51 149-284 519-681 768-479 301-947 417-1046 259-99-157 209-529 688-829 239-150 493-228 690-261-95-19-190-40-283-65-293-79-580-171-861-278-35 102-364 463-855 632-534 185-1017 192-1078 17-61-176 323-468 858-653 322-112 641-115 847-88-398-168-781-371-1142-614-63 96-455 376-963 443-561 73-1035-17-1059-202-24-184 411-393 972-466 351-46 674 21 869 93l-897-761c-33-32-67-65-100-97-48 75-501 298-1037 269-565-31-1014-207-1004-393s476-311 1041-280c372 21 691 158 865 267-312-321-605-666-861-1033-109 69-563 184-1049 70-551-129-963-380-920-561 42-181 523-223 1074-94 323 76 588 235 749 366-1-1-1-2-2-3l-579-1135c-53 54-567 117-1070-99-520-223-882-542-809-713s554-129 1074 94c390 167 663 454 765 610l-400-1106c-21-78-40-157-58-236-73 41-582 5-1031-296-470-314-767-695-664-849 103-155 568-25 1038 290 328 219 538 522 623 701-94-454-145-918-154-1382-1 5-3 9-5 11-43 42-562-91-958-494s-610-836-478-966c133-130 562 91 958 494 315 320 458 715 482 885-5-476 33-953 115-1420 130-743 447-1466 899-2070l43-49c152-226 322-460 469-626 148-167 307-307 438-421l8-9 268-259c-40-46 115-557 535-936s861-574 986-436zm-2164 2c186 9 313 475 284 1040s-328 1009-388 1006-313-475-284-1040S2941 41 3126 50zM1717 1357c182-38 424 379 541 932s-59 1059-118 1071-424-379-541-932-64-1033 118-1071zM699 2983c166-83 507 259 760 764 254 505 212 1039 159 1066-54 27-507-259-760-764-254-505-325-983-159-1066zm2461 2047c121 141-130 554-560 921s-958 455-997 409 130-554 560-921 876-550 997-409zm68 2450c165 85 90 562-169 1065-258 503-714 784-767 757s-90-562 169-1065c258-503 602-842 767-757z"
                            id="Layer_x0020_1"
                            fill="#b5b5b5"
                            stroke="#2b2a29"
                            strokeWidth={7.62}
                        />
                    </Svg>
                </View>
                <Text style={styles.header}>Model Ranking</Text>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>

                    <Svg
                        height="64px"
                        width="64px"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 9687 15065"
                        fillRule="evenodd"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        clipRule="evenodd"
                        shapeRendering="geometricPrecision"
                        style={{ transform: [{ scaleX: -1 }] }}
                    >
                        <Path
                            d="M5290 48c125 138-115 557-535 936-316 286-693 414-877 440-263 204-501 420-716 647l-23 27c154-85 549-208 989-154 561 68 998 273 976 458s-496 279-1057 211c-522-63-923-353-971-441l-258 298c-45 57-88 114-130 171l-117 166c-116 172-222 347-317 527 127-121 478-341 917-403 560-78 1035 8 1061 192s-408 397-968 475c-525 73-990-107-1053-179-215 423-372 866-477 1319 103-155 380-439 771-603 522-218 1003-256 1075-84s-293 487-815 705c-475 198-957 151-1057 99-82 394-125 795-132 1199 0 480 48 960 134 1429l79 288c8-178 106-576 375-922 346-447 747-717 894-603s-15 569-361 1016c-326 420-786 616-880 607l237 862c241 659 554 1285 953 1859-60-132-133-578 9-1039 167-540 447-934 624-879 178 55 186 538 19 1078s-567 897-624 879c-1 0-2-1-2-1 71 100 144 199 220 296l643 697c-73-193-145-521-100-877 70-561 277-997 462-974 184 23 277 497 206 1058-61 482-313 860-421 952l82 89 922 758c-109-174-247-490-269-859-34-564 89-1031 275-1042s363 438 397 1002c29 484-150 901-239 1013 358 233 732 422 1126 578-138-156-313-421-402-749-147-546-121-1028 58-1076 180-48 444 355 592 901 118 438 46 855-16 1012 70 25 141 49 213 73l985 230c-167-123-384-336-538-623-266-499-350-974-186-1062s513 246 779 745c219 409 239 843 210 1001l773 148c254 73 509 205 692 399l172 228c35 75 3 164-72 200-75 35-164 3-200-72-63-130-129-244-255-327-354-232-757-309-1163-380-51 149-284 519-681 768-479 301-947 417-1046 259-99-157 209-529 688-829 239-150 493-228 690-261-95-19-190-40-283-65-293-79-580-171-861-278-35 102-364 463-855 632-534 185-1017 192-1078 17-61-176 323-468 858-653 322-112 641-115 847-88-398-168-781-371-1142-614-63 96-455 376-963 443-561 73-1035-17-1059-202-24-184 411-393 972-466 351-46 674 21 869 93l-897-761c-33-32-67-65-100-97-48 75-501 298-1037 269-565-31-1014-207-1004-393s476-311 1041-280c372 21 691 158 865 267-312-321-605-666-861-1033-109 69-563 184-1049 70-551-129-963-380-920-561 42-181 523-223 1074-94 323 76 588 235 749 366-1-1-1-2-2-3l-579-1135c-53 54-567 117-1070-99-520-223-882-542-809-713s554-129 1074 94c390 167 663 454 765 610l-400-1106c-21-78-40-157-58-236-73 41-582 5-1031-296-470-314-767-695-664-849 103-155 568-25 1038 290 328 219 538 522 623 701-94-454-145-918-154-1382-1 5-3 9-5 11-43 42-562-91-958-494s-610-836-478-966c133-130 562 91 958 494 315 320 458 715 482 885-5-476 33-953 115-1420 130-743 447-1466 899-2070l43-49c152-226 322-460 469-626 148-167 307-307 438-421l8-9 268-259c-40-46 115-557 535-936s861-574 986-436zm-2164 2c186 9 313 475 284 1040s-328 1009-388 1006-313-475-284-1040S2941 41 3126 50zM1717 1357c182-38 424 379 541 932s-59 1059-118 1071-424-379-541-932-64-1033 118-1071zM699 2983c166-83 507 259 760 764 254 505 212 1039 159 1066-54 27-507-259-760-764-254-505-325-983-159-1066zm2461 2047c121 141-130 554-560 921s-958 455-997 409 130-554 560-921 876-550 997-409zm68 2450c165 85 90 562-169 1065-258 503-714 784-767 757s-90-562 169-1065c258-503 602-842 767-757z"
                            id="Layer_x0020_1"
                            fill="#b5b5b5"
                            stroke="#2b2a29"
                            strokeWidth={7.62}
                        />
                    </Svg>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <FlatList
                    style={{ backgroundColor: '#f5f5f5' }}
                    data={rankings}
                    renderItem={renderItem}
                    contentContainerStyle={{ flex: 1 }}
                />
            </View>
        </View>
    );
};
const WhatsAppView = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                Dimensions.removeEventListener('change', handleDimensionsChange);
            }
        };
    }, []);
    const baseFontSize = 18;
    const scaleFactor = 0.03;
    const minimumFontSize = 16;
    const responsiveFontSize = Math.max(screenWidth * scaleFactor, minimumFontSize);

    const fontSize = screenWidth < 768 ? 21 : responsiveFontSize;
    const styles = StyleSheet.create({
        button: {
            borderRadius: 5,
            backgroundColor: '#25D366',
            flex: 1,
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        contentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,

        },
        chatContainer: {
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        text: {
            color: 'white',
            marginLeft: screenWidth < 768 ? 0 : 10,
            fontWeight: '650'
        },
        circleButton: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: responsiveFontSize / 2,
            height: responsiveFontSize / 2,
            borderRadius: responsiveFontSize / 4,
            marginLeft: 10,
        },
        circleButtonMobile: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 30,
            marginLeft: 3,
        }
    });
    return (
        <TouchableOpacity style={styles.button}>
            <View style={styles.contentContainer}>
                <FontAwesome name="whatsapp" size={fontSize} color="white" />
                <Text style={[styles.text, { fontSize: fontSize, marginLeft: 3 }]}>WhatsApp</Text>
            </View>
            {screenWidth < 768 && (
                <Ionicons name="chatbox-ellipses-outline" size={30} color="#1EA252" style={{ marginRight: 8, }} />
            )}
            <View style={styles.chatContainer}>
                {screenWidth > 768 && (
                    <Ionicons name="chatbox-ellipses-outline" size={responsiveFontSize * 0.9} color="#1EA252" style={{ marginRight: 8, }} />
                )}
                <Text style={[styles.text, { fontSize: screenWidth < 768 ? 16 : responsiveFontSize * 0.5, fontWeight: '600' }]}>Start Chat</Text>
                <Pressable style={screenWidth < 768 ? styles.circleButtonMobile : styles.circleButton}>
                    <AntDesign name="right" size={screenWidth < 768 ? 8 : responsiveFontSize / 4} color={'#25D366'} />
                </Pressable>
            </View>
        </TouchableOpacity>

    );
};
const SignUpView = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                Dimensions.removeEventListener('change', handleDimensionsChange);
            }
        };
    }, []);
    const baseFontSize = 18;
    const scaleFactor = 0.03;
    const minimumFontSize = 16;

    const responsiveFontSize = Math.max(screenWidth * scaleFactor, minimumFontSize);

    const fontSize = screenWidth < 768 ? 21 : responsiveFontSize;
    const styles = StyleSheet.create({
        button: {
            borderRadius: 5,
            backgroundColor: '#F4C112',
            flex: 1,
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        contentContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        chatContainer: {
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        text: {
            color: 'white',
            marginLeft: screenWidth < 768 ? 0 : 10,
            fontWeight: '650'
        },
        circleButton: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: responsiveFontSize / 2,
            height: responsiveFontSize / 2,
            borderRadius: responsiveFontSize / 4,
            marginLeft: 10,
        },
        circleButtonMobile: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20, // Increase the width for better touch area
            height: 20, // Same for height to keep it circular
            borderRadius: 30,
            marginLeft: 3,// Half of width/height to make it circular
        }
    });
    return (
        <TouchableOpacity style={styles.button}>
            <View style={styles.contentContainer}>
                <Text style={[styles.text, { fontSize: fontSize }]}>Sign Up Free</Text>
            </View>
            {screenWidth < 768 && (
                <FontAwesome name="user-plus" size={30} color="#EE9A1D" />
            )}
            <View style={styles.chatContainer}>
                {screenWidth > 768 && (
                    <FontAwesome name="user-plus" size={responsiveFontSize * 0.9} color="#EE9A1D" style={{ marginRight: 8 }} />
                )}
                <Text style={[styles.text, { fontSize: screenWidth < 768 ? 16 : responsiveFontSize * 0.5, fontWeight: '600' }]}>Register Now</Text>
                <Pressable style={screenWidth < 768 ? styles.circleButtonMobile : styles.circleButton}>
                    <AntDesign name="right" size={screenWidth < 768 ? 8 : responsiveFontSize / 4} color={'#F4C112'} />
                </Pressable>
            </View>
        </TouchableOpacity>

    );
};

const SortBy = ({ sortOptionsArray, sortSelection, handleSortChange, isActive, handleIsActive }) => {
    const [parentPosition, setParentPosition] = useState({ top: 0, left: 0, width: 0 });

    const handleParentLayout = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setParentPosition({ top: y + height, left: x, width });
    };
    return (
        <Pressable
            onLayout={handleParentLayout}
            onPress={() => handleIsActive('sortBy')}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderBottomWidth: 2,
                    borderBottomColor: 'blue',
                },
            ]}
        >
            <Text selectable={false}>{sortSelection}</Text>
            {isActive && (
                <View style={{
                    position: 'absolute',
                    top: parentPosition.top,
                    left: -10,
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    maxHeight: 200,
                    margin: 5,
                    zIndex: 99,
                    width: parentPosition.width + 10

                }}>
                    <FlatList
                        data={sortOptionsArray} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item.label}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleSortChange(item); handleIsActive(false); }}
                            >
                                <Text selectable={false} style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            )}
            <AntDesign
                name="down"
                size={15}
                color={'blue'}
                style={[
                    { marginLeft: 4 },
                    isActive && {
                        transform: [{ rotate: '180deg' }],
                    },
                ]}
            />
        </Pressable>
    )
};

const PerPage = ({ handleItemsPerPage, itemsPerPage, isActive, handleIsActive }) => {

    const data = [
        10, 15, 25, 50
    ];
    const [parentPosition, setParentPosition] = useState({ top: 0, left: 0, width: 0 });

    const handleParentLayout = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setParentPosition({ top: y + height, left: x, width });
    };
    return (
        <Pressable
            onLayout={handleParentLayout}
            onPress={() => handleIsActive('perPage')}

            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,

                    borderBottomWidth: 2,
                    borderBottomColor: 'blue',

                },
            ]}
        >

            <Text>{itemsPerPage}</Text>
            {isActive && (
                <View style={{
                    position: 'absolute',
                    top: parentPosition.top,
                    right: 0,
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    maxHeight: 200,
                    margin: 5,
                    zIndex: 99,
                    width: 100
                }}>
                    <FlatList
                        data={data} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleItemsPerPage(item); handleIsActive(false); }}
                            >
                                <Text style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            )}

            <AntDesign
                name="down"
                size={15}
                color={'blue'}
                style={[
                    { marginLeft: 4 },
                    isActive && {
                        transform: [{ rotate: '180deg' }],
                    },
                ]}
            />
        </Pressable>
    )
};
const StickyFooter = ({ handlePolicyClick, fetchGeneralData, handleSelectMake, handleSelectBodyType, setContactUsOpen }) => {
    const navigate = useRouter();
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
            navigate.push(`/SearchCarDesign?carMakes=${item.key}`);  // Pass selected carMake in URL
        };

        return (
            <TouchableOpacity
                style={[styles.item, isFirstColumn ? styles.firstColumn : styles.secondColumn]} // Conditional column styling
                onPress={() => { fetchGeneralData(); handleSelectMake(item.key); handleSearch(); }}  // Trigger search on press
            >
                <Text style={styles.title}>{item.key}</Text>
            </TouchableOpacity>
        );
    };
    const numColumns = screenWidth < 992 ? 1 : 2;

    const renderItemBodyType = ({ item, index }) => {
        const handleSearch = () => {
            navigate.push(`/SearchCarDesign?carBodyType=${item.key}`);  // Pass selected carMake in URL
        };
        return (
            <TouchableOpacity style={[styles.item, styles.firstColumn]}
                onPress={() => { fetchGeneralData(); handleSelectBodyType(item.key); handleSearch(); }}
            >
                <Text style={styles.title}>{item.key}</Text>
            </TouchableOpacity>
        );
    };
    const handleSearch = () => {
        fetchGeneralData();
        handleSelectBodyType('');
        handleSelectMake('');
        navigate.push(`/SearchCarDesign`);
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
                    <Text style={styles.companyAddress}>26-2 Takara Tsutsumi-cho, Toyota-city, Aichi 473-90932 Japan</Text>
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
                            <Pressable onPress={() => { navigate.push('/SearchCarDesign') }}>
                                <Text style={styles.linkText}>Car Stock</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate.push('/', { replace: true }) }}>
                                <Text style={styles.linkText}>How to Buy</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate.push('/AboutUs') }}>
                                <Text style={styles.linkText}>About Us</Text>
                            </Pressable>
                            <Pressable onPress={() => { navigate.push('/LocalIntroduction') }}>
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

const LoadingComponent = () => {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            marginVertical: 5,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#999',
            flexDirection: 'column', // Ensures the layout is vertical for top-level sections
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
        },
        iconPlaceholder: {
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: '#ccc',
            marginRight: 5,
        },
        textShort: {
            height: 20,
            width: 100,
            backgroundColor: '#eee',
            borderRadius: 5,
        },
        buttonPlaceholder: {
            height: 40,
            backgroundColor: '#ddd',
            borderRadius: 5,
            margin: 10,
            maxWidth: 140,
            alignSelf: 'flex-end',
        },
        imagePlaceholder: {
            width: '50%', // Adjust width for side-by-side layout
            height: 250,
            backgroundColor: '#ccc',
        },
        details: {
            padding: 10,
            flex: 1, // Takes the remaining space in the flex row
        },
        textLong: {
            height: 28,
            width: '90%',
            backgroundColor: '#eee',
            borderRadius: 5,
            marginBottom: 5,
        },
        textMedium: {
            height: 16,
            width: '60%',
            backgroundColor: '#eee',
            borderRadius: 5,
            marginTop: 5,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 20,
        },
        textExtraSmall: {
            width: '30%',
            height: 16,
            backgroundColor: '#eee',
        },
        verticalDivider: {
            height: '100%',
            width: 1,
            backgroundColor: 'grey',
        },
        buttonPlaceholderSmall: {
            backgroundColor: '#ddd',
            height: 50,
            width: '100%',
            borderRadius: 5,
            marginTop: 10,
        },
        flexDirection: {
            flexDirection: 'row', // Ensures that image and details are side by side
            alignItems: 'center',
            width: '100%',
            marginBottom: '2%',
            paddingHorizontal: 5,
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconPlaceholder} />
                <View style={styles.textShort} />
            </View>
            <View style={styles.buttonPlaceholder} />
            <View style={styles.flexDirection}>
                <View style={styles.imagePlaceholder} />
                <View style={styles.details}>
                    <View style={styles.textLong} />
                    <View style={styles.textShort} />
                    <View style={styles.textMedium} />

                    <View style={styles.row}>
                        <View style={styles.textExtraSmall} />
                        <View style={styles.verticalDivider} />
                        <View style={styles.textExtraSmall} />
                        <View style={styles.verticalDivider} />
                        <View style={styles.textExtraSmall} />
                    </View>

                    <View style={styles.buttonPlaceholderSmall} />
                </View>
            </View>
        </View>
    );
}


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




const SearchCarDesignAlpha = () => {
    const navigate = useRouter();
    const { userEmail } = useContext(AuthContext);

    const [searchParams, setSearchParams] = useState([])
    //dropdown Country
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
                            setPorts([]); // Reset ports if no data is found
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
    const [selectedPort, setSelectPort] = useState('');
    const handleSelectPort = (option) => {
        setSelectPort(option)
    };
    //dropdown Port




    //inspection
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
    //inspection



    //getPort price
    const [profitMap, setProfitMap] = useState('');
    useEffect(() => {
        const fetchInspection = async () => {

            const portDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'PortsDoc');

            try {
                const docSnap = await getDoc(portDocRef);

                if (docSnap.exists()) {
                    const selectedPortData = docSnap.data()[selectedPort];

                    if (selectedPortData) {
                        const profitPrice = selectedPortData.profitPrice;
                        setProfitMap(profitPrice);

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

    //fetch currency
    const [currentCurrency, setCurrentCurrency] = useState({});

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
    //fetch currency

    //screenwidth
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //screenwidth


    //screenheight
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenHeight(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //screenheight

    const InfoColumn = ({ label, value, flex }) => (
        <View style={{ alignItems: 'center', marginHorizontal: screenWidth < 468 ? 10 : 5, justifyContent: 'center', flex: flex, }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', }}>{value}</Text>
            <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center', }}>{label}</Text>
        </View>
    );


    //DROPDOWN MAKE
    const [makes, setMakes] = useState([]);
    useEffect(() => {
        const docRef = doc(collection(projectExtensionFirestore, 'Make'), 'Make');
        try {
            const unsubscribeMake = onSnapshot(docRef, (snapshot) => {
                const makeData = snapshot.data()?.make || [];
                setMakes(makeData);
            });
            return () => {
                unsubscribeMake();
            }
        } catch (error) {
            console.error('Error fetching data from Firebase: ', error);
        }
    }, []);

    const [carMakes, setCarMakes] = useState('');
    const handleSelectMake = (item) => {
        const updatedMake = item === "Select Make" ? '' : item;
        setCarMakes(updatedMake);



    };

    //DROPDOWN MAKE
    //DROPDOWN EXTERIOR COLOR
    const [colors, setColors] = useState([]);
    useEffect(() => {
        const docRef = doc(collection(projectExtensionFirestore, 'ExteriorColor'), 'ExteriorColor');
        try {
            const unsubscribeColor = onSnapshot(docRef, (snapshot) => {
                const colorData = snapshot.data()?.exteriorColor || [];
                setColors(colorData);
            });
            return () => {
                unsubscribeColor();
            }
        } catch (error) {
            console.error('Error fetching data from Firebase: ', error);
        }
    }, []);
    const [carColor, setCarColor] = useState({ name: '', hex: '' });
    const handleSelectColor = (colorName, hexValue) => {
        setCarColor({ name: colorName, hex: hexValue });
    };
    //DROPDOWN EXTERIOR COLOR
    //DROPDOWN MODEL
    const [models, setModels] = useState([]);
    useEffect(() => {
        let unsubscribeModel;
        try {
            if (carMakes) {
                const modelRef = doc(collection(projectExtensionFirestore, 'Model'), carMakes);
                unsubscribeModel = onSnapshot(modelRef, (docSnapshot) => {
                    const modelData = docSnapshot.data() || [];
                    setModels(modelData.model);
                    console.log('Model data:', modelData);
                });
            }

            return () => {
                if (unsubscribeModel) {
                    unsubscribeModel();
                }
            };
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
        }
    }, [carMakes]);
    const [carModels, setCarModels] = useState('');

    const handleSelectModel = (option) => {
        setCarModels(option === "Select Model" ? '' : option);
    };
    //DROPDOWN MODEL
    //DROPDOWN BODYTYPE
    const [bodyType, setBodyType] = useState([]);
    useEffect(() => {
        const docRef = doc(collection(projectExtensionFirestore, 'BodyType'), 'BodyType');
        try {
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                const bodyTypeData = snapshot.data()?.bodyType || [];
                setBodyType(bodyTypeData);
            });
            return () => {
                unsubscribe();
            };
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
        }
    }, []);
    const [carBodyType, setCarBodyType] = useState('');

    const handleSelectBodyType = (option) => {
        setCarBodyType(option === "Select Bodytype" ? '' : option);
    };
    //DROPDOWN BODY TYPE
    //DROPDOWN MIN YEAR
    const [carMinYear, setCarMinYear] = useState('');
    const handleSelectMinYear = async (option) => {
        setCarMinYear(option === 'Select Year' ? '' : option)
    }

    //DROPDOWN MIN YEAR

    //DROPDOWN MAX YEAR
    const [carMaxYear, setCarMaxYear] = useState('');
    const handleSelectMaxYear = async (option) => {
        setCarMaxYear(option === 'Select Year' ? '' : option)
    }
    //DROPDOWN MAX YEAR
    //DROPDOWN MIN MILEAGE
    const [minMileage, setMinMileage] = useState('');
    const minMileageData = [
        "10000",
        "30000",
        "50000",
        "100000",
        "150000",
        "200000",
    ];
    const handleSelectMinMileage = async (option) => {
        setMinMileage(option === 'Select Mileage' ? '' : option);
    };

    //DROPDOWN MIN MILEAGE

    //DROPDOWN MAX MILEAGE
    const [maxMileage, setMaxMileage] = useState('');
    const maxMileageData = [
        '10000',
        '30000',
        '50000',
        '100000',
        '150000',
        '200000',
    ];
    const handleSelectMaxMileage = (option) => {
        setMaxMileage(option === 'Select Mileage' ? '' : option);
    };
    //DROPDOWN MAX MILEAGE

    //DROPDOWN MIN PRICE
    const [minPrice, setMinPrice] = useState('');
    const minPriceData = [
        '500',
        '1000',
        '3000',
        '5000',
        '10000',
        '15000',
        '20000',
    ];
    const handleSelectMinPrice = (option) => {
        setMinPrice(option === 'Select Price' ? '' : option);
    };
    //DROPDOWN MIN PRICE


    //DROPDOWN MAX PRICE
    const [maxPrice, setMaxPrice] = useState('');
    const maxPriceData = [
        '500',
        '1000',
        '3000',
        '5000',
        '10000',
        '15000',
        '20000',
    ];
    const handleSelectMaxPrice = (option) => {
        setMaxPrice(option === 'Select Price' ? '' : option);

    };
    //DROPDOWN MAX PRICE

    //LOGIC FOR FILTERS


    const [carItems, setCarItems] = useState([]);
    const [hasMoreItems, setHasMoreItems] = useState(false);
    const [pageSnapshots, setPageSnapshots] = useState([null]);

    const searchKeywords = useRef('');
    const handleTextChange = (value) => {
        searchKeywords.current = value
    };


    const [isLoading, setIsLoading] = useState(true)
    // const updateSearchParams = () => {
    //     setSearchParams({searchTerm});
    // };


    //vehicle count
    const [vehicleCount, setVehicleCount] = useState(0)
    //vehilce count

    const [allItems, setAllItems] = useState([]);
    console.log('COUNT OF ALL ITEMS OF LIMIT', allItems)
    const [displayItems, setDisplayItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    //per page
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const handleItemsPerPage = (value) => {
        setItemsPerPage(value);
        setCurrentPage(0);
        fetchGeneralData();
    };
    //per page

    //Sort by
    const sortOptionsArray = [
        { label: "Update New to Old", field: "dateAdded", direction: "desc" },
        { label: "Update Old to New", field: "dateAdded", direction: "asc" },
        { label: "Price Low to High", field: "fobPrice", direction: "asc" },
        { label: "Price High to Low", field: "fobPrice", direction: "desc" },
        { label: 'Reg. Year New to Old', field: "regYear", direction: "desc" },
        { label: 'Reg. Year Old to New', field: "regYear", direction: "asc" },
    ];
    const [sortSelection, setSortSelection] = useState('Update Old to New');
    const [sortField, setSortField] = useState('dateAdded');
    const [sortDirection, setSortDirection] = useState('asc');
    const handleSortChange = (selectedOption) => {
        setCurrentPage(0);
        setSortSelection(selectedOption.label);
        setSortField(selectedOption.field);
        setSortDirection(selectedOption.direction);
        fetchGeneralData();
    };
    //Sort by

    //fetch image
    const [allImageUrl, setAllImageUrl] = useState({});
    console.log('all images', allImageUrl)
    //fetch image

    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);

    const [fetching, setFetching] = useState(false); // New state to track fetching status
    const currencyInside = currentCurrency.jpyToUsd

    console.log('currency inside', currencyInside)
 
    const [isImagesLoading, setIsImagesLoading] = useState(true); // New state for image preloading
    const [count, setCount] = useState(0); // State to store the count

    const fetchItems = async () => {
        if (!currentCurrency || currentCurrency.jpyToUsd === undefined) {
            console.warn('Currency conversion rate not available yet.');
            return;
        }
        setIsLoading(true);
        setIsImagesLoading(true); // Set loading to true


        try {

            let q = query(
                collection(projectExtensionFirestore, 'VehicleProducts'),
                where('imageCount', '>', 0),
                where('stockStatus', '==', 'On-Sale')
            );

            // Get the count for the base query
            let snapshot = await getCountFromServer(q);
            let count = snapshot.data().count || 0;
            console.log("Base count:", count);

            // Apply additional filters conditionally
            if (searchKeywords.current) {
                q = query(q, where('keywords', 'array-contains', searchKeywords.current));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after keywords filter:", count);
            }

            if (carMakes) {
                q = query(q, where('make', '==', carMakes.toUpperCase()));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after car make filter:", count);
            }

            if (carModels) {
                q = query(q, where('model', '==', carModels.toUpperCase()));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after car model filter:", count);
            }

            if (carBodyType) {
                q = query(q, where('bodyType', '==', carBodyType));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after body type filter:", count);
            }

            if (carMinYear || carMaxYear) {
                if (carMinYear) {
                    q = query(q, where('regYearNumber', '>=', Number(carMinYear)));
                    snapshot = await getCountFromServer(q);
                    count = snapshot.data().count || 0;
                }
                if (carMaxYear) {
                    q = query(q, where('regYearNumber', '<=', Number(carMaxYear)));
                    snapshot = await getCountFromServer(q);
                    count = snapshot.data().count || 0;
                }
                q = query(q, orderBy('regYearNumber'));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after year filter:", count);
            }

            if (minMileage || maxMileage) {
                if (minMileage) {
                    q = query(q, where('mileageNumber', '>=', Number(minMileage)));
                    snapshot = await getCountFromServer(q);
                    count = snapshot.data().count || 0;
                }
                if (maxMileage) {
                    q = query(q, where('mileageNumber', '<=', Number(maxMileage)));
                    snapshot = await getCountFromServer(q);
                    count = snapshot.data().count || 0;
                }
                q = query(q, orderBy('mileageNumber'));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after mileage filter:", count);
            }

            console.log('min price', currencyInside)

            if ((Number(minPrice) || Number(maxPrice))) {
                if (Number(minPrice)) {
                    q = query(q, where('fobPriceNumber', '>', Number(minPrice) / currencyInside));
                    snapshot = await getCountFromServer(q);
                    count = snapshot.data().count || 0;
                }
                if (Number(maxPrice)) {
                    q = query(q, where('fobPriceNumber', '<', Number(maxPrice) / currencyInside));
                    snapshot = await getCountFromServer(q);
                    count = snapshot.data().count || 0;
                }
                q = query(q, orderBy('fobPriceNumber'));
                snapshot = await getCountFromServer(q);
                count = snapshot.data().count || 0;
                console.log("Count after price filter:", count);
            }

            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            q = query(q, limit(itemsPerPage));

            // Final query to fetch documents
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                console.log("No items found.");
                setCount(0);
                setIsLoading(false);
                setIsImagesLoading(false);
                return;
            }

            setCount(count); // Update the count state with the final count
            let items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort items
            items = items.sort((a, b) => {
                const valueA = sortField === 'fobPrice' ? parseFloat(a[sortField]) : a[sortField];
                const valueB = sortField === 'fobPrice' ? parseFloat(b[sortField]) : b[sortField];
                return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
            updateSearchParams();
            // Fetch image URLs and attach to items
            const itemsWithImages = await Promise.all(items.map(async (item) => {
                if (item.images && Array.isArray(item.images)) {
                    return { ...item, images: item.images };
                } else {
                    console.warn(`No images found for item with ID: ${item.id}`);
                    return { ...item, images: [] };
                }
            }));

            // Preload images
            // setIsImagesLoading(true); // Start image preloading
            const imagePromises = itemsWithImages.map(item => {
                const firstImageUri = item.images.length > 0 ? item.images[0] : carSample;
                return firstImageUri ? Image.prefetch(firstImageUri) : Promise.resolve();
            });
            await Promise.all(imagePromises);

            // Update pagination and state
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setAllItems((prevItems) => [...prevItems, ...itemsWithImages]);
            setDisplayItems(itemsWithImages.slice(0, itemsPerPage));
            setHasMoreItems(querySnapshot.docs.length === itemsPerPage);

            // Collect new image URLs and merge with previous state
            const newImageUrls = itemsWithImages.reduce((acc, item) => {
                acc[item.id] = item.images;
                return acc;
            }, {});
            setAllImageUrl(prevUrls => ({ ...prevUrls, ...newImageUrls }));
            setIsLoading(false);
            setIsImagesLoading(false);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };

    const resetPagination = () => {
        setCurrentPage(0);
        setAllItems([]);
        setLastVisible(null);
        setDisplayItems([]);
        setTotalPrices([]);
    };
    const fetchGeneralData = () => {
        resetPagination();
        if (allItems <= 0) {
            fetchItems();
        }
    };

    useEffect(() => {
        if (lastVisible === null && currencyInside !== undefined) {
            fetchItems();
        }
    }, [lastVisible, currencyInside]); // Add searchParams as a dependency



    // Updated fetchNext function to handle pagination and dynamic item fetching efficiently
    const [fetchSize, setFetchSize] = useState(10);
    const [checkFetched, setCheckedFetched] = useState(false);
    const fetchNext = async () => {
        const nextPageStartIndex = (currentPage + 1) * itemsPerPage;

        // Check if we need to fetch more items (when we're at the last page of the current items)
        if (nextPageStartIndex >= allItems.length && hasMoreItems) {

            setCurrentPage(currentPage + 1);
            await fetchItems();
            setCheckedFetched(true) // Fetch the next batch of items
        }
        if (allItems.length > nextPageStartIndex) {

            setCurrentPage(currentPage + 1);

            // Update to the next page index
        }
        // After fetching or if items are already available, move to the next page

    };
    console.log('current page', currentPage)
    // useEffect(() => {
    //     // Calculate the maximum possible current page based on the length of allItems
    //     const maxFullPages = Math.floor(allItems.length / itemsPerPage);

    //     // If the current page is less than the maximum full pages available, move to the next page
    //     if (currentPage < maxFullPages && checkFetched === true) {
    //         setCurrentPage(currentPage + 1);
    //     }
    // }, [allItems]); // Dependency on allItems to trigger the check whenever items are added

    const [totalPrices, setTotalPrices] = useState([]);

    useEffect(() => {

        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        // Ensure that we have enough items to display for the current page
        if (start < allItems.length) {
            const newDisplayItems = allItems.slice(start, Math.min(end, allItems.length));  // Ensure not to exceed available items
            setDisplayItems(newDisplayItems);
        };

    }, [currentPage, itemsPerPage, allItems, totalPrices, searchParams]); // Respond to changes in currentPage or allItems
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [currentCurrencyGlobal, setCurrentCurrencyGlobal] = useState({});
    useEffect(() => {
        handleCalculate(); // Recalculate prices whenever displayItems changes
    }, [selectedCurrency, currentCurrencyGlobal, isLoading]);

    const fetchPrevious = () => {
        if (currentPage > 0) {
            const prevPageStartIndex = (currentPage - 1) * itemsPerPage;
            const prevPageItems = allItems.slice(prevPageStartIndex, prevPageStartIndex + itemsPerPage);
            setDisplayItems(prevPageItems);
            setCurrentPage(currentPage - 1);
        }
    };


    // useEffect(() => {
    //     // Calculate the range based on the current page
    //     const start = currentPage * itemsPerPage;
    //     const end = start + itemsPerPage;

    //     // Slice the current items for display
    //     const newDisplayItems = allItems.slice(start, end);
    //     setDisplayItems(newDisplayItems);

    //     // Update whether more items can be fetched or displayed
    //     setHasMoreItems(allItems.length > end);
    // }, [allItems, currentPage, itemsPerPage, vehicleCount]);




    // const fetchData = () => {
    //     resetPagination();
    //     fetchItems();
    // };
    // useEffect(() => {
    //     if (hasMoreItems === false) {
    //         fetchData();
    //     }
    // }, [itemsPerPage, sortSelection, vehicleCount])
    // useEffect(() => {
    //     resetPagination();

    // }, [searchParams, carMakes, carModels, carBodyType, carMinYear, carMaxYear]);


    //LOGIC FOR FILTERS
    //RENDER ITEMS FROM FLATLIST
    console.log('data layer', window.dataLayer);

    const handleGoToProduct = (id) => {
        navigate.push({
            pathname: `/Product/${id}`,
            query: { country: selectedCountry, city: selectedPort },
        });
    };
    
    const convertedCurrency = (yenValue) => {
        const value = Number(yenValue);
        const currency = selectedCurrency || currentCurrencyGlobal?.selectedCurrencyExchange || 'USD'; // Default to USD if no currency is selected
        const rates = {
            'EUR': currentCurrency.usdToEur,
            'AUD': currentCurrency.usdToAud,
            'GBP': currentCurrency.usdToGbp,
            'CAD': currentCurrency.usdToCad,
            'USD': 1, // Assume the fallback is USD
            'YEN': currentCurrency.usdToJpy
        };
        const conversionRate = rates[currency];

        // Check if conversion rate is undefined and set default values
        if (conversionRate === undefined) {
            return { symbol: '--', value: '000' }; // Default values when rate is not available
        }

        const convertedValue = Math.round(value * conversionRate).toLocaleString('en-US', { useGrouping: true });

        const currencySymbols = {
            'EUR': '€',
            'AUD': 'A$',
            'GBP': '£',
            'CAD': 'C$',
            'USD': 'US$',
            'YEN': '¥'
        };

        // Use default symbol if currency is not found in the map
        const symbol = currencySymbols[currency] || '--';

        return { symbol: symbol, value: convertedValue };
    };
    console.log('Prices', totalPrices);
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
        fetchInspectionPrice();
    }, [inspectionName])
    const handleCalculate = async () => {
        if (!selectedPort || !selectedCountry) {
            setTotalPrices(0);
            return;
        }

        const newTotalPrices = displayItems.map(item => {
            const totalPriceCalculation = (parseFloat(item.fobPrice) * currentCurrency.jpyToUsd) +
                (parseFloat(item.dimensionCubicMeters) * parseFloat(profitMap)) + (toggle ? 300 : 0) + (toggleInsurance ? 50 : 0);
            return convertedCurrency(totalPriceCalculation); // This already returns an object { symbol, value }
        });

        setTotalPrices(newTotalPrices);
    };


    const [animationStates, setAnimationStates] = useState({});
    const [favoriteModal, setFavoriteModal] = useState(false)
    const openModalFavorite = () => {
        setFavoriteModal(!favoriteModal);
    }

    const addToFavorites = async ({ car, firstImageUri }) => {
        if (!userEmail) {
            return;
        }
        try {
            // Fetch the current datetime from the API
            const response = await axios.get(timeApi);
            const datetime = response.data.datetime; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.ssssss±hh:mm
            const year = datetime.slice(0, 4);
            const month = datetime.slice(5, 7);
            const day = datetime.slice(8, 10);
            const time = datetime.slice(11, 19); // HH:mm:ss
            const dateOfTransaction = `${year}/${month}/${day} at ${time}`;

            const newFavorite = {
                carName: car.carName,
                imageUrl: firstImageUri ? firstImageUri : 'No image yet',
                referenceNumber: car.referenceNumber,
                stockId: car.stockID,
                fobPrice: car.fobPrice,
                regYear: car.regYear,
                regMonth: car.regMonth,
                mileage: car.mileage,
                steering: car.steering,
                color: car.exteriorColor,
                dateOfTransaction
            };

            const accountTransaction = doc(projectExtensionFirestore, 'accounts', userEmail);

            // Fetch the user's current favorites
            const accountSnap = await getDoc(accountTransaction);
            if (accountSnap.exists()) {
                const userData = accountSnap.data();
                const currentFavorites = userData.favorites || [];

                // Check if the car is already in the favorites by comparing stockId
                const isAlreadyInFavorites = currentFavorites.some(fav => fav.stockId === car.stockID);
                if (isAlreadyInFavorites) {
                    window.alert('This car is already in your favorites list.');
                    return;
                }

                // If not in favorites, proceed to add the new favorite
                await updateDoc(accountTransaction, {
                    favorites: arrayUnion(newFavorite)
                });
            } else {
                console.error('Account document does not exist.');
                window.alert('Failed to retrieve account details.');
            }
        } catch (error) {
            console.error('Failed to add to favorites:', error);
            window.alert('Failed to add car to favorites.');
        }
    };


    const animationValues = useRef({}); // Store animation values for each item
    const textOpacityValues = useRef({}); // Store text opacity animation values for each item

    const animateButton = (itemId) => {
        if (!animationValues.current[itemId]) return; // Ensure the animation exists

        AnimatedRN.timing(animationValues.current[itemId], {
            toValue: 1, // Animate to red
            duration: 500,
            useNativeDriver: true,
        }).start();
    };
    const animateTextChange = (itemId) => {
        if (!textOpacityValues.current[itemId]) return; // Ensure the animation exists

        AnimatedRN.sequence([
            AnimatedRN.timing(textOpacityValues.current[itemId], {
                toValue: 0, // Fade out
                duration: 800,
                useNativeDriver: true,
            }),
            AnimatedRN.timing(textOpacityValues.current[itemId], {
                toValue: 1, // Fade in
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    };
    const [favoritesState, setFavoritesState] = useState({}); // Centralized favorites state
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
                    const currentFavorites = userData.favorites || [];

                    // Map the current favorites to their respective IDs
                    const updatedFavoritesState = {};
                    currentFavorites.forEach((fav) => {
                        updatedFavoritesState[fav.stockId] = true; // Mark as favorited
                    });

                    setFavoritesState(updatedFavoritesState);
                } else {
                    console.error('Account document does not exist.');
                }
            } catch (error) {
                console.error('Failed to fetch favorites:', error);
            }
        };

        fetchFavorites();
    }, [userEmail]); // Fetch favorites when Firestore instance or userEmail changes

    const renderCarItems = useCallback(({ item, index }) => {
        const isFavorited = favoritesState[item.id] || false; // Get the favorited state for this item

        const imageAspectRatio = 1.7
        const fobBaseDollar = (item.fobPrice) * currentCurrency.jpyToUsd;
        console.log('FOB DOLLAR', fobBaseDollar)
        const fobCurrency = convertedCurrency(fobBaseDollar);


        const totalPriceCalculation = (fobBaseDollar) + (parseFloat(item.dimensionCubicMeters) * parseFloat(profitMap));
        const fobTotalPriceCurrency = convertedCurrency(totalPriceCalculation);
        const displayTotalPrice = totalPrices[index] && totalPrices[index].value ?
            totalPrices[index] :
            { symbol: fobCurrency.symbol, value: `000` };
        const carImages = allImageUrl?.[item?.id];

        if (!animationValues.current[item.id]) {
            animationValues.current[item.id] = new AnimatedRN.Value(0);
        }

        const backgroundColor = favoritesState[item.id]
            ? 'red' // Static red when favorited
            : animationValues.current[item.id].interpolate({
                inputRange: [0, 1],
                outputRange: ['blue', 'red'], // Animate between blue and red
            });

        const firstImageUri = carImages && carImages.length > 0 ? carImages[0] : carSample;
        const handleFavorite = () => {
            if (!userEmail) {
                // Redirect to LoginForm if user is not logged in
                navigate.push('/LoginForm'); // Assuming `navigate` is a function from your routing library (e.g., React Router)
                return;
            }
            if (favoritesState[item.id]) return;

            setAnimationStates((prevState) => ({
                ...prevState,
                [item.id]: {
                    isAnimating: true,
                    showHeart: false,
                    heartVisible: false,
                },
            }));
            animateButton(item.id);
            animateTextChange(item.id);
            setFavoritesState((prevState) => ({
                ...prevState,
                [item.id]: true, // Set the item as favorited
            }));


            addToFavorites({ car: item, firstImageUri: item.images[0] });
        }


        return (
            <View style={{ borderRadius: 5, borderWidth: 1, borderColor: '#999', flex: 1, marginVertical: 5, width: '100%', alignSelf: 'center' }}>
                <View style={{ padding: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                            <MaterialCommunityIcons name="steering" size={25} />
                            <Text> Right Hand</Text>
                        </View>
                        <AnimatedRN.View style={{


                            width: 'auto',
                            maxWidth: screenWidth <= 600 ? null : 140,
                            borderRadius: 5,
                            backgroundColor
                        }}>
                            <TouchableOpacity
                                style={{
                                    padding: 10,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                                onPress={() => handleFavorite()}
                            >
                                {/* <AntDesign name="heart" size={15} color={'white'} /> */}
                                <AnimationFavorites
                                    screenWidth={screenWidth}
                                    isAnimating={animationStates[item.id]?.isAnimating || false}
                                    showHeart={animationStates[item.id]?.showHeart || false}
                                    setShowHeart={(value) =>
                                        setAnimationStates((prevState) => ({
                                            ...prevState,
                                            [item.id]: { ...prevState[item.id], showHeart: value },
                                        }))
                                    }
                                    isFavorited={isFavorited}
                                    heartVisible={animationStates[item.id]?.heartVisible || false}
                                    setHeartVisible={(value) =>
                                        setAnimationStates((prevState) => ({
                                            ...prevState,
                                            [item.id]: { ...prevState[item.id], heartVisible: value },
                                        }))
                                    }
                                />
                                {screenWidth <= 600 ? (<></>) : (
                                    <AnimatedRN.Text
                                        style={{
                                            color: 'white',
                                            marginLeft: 5,
                                            fontWeight: '500',
                                            opacity: textOpacityValues.current[item.id], // Apply per-item animated opacity
                                        }}
                                    >
                                        {isFavorited ? 'On favorites' : 'Add to favorites'}
                                    </AnimatedRN.Text>
                                )}

                            </TouchableOpacity>
                        </AnimatedRN.View>
                    </View>
                    <View style={{ flexDirection: screenWidth <= 768 ? 'column' : 'row', padding: 10, backgroundColor: '#fff' }}>
                        <Image

                            source={{ uri: firstImageUri }}
                            style={{
                                width: screenWidth <= 768 ? '100%' : 350,
                                height: screenWidth <= 768 ? (screenWidth / imageAspectRatio + 8) : 258, // Calculate the height based on the screen width and the image's aspect ratio
                                resizeMode: 'cover',

                            }}
                        />

                        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 5 }}>
                                {item.carName}
                            </Text>
                            <Text style={{ color: 'blue', fontSize: 16, marginTop: -5 }}>
                                {item.carDescription}
                            </Text>
                            <View
                                style={{

                                    flexDirection: screenWidth < 375 ? 'column' : 'row',
                                    justifyContent: screenWidth < 375 ? null : 'space-between',
                                    alignItems: screenWidth < 375 ? null : 'center',
                                }}
                            >
                                {/* FOB Price Section */}
                                <View style={{ flex: 1, alignItems: 'flex-start', marginVertical: 20 }}>
                                    <Text style={{ fontWeight: '700', fontSize: 16 }}>
                                        {fobCurrency.symbol}{' '}
                                        <Text style={{ fontSize: 30, fontWeight: '700' }}>
                                            {fobCurrency.value}
                                        </Text>
                                    </Text>
                                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'gray', marginTop: 5 }}>
                                        FOB Price
                                    </Text>
                                </View>

                                {!totalPrices ? <></> : (
                                    <View style={{ flex: 1, alignItems: 'flex-start', marginVertical: 20 }}>
                                        <Text style={{ fontWeight: '700', fontSize: 30 }}>
                                            {displayTotalPrice.value === 'NaN' ? (
                                                'ASK'
                                            ) : (
                                                <>
                                                    <Text style={{ fontSize: 16, fontWeight: '700' }}>
                                                        {displayTotalPrice.symbol}{' '}
                                                    </Text>
                                                    {displayTotalPrice.value}
                                                </>
                                            )}
                                        </Text>
                                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'gray', marginTop: 5 }}>
                                            Total Price
                                        </Text>
                                    </View>

                                )}

                            </View>


                            {screenWidth <= 768 ? (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    marginVertical: 20,
                                    borderTopWidth: 1,
                                    borderTopColor: '#aaa',
                                    borderBottomColor: '#aaa',
                                    borderBottomWidth: 1,
                                    padding: 3
                                }}>
                                    <InfoColumn label="Year" value={`${item.regYear}/${item.regMonth}`} flex={1} />
                                    <InfoColumn label="Mileage" value={`${item.mileage} km`} flex={1} />
                                    <InfoColumn label="Exterior Color" value={item.exteriorColor} flex={1} />
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%', maxWidth: screenWidth <= 768 ? null : 480, justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 16 }}>
                                        <Text style={{ color: 'gray', fontWeight: '500' }}>Year </Text>
                                        <Text style={{ fontWeight: 'bold' }}> {item.regYear}/{item.regMonth}</Text>
                                    </Text>
                                    <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
                                    <Text style={{ fontSize: 16 }}>
                                        <Text style={{ color: 'gray', fontWeight: '500' }}>Mileage </Text>
                                        <Text style={{ fontWeight: 'bold' }}> {item.mileage} km</Text>
                                    </Text>
                                    <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
                                    <Text style={{ fontSize: 16 }}>
                                        <Text style={{ color: 'gray', fontWeight: '500' }}>Exterior Color </Text>
                                        <Text style={{ fontWeight: 'bold' }}> {item.exteriorColor}</Text>
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'blue',
                                    padding: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: screenWidth <= 768 ? null : 'flex-end',
                                    maxWidth: screenWidth <= 768 ? null : 220,
                                    width: '100%',
                                    height: 50,
                                    marginTop: 10,
                                    marginRight: -20,
                                    borderRadius: 5
                                }}
                                onPress={() => handleGoToProduct(item.id)}
                            >
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Send Message</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                </View>
            </View>
        )
    }, [favoritesState, animationStates, currentCurrency, profitMap, screenWidth, allImageUrl, totalPrices, selectedCurrency, currentCurrencyGlobal])
    //RENDER ITEMS FROM FLATLIST

    const carouselRef = useRef(null);
    const carouselWidth = screenWidth
    const carouselHeight = carouselWidth * 0.2; // Maintain an aspect ratio (e.g., 4:3)
    const dataFilesExtra = [
        { image: image },
    ]
    const [isSearchModalVisible, setSearchModalVisible] = useState(false);
    const [isCalculatorModalVisible, setCalculatorModalVisible] = useState(false);

    const toggleSearchModal = () => {
        setSearchModalVisible(!isSearchModalVisible);
    };

    const toggleCalculatorModal = () => {
        setCalculatorModalVisible(!isCalculatorModalVisible);
    };

    useEffect(() => {
        setTimeout(() => {
            document.documentElement.scrollTop = 0;  // Scroll to the top
            document.body.scrollTop = 0;  // For older browsers (or in case body is scrollable)
        }, 0);
    }, []);


    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (id) => {
        setActiveDropdown(prevId => (prevId === id ? null : id));
    };
    const currentYear = new Date().getFullYear();
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);



    const [isActive, setIsActive] = useState(false);
    const handleOutsidePress = () => {
        setActiveDropdown(null);
        setIsProfileDropdownOpen(false) // Close dropdowns on outside press
    };
    const listTranslateY = useRef(new AnimatedRN.Value(-50)).current; // Start FlatList below the view
    const listOpacity = useRef(new AnimatedRN.Value(0)).current;

    useEffect(() => {
        // Start animations
        AnimatedRN.parallel([
            AnimatedRN.timing(listTranslateY, {
                toValue: 0, // Move to its base location
                duration: 600,
                useNativeDriver: true,
            }),
            AnimatedRN.timing(listOpacity, {
                toValue: 1, // Fade in
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
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
    const handlePolicyClick = (policy) => {
        setCurrentPolicy(policy); // Set the current policy content
        setOpenDetails(true); // Open the modal
    };
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
    const [activeDropdownSort, setActiveDropdownSort] = useState(null);

    const handleDropdown = (key) => {
        setActiveDropdownSort((prev) => (prev === key ? null : key)); // Toggle active dropdown
    };
    const [toggleInsurance, setToggleInsurance] = useState(false);
    const handleInsurance = () => {
        setToggleInsurance(!toggleInsurance)
    };
    const formatItemForDisplay = (item, placeholder, id) => {
        if (item === placeholder || !item) return placeholder;  // Keep the placeholder text

        const numericValue = parseInt(item, 10);
        if (isNaN(numericValue)) return item;

        switch (id) {
            case 'minPrice':
            case 'maxPrice':
                return `$${numericValue.toLocaleString()}`;
            case 'minMileage':
            case 'maxMileage':
                return `${numericValue.toLocaleString()} km`;
            default:
                return item;
        }
    };
    const updateSearchParams = () => {
        if (!navigate.isReady) return;

        const newQuery = {
            ...(searchKeywords.current && { keyword: searchKeywords.current }),
            ...(carMakes && { make: carMakes }),
            ...(carModels && { model: carModels }),
            ...(carBodyType && { bodyType: carBodyType }),
            ...(carMinYear && { minYear: carMinYear }),
            ...(carMaxYear && { maxYear: carMaxYear }),
            ...(minMileage && { minMileage }),
            ...(maxMileage && { maxMileage }),
            ...(minPrice && { minPrice }),
            ...(maxPrice && { maxPrice }),
        };

        const currentQuery = navigate.query;
        const isSame =
            Object.keys(newQuery).length === Object.keys(currentQuery).length &&
            Object.keys(newQuery).every(key => newQuery[key] === currentQuery[key]);

        if (!isSame) {
            navigate.push(
                {
                    pathname: navigate.pathname,
                    query: newQuery,
                },
                undefined,
                { shallow: true }
            );
        }
    };
    useEffect(() => {
        if (!navigate.isReady) return;
        
        // Destructure the parameters you care about
        const {
          make,
          model,
          bodyType,
          minYear,
          maxYear,
          minMileage: qMinMileage,
          maxMileage: qMaxMileage,
          minPrice: qMinPrice,
          maxPrice: qMaxPrice,
          keyword,
        } = navigate.query;
        
        if (make) setCarMakes(make);
        if (model) setCarModels(model);
        if (bodyType) setCarBodyType(bodyType);
        if (minYear) setCarMinYear(minYear);
        if (maxYear) setCarMaxYear(maxYear);
        if (qMinMileage) setMinMileage(qMinMileage);
        if (qMaxMileage) setMaxMileage(qMaxMileage);
        if (qMinPrice) setMinPrice(qMinPrice);
        if (qMaxPrice) setMaxPrice(qMaxPrice);
        if (keyword) searchKeywords.current = keyword;
      }, [navigate.isReady, navigate.query]);
    return (
        <TouchableWithoutFeedback onPress={() => { setIsProfileDropdownOpen(false); handleOutsidePress(); setActiveDropdownSort(null) }}>
            <View style={{ flex: 3 }}>


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
                <View style={{ flex: 3 }} >

                    <View style={{
                        width: '100%',
                        height: 150,
                        marginTop: '3%'
                    }}>
                        <ImageBackground
                            source={{ uri: imageSrc }}
                            resizeMode="cover"
                            style={{
                                width: screenWidth,
                                height: 250, // Adjust the height as needed
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 99
                            }}
                        >

                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject, // Fills the entire ImageBackground
                                    backgroundColor: 'rgba(0, 0, 266, 0.1)', // Dark blue with transparency
                                }}
                            />


                        </ImageBackground>



                    </View>

                    <View style={{ marginTop: 1 }}>

                        {screenWidth <= 962 && (

                            <AnimatedRN.View style={{
                                transform: [{ translateY: listTranslateY }],
                                opacity: listOpacity,
                                flexDirection: screenWidth <= 962 ? 'column' : 'row', alignItems: 'center', padding: 20
                            }}>

                                <View style={{ position: 'relative', alignItems: 'center', width: '100%' }}>

                                    {/* <View
                                        style={{
                                            position: 'absolute',
                                            top: -25, // Adjust to place above the TouchableOpacity
                                            zIndex: 10,
                                            backgroundColor: '#FF6347', // Example sticker color
                                            borderRadius: 10,
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                        }}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>New</Text>
                                    </View>
 */}

                                    <TouchableOpacity
                                        onPress={toggleSearchModal}
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingHorizontal: '5%',
                                            width: '100%',
                                            paddingVertical: 20,
                                            backgroundColor: 'white',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 5,
                                            borderTopLeftRadius: 5,
                                            borderTopRightRadius: 5,
                                        }}
                                    >
                                        <Entypo name="magnifying-glass" size={25} />
                                        <Text
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 16,
                                            }}
                                        >
                                            Find Used Cars
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Modal
                                    animationType="fade"
                                    transparent={true}
                                    visible={isSearchModalVisible}
                                    onRequestClose={toggleSearchModal}
                                >

                                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', padding: 10 }}>
                                        <TouchableWithoutFeedback onPress={() => { handleOutsidePress(); }}>

                                            <ScrollView style={{
                                                backgroundColor: 'white',
                                                width: '100%',
                                                height: '100%',
                                                maxHeight: 900,
                                                padding: 10,
                                                borderRadius: 5,
                                                shadowColor: 'black',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 3,
                                                elevation: 5, // for Android shadow

                                            }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 10,
                                                }}>
                                                    <Text style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 18,
                                                    }}>Filter Results</Text>
                                                    <TouchableOpacity onPress={toggleSearchModal} style={{ alignSelf: 'flex-end', }}>
                                                        <FontAwesome name={'close'} size={25} color={'gray'} />
                                                    </TouchableOpacity>
                                                </View>
                                                {/* <TouchableOpacity onPress={() => { openModalFavorite() }} style={{ alignSelf: 'flex-end', marginRight: 5, marginBottom: 5 }}>
                                        <Text style={{ color: 'gray', fontSize: '1.2em', fontWeight: '700' }}>X</Text>
                                    </TouchableOpacity> */}
                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 8 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Make:</Text>
                                                    <DropDownMake
                                                        id="make"
                                                        data={[`Select Make`, ...makes]}
                                                        selectedValue={carMakes}
                                                        handleSelect={setCarMakes}
                                                        placeholder="Select Make"
                                                        isActive={activeDropdown === "make"}
                                                        toggleDropdown={toggleDropdown}
                                                        setCarModels={setCarModels}
                                                        setModels={setModels}
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 7 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Model:</Text>
                                                    <DropdownSearchFilter
                                                        id="model"
                                                        data={[`Select Model`, ...models]}
                                                        selectedValue={carModels}
                                                        handleSelect={setCarModels}
                                                        placeholder="Select Model"
                                                        isActive={activeDropdown === "model"}
                                                        toggleDropdown={toggleDropdown}
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 6 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>BodyType:</Text>
                                                    <DropdownSearchFilter
                                                        id="bodyType"
                                                        data={[`Body Type`, ...bodyType]} // Add placeholder as the first item
                                                        selectedValue={carBodyType}
                                                        handleSelect={setCarBodyType}
                                                        placeholder="Body Type"
                                                        isActive={activeDropdown === "bodyType"}
                                                        toggleDropdown={toggleDropdown}
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 5 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Mileage:</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                                        <DropdownSearchFilter
                                                            id="minMileage"
                                                            data={[`Min Mileage`, ...minMileageData]} // Add "Select Min Mileage" as the first item
                                                            selectedValue={minMileage}
                                                            handleSelect={setMinMileage}
                                                            placeholder="Min Mileage"
                                                            isActive={activeDropdown === "minMileage"}
                                                            toggleDropdown={toggleDropdown}
                                                            renderItem={(item) => formatItemForDisplay(item, 'Min Mileage', 'minMileage')}
                                                        />
                                                        <Text> - </Text>
                                                        <DropdownSearchFilter
                                                            id="maxMileage"
                                                            data={[`Max Mileage`, ...maxMileageData]} // Add "Select Max Mileage" as the first item
                                                            selectedValue={maxMileage}
                                                            handleSelect={setMaxMileage}
                                                            placeholder="Max Mileage"
                                                            isActive={activeDropdown === "maxMileage"}
                                                            toggleDropdown={toggleDropdown}
                                                            renderItem={(item) => formatItemForDisplay(item, 'Max Mileage', 'maxMileage')}
                                                        />
                                                    </View>
                                                </View>

                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 4 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Year:</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                                        <DropdownSearchFilter
                                                            id="minYear"
                                                            data={[`Min Year`, ...years]}  // Add "Min Year" as the first item
                                                            selectedValue={carMinYear}
                                                            handleSelect={setCarMinYear}
                                                            placeholder="Min Year"
                                                            isActive={activeDropdown === "minYear"}
                                                            toggleDropdown={toggleDropdown}
                                                        />
                                                        <Text> - </Text>
                                                        <DropdownSearchFilter
                                                            id="maxYear"
                                                            data={[`Max Year`, ...years]}  // Add "Max Year" as the first item
                                                            selectedValue={carMaxYear}
                                                            handleSelect={setCarMaxYear}
                                                            placeholder="Max Year"
                                                            isActive={activeDropdown === "maxYear"}
                                                            toggleDropdown={toggleDropdown}
                                                        />
                                                    </View>

                                                </View>

                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 3 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Price:</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                                        <DropdownSearchFilter
                                                            id="minPrice"
                                                            data={[`Min Price`, ...minPriceData]} // Add placeholder as the first item
                                                            selectedValue={minPrice}
                                                            handleSelect={setMinPrice}
                                                            placeholder="Min Price"
                                                            isActive={activeDropdown === "minPrice"}
                                                            toggleDropdown={toggleDropdown}
                                                            renderItem={(item) => formatItemForDisplay(item, 'Min Price', 'minPrice')}
                                                        />
                                                        <Text> - </Text>
                                                        <DropdownSearchFilter
                                                            id="maxPrice"
                                                            data={[`Max Price`, ...maxPriceData]} // Add placeholder as the first item
                                                            selectedValue={maxPrice}
                                                            handleSelect={setMaxPrice}
                                                            placeholder="Max Price"
                                                            isActive={activeDropdown === "maxPrice"}
                                                            toggleDropdown={toggleDropdown}
                                                            renderItem={(item) => formatItemForDisplay(item, 'Max Price', 'maxPrice')}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={{ marginBottom: 20, padding: 5, zIndex: 2 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Keywords:</Text>
                                                    <TextInput
                                                        style={{
                                                            padding: 15,
                                                            borderWidth: 2,
                                                            borderColor: isActive ? 'blue' : '#eee',
                                                            borderRadius: 2,

                                                            marginTop: screenWidth < 644 ? 10 : 0,
                                                            width: '100%',
                                                            outlineStyle: 'none',
                                                            flex: 1
                                                        }}
                                                        onFocus={() => setIsActive(true)}
                                                        onBlur={() => setIsActive(false)}
                                                        placeholder="Search by make, model, or keyword"
                                                        placeholderTextColor={'#ccc'}
                                                        onChangeText={handleTextChange}
                                                        defaultValue={searchKeywords.current}
                                                    />

                                                </View>
                                                <View style={{ width: '100%', height: 60, paddingHorizontal: 5, padding: 5, }}>
                                                    <TouchableOpacity
                                                        style={{
                                                            justifyContent: 'center',
                                                            borderRadius: 5,
                                                            padding: 10,
                                                            backgroundColor: 'blue',
                                                            alignItems: 'center',
                                                            flex: 1
                                                        }}
                                                        onPress={() => { fetchGeneralData(); toggleSearchModal(); }}
                                                    >
                                                        <Text style={{ color: 'white' }}>Search</Text>
                                                    </TouchableOpacity>
                                                </View>



                                            </ScrollView>

                                        </TouchableWithoutFeedback>



                                    </View>

                                </Modal>
                                <TouchableOpacity onPress={toggleCalculatorModal} style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingHorizontal: '5%',
                                    width: '100%',
                                    paddingVertical: 20,
                                    backgroundColor: 'white',
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5

                                }}>
                                    <FontAwesome name="calculator" size={25} />
                                    <Text style={{
                                        fontWeight: 'bold',
                                        fontSize: 16
                                    }}>Total Price Calculators</Text>
                                </TouchableOpacity>
                                <Modal
                                    animationType="fade"
                                    transparent={true}
                                    visible={isCalculatorModalVisible}
                                    onRequestClose={toggleCalculatorModal}
                                >
                                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', padding: 10, paddingHorizontal: 10 }}>
                                        <ScrollView style={{
                                            backgroundColor: 'white',
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: 450,
                                            padding: 20,
                                            borderRadius: 10,
                                            shadowColor: 'black',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 6,
                                            elevation: 5,
                                        }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 10,
                                            }}>
                                                <Text style={{
                                                    fontWeight: 'bold',
                                                    fontSize: 18,
                                                }}>Calculator</Text>
                                                <TouchableOpacity onPress={toggleCalculatorModal} style={{ alignSelf: 'flex-end', }}>
                                                    <FontAwesome name={'close'} size={25} color={'gray'} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ marginBottom: 10, padding: 5, zIndex: 8 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Country:</Text>
                                                <DropdownSearchFilter
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
                                                />
                                            </View>
                                            <View style={{ marginBottom: 10, padding: 5, zIndex: 7 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>Port:</Text>
                                                <DropdownSearchFilter
                                                    id="selectPort"
                                                    data={[`Select Port`, ...ports]} // Pass ports data with a default placeholder
                                                    selectedValue={selectedPort} // Pass the selected port
                                                    handleSelect={handleSelectPort} // Pass the handler function
                                                    placeholder="Select Port"
                                                    isActive={activeDropdown === "selectPort"} // Ensure dropdown toggling works
                                                    toggleDropdown={toggleDropdown} // Handle toggling state
                                                />
                                            </View>
                                            <View style={{ marginBottom: 10, padding: 5, zIndex: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Inspection
                                                    isToggleDisabled={isToggleDisabled}
                                                    toggleAnim={toggleAnim}
                                                    handleToggle={handleToggle}
                                                    switchTranslate={switchTranslate}
                                                    switchColor={switchColor}
                                                    setToggle={setToggle}
                                                    toggle={toggle}
                                                    handleToggleInspection={handleToggleInspection}
                                                    selectedCountry={selectedCountry}
                                                />
                                                <Insurance handleInsurance={handleInsurance} toggleInsurance={toggleInsurance} />
                                            </View>
                                            <View style={{ marginTop: 10, padding: 5, zIndex: -5 }}>
                                                <TouchableOpacity
                                                    style={{
                                                        justifyContent: 'center',
                                                        borderRadius: 5,
                                                        padding: 10,
                                                        backgroundColor: 'blue',
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => { handleCalculate(); toggleCalculatorModal(); }}
                                                >
                                                    <Text style={{ color: 'white', textAlign: 'center' }}>Calculate</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </ScrollView>





                                    </View>
                                </Modal>
                            </AnimatedRN.View>

                        )}


                        {screenWidth > 962 && (
                            <View style={{ flexDirection: screenWidth <= 962 ? 'column' : 'row', alignItems: 'center', width: '100%', justifyContent: 'center', }}>
                                <AnimatedRN.View style={{
                                    transform: [{ translateY: listTranslateY }],
                                    opacity: listOpacity,
                                    width: '100%',
                                    maxWidth: screenWidth <= 1354 ? null : 650,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#ccc',
                                    padding: 15,
                                    marginVertical: 10,
                                    height: screenWidth < 456 ? null : 300,
                                    flex: 1,
                                    backgroundColor: 'white',
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: screenWidth < 456 ? 'column' : 'row',
                                        flexWrap: 'wrap',
                                        alignItems: screenWidth < 456 ? null : 'center',
                                        justifyContent: screenWidth < 456 ? null : 'space-between',
                                        marginBottom: 10,
                                        zIndex: 10
                                    }}>
                                        <DropDownMake
                                            id="make"
                                            data={[`Select Make`, ...makes]}
                                            selectedValue={carMakes}
                                            handleSelect={setCarMakes}
                                            placeholder="Select Make"
                                            isActive={activeDropdown === "make"}
                                            toggleDropdown={toggleDropdown}
                                            setCarModels={setCarModels}
                                            setModels={setModels}
                                        />
                                        <DropdownSearchFilter
                                            id="model"
                                            data={[`Select Model`, ...models]}
                                            selectedValue={carModels}
                                            handleSelect={setCarModels}
                                            placeholder="Select Model"
                                            isActive={activeDropdown === "model"}
                                            toggleDropdown={toggleDropdown}
                                        />
                                        <DropdownSearchFilter
                                            id="bodyType"
                                            data={[`Body Type`, ...bodyType]} // Add placeholder as the first item
                                            selectedValue={carBodyType}
                                            handleSelect={setCarBodyType}
                                            placeholder="Body Type"
                                            isActive={activeDropdown === "bodyType"}
                                            toggleDropdown={toggleDropdown}
                                        />
                                    </View>
                                    <View style={{
                                        flexDirection: screenWidth < 456 ? 'column' : 'row',
                                        flexWrap: 'wrap',
                                        alignItems: screenWidth < 456 ? null : 'center',
                                        justifyContent: screenWidth < 456 ? null : 'space-between',
                                        marginBottom: 5,
                                        zIndex: 8,
                                    }}>
                                        <View style={{ alignItems: screenWidth < 456 ? 'center' : null, flexDirection: screenWidth < 456 ? 'row' : 'column', flex: 1, zIndex: 11 }}>
                                            <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 8, flex: 1 }}>
                                                <DropdownSearchFilter
                                                    id="minMileage"
                                                    data={[`Min Mileage`, ...minMileageData]} // Add "Select Min Mileage" as the first item
                                                    selectedValue={minMileage}
                                                    handleSelect={setMinMileage}
                                                    placeholder="Min Mileage"
                                                    isActive={activeDropdown === "minMileage"}
                                                    toggleDropdown={toggleDropdown}
                                                    renderItem={(item) => formatItemForDisplay(item, 'Min Mileage', 'minMileage')}
                                                />
                                            </View>
                                            <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 6, marginTop: screenWidth < 456 ? null : -10, flex: 1 }}>
                                                <DropdownSearchFilter
                                                    id="maxMileage"
                                                    data={[`Max Mileage`, ...maxMileageData]} // Add "Select Max Mileage" as the first item
                                                    selectedValue={maxMileage}
                                                    handleSelect={setMaxMileage}
                                                    placeholder="Max Mileage"
                                                    isActive={activeDropdown === "maxMileage"}
                                                    toggleDropdown={toggleDropdown}
                                                    renderItem={(item) => formatItemForDisplay(item, 'Max Mileage', 'maxMileage')}
                                                />
                                            </View>
                                        </View>

                                        <View style={{ alignItems: screenWidth < 456 ? 'center' : null, flexDirection: screenWidth < 456 ? 'row' : 'column', flex: 1, zIndex: 10 }}>
                                            <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 6, flex: 1 }}>
                                                <DropdownSearchFilter
                                                    id="minYear"
                                                    data={[`Min Year`, ...years]}  // Add "Min Year" as the first item
                                                    selectedValue={carMinYear}
                                                    handleSelect={setCarMinYear}
                                                    placeholder="Min Year"
                                                    isActive={activeDropdown === "minYear"}
                                                    toggleDropdown={toggleDropdown}
                                                />
                                            </View>
                                            <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 5, marginTop: screenWidth < 456 ? null : -10, flex: 1 }}>
                                                <DropdownSearchFilter
                                                    id="maxYear"
                                                    data={[`Max Year`, ...years]}  // Add "Max Year" as the first item
                                                    selectedValue={carMaxYear}
                                                    handleSelect={setCarMaxYear}
                                                    placeholder="Max Year"
                                                    isActive={activeDropdown === "maxYear"}
                                                    toggleDropdown={toggleDropdown}
                                                />
                                            </View>
                                        </View>

                                        <View style={{ alignItems: screenWidth < 456 ? 'center' : null, flexDirection: screenWidth < 456 ? 'row' : 'column', flex: 1, zIndex: 9 }}>
                                            <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 5, flex: 1 }}>
                                                <DropdownSearchFilter
                                                    id="minPrice"
                                                    data={[`Min Price`, ...minPriceData]} // Add "Min Price" as the first item
                                                    selectedValue={minPrice}
                                                    handleSelect={setMinPrice}
                                                    placeholder="Min Price"
                                                    isActive={activeDropdown === "minPrice"}
                                                    toggleDropdown={toggleDropdown}
                                                    renderItem={(item) => formatItemForDisplay(item, 'Min Price', 'minPrice')}
                                                />
                                            </View>
                                            <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 4, marginTop: screenWidth < 456 ? null : -10, flex: 1 }}>
                                                <DropdownSearchFilter
                                                    id="maxPrice"
                                                    data={[`Max Price`, ...maxPriceData]} // Add "Max Price" as the first item
                                                    selectedValue={maxPrice}
                                                    handleSelect={setMaxPrice}
                                                    placeholder="Max Price"
                                                    isActive={activeDropdown === "maxPrice"}
                                                    toggleDropdown={toggleDropdown}
                                                    renderItem={(item) => formatItemForDisplay(item, 'Max Price', 'maxPrice')}
                                                />
                                            </View>
                                        </View>

                                    </View>

                                    <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 9, }}>
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                padding: 10,
                                                paddingVertical: 10,
                                                paddingRight: 5,
                                                borderWidth: 2,
                                                borderColor: isActive ? 'blue' : '#eee',
                                                borderRadius: 2,
                                                marginTop: screenWidth < 644 ? 10 : 0,
                                                width: '100%',
                                                outlineStyle: 'none',

                                            }}
                                            onFocus={() => setIsActive(true)}
                                            onBlur={() => setIsActive(false)}
                                            placeholder='Search by make, model, or keyword '
                                            placeholderTextColor={'#ccc'}
                                            onChangeText={handleTextChange}
                                            defaultValue={searchKeywords.current}
                                        />
                                    </View>
                                    <View style={{ width: '100%', height: 50, paddingHorizontal: 5, }}>
                                        <TouchableOpacity
                                            style={{
                                                justifyContent: 'center',
                                                borderRadius: 5,
                                                padding: 10,
                                                backgroundColor: 'blue',
                                                alignItems: 'center',
                                                flex: 1
                                            }}
                                            onPress={() => { fetchGeneralData(); }}
                                        >
                                            <Text style={{ color: 'white' }}>Search</Text>
                                        </TouchableOpacity>
                                    </View>

                                </AnimatedRN.View>
                                <View style={{ marginHorizontal: 25 }} />
                                <AnimatedRN.View style={{
                                    transform: [{ translateY: listTranslateY }],
                                    opacity: listOpacity,
                                    backgroundColor: 'white',
                                    width: '100%',
                                    maxWidth: screenWidth <= 1354 ? null : 650,
                                    flex: screenWidth > 962 ? 1 : null,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: '#ccc',
                                    padding: 15,
                                    marginVertical: 10,
                                    height: screenWidth < 456 ? null : 300,
                                    zIndex: -2,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 5,

                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        marginBottom: 10
                                    }}>
                                        <Text style={{ fontWeight: 'bold' }}>TOTAL PRICE CALCULATOR</Text>

                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 10,
                                        zIndex: 5
                                    }}>
                                        <DropdownSearchFilter
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
                                        />
                                        <DropdownSearchFilter
                                            id="selectPort"
                                            data={[`Select Port`, ...ports]} // Pass ports data with a default placeholder
                                            selectedValue={selectedPort} // Pass the selected port
                                            handleSelect={handleSelectPort} // Pass the handler function
                                            placeholder="Select Port"
                                            isActive={activeDropdown === "selectPort"} // Ensure dropdown toggling works
                                            toggleDropdown={toggleDropdown} // Handle toggling state
                                        />

                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 10,
                                        zIndex: -2
                                    }}>
                                        <Inspection
                                            isToggleDisabled={isToggleDisabled}
                                            toggleAnim={toggleAnim}
                                            handleToggle={handleToggle}
                                            switchTranslate={switchTranslate}
                                            switchColor={switchColor}
                                            setToggle={setToggle}
                                            toggle={toggle}
                                            handleToggleInspection={handleToggleInspection}
                                            selectedCountry={selectedCountry}
                                        />
                                        <Insurance handleInsurance={handleInsurance} toggleInsurance={toggleInsurance} />

                                        <TouchableOpacity
                                            style={{
                                                justifyContent: 'center',
                                                borderRadius: 5,
                                                padding: 10,
                                                backgroundColor: 'blue'
                                            }}
                                            onPress={() => handleCalculate()}
                                        >
                                            <Text style={{ color: 'white' }}>Calculate</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ marginTop: 10, padding: 10 }}>
                                        <Text style={{
                                            flex: 1,
                                            marginBottom: 5
                                        }}>Total Price calculator will estimate the total price of the cars based on your shipping desstination port and other preferences</Text>
                                        <Text style={{
                                            flex: 1,
                                            fontSize: 12,
                                            color: 'grey'
                                        }}>Note: In some cases the total price cannot be estimated.</Text>
                                    </View>
                                </AnimatedRN.View>
                            </View>
                        )}

                    </View>

                    <View style={{ flexDirection: screenWidth <= 962 ? 'column' : 'row', width: '100%', justifyContent: 'center', padding: 10, zIndex: -5 }}>

                        <View style={{ flex: 3, maxWidth: 1350, paddingHorizontal: 10 }}>
                            <View style={{ alignSelf: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 10, }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center', // Center the content horizontally
                                            justifyContent: 'center', // Center the content vertically

                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 24, // Large font size for the count
                                                fontWeight: '700', // Bold font
                                                color: '#000', // Eye-catching blue color
                                                // Shadow blur radius
                                            }}
                                        >
                                            {count === 0 ? 0 : count}
                                        </Text>
                                        <Text
                                            style={{
                                                marginLeft: 5,
                                                fontSize: 16, // Slightly smaller font size for the description
                                                fontWeight: '400', // Regular weight for the description
                                                color: 'gray', // Subtle gray color for contrast
                                                marginTop: 4, // Space above this text
                                            }}
                                        >
                                            units found
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', alignSelf: 'flex-end' }}>
                                        <Pressable
                                            onPress={fetchPrevious}
                                            disabled={currentPage === 0}
                                            style={({ pressed, hovered }) => ({
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginHorizontal: 10,
                                                padding: 10,
                                                backgroundColor: currentPage === 0
                                                    ? '#ccc' // Disabled color (grey) if disabled
                                                    : hovered
                                                        ? '#007bff' // Hover color if enabled
                                                        : 'blue', // Default blue color if enabled
                                                opacity: pressed ? 0.7 : 1, // Slight opacity on press // Blue color on hover
                                                opacity: pressed ? 0.7 : 1, // Slightly reduce opacity when pressed
                                                justifyContent: 'center',
                                                borderRadius: 5,
                                            })}
                                        >
                                            <AntDesign name="left" size={25} color="white" />
                                        </Pressable>

                                        <Pressable
                                            onPress={fetchNext}
                                            disabled={count === 0 || (currentPage + 1) * itemsPerPage >= count}
                                            style={({ pressed, hovered }) => {
                                                const isDisabled = count === 0 || (currentPage + 1) * itemsPerPage >= count;
                                                return {
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    padding: 10,
                                                    backgroundColor: isDisabled
                                                        ? 'grey' // Grey color when disabled
                                                        : hovered
                                                            ? '#007bff' // Blue color on hover
                                                            : 'blue', // Default blue color
                                                    opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1, // Reduced opacity when disabled or pressed
                                                    justifyContent: 'center',
                                                    borderRadius: 5,
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer', // Show not-allowed cursor when disabled
                                                };
                                            }}
                                        >
                                            <AntDesign name="right" size={25} color="white" />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10, zIndex: 10 }}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: -5, alignSelf: screenWidth >= 768 ? 'flex-start' : null }}>
                                    {screenWidth >= 768 && <Text selectable={false}>Sort by</Text>}
                                    <SortBy handleIsActive={handleDropdown} isActive={activeDropdownSort === 'sortBy'} sortOptionsArray={sortOptionsArray} sortSelection={sortSelection} handleSortChange={handleSortChange} />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5, marginRight: 5 }}>
                                    {screenWidth >= 768 && <Text>View Price in</Text>}
                                    <DropDownCurrency selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} currentCurrencyGlobal={currentCurrencyGlobal} setCurrentCurrencyGlobal={setCurrentCurrencyGlobal} />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5, zIndex: 5 }}>
                                    {screenWidth >= 768 && <Text>Per Page</Text>}
                                    <PerPage handleIsActive={handleDropdown} isActive={activeDropdownSort === 'perPage'} handleItemsPerPage={handleItemsPerPage} itemsPerPage={itemsPerPage} resetPagination={resetPagination} />
                                </View>
                            </View>

                            {(isLoading && isImagesLoading) ? (
                                <View>
                                    {Array.from({ length: itemsPerPage }, (_, index) => (
                                        <LoadingComponent key={index} />
                                    ))}
                                </View>
                            ) : (
                                <FlatList
                                    data={displayItems}
                                    renderItem={renderCarItems}
                                    keyExtractor={(item) => item.id}
                                    ListEmptyComponent={() => (
                                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                                            <Text style={{ fontSize: 24, color: 'gray', fontWeight: '800' }}>No results found</Text>
                                        </View>
                                    )}
                                />

                            )}
                            <View style={{ alignSelf: 'flex-end', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignSelf: 'flex-end' }}>
                                    <Pressable
                                        onPress={fetchPrevious}
                                        disabled={currentPage === 0}
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginHorizontal: 10,
                                            padding: 10,
                                            backgroundColor: currentPage === 0
                                                ? '#ccc' // Disabled color (grey) if disabled
                                                : hovered
                                                    ? '#007bff' // Hover color if enabled
                                                    : 'blue', // Default blue color if enabled
                                            opacity: pressed ? 0.7 : 1, // Slight opacity on press // Blue color on hover
                                            opacity: pressed ? 0.7 : 1, // Slightly reduce opacity when pressed
                                            justifyContent: 'center',
                                            borderRadius: 5,
                                        })}
                                    >
                                        <AntDesign name="left" size={25} color="white" />
                                    </Pressable>

                                    <Pressable
                                        onPress={fetchNext}
                                        disabled={count === 0 || (currentPage + 1) * itemsPerPage >= count}
                                        style={({ pressed, hovered }) => {
                                            const isDisabled = count === 0 || (currentPage + 1) * itemsPerPage >= count;
                                            return {
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                padding: 10,
                                                backgroundColor: isDisabled
                                                    ? 'grey' // Grey color when disabled
                                                    : hovered
                                                        ? '#007bff' // Blue color on hover
                                                        : 'blue', // Default blue color
                                                opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1, // Reduced opacity when disabled or pressed
                                                justifyContent: 'center',
                                                borderRadius: 5,
                                                cursor: isDisabled ? 'not-allowed' : 'pointer', // Show not-allowed cursor when disabled
                                            };
                                        }}
                                    >
                                        <AntDesign name="right" size={25} color="white" />
                                    </Pressable>
                                </View>
                            </View>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={favoriteModal}
                                onRequestClose={openModalFavorite}
                            >
                                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                                    <View style={{
                                        backgroundColor: 'transparent',
                                        maxWidth: 450,
                                        width: '100%',
                                        height: '100%',
                                        maxHeight: 350,
                                        padding: 10,
                                        borderRadius: 5,
                                        shadowColor: 'black',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 5, // for Android shadow

                                    }}>
                                        {/* <TouchableOpacity onPress={() => { openModalFavorite() }} style={{ alignSelf: 'flex-end', marginRight: 5, marginBottom: 5 }}>
                                        <Text style={{ color: 'gray', fontSize: '1.2em', fontWeight: '700' }}>X</Text>
                                    </TouchableOpacity> */}
                                        <View style={{
                                            backgroundColor: '#4CAF50',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 20,
                                            borderTopLeftRadius: 10,
                                            borderTopRightRadius: 10
                                        }}>
                                            <AntDesign name="checkcircle" size={'7em'} color="white" />
                                        </View>
                                        <View style={{
                                            padding: 20,
                                            backgroundColor: 'white',
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10
                                        }}>
                                            <View style={{
                                                alignItems: 'center',
                                            }}>
                                                <Text style={{
                                                    fontSize: 24,
                                                    fontWeight: 'bold',
                                                    marginBottom: 10,
                                                }}>Success</Text>
                                                <Text style={{
                                                    fontSize: 16,
                                                    textAlign: 'center',
                                                    marginBottom: 20,
                                                }}>Added to favorites!</Text>
                                            </View>
                                            <TouchableOpacity style={{
                                                backgroundColor: '#007BFF',
                                                paddingVertical: 10,
                                                paddingHorizontal: 30,
                                                borderRadius: 5,
                                                marginBottom: 20,
                                                alignSelf: 'center',
                                            }} onPress={() => openModalFavorite()}>
                                                <Text style={{
                                                    color: 'white',
                                                    fontSize: 18,
                                                    fontWeight: 'bold',
                                                }}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>
                            </Modal>

                        </View>

                    </View>
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', alignSelf: 'center', maxWidth: 1300 }}>
                        <SignUpView />
                        <View style={{ marginHorizontal: 10 }} />
                        <WhatsAppView />
                    </View> */}

                </View>
                <StickyFooter handlePolicyClick={handlePolicyClick} setContactUsOpen={setContactUsOpen} fetchGeneralData={fetchGeneralData} handleSelectMake={handleSelectMake} handleSelectBodyType={handleSelectBodyType} />
            </View>
        </TouchableWithoutFeedback>
    )
};

export default SearchCarDesignAlpha;