import React, { useState, useEffect, useRef } from "react";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { View, Pressable, Text, FlatList, TextInput } from "react-native";
import { projectExtensionFirestore } from "../firebaseConfig/firebaseConfig";
import { AntDesign } from "@expo/vector-icons";
const DropDownMake = React.memo(
    ({
        id,
        data = [],
        selectedValue,
        handleSelect,
        placeholder,
        isActive,
        toggleDropdown,
        context
    }) => {
        console.log("Rendering DropDownMake:", id);

        const [hoveredIndex, setHoveredIndex] = useState(null);
        const [searchQuery, setSearchQuery] = useState(selectedValue || "");
        const [filteredData, setFilteredData] = useState([]); // Holds the filtered data
        const [isFiltering, setIsFiltering] = useState(false);
        const textInputRef = useRef(null);

        useEffect(() => {
            if (!data) return;

            // Initialize the Web Worker
            const worker = new Worker(new URL("./firebaseWorker.jsx", import.meta.url));
            setIsFiltering(true);

            // Send data and searchQuery to the worker
            worker.postMessage({ data, searchQuery });

            // Receive filtered data from the worker
            worker.onmessage = (e) => {
                setFilteredData(e.data); // Set the filtered data into state
                setIsFiltering(false);
                worker.terminate(); // Terminate the worker after use
            };

            worker.onerror = (err) => {
                console.error("Worker error:", err);
                setIsFiltering(false);
                worker.terminate();
            };

            return () => {
                worker.terminate(); // Cleanup worker if the component unmounts
            };
        }, [data, searchQuery]); // Re-run when data or searchQuery changes

        // Reset search query when selected value changes
        useEffect(() => {
            if (selectedValue) setSearchQuery("");
        }, [selectedValue]);
        const [viewDimensions, setViewDimensions] = useState({ width: 0, height: 0, top: 0, });

        const handleViewLayout = (event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setViewDimensions({ width, height, top: y + height, });
        };
        // Create a reference for TextInput
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
        return (
            <View
                accessibilityState={{ expanded: isActive }}
                style={{ flex: 3, zIndex: -99 }}
            >

                <Pressable
                    onLayout={handleViewLayout}
                    onPress={handlePress}
                    style={{
                        padding: 10,
                        borderWidth: 2,
                        borderColor: isActive ? "#0000ff" : "#eee",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <View style={{ flex: 3, justifyContent: "flex-start", width: "100%" }}>
                        {isActive ? (
                            <TextInput
                                ref={textInputRef}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder={`${placeholder}...`}
                                placeholderTextColor="#a5a5a5"
                                style={{
                                    position: "absolute",
                                    paddingLeft: 10,
                                    height: viewDimensions.height,
                                    width: viewDimensions.width - 30,
                                    marginLeft: -10,
                                    top: -20,
                                    outlineStyle: "none",
                                }}
                            />
                        ) : (
                            <Text
                                selectable={false}
                                style={{ fontWeight: "500" }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {selectedValue || placeholder}
                            </Text>
                        )}
                    </View>
                    <View style={{ justifyContent: "flex-end", alignSelf: "center" }}>
                        <AntDesign
                            name="down"
                            color="blue"
                            size={15}
                            style={isActive ? { transform: [{ rotate: "180deg" }] } : null}
                        />
                    </View>
                </Pressable>


                {isActive && (
                    <View
                        style={{
                            width: '100%',
                            position: "absolute",
                            top: viewDimensions.top,
                            right: -5,
                            backgroundColor: "white",
                            borderColor: "#ddd",
                            borderWidth: 1,
                            maxHeight: 200,
                            margin: 5,
                            zIndex: 999,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5,
                            overflow: context === 'chat' ? 'scroll' : null

                        }}

                    >
                        <View style={{ maxHeight: 200 }}>
                            <FlatList
                                style={{ zIndex: -9 }}
                                nestedScrollEnabled

                                data={filteredData}
                                keyExtractor={(item, index) => index.toString()}
                                initialNumToRender={10}
                                windowSize={5}
                                renderItem={({ item, index }) => (
                                    <Pressable
                                        onHoverIn={() => setHoveredIndex(index)}
                                        onHoverOut={() => setHoveredIndex(null)}
                                        onPress={() => {
                                            handleSelect(item === placeholder ? "" : item);
                                            toggleDropdown(null);
                                        }}
                                        style={{
                                            backgroundColor: hoveredIndex === index ? "blue" : "transparent",
                                        }}
                                    >
                                        <Text
                                            selectable={false}
                                            style={{
                                                padding: 10,
                                                fontWeight: "600",
                                                color: hoveredIndex === index ? "white" : "black",
                                            }}
                                        >
                                            {item}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        </View>
                    </View>
                )}

            </View>
        );
    },
    (prevProps, nextProps) =>
        prevProps.data === nextProps.data &&
        prevProps.selectedValue === nextProps.selectedValue &&
        prevProps.isActive === nextProps.isActive
);
const CountryCityDropdown = ({ activeDropdown, setActiveDropDown, toggleDropdown, area,
    selectedCountryCode,
    setSelectedCountryCode,
    selectedCity,
    setSelectedCity,
    setSelectedCountryCodeNotify,
    selectedCountryCodeNotify,
    selectedCityNotify,
    setSelectedCityNotify,
    context
}) => {
    const [countries, setCountries] = useState([]); // List of countries
    // Selected country code
    const [cities, setCities] = useState([]); // List of cities for the selected country

    useEffect(() => {
        if (selectedCountryCode) {
            // Only reset city and cities if there is no auto-filled value
            if (!selectedCity) {
                setCities([]);
                fetchCities(selectedCountryCode); // Fetch cities based on the selected country
            }
        }
    }, [selectedCountryCode, selectedCity]);

    useEffect(() => {
        if (selectedCountryCodeNotify) {
            setSelectedCityNotify('');
            setCities([]);
        }
    }, [selectedCountryCodeNotify]);
    // Fetch countries from the "CountryData" document
    const fetchCountries = async () => {
        try {
            const docRef = doc(projectExtensionFirestore, "CustomerCountryPort", "CountryData");
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const data = snapshot.data();

                if (data.countries) {
                    // Map the countries array to an array of objects with name and isoCode
                    const countryList = data.countries.map((country) => ({
                        name: country.name, // e.g., "Afghanistan"
                        code: country.isoCode, // e.g., "AF"
                    }));

                    setCountries(countryList); // Set the countries state
                }
            } else {
                console.error("CountryData document does not exist.");
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    // Fetch cities based on the selected country code
    const fetchCities = async (countryCode) => {
        try {
            const cityChunksRef = collection(projectExtensionFirestore, "cities", countryCode, "CityChunks");
            const snapshot = await getDocs(cityChunksRef);

            const cityList = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.cities) {
                    cityList.push(...data.cities.map((city) => city.name)); // Extract city names
                }
            });

            setCities(cityList.sort()); // Sort the cities alphabetically
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    // Fetch countries on mount
    useEffect(() => {
        fetchCountries();
    }, []);

    return (    
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 500, flex: 1 }}>
            <View style={{ zIndex: 8, flex: 1, }}>
                <DropDownMake
                    context={context}
                    id={`${area}-country`}
                    data={countries.map((country) => country.name)} // Display country names
                    selectedValue={(area === 'consignee' ? selectedCountryCode.name : selectedCountryCodeNotify.name) || ""} // Show selected country name
                    handleSelect={(name) => {
                        const selected = countries.find((country) => country.name === name);
                        if (selected) {
                            area === 'consignee' ? setSelectedCountryCode({ code: selected.code, name: selected.name }) : setSelectedCountryCodeNotify({ code: selected.code, name: selected.name }) // Set the country code
                            fetchCities(selected.code); // Fetch cities for the selected country
                        }

                    }}
                    placeholder="Select Country"
                    isActive={activeDropdown === `${area}-country`}
                    toggleDropdown={(id) => toggleDropdown(id)}
                />
            </View>
            <View style={{ marginHorizontal: 5 }} />
            <View style={{ zIndex: 8, flex: 1 }}>
                <DropDownMake
                    context={context}
                    id={`${area}-city`}
                    data={cities} // Pass city names directly
                    selectedValue={area === 'consignee' ? selectedCity : selectedCityNotify} // Show the selected city
                    handleSelect={(city) => {
                        area === 'consignee' ? setSelectedCity(city) : setSelectedCityNotify(city) // Set the selected city
                    }}
                    placeholder="Select City"
                    isActive={activeDropdown === `${area}-city`}
                    toggleDropdown={(id) => toggleDropdown(id)}
                />
            </View>
        </View>
    );
};

export default CountryCityDropdown;
