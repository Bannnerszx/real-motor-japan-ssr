import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { FlatGrid } from 'react-native-super-grid'; // Assuming you're using react-native-super-grid

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

const SearchByTypes = ({ types }) => {
    const navigate = ''
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);


    let isMobile = screenWidth > 440 ? 120 : 60
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
            marginRight: 20,
        },
        itemContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        logoContainer: {
            width: isMobile,
            height: isMobile,
            borderRadius: 5,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        button: {
            backgroundColor: 'black',
            borderWidth: 2,
            borderColor: 'white',
            borderRadius: 5,
            height: 40,
            maxWidth: 150,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    const handleSearchOutside = () => {
       ''
    };
    let numberOfItemsPerRow;

    if (screenWidth > 992) {
        // Desktop: 1 row, 6 columns
        numberOfItemsPerRow = 6;
    } else if (screenWidth > 440) {
        // Tablet/Mid-Screen: 1 row, 6 columns (similar behavior as desktop)
        numberOfItemsPerRow = 3;
    } else {
        // Mobile: 2 columns (3 rows)
        numberOfItemsPerRow = 2;
    }

    // Spacing between items
    const spacing = screenWidth > 440 ? 10 : 5;

    // Total spacing for the row
    const totalSpacing = spacing * (numberOfItemsPerRow - 1);

    // Calculate available width for items
    const availableWidth = screenWidth - totalSpacing;

    // Item width for the grid
    const itemDimension = availableWidth / numberOfItemsPerRow;

    // Adjust for borders, padding, and margins (if applicable)
    const borderWidth = styles.logoContainer.borderWidth * 2 || 0; // Safeguard for undefined styles
    const horizontalInsets =
        2 * (styles.itemContainer?.margin || 0) +
        2 * (styles.logoContainer?.padding || 0) +
        borderWidth;

    const finalItemDimension = itemDimension - horizontalInsets;
    const capitalizeFirstLetter = (str) => {
        // Leave "SUV" as is
        if (str.toUpperCase() === "SUV") {
            return "SUV";
        }
        // Capitalize the first letter for other cases
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    const [typeCounts, setTypeCounts] = useState({});
    const formatItemName = (name) => {
        if (!name) return ""; // Handle null/undefined cases
    
        // Special case for "SUV"
        if (name.toUpperCase() === "SUV") {
            return "SUV"; // Return unchanged
        }
    
        // Special case for "Van/Minivan"
        if (name.toUpperCase() === "VAN/MINIVAN") {
            return "Van/Minivan"; // Format specifically
        }
    
        // Default formatting: Capitalize the first letter, lowercase the rest
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };
    // useEffect(() => {
    //     ;
    //     async function fetchCounts() {
    //         try {
    //             const counts = {};

    //             // Iterate over items and fetch counts for each make
    //             for (const item of types) {
    //                 const vehicleProductsRef = collection(projectExtensionFirestore, "VehicleProducts");

    //                 // Create a query dynamically using item.name for the make
    //                 const filteredQuery = query(
    //                     vehicleProductsRef,
    //                     where("stockStatus", "==", "On-Sale"),
    //                     where("imageCount", ">", 0),
    //                     where("bodyType", "==", formatItemName(item.name))
    //                 );

    //                 // Get the count from Firestore
    //                 const snapshot = await getCountFromServer(filteredQuery);

    //                 // Store the count in the dictionary
    //                 counts[item.name] = snapshot.data().count || 0;
    //             }

    //             // Update state with the counts
    //             setTypeCounts(counts);

    //         } catch (error) {
    //             console.error("Error fetching make counts:", error);
    //             setLoading(false);
    //         }
    //     }

    //     fetchCounts(); // Call the async function
    // }, [types]);
    const renderItem = ({ item }) => {
        const formattedName = formatItemName(item.name);
        const handleSearch = () => {
           ' navigate(`/SearchCarDesign?keywords=&carModels=&carMakes=&carBodyType=${formattedName}&carMinYear=&carMaxYear=&minMileage=&maxMileage=&minPrice=&maxPrice=`);'
        };

        return (
            <View style={styles.itemContainer}>
                <Pressable
                    style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.5 : 1,
                            transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                            margin: 5,
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                            transition: 'transform 0.2s ease-in-out',
                        },
                    ]}
                    onPress={() => handleSearch(formattedName)}
                >
                    {item.logo}
                </Pressable>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: 'white' }}>{item.name} </Text>
                    <Text
                        style={{
                            fontWeight: '700',
                            textDecorationLine: 'underline',
                            textDecorationStyle: 'solid',
                            color: 'white'
                        }}
                    >
                        {typeCounts[item.name] || 0}
                    </Text>
                </View>
            </View>
        );
    };


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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.title}>Search by Type</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <Pressable style={styles.button} onPress={handleSearchOutside}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Type</Text>
                    </Pressable>
                </View>
            )}

            {screenWidth < 644 && (
                <View style={{ alignSelf: 'center' }}>
                    <Text style={styles.title}>Search by Type</Text>
                </View>
            )}
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={types}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={finalItemDimension}
                    spacing={spacing}
                />
            </View>
            {screenWidth < 644 && (
                <Pressable
                    onPress={handleSearchOutside}
                    style={[
                        {
                            marginTop: screenWidth < 644 ? 10 : 0,
                            alignSelf: 'center',
                        },
                        styles.button,
                    ]}
                >
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Type</Text>
                </Pressable>
            )}
        </View>
    );
};

export default SearchByTypes;