import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { FlatGrid } from 'react-native-super-grid'; // Assuming you're using react-native-super-grid
import Head from 'next/head';

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

const SearchByMakes = ({ logos, svgPre }) => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: logos.map((logo, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: logo.name,
        })),
    };


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
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 5,
            flex: 1
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginLeft: 20,
            marginRight: 20
        },
        itemContainer: {
            // Reduce the margin or remove it to fit within the grid calculation
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5, // Adjusted from 10 to 5
        },
        logoContainer: {
            // Set a fixed width and height that includes the border and padding
            width: isMobile + 20, // Adjusted from 180 to 170
            height: isMobile + 10, // Adjusted from 130 to 120
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            borderWidth: 2,
            padding: 5,
            borderRadius: 3,
            borderColor: '#aaa'
        },
        logoImage: {
            // Keep as is; ensure the image fits within the logoContainer
            width: '100%',
            height: '100%',
            maxWidth: 70, // This should be less than the width of logoContainer minus padding and border
            maxHeight: 70, // This should be less than the height of logoContainer minus padding and border
            resizeMode: 'contain'
        },

        button: {
            backgroundColor: '0642F4',
            borderRadius: 5,
            height: 40,
            maxWidth: 150,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        },
        indexZero: {
            // These styles are specific to the first item; adjust dimensions as needed
            width: '100%',
            height: '100%',
            maxWidth: 170, // Adjusted to match the width of logoContainer
            maxHeight: 90, // Adjusted to be less than the height of logoContainer to accommodate marginTop
            resizeMode: 'contain',
            marginTop: 25
        },
        indexThree: {
            // These styles are specific to the fourth item; adjust dimensions as needed
            width: '100%',
            height: '100%',
            maxWidth: 110, // Adjusted to be less than the width of logoContainer minus padding and border
            maxHeight: 110, // Adjusted to be less than the height of logoContainer minus padding and border
            resizeMode: 'contain',
        }
    });

    let numberOfItemsPerRow;

    if (screenWidth > 992) {
        numberOfItemsPerRow = 5;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 5;
    } else {
        numberOfItemsPerRow = 10;
    }

    const spacing = screenWidth > 440 ? 10 : 5; // Spacing between items
    const totalSpacing = spacing * (numberOfItemsPerRow - 1); // Total spacing between items
    const borderWidth = styles.logoContainer.borderWidth * 2; // Total border width on both sides
    const itemContentWidth = screenWidth > 440 ? (screenWidth - totalSpacing) / numberOfItemsPerRow : 150;
    const horizontalInsets = 2 * styles.itemContainer.margin + 2 * styles.logoContainer.padding + borderWidth; // Added borderWidth here
    const itemDimension = itemContentWidth - horizontalInsets;
    const handleSearchOutside = () => {
        ''  // Pass selected carMake in URL
    };
    const [makeCounts, setMakeCounts] = useState({});
    console.log('make', makeCounts)
    // useEffect(() => {
    //     async function fetchCounts() {
    //         try {
    //             const counts = {};

    //             // Iterate over items and fetch counts for each make
    //             for (const item of logos) {
    //                 const vehicleProductsRef = collection(projectExtensionFirestore, "VehicleProducts");

    //                 // Create a query dynamically using item.name for the make
    //                 const filteredQuery = query(
    //                     vehicleProductsRef,
    //                     where("stockStatus", "==", "On-Sale"),
    //                     where("imageCount", ">", 0),
    //                     where("make", "==", item.name)
    //                 );

    //                 // Get the count from Firestore
    //                 const snapshot = await getCountFromServer(filteredQuery);

    //                 // Store the count in the dictionary
    //                 counts[item.name] = snapshot.data().count || 0;
    //             }

    //             // Update state with the counts
    //             setMakeCounts(counts);

    //         } catch (error) {
    //             console.error("Error fetching make counts:", error);
    //             // setLoading(false);
    //         }
    //     }

    //     fetchCounts(); // Call the async function
    // }, [logos]);
    const renderItem = ({ item, index }) => {
        const handleSearch = () => {
            ''  // Pass selected carMake in URL
        };
        let itemStyle;
        if (index === 0) {
            itemStyle = styles.indexZero;
        } else if (index === 3) {
            itemStyle = styles.indexThree;
        } else {
            itemStyle = styles.logoImage;
        }
        const truncatedName = (screenWidth >= 993 && screenWidth <= 1037) ?
            (item.name.length > 5 ? `${item.name.substring(0, 8)}...` : item.name) :
            item.name;
        return (
            <View style={styles.itemContainer}>
                <Head>
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                </Head>

                <Pressable
                    style={({ pressed, hovered }) => [
                        {
                            opacity: pressed ? 0.5 : 1,
                            shadowColor: hovered ? '#000' : 'transparent',
                            shadowOffset: hovered ? { width: 0, height: 2 } : { width: 0, height: 0 },
                            shadowOpacity: hovered ? 0.25 : 0,
                            shadowRadius: hovered ? 3.84 : 0,
                            borderRadius: hovered ? 50 : 0,
                            margin: 5,
                            alignItems: 'center',
                        },
                        styles.logoContainer
                    ]}
                    onPress={() => handleSearch(item.name)}
                >
                    {item.logo}
                </Pressable>

                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, []]}>
                    <Text
                        style={{
                            marginRight: 5,
                            textAlign: 'center',
                            width: 110
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {truncatedName.split('-')[0]}{' '}
                        <Text
                            style={{
                                fontWeight: '700',
                                textDecorationLine: 'underline',
                                textDecorationStyle: 'solid'
                            }}
                        >
                            {makeCounts[item.name] || 0}
                        </Text>
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
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginLeft: -35, }}>
                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'black' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>Search by Makers</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <Pressable
                        onPress={handleSearchOutside}
                        style={[{
                            marginTop: screenWidth < 644 ? 10 : 0,
                            alignSelf: 'center',
                        }, {
                            backgroundColor: '#0642F4',
                            borderRadius: 5,
                            height: 40,
                            maxWidth: 150,
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }]}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Makers</Text>
                    </Pressable>
                </View>
            )}
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>Search by Makers</Text>
                </View>
            )}
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={logos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={itemDimension}
                    spacing={spacing}
                />
                <div style={{ display: 'none' }}>
                    <ul>
                        {logos.map((logo) => (
                            <li key={logo.id}>{logo.name}</li>
                        ))}
                    </ul>
                </div>
            </View>
            {screenWidth < 644 && (
                <Pressable
                    onPress={handleSearchOutside}
                    style={[{
                        marginTop: screenWidth < 644 ? 10 : 0,
                        alignSelf: 'center',
                    }, {
                        backgroundColor: '#0642F4',
                        borderRadius: 5,
                        height: 40,
                        maxWidth: 150,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }]}>
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Makers</Text>
                </Pressable>
            )}
        </View>
    );

};

export default SearchByMakes;
