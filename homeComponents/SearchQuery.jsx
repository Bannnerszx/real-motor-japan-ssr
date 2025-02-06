'use client'
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Entypo, AntDesign } from '@expo/vector-icons';
const DropDownMake = ({
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
const SlantedButton = () => {

    const styles = StyleSheet.create({
        buttonDefault: {
            color: 'white',
            backgroundColor: '#0000ff',
            textAlign: 'center',
            textTransform: 'uppercase',
            padding: 9,
            margin: 10,
            borderRadius: 5,
            maxWidth: 160,
            zIndex: -1,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            paddingLeft: 10
        },
        buttonSlanted: {
            transform: [{ skewX: '20deg' }],
            zIndex: -2
        },
        buttonContent: {
            transform: [{ skewX: '-20deg' }],
            color: '#fff',
            fontWeight: '700',
            fontSize: 12,
            marginLeft: 5
        },
        leftOverlay: {
            transform: [{ skewX: '-20deg' }],
            position: 'absolute',
            left: -10,
            top: 0,
            bottom: 0,
            width: 25,
            backgroundColor: '#0000ff',
            borderTopLeftRadius: 5,
            zIndex: -2

        }
    });

    return (
        <View style={[styles.buttonDefault, styles.buttonSlanted]}>
            <View style={styles.leftOverlay} />
            <Entypo name="magnifying-glass" size={20} color={'#fff'} style={{ transform: [{ skewX: '-20deg' }] }} />
            <Text style={styles.buttonContent}>Find Used Cars</Text>
        </View>
    );
};

const SearchQuery = ({
    // fetchBodyTypes,
    // fetchMakes,
    // fetchModels,
    screenWidth,
    carouselHeight,
    listTranslateY,
    listOpacity,
    makes,
    carMakes,
    setCarMakes,
    models,
    carModels,
    setCarModels,
    bodyType,
    carBodyType,
    setCarBodyType,
    minPriceData,
    maxPriceData,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    years,
    carMinYear,
    setCarMinYear,
    carMaxYear,
    setCarMaxYear,
    minMileageData,
    maxMileageData,
    minMileage,
    setMinMileage,
    maxMileage,
    setMaxMileage,
    activeDropdown,
    toggleDropdown,
    isActive,
    setIsActive,
    handleTextChange,
    handleSearch,
    isFetchingMakes
}) => {
    const imageHeight = screenWidth * (5 / 16); // Calculate height for 16:9 ratio
    const imageHeightPhone = 200; // Calculate height for 16:9 ratio
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

    return (
        <Animated.View
            style={{
                // transform: [{ translateY: listTranslateY }],
                // opacity: listOpacity,
                alignSelf: 'center',
                backgroundColor: 'white',
                maxWidth: 1280,
                width: '100%',
                minHeight: screenWidth < 664 ? 480 : 260,
                padding: 10,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
                zIndex: 3333,
           
            }}
        >
            <View
                style={{
                    position: 'absolute',
                    top: screenWidth < 644 ? '-10%' : '-19%',
                    left: 0,
                    right: 0,
                    zIndex: 2,
                }}
            >
                <SlantedButton />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', zIndex: 10 }}>
                <DropDownMake
                    setIsActive={setIsActive}
                    id="make"
                    data={[`Select Make`, ...makes]}
                    selectedValue={carMakes}
                    handleSelect={setCarMakes}
                    placeholder="Select Make"
                    isActive={activeDropdown === "make"}
                    toggleDropdown={async (id) => {
                        toggleDropdown(id); // Pass the dropdown ID
                        if (makes.length === 0) {
                            // await fetchMakes(); // Fetch makes only if not already loaded
                        }
                    }}
                />
                <DropDownMake
                    id="model"
                    data={[`Select Model`, ...models]}
                    selectedValue={carModels}
                    handleSelect={setCarModels}
                    placeholder="Select Model"
                    isActive={activeDropdown === "model"}
                    toggleDropdown={async (id) => {
                        toggleDropdown(id); // Pass the dropdown ID
                        if (models.length === 0) {
                            // await fetchModels(); // Fetch makes only if not already loaded
                        }
                    }}
                />
                {screenWidth >= 644 ? (
                    <DropDownMake
                        id="bodyType"
                        data={[`Body Type`, ...bodyType]} // Add placeholder as the first item
                        selectedValue={carBodyType}
                        handleSelect={setCarBodyType}
                        placeholder="Body Type"
                        isActive={activeDropdown === "bodyType"}
                        toggleDropdown={async (id) => {
                            toggleDropdown(id); // Pass the dropdown ID
                            if (bodyType.length === 0) {
                                // await fetchBodyTypes(); // Fetch makes only if not already loaded
                            }
                        }}
                    />

                ) : null}
            </View>
            {screenWidth < 644 && (
                <View style={{
                    flexDirection: 'column',
                }}><View style={{ flexDirection: 'row', zIndex: 10 }}>
                        <DropDownMake
                            id="bodyType"
                            data={[`Body Type`, ...bodyType]} // Add placeholder as the first item
                            selectedValue={carBodyType}
                            handleSelect={setCarBodyType}
                            placeholder="Body Type"
                            isActive={activeDropdown === "bodyType"}
                            toggleDropdown={async (id) => {
                                toggleDropdown(id); // Pass the dropdown ID
                                if (bodyType.length === 0) {
                                    // await fetchBodyTypes(); // Fetch makes only if not already loaded
                                }
                            }}
                        />

                    </View>
                    <View style={{ flexDirection: 'row', zIndex: 9 }}>
                        <DropDownMake
                            id="minPrice"
                            data={['Min Price', ...minPriceData]}     // Keep raw data unchanged
                            selectedValue={minPrice}                  // Use the raw value for selection
                            handleSelect={setMinPrice}                // Raw value is passed on selection
                            placeholder="Min Price"
                            isActive={activeDropdown === "minPrice"}
                            toggleDropdown={toggleDropdown}
                            renderItem={(item) => formatItemForDisplay(item, 'Min Price', 'minPrice')} // Render formatted text
                        />
                        <DropDownMake
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
                    <View style={{ flexDirection: 'row', zIndex: 8 }}>
                        <DropDownMake
                            id="minYear"
                            data={[`Min Year`, ...years]}  // Add "Min Year" as the first item
                            selectedValue={carMinYear}
                            handleSelect={setCarMinYear}
                            placeholder="Min Year"
                            isActive={activeDropdown === "minYear"}
                            toggleDropdown={toggleDropdown}
                        />
                        <DropDownMake
                            id="maxYear"
                            data={[`Max Year`, ...years]}  // Add "Max Year" as the first item
                            selectedValue={carMaxYear}
                            handleSelect={setCarMaxYear}
                            placeholder="Max Year"
                            isActive={activeDropdown === "maxYear"}
                            toggleDropdown={toggleDropdown}
                        />

                    </View>
                    <View style={{ flexDirection: 'row', zIndex: 7 }}>
                        <DropDownMake
                            id="minMileage"
                            data={[`Min Mileage`, ...minMileageData]} // Add "Select Min Mileage" as the first item
                            selectedValue={minMileage}
                            handleSelect={setMinMileage}
                            placeholder="Min Mileage"
                            isActive={activeDropdown === "minMileage"}
                            toggleDropdown={toggleDropdown}
                            renderItem={(item) => formatItemForDisplay(item, 'Min Mileage', 'minMileage')}
                        />
                        <DropDownMake
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
            )}
            {screenWidth >= 644 ? (
                <View style={{ flexDirection: 'row', zIndex: 9 }}>
                    <DropDownMake
                        id="minPrice"
                        data={['Min Price', ...minPriceData]}     // Keep raw data unchanged
                        selectedValue={minPrice}                  // Use the raw value for selection
                        handleSelect={setMinPrice}                // Raw value is passed on selection
                        placeholder="Min Price"
                        isActive={activeDropdown === "minPrice"}
                        toggleDropdown={toggleDropdown}
                        renderItem={(item) => formatItemForDisplay(item, 'Min Price', 'minPrice')} // Render formatted text
                    />
                    <DropDownMake
                        id="minYear"
                        data={[`Min Year`, ...years]} // Add "Min Year" as the first item
                        selectedValue={carMinYear}
                        handleSelect={setCarMinYear}
                        placeholder="Min Year"
                        isActive={activeDropdown === "minYear"}
                        toggleDropdown={toggleDropdown}
                    />
                    <DropDownMake
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
            ) : null}

            {screenWidth >= 644 ? (
                <View style={{ flexDirection: 'row', zIndex: 8, marginTop: 8 }}>
                    <DropDownMake
                        id="maxPrice"
                        data={[`Max Price`, ...maxPriceData]} // Add placeholder as the first item
                        selectedValue={maxPrice}
                        handleSelect={setMaxPrice}
                        placeholder="Max Price"
                        isActive={activeDropdown === "maxPrice"}
                        toggleDropdown={toggleDropdown}
                        renderItem={(item) => formatItemForDisplay(item, 'Max Price', 'maxPrice')}
                    />
                    <DropDownMake
                        id="maxYear"
                        data={[`Max Year`, ...years]} // Add "Max Year" as the first item
                        selectedValue={carMaxYear}
                        handleSelect={setCarMaxYear}
                        placeholder="Max Year"
                        isActive={activeDropdown === "maxYear"}
                        toggleDropdown={toggleDropdown}
                    />
                    <DropDownMake
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
            ) : null}

            <View
                style={{
                    flexDirection: screenWidth < 644 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    zIndex: -6,
                    padding: 5,
                    flex: 1,
                    alignItems: 'center',
                }}
            >
                <TextInput
                    style={{
                        padding: 15,
                        borderWidth: 2,
                        borderColor: isActive ? 'blue' : '#eee',
                        borderRadius: 2,
                        marginTop: screenWidth < 644 ? 10 : 0,
                        width: '100%',
                        outlineStyle: 'none',
                        flex: screenWidth < 644 ? null : 3,
                    }}
                    onFocus={() => setIsActive(true)}
                    onBlur={() => setIsActive(false)}
                    placeholder="Search by make, model, or keyword"
                    placeholderTextColor={'#ccc'}
                    onChangeText={handleTextChange}
                />

                <Pressable
                    onPress={() => handleSearch()}
                    style={({ pressed, hovered }) => [
                        {
                            maxWidth: screenWidth < 644 ? '100%' : '20%',
                            flex: screenWidth < 644 ? null : 1,
                            margin: 5,
                            alignSelf: screenWidth < 644 ? 'flex-end' : null,
                            backgroundColor: hovered ? '#3366CC' : 'blue',
                            paddingVertical: 10,
                            paddingHorizontal: 90,
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: screenWidth < 644 ? 10 : 0,
                            width: screenWidth < 644 ? '100%' : undefined,
                            transition: 'all 0.3s ease-in-out',
                            transform: hovered ? [{ translateY: -2 }] : [{ translateY: 0 }],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: hovered ? 10 : 2 },
                            shadowOpacity: hovered ? 0.3 : 0.1,
                            shadowRadius: hovered ? 8 : 4,
                        },
                    ]}
                >
                    <Text selectable={false} style={{ color: 'white', fontWeight: '600', fontSize: 22 }}>
                        Search
                    </Text>
                </Pressable>
            </View>
        </Animated.View>
    );
};

export default SearchQuery;
