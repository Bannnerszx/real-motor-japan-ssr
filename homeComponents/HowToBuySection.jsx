import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import dynamic from 'next/dynamic';
const FlatGrid = dynamic(() => import('react-native-super-grid'), { ssr: false });


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

const HowToBuySection = ({ steps, navigate, screenWidth }) => {



    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'black',
            padding: 15,
            borderRadius: 5,
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginLeft: 20,
            marginRight: 20,
            color: '#fff'
        },
        itemContainer: {
            // Reduce the margin or remove it to fit within the grid calculation
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5, // Adjusted from 10 to 5
        },
        logoContainer: {
            // Set a fixed width and height that includes the border and padding
            width: 150, // Adjusted from 180 to 170
            height: 120, // Adjusted from 130 to 120
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
            borderColor: 'white',
            borderWidth: 1,
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

    // Determine the number of items per row based on the screen width
    if (screenWidth > 992) {
        numberOfItemsPerRow = 5;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 3;
    } else {
        numberOfItemsPerRow = 2;
    }

    const spacing = screenWidth > 440 ? 30 : 10; // Spacing between items
    const totalSpacing = spacing * (numberOfItemsPerRow - 1); // Total spacing between items
    const borderWidth = styles.logoContainer.borderWidth * 2; // Total border width on both sides
    const itemContentWidth = screenWidth > 440 ? (screenWidth - totalSpacing) / numberOfItemsPerRow : 150;
    const horizontalInsets = 2 * styles.itemContainer.margin + 2 * styles.logoContainer.padding + borderWidth; // Added borderWidth here
    const itemDimension = itemContentWidth - horizontalInsets;

    const renderItem = ({ item, index }) => {

        let itemStyle;
        if (index === 0) {
            itemStyle = styles.indexZero;
        } else if (index === 3) {
            itemStyle = styles.indexThree;
        } else {
            itemStyle = styles.logoImage;
        }

        return (
            <View style={styles.itemContainer}>

                <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, }}>
                    <View
                        style={{
                            width: 70,
                            height: 70,
                            backgroundColor: '#fff',
                            borderRadius: 35,
                            justifyContent: 'center',
                            alignItems: 'center',

                        }}
                    >
                        {item.icon}
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', marginVertical: 10, padding: 5 }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: 5,
                                textAlign: 'center'
                            }}
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: '#D1D5DB',
                                textAlign: 'center'
                            }}
                        >
                            {item.description}
                        </Text>
                    </View>

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
                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'white' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>How to Buy</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <Pressable style={styles.button} onPress={() => ''}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>Learn More</Text>
                    </Pressable>
                </View>
            )}
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>How to Buy</Text>
                </View>
            )}
            <View style={{ flex: 3, marginTop: 5 }}>
                <FlatGrid
                    data={steps}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={itemDimension}
                    spacing={spacing}
                />
            </View>
            {screenWidth < 644 && (
                <Pressable
                    onPress={() => ''}
                    style={[{
                        marginTop: screenWidth < 644 ? 10 : 0,
                        alignSelf: 'center',
                    }, styles.button]}>
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>Learn More</Text>
                </Pressable>
            )}
        </View>
    );
};

export default HowToBuySection;
