import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated as AnimatedRN, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button, TouchableWithoutFeedback } from 'react-native';
import React, { useMemo, useEffect, useState, useRef, useContext, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // Use legacy build for browser compatibility
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const PdfViewer = ({ selectedChatData, bookingData, context }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenHeight(window.height);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);


    const [modalVisible, setModalVisible] = useState(false);
    const handlePress = () => {
        setModalVisible(true);
    };
    const handleModalClose = () => {
        setModalVisible(false);
    };
    const [scale, setScale] = useState(1.3); // Initial scale
    const downloadURL = context === 'BL' ? bookingData?.bL?.url : bookingData?.sI?.url;
    const canvasRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [totalPages, setTotalPages] = useState(0);
    const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        if (!downloadURL) return;

        const loadPdfPage = async (pageNumber) => {
            if (!canvasRef.current) return;

            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
                const pdf = await pdfjsLib.getDocument(downloadURL).promise;

                // Set total pages on first load
                if (totalPages === 0) setTotalPages(pdf.numPages);

                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale }); // Use dynamic scale

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                setPdfDimensions({ width: viewport.width, height: viewport.height });

                // Check orientation
                setIsLandscape(viewport.width > viewport.height);

                await page.render({ canvasContext: context, viewport }).promise;
            } catch (error) {
                console.error("Error loading PDF:", error);
            }
        };

        if (modalVisible && downloadURL) {
            loadPdfPage(currentPage); // Load page with current scale
        }
    }, [modalVisible, downloadURL, currentPage, scale, selectedChatData]);
    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleOpenLink = () => {
        Linking.openURL(downloadURL);
    };


    const { adjustedWidth, adjustedHeight } = useMemo(() => {
        const scaleFactor = screenWidth <= 992 ? 0.5 : 0.8; // Base scale factor for device width

        // Determine initial dimensions based on orientation and screen size
        let adjustedWidth = pdfDimensions.width;
        let adjustedHeight = pdfDimensions.height;

        if (isLandscape) {
            const additionalScale = screenWidth <= 425 ? 0.8 : 1;

            adjustedWidth = pdfDimensions.width * scaleFactor * 0.7 * additionalScale;
            adjustedHeight = pdfDimensions.height * scaleFactor * 0.7 * additionalScale;
        } else {
            // For portrait orientation, ensure it fits within the screen bounds
            const heightScale = screenHeight / pdfDimensions.height;
            const widthScale = screenWidth / pdfDimensions.width;
            const portraitScaleFactor = Math.min(heightScale, widthScale, scaleFactor);

            // Apply an additional scaling adjustment for small screens only
            const additionalScale = screenHeight <= 600 ? 0.69 : 0.9;

            adjustedWidth = pdfDimensions.width * portraitScaleFactor * additionalScale;
            adjustedHeight = pdfDimensions.height * portraitScaleFactor * additionalScale;
        }

        // Ensure adjustedHeight does not exceed screenHeight, preserving readability
        if (adjustedHeight > screenHeight) {
            const overflowScaleFactor = screenHeight / adjustedHeight;
            adjustedHeight = screenHeight;
            adjustedWidth *= overflowScaleFactor; // Maintain aspect ratio
        }

        return { adjustedWidth, adjustedHeight };
    }, [screenWidth, screenHeight, pdfDimensions, isLandscape, modalVisible]);

    const zoomIn = () => {
        setScale((prevScale) => prevScale + 0.1); // Increase scale for zoom in
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Decrease scale for zoom out, with a minimum limit
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed, hovered }) => ({
                backgroundColor: pressed
                    ? '#8CAFF8'
                    : hovered
                        ? '#B0C7FB'
                        : '#E5EBFE',
                borderRadius: 5,
                paddingVertical: 6,
                paddingHorizontal: 20,
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1
            })}
        >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Open</Text>
            {modalVisible && (
                <Modal
                    transparent={true}
                    animationType='fade'
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 10,
                        backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for modal background
                    }}>
                        <TouchableOpacity onPress={handleModalClose} style={{
                            ...StyleSheet.absoluteFillObject,
                        }} />
                        <View style={styles.container}>

                            <View style={styles.toolbar}>
                                <TouchableOpacity onPress={handleOpenLink} style={styles.downloadButton}>
                                    <MaterialCommunityIcons size={20} name="download" color="white" />
                                    <Text style={styles.downloadText}>Download PDF</Text>
                                </TouchableOpacity>
                            </View>

                            <View
                                style={[
                                    styles.canvasContainer,
                                    {
                                        width: adjustedWidth,
                                        height: adjustedHeight,
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 10,
                                        elevation: 5, // For Android
                                    },
                                ]}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'hidden'// Optional, for rounded corners
                                }}>
                                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                                </div>
                            </View>


                            <View style={styles.pagination}>
                                <TouchableOpacity onPress={goToPreviousPage} disabled={currentPage === 1} style={styles.navButton}>
                                    <Text style={[styles.navText, { color: currentPage === 1 ? 'gray' : 'blue' }]}>Previous</Text>
                                </TouchableOpacity>
                                <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
                                <TouchableOpacity onPress={goToNextPage} disabled={currentPage === totalPages} style={styles.navButton}>
                                    <Text style={[styles.navText, { color: currentPage === totalPages ? 'gray' : 'blue' }]}>Next</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => zoomOut()}>
                                    <MaterialIcons name="remove" size={20} color="gray" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => zoomIn()}>
                                    <MaterialIcons name="add" size={20} color="gray" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </Pressable>

    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        position: 'relative',
        alignItems: 'center',
    },
    toolbar: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    downloadButton: {
        flexDirection: 'row',
        backgroundColor: '#16A34A',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    downloadText: {
        color: 'white',
        marginLeft: 5,
    },
    canvasContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        borderColor: '#ddd',
        borderWidth: 1,
        marginTop: 50, // Spacing between the toolbar and the canvas
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderColor: '#ddd',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        width: '100%',
        marginTop: 10,
    },
    navButton: {
        marginHorizontal: 10,
    },
    navText: {
        fontSize: 16,
    },
    pageText: {
        fontSize: 14,
        color: 'gray',
        marginHorizontal: 15,
    },
});

export default PdfViewer;