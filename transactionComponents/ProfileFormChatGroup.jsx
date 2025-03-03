'use client'
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated as AnimatedRN, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState, useRef, useContext, useCallback, useMemo } from 'react';
import { SimpleLineIcons, FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto, MaterialIcons, Feather } from '@expo/vector-icons';
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc, limit, startAfter } from 'firebase/firestore';
import { projectExtensionFirestore, projectExtensionStorage } from '../firebaseConfig/firebaseConfig';
import { Button as NativeBaseButton, NativeBaseProvider, Pressable as NativeBasePressable, extendTheme, Spinner, PresenceTransition, Modal as NativeBaseModal, Fab } from 'native-base';

import { getDownloadURL, ref, uploadBytes, getMetadata } from "firebase/storage";

import { Calendar } from 'react-native-calendars';
import moment from 'moment/moment';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import noCar from '../assets/No Car Image Found.webp'
import imageLogo from '../assets/RMJ logo for invoice.png'
import hankoOnline from '../assets/RMJ Invoice Signature with Hanko.png'
import { head, max, over } from 'lodash';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // Use legacy build for browser compatibility
import PdfViewer from './PdfViewer';
import CountryCityDropdown from './CountryCityDropDown'
import Alert from './Alerts';
const ipInfo = process.env.IP_INFO;
const timeApi = process.env.TIME_API;

const feedBackData = process.env.FEED_BACK_DATA;
const fetchDetails = process.env.FETCH_FILE_DETAILS;
const updateInvoiceAndVehicle = process.env.UPDATE_INVOICE_AND_VEHICLE;
let formattedIssuingDate;
let formattedDueDate;
const mobileViewBreakpoint = 768;

const LoadingComponent = ({ heightDimension }) => {
    const styles = StyleSheet.create({

        shimmerOverlay: {
            zIndex: 99,
            position: 'absolute', // Instead of absoluteFillObject
            left: 0,
            top: 0,
            right: 0,
            height: '100%', // Or specify exact height if necessary
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            opacity: 0.7,
            overflow: 'hidden',
            shadowColor: 'rgba(255, 255, 255, 1)', // Adds subtle glow // Ensure no overflow beyond bounds
        }
    });
    const shimmerValue = useRef(new AnimatedRN.Value(0)).current;

    useEffect(() => {
        // Start the shimmer animation loop
        const shimmerAnimation = AnimatedRN.loop(
            AnimatedRN.sequence([
                AnimatedRN.timing(shimmerValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shimmerValue, {
                    toValue: 0,
                    duration: 0, // Reset immediately to keep the loop smooth
                    useNativeDriver: true,
                })
            ])
        );

        shimmerAnimation.start();

        // Cleanup the animation on unmount
        return () => {
            shimmerAnimation.stop();
        };
    }, [shimmerValue]);

    const shimmerTranslateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['-100%', '1%'], // Adjust to fit within the bounds of the container
    });
    return (
        <View
            style={{
                opacity: 0.5,
                backgroundColor: 'white',
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                padding: 10,
                marginBottom: 5,
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: -99,
                boxShadow: '0 1px 1px rgba(2, 2, 2, 0.3)'
            }}
        >
            <AnimatedRN.View
                style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslateX }] },
                ]}
            />

            {/* Skeleton for Avatar */}
            <View
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#c0c0c0",
                    marginRight: 10,
                }}
            />

            {/* Skeleton for Text Content */}
            <View style={{ flex: 1 }}>
                {/* Skeleton for car name */}
                <View
                    style={{
                        height: 14,
                        backgroundColor: "#c0c0c0",
                        borderRadius: 5,
                        marginBottom: 5,
                        width: '70%'
                    }}
                />

                {/* Skeleton for last message */}
                <View
                    style={{
                        height: 14,
                        backgroundColor: "#c0c0c0",
                        borderRadius: 5,
                        marginBottom: 5,
                        width: '60%'
                    }}
                />
            </View>


        </View>

    );
};

const PreviewInvoice = ({ messageText, activeChatId, selectedChatData, invoiceData, context }) => {

    // npm install html2canvas jspdf
    // import jsPDF from 'jspdf';
    // import html2canvas from 'html2canvas';
    const image = imageLogo
    const hanko = hankoOnline


    const [previewInvoiceVisible, setPreviewInvoiceVisible] = useState(false);


    const [isPreviewHovered, setIsPreviewHovered] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const invoiceRef = useRef(null);
    const qrCodeRef = useRef(null);
    const [invoiceImageUri, setInvoiceImageUri] = useState('');
    const hoverPreviewIn = () => setIsPreviewHovered(true);
    const hoverPreviewOut = () => setIsPreviewHovered(false);
    const [firstCaptureUri, setFirstCaptureUri] = useState('');
    const [capturedImageUri, setCapturedImageUri] = useState('');
    // const [vehicleImageUri, setVehicleImageUri] = useState(globalImageUrl);
    const [featuresTrueCount, setFeaturesTrueCount] = useState(0);
    const [rerenderState, setRerenderState] = useState(0);
    const [imagePreviewKey, setImagePreviewKey] = useState(0);
    const handlePreviewInvoiceModalOpen = () => {
        setPreviewInvoiceVisible(!previewInvoiceVisible);
    };

    const handlePreviewInvoiceModalClose = () => {
        setPreviewInvoiceVisible(!previewInvoiceVisible);
        setCapturedImageUri('');
    }

    function countTrueValuesInCarData(invoiceData) {
        let count = 0;

        // Check if carData exists in invoiceData
        if (invoiceData?.carData) {
            // List of fields to check within carData
            const fields = ['interior', 'exterior', 'safetySystem', 'comfort', 'sellingPoints'];

            fields.forEach(field => {
                if (invoiceData?.carData[field]) {
                    // Count true values in each field of carData
                    count += Object.values(invoiceData?.carData[field]).filter(value => value === true).length;
                }
            });
        }

        return count;
    }

    useEffect(() => {

        if (previewInvoiceVisible) {
            setRerenderState(rerenderState + 1);
        }
    }, [previewInvoiceVisible])


    useEffect(() => {
        let generatedImageUri = '';
        const captureImageAsync = async () => {
            try {
                if (invoiceRef.current) {
                    // Adjust the scale to control the captured image resolution
                    const scale = 0.85; // Experiment with different scale values
                    const width = 2480 * scale;
                    const height = 3508 * scale;


                    const imageUri = await captureRef(invoiceRef, {
                        format: 'jpg',
                        quality: 1, // Adjust quality if needed
                        result: 'base64',
                        width: width,
                        height: height,
                    });

                    const trueCount = countTrueValuesInCarData(invoiceData);
                    setFeaturesTrueCount(trueCount);
                    generatedImageUri = `data:image/jpeg;base64,${imageUri}`
                    setCapturedImageUri(`data:image/jpeg;base64,${imageUri}`);

                    // console.log(`data:image/jpeg;base64,${imageUri}`);
                }
            } catch (error) {
                console.error("Error capturing view:", error);
            }
        };


        captureImageAsync();


    }, [invoiceRef.current, invoiceData]);

    useEffect(() => {
        setCapturedImageUri(capturedImageUri);
    }, [capturedImageUri]);

    const captureImage = async () => {
        try {
            // Adjust the scale to control the captured image resolution
            const scale = 0.9; // Experiment with different scale values
            const width = 2480 * scale;
            const height = 3508 * scale;

            const imageUri = await captureRef(invoiceRef, {
                format: 'jpg',
                quality: 1, // Adjust quality if needed
                result: 'base64',
                width: width,
                height: height,
            });
            return `data:image/jpeg;base64,${imageUri}`;
        } catch (error) {
            console.error("Error capturing view:", error);
        }
    };

    const createPDF = async () => {
        const element = invoiceRef.current;
        if (element) {
            // Reduce the scale slightly for smaller file size
            const scale = 1; // Fine-tune this value for balance

            const canvas = await html2canvas(element, {
                scale: scale,
            });

            // Experiment with JPEG quality for a balance between quality and file size
            const imageData = canvas.toDataURL('image/jpeg', 0.9);

            // A4 size dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Adjust PDF compression settings
            const options = {
                imageCompression: 'JPEG',
                imageQuality: 1, // Fine-tune this value as well
            };

            const imgProps = pdf.getImageProperties(imageData);
            const pdfWidthFit = pdfWidth;
            const pdfHeightFit = (imgProps.height * pdfWidthFit) / imgProps.width;

            pdf.addImage(imageData, 'JPEG', 0, 0, pdfWidthFit, pdfHeightFit, undefined, 'FAST', 0, options);

            // Filename logic
            selectedChatData.stepIndicator.value < 3 ?
                pdf.save(`Proforma Invoice (${invoiceData?.carData.carName} [${invoiceData?.carData.referenceNumber}]) (A4 Paper Size).pdf`) :
                pdf.save(`Invoice No. ${selectedChatData.invoiceNumber} (A4 Paper Size).pdf`);
        } else {
            console.error("No element to capture");
        }
    };


    const handleCaptureAndCreatePDF = async () => {
        const capturedImageUri = await captureImage();
        if (capturedImageUri) {
            await createPDF(capturedImageUri);
        }
    };


    if (invoiceData) {
        const issuingDateString = invoiceData?.bankInformations?.issuingDate;
        const dueDateString = invoiceData?.bankInformations?.dueDate;
        const issuingDateObject = new Date(issuingDateString);
        const dueDateObject = new Date(dueDateString);


        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

        formattedIssuingDate = issuingDateObject?.toLocaleDateString(undefined, options);
        formattedDueDate = dueDateObject?.toLocaleDateString(undefined, options);

    }

    const originalWidth = 794;
    const originalHeight = 1123;


    const originalSmallWidth = 794;
    const originalSmallHeight = 1123;

    const newWidth = 2480;
    const newHeight = 3508;

    const smallWidth = 377;
    const smallHeight = 541;

    const smallWidthScaleFactor = smallWidth / originalSmallWidth;
    const smallHeightScaleFactor = smallHeight / originalSmallHeight;

    const widthScaleFactor = newWidth / originalWidth;
    const heightScaleFactor = newHeight / originalHeight;

    const openImage = () => {
        if (Platform.OS === 'web') {
            const imageWindow = window.open();
            imageWindow.document.write(`
                <style>
                    body {
                        margin: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        overflow: hidden;
                    }
                    img {
                        width: 595px;
                        height: 842px;
                        object-fit: contain;
                        transition: transform 0.25s ease;
                        cursor: zoom-in; /* Set cursor to magnifying glass */
                    }
                    .zoomed {
                        transform: scale(3);
                        transform-origin: center;
                        cursor: zoom-out; /* Change cursor to indicate zooming out */
                    }
                </style>
                <img id="zoomableImage" src="${capturedImageUri}" alt="Base64 Image" draggable="false" />
                <script>
                    const image = document.getElementById('zoomableImage');
    
                    image.addEventListener('mousedown', function(e) {
                        const rect = this.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
    
                        // Set the transform origin to the mouse position
                        this.style.transformOrigin = \`\${x}px \${y}px\`;
                        this.classList.add('zoomed');
                    });
    
                    document.addEventListener('mouseup', function() {
                        image.classList.remove('zoomed');
                    });
                </script>
            `);
        } else {
            console.log('This feature is only available in a web environment');
        }
    };


    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    };


    const freightCalculation = ((selectedChatData.m3 ? selectedChatData.m3 :
        (selectedChatData.carData && selectedChatData.carData.dimensionCubicMeters ?
            selectedChatData.carData.dimensionCubicMeters : 0)) *
        Number(selectedChatData.freightPrice));

    const totalPriceCalculation = (selectedChatData.fobPrice ? selectedChatData.fobPrice :
        (selectedChatData.carData && selectedChatData.carData.fobPrice ?
            selectedChatData.carData.fobPrice : 0) *
        (selectedChatData.jpyToUsd ? selectedChatData.jpyToUsd :
            (selectedChatData.currency && selectedChatData.currency.jpyToUsd ?
                selectedChatData.currency.jpyToUsd : 0))) + freightCalculation;

    const convertedCurrency = (baseValue) => {
        // Ensure baseValue is a valid number
        const baseValueNumber = Number(baseValue);

        if (isNaN(baseValueNumber)) {
            return 'Invalid base value';
        }

        const numberFormatOptions = {
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        };

        if (invoiceData.selectedCurrencyExchange == 'None' || !invoiceData.selectedCurrencyExchange || invoiceData.selectedCurrencyExchange == 'USD') {
            return `$${Math.round(baseValueNumber).toLocaleString('en-US', numberFormatOptions)}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'JPY') {
            const jpyValue = baseValueNumber * Number(selectedChatData.currency.usdToJpy);
            return `¥${Math.round(jpyValue).toLocaleString('en-US', numberFormatOptions)}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'EURO') {
            const euroValue = baseValueNumber * Number(selectedChatData.currency.usdToEur);
            return `€${Math.round(euroValue).toLocaleString('en-US', numberFormatOptions)}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'AUD') {
            const audValue = baseValueNumber * Number(selectedChatData.currency.usdToAud);
            return `A$${Math.round(audValue).toLocaleString('en-US', numberFormatOptions)}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'GBP') {
            const gbpValue = baseValueNumber * Number(selectedChatData.currency.usdToGbp);
            return `£${Math.round(gbpValue).toLocaleString('en-US', numberFormatOptions)}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'CAD') {
            const cadValue = baseValueNumber * Number(selectedChatData.currency.usdToCad);
            return `C$${Math.round(cadValue).toLocaleString('en-US', numberFormatOptions)}`;
        }

        // Add a default return value if none of the conditions are met
        return `$${Math.round(baseValueNumber).toLocaleString('en-US', numberFormatOptions)}`;
    };

    const totalPriceCalculated = () => {

        const totalAdditionalPrice = invoiceData.paymentDetails.additionalPrice.reduce((total, price) => {
            const converted = Number(price); // Convert each price using your currency conversion function
            const numericPart = price.replace(/[^0-9.]/g, ''); // Remove non-numeric characters, assuming decimal numbers
            return total + parseFloat(numericPart); // Add the numeric value to the total
        }, 0);

        const totalUsd = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice))
            // * Number(invoiceData.currency.jpyToEur)
            ;

        const totalJpy = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToJpy));

        const totalEur = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToEur));


        // const totalEur = Number(invoiceData.paymentDetails.fobPrice) * Number(invoiceData.currency.usdToEur)
        //     + (valueCurrency * Number(invoiceData.currency.usdToEur))
        //     + Number(invoiceData.paymentDetails.freightPrice) * Number(invoiceData.currency.usdToEur)
        //     + (valueCurrency * Number(invoiceData.currency.usdToEur))
        //     + (invoiceData.paymentDetails.inspectionIsChecked
        //         ? (Number(invoiceData.paymentDetails.inspectionPrice) * Number(invoiceData.currency.usdToEur)
        //             + (valueCurrency * Number(invoiceData.currency.usdToEur)))
        //         : 0)
        //     + totalAdditionalPrice;

        const totalAud = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToAud))

        const totalGbp = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToGbp))

        const totalCad = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToCad))

        if (invoiceData.selectedCurrencyExchange == 'None' || !invoiceData.selectedCurrencyExchange || invoiceData.selectedCurrencyExchange == 'USD') {
            return `$${Math.round(totalUsd).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'JPY') {
            return `¥${Math.round(totalJpy).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'EURO') {
            return `€${Math.round(totalEur).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'AUD') {
            return `A$${Math.round(totalAud).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'GBP') {
            return `£${Math.round(totalGbp).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'CAD') {
            return `C$${Math.round(totalCad).toLocaleString('en-US', { useGrouping: true })}`;
        }
    }

    const PreviewInvoiceForMobile = () => {

        return (
            <NativeBaseProvider>
                <View
                    style={{
                        width: smallWidth,
                        height: smallHeight,
                        backgroundColor: 'white',
                        zIndex: 1
                    }}>

                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 999,
                        }}
                    />

                    <View style={{ position: 'absolute', left: 38 * smallWidthScaleFactor, top: 38 * smallHeightScaleFactor }}>

                        <Image
                            source={{ uri: image }}
                            onLoad={() => setImageLoaded(true)}
                            style={{
                                width: 95 * smallWidthScaleFactor,
                                height: 85 * smallHeightScaleFactor,
                                resizeMode: 'stretch',

                            }}
                        />
                    </View>

                    <View style={{ position: 'absolute', alignSelf: 'center', top: 80 * smallHeightScaleFactor }}>
                        {/* Title */}
                        {selectedChatData.stepIndicator.value < 3 ?
                            <Text style={{ fontWeight: 700, fontSize: 25 * smallWidthScaleFactor }}>{`PROFORMA INVOICE`}</Text> :
                            <Text style={{ fontWeight: 700, fontSize: 25 * smallWidthScaleFactor }}>{`INVOICE`}</Text>
                        }
                    </View>

                    <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 38 * smallHeightScaleFactor }}>
                        {/* QR CODE */}
                        {selectedChatData.stepIndicator.value < 3 ?
                            null :
                            <QRCode
                                value={invoiceData?.cryptoNumber}
                                size={80 * smallWidthScaleFactor}
                                color="black"
                                backgroundColor="white"
                            />
                        }
                    </View>

                    <View style={{ position: 'absolute', right: 121 * smallWidthScaleFactor, top: 34 * smallHeightScaleFactor }}>
                        {/* Invoice Number */}
                        {selectedChatData.stepIndicator.value < 3 ?
                            null :
                            <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor }}>{`Invoice No. RMJ-${selectedChatData.invoiceNumber}`}</Text>
                        }
                    </View>

                    {selectedChatData.stepIndicator.value < 3 ?
                        <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 34 * smallHeightScaleFactor, }}>
                            {/* Issuing Date */}
                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                                <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor }}>{`Issuing Date: `}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                                <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor, color: '#F00A0A', }}>{`Valid Until: `}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor }}>{`${formattedDueDate}`}</Text>
                            </View>

                        </View>
                        :
                        <View style={{ position: 'absolute', right: 121 * smallWidthScaleFactor, top: 49 * smallHeightScaleFactor, flexDirection: 'row' }}>
                            {/* Issuing Date */}
                            <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor }}>{`Issuing Date: `}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                        </View>
                    }

                    <View style={{
                        position: 'absolute',
                        left: 40 * smallWidthScaleFactor,
                        top: 134 * smallHeightScaleFactor,
                        width: 280 * smallWidthScaleFactor,
                    }}>
                        {/* Shipper */}
                        <Text style={{
                            fontWeight: 750,
                            fontSize: 16 * smallWidthScaleFactor,
                            borderBottomWidth: 3 * smallWidthScaleFactor, // Adjust the thickness of the underline
                            width: 'fit-content', // Make the underline cover the text width
                            marginBottom: 5 * smallHeightScaleFactor, // Add some space between text and underline
                        }}>
                            {`Shipper`}
                        </Text>
                        <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Real Motor Japan (YANAGISAWA HD CO.,LTD)`}</Text>
                        <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`26-2 Takara Tsutsumi-cho Toyota City, Aichi Prefecture, Japan, 473-0932`}</Text>
                        <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`FAX: +81565850606`}</Text>

                        <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Shipped From:`}</Text>
                        <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.departurePort}, ${invoiceData?.departureCountry}`}</Text>

                        <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Shipped To:`}</Text>
                        <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.discharge.port}, ${invoiceData?.discharge.country}`}</Text>
                        {invoiceData?.placeOfDelivery && invoiceData?.placeOfDelivery !== '' ?
                            <>
                                <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Place of Delivery:`}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 12 * smallHeightScaleFactor }}>{`${invoiceData?.placeOfDelivery}`}</Text>
                            </>
                            : null}
                        {invoiceData?.cfs && invoiceData?.cfs !== '' ?
                            <>
                                <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`CFS:`}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.cfs}`}</Text>
                            </>
                            : null}

                        <View style={{ flex: 1, flexDirection: 'row', width: 715 * smallWidthScaleFactor, }}>

                            <View style={{
                                flex: 1, width: 280 * smallWidthScaleFactor,
                            }}>
                                {/* Buyer Information */}
                                <Text style={{
                                    fontWeight: 750,
                                    fontSize: 18 * smallWidthScaleFactor,
                                    borderBottomWidth: 3 * smallHeightScaleFactor, // Adjust the thickness of the underline
                                    borderBottomColor: '#0A78BE',
                                    width: 'fit-content', // Make the underline cover the text width
                                    marginBottom: 5 * smallHeightScaleFactor, // Add some space between text and underline
                                    color: '#0A78BE',
                                    marginTop: 45 * smallHeightScaleFactor,

                                }}>
                                    {`Buyer Information`}
                                </Text>
                                <Text style={{ fontWeight: 750, fontSize: 16 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.consignee.name}`}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.consignee.address}, ${invoiceData?.consignee.city}, ${invoiceData?.consignee.country}`}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.consignee.email}`}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.consignee.contactNumber}`}</Text>
                                <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`FAX: ${invoiceData?.consignee.fax == '' ? 'N/A' : invoiceData?.consignee.fax}`}</Text>

                            </View>

                            <View style={{ flex: 1, paddingLeft: 20 * smallWidthScaleFactor, width: 280 * smallWidthScaleFactor, }}>
                                {/* Notify Party */}
                                <Text style={{
                                    fontWeight: 750,
                                    fontSize: 18 * smallWidthScaleFactor,
                                    borderBottomWidth: 3 * smallHeightScaleFactor, // Adjust the thickness of the underline
                                    borderBottomColor: '#FF0000',
                                    width: 'fit-content', // Make the underline cover the text width
                                    marginBottom: 5 * smallHeightScaleFactor, // Add some space between text and underline
                                    color: '#FF0000',
                                    marginTop: 45 * smallHeightScaleFactor,
                                }}>
                                    {`Notify Party`}
                                </Text>
                                {invoiceData?.notifyParty.sameAsConsignee == true ? (
                                    <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, }}>{`Same as consignee / buyer`}</Text>) :
                                    (<>
                                        <Text style={{ fontWeight: 750, fontSize: 16 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.notifyParty.name}`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.notifyParty.address}`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.notifyParty.email}`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.notifyParty.contactNumber}`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`FAX: ${invoiceData?.notifyParty.fax == '' ? 'N/A' : invoiceData?.notifyParty.fax}`}</Text>
                                    </>)}
                            </View>

                        </View>


                    </View>
                    {selectedChatData.stepIndicator.value < 3 ?

                        <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 130 * smallHeightScaleFactor, borderWidth: 3 * smallWidthScaleFactor, width: 430 * smallWidthScaleFactor, borderColor: '#FF5C00', height: 194 * smallHeightScaleFactor, }}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', }}>
                                <Entypo size={50 * smallWidthScaleFactor} name='warning' color={'#FF0000'} style={{ marginLeft: 15 * smallWidthScaleFactor, }} />
                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, color: '#FF0000', marginLeft: 20 * smallWidthScaleFactor, }}>{`Bank Information will be provided after placing an order.`}</Text>
                            </View>
                        </View>
                        :
                        <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 130 * smallHeightScaleFactor, borderWidth: 3 * smallWidthScaleFactor, width: 430 * smallWidthScaleFactor, borderColor: '#1ABA3D', }}>

                            <View style={{ flex: 1, alignItems: 'center', }}>
                                <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor, color: '#114B33', }}>{`Bank Information`}</Text>
                            </View>

                            <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 5 * smallWidthScaleFactor, marginBottom: 5 * smallHeightScaleFactor, }}>
                                <View style={{ flex: 1, marginRight: 50 * smallWidthScaleFactor, }}>
                                    <Text style={{
                                        fontWeight: 750,
                                        fontSize: 14 * smallWidthScaleFactor,
                                        borderBottomWidth: 3 * smallHeightScaleFactor, // Adjust the thickness of the underline
                                        width: 'fit-content', // Make the underline cover the text width
                                        marginBottom: 2 * smallHeightScaleFactor, // Add some space between text and underline
                                    }}>
                                        {`Bank Account`}
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Bank Name: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.bankName}`}</Text>
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Branch Name: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.branchName}`}</Text>
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`SWIFTCODE: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.swiftCode}`}</Text>
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Address: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.address}`}</Text>
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Name of Account Holder: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.accountHolder}`}</Text>
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Account Number: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.accountNumberValue}`}</Text>
                                    </Text>
                                </View>

                                <View style={{ flex: 1 }}>

                                    <Text style={{
                                        fontWeight: 750,
                                        fontSize: 14 * smallWidthScaleFactor,
                                        borderBottomWidth: 3 * smallWidthScaleFactor, // Adjust the thickness of the underline
                                        width: 'fit-content', // Make the underline cover the text width
                                        marginBottom: 2 * smallHeightScaleFactor, // Add some space between text and underline
                                    }}>
                                        {`Payment Terms`}
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Terms: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData?.bankInformations.paymentTerms}`}</Text>
                                    </Text>

                                    <View style={{ paddingTop: 30 * smallHeightScaleFactor, }}>

                                        <Text style={{
                                            fontWeight: 750,
                                            fontSize: 14 * smallWidthScaleFactor,
                                            borderBottomWidth: 3 * smallWidthScaleFactor, // Adjust the thickness of the underline
                                            width: 'fit-content', // Make the underline cover the text width
                                            marginBottom: 2 * smallHeightScaleFactor, // Add some space between text and underline
                                            color: '#F00A0A',
                                            borderBottomColor: '#F00A0A',
                                        }}>
                                            {`Payment Due`}
                                        </Text>

                                        <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, color: '#F00A0A', lineHeight: 14 * smallWidthScaleFactor }}>{`Due Date: `}
                                            <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, color: 'black', lineHeight: 14 * smallWidthScaleFactor }}>{`${formattedDueDate}`}</Text>
                                        </Text>

                                    </View>

                                </View>

                            </View>

                        </View>}



                    <View style={{
                        position: 'absolute',
                        left: 38 * smallWidthScaleFactor,
                        top: (invoiceData?.placeOfDelivery && invoiceData?.cfs) || (invoiceData?.placeOfDelivery !== '' && invoiceData?.cfs !== '') ? 577 * smallHeightScaleFactor : 537 * smallHeightScaleFactor,
                        width: 718 * smallWidthScaleFactor,
                        borderWidth: 1 * smallWidthScaleFactor,
                        borderColor: '#C2E2F4',
                        alignSelf: 'center',
                    }}>
                        <View style={{ flex: 1, flexDirection: 'row', }}>

                            <View style={{ flex: 2, justifyContent: 'center', }}>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                        color: '#008AC6',
                                    }}>
                                    {`Description`}
                                </Text>

                            </View>

                            <View style={{ flex: 2, justifyContent: 'center', }}>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                        color: '#008AC6',
                                    }}>
                                    {`Notes`}
                                </Text>
                            </View>

                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                        color: '#008AC6',
                                    }}>
                                    {`Quantity`}
                                </Text>
                            </View>

                            <View style={{ flex: 2, justifyContent: 'center', }}>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                        color: '#008AC6',
                                    }}>
                                    {`Amount`}
                                </Text>
                            </View>

                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', }}>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 5,
                            }}>
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        marginLeft: 2 * smallWidthScaleFactor,
                                    }}>
                                    {`FOB`}
                                </Text>
                            </View>


                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                            }}>
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                    {`${convertedCurrency(Number(invoiceData?.paymentDetails.fobPrice))}`}
                                </Text>
                            </View>

                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', }}>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 5,
                            }}>
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        marginLeft: 2 * smallWidthScaleFactor,
                                    }}>
                                    {`Freight`}
                                </Text>
                            </View>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                            }}>
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                    {`${convertedCurrency(Number(invoiceData?.paymentDetails.freightPrice))}`}
                                </Text>
                            </View>

                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', }}>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 5,
                                flexDirection: 'row',
                            }}>
                                {invoiceData?.paymentDetails.inspectionIsChecked && (invoiceData?.paymentDetails.incoterms == "C&F" || invoiceData?.paymentDetails.incoterms == "FOB") && <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        marginLeft: 2 * smallWidthScaleFactor,
                                    }}>
                                    {invoiceData?.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData?.paymentDetails.inspectionName}]` : ' '}
                                </Text>}

                                {invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                    <>
                                        <Text
                                            style={{
                                                fontWeight: 400,
                                                fontSize: 12 * smallWidthScaleFactor,
                                                lineHeight: 14 * smallWidthScaleFactor,
                                                marginBottom: 3 * smallHeightScaleFactor,
                                                marginLeft: 2 * smallWidthScaleFactor,
                                            }}>
                                            {invoiceData?.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData?.paymentDetails.inspectionName}]` : ' '}
                                        </Text>
                                        <Text
                                            style={{
                                                fontWeight: 400,
                                                fontSize: 12 * smallWidthScaleFactor,
                                                lineHeight: 14 * smallWidthScaleFactor,
                                                marginBottom: 3 * smallHeightScaleFactor,
                                                marginLeft: 2 * smallWidthScaleFactor,
                                            }}>
                                            {invoiceData?.paymentDetails.incoterms == "CIF" ? ` + Insurance` : ' '}
                                        </Text>
                                    </>
                                }

                                {!invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            marginLeft: 2 * smallWidthScaleFactor,
                                        }}>
                                        {invoiceData?.paymentDetails.incoterms == "CIF" ? `Insurance` : ' '}
                                    </Text>
                                }

                                {!invoiceData?.paymentDetails.inspectionIsChecked && (invoiceData?.paymentDetails.incoterms == "C&F" || invoiceData?.paymentDetails.incoterms == "FOB") &&
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                        }}>
                                        {' '}
                                    </Text>
                                }


                            </View>


                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                            }}>

                                {invoiceData?.paymentDetails.inspectionIsChecked && (invoiceData?.paymentDetails.incoterms == "C&F" || invoiceData?.paymentDetails.incoterms == "FOB") && <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                    {invoiceData?.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData?.paymentDetails.inspectionPrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                </Text>}

                                {invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                        {invoiceData?.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData?.paymentDetails.inspectionPrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                        <Text
                                            style={{
                                                fontWeight: 400,
                                                fontSize: 12 * smallWidthScaleFactor,
                                                lineHeight: 14 * smallWidthScaleFactor,
                                                marginBottom: 3 * smallHeightScaleFactor,
                                            }}>
                                            {invoiceData?.paymentDetails.incoterms === "CIF" ? ` + ${convertedCurrency(Number(invoiceData?.paymentDetails.insurancePrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                        </Text>
                                    </Text>

                                }

                                {!invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',

                                        }}>
                                        {invoiceData?.paymentDetails.incoterms == "CIF" ? `${convertedCurrency(Number(invoiceData?.paymentDetails.insurancePrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                    </Text>
                                }

                            </View>


                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', }}>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 5,
                                flexDirection: 'row',
                            }}>
                                {invoiceData?.paymentDetails.additionalName && (invoiceData?.paymentDetails.additionalName).length > 0 && <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        marginLeft: 2 * smallWidthScaleFactor,
                                    }}>
                                    {invoiceData?.paymentDetails.additionalName && (invoiceData?.paymentDetails.additionalName).length > 0 ? `${invoiceData?.paymentDetails.additionalName.join(' + ')}` : ' '}
                                </Text>}


                            </View>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                            }}>
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                    {invoiceData?.paymentDetails.additionalPrice && invoiceData?.paymentDetails.additionalPrice.length > 0
                                        ? invoiceData?.paymentDetails.additionalPrice.map(price => {
                                            const converted = convertedCurrency(Number(price));
                                            return converted;
                                        }).join(' + ')
                                        : ' '}
                                </Text>
                            </View>

                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', }}>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                                flexDirection: 'row',
                                paddingVertical: 2 * smallHeightScaleFactor,

                            }}>
                                {invoiceData?.carData && invoiceData?.carData.carName ? (
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                        marginLeft: 2 * smallWidthScaleFactor,
                                    }}>
                                        {"Used Vehicle\n"}
                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${invoiceData?.carData.carName}\n`}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${invoiceData?.carData.chassisNumber}\n`}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${invoiceData?.carData.exteriorColor}\n`}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${Number(invoiceData?.carData.engineDisplacement).toLocaleString('en-US')} cc\n`}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${Number(invoiceData?.carData.mileage).toLocaleString('en-US')} km\n`}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${invoiceData?.carData.fuel}\n`}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                        }}>
                                            {`${invoiceData?.carData.transmission}\n`}
                                        </Text>
                                    </Text>

                                ) : (
                                    <Text>{' '}</Text>
                                )}


                            </View>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}>
                                {invoiceData?.paymentDetails && invoiceData?.paymentDetails.incoterms && invoiceData?.discharge.port && invoiceData?.discharge ? (
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${invoiceData?.paymentDetails.incoterms} ${invoiceData?.discharge.port}`}
                                    </Text>
                                ) : (
                                    <Text>{' '}</Text>
                                )}
                            </View>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}>
                                {invoiceData?.carData && invoiceData?.carData.carName ? (
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {'1'}
                                    </Text>
                                ) : (
                                    <Text>{' '}</Text>
                                )}


                            </View>

                            <View style={{
                                borderTopWidth: 1 * smallWidthScaleFactor,
                                borderColor: '#C2E2F4',
                                flex: 2,
                                justifyContent: 'center',
                                flexDirection: 'row',
                            }}>
                                {invoiceData?.paymentDetails && invoiceData?.paymentDetails.totalAmount ? (
                                    <>
                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            color: '#008AC6',
                                            marginRight: 10 * smallWidthScaleFactor,
                                            top: 51 * smallHeightScaleFactor,
                                            left: 50 * smallWidthScaleFactor,
                                            position: 'absolute',
                                        }}>
                                            {"Total"}
                                            <Text style={{
                                                fontWeight: 700,
                                                fontSize: 12 * smallWidthScaleFactor,
                                                lineHeight: 14 * smallWidthScaleFactor,
                                                marginBottom: 3 * smallHeightScaleFactor,
                                                alignSelf: 'center',
                                                color: '#00720B',
                                                marginLeft: 5 * smallWidthScaleFactor,
                                            }}>
                                                {`${totalPriceCalculated()}`}
                                            </Text>
                                        </Text>

                                    </>
                                ) : (
                                    <Text>{' '}</Text>
                                )}
                            </View>

                        </View>

                    </View>

                    <View style={{ position: 'absolute', left: 38 * smallWidthScaleFactor, top: 825 * smallHeightScaleFactor, width: 350 * smallWidthScaleFactor, }}>
                        <Text style={{
                            fontWeight: 700,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'Payment Information:'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'The customer is responsible for the bank charges incurred when the T/T (Telegraphic Transfer) is paid.'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                            marginBottom: 5 * smallHeightScaleFactor,
                        }}>
                            {'No warranty service is provided on used vehicles.'}
                        </Text>

                        <Text style={{
                            fontWeight: 700,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'Conditions for order cancellation:'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'(1) Order Cancellation Penalty: If the order is cancelled after payment, a penalty of USD 220 will apply.'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                            marginBottom: 5 * smallHeightScaleFactor,

                        }}>
                            {'(2) Non-refund: Payment for vehicles purchased through pre-delivery inspection is non-refundable.'}
                        </Text>

                        <Text style={{
                            fontWeight: 700,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'Intermediary Banking Information:'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'Bank Name: SUMITOMO MITSUI BANKING CORPORATION (NEW YORK BRANCH).'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,

                        }}>
                            {'Swift code: SMBCUS33'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                        }}>
                            {'Address: 277 Park Avenue'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,

                        }}>
                            {'City: New York, NY'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,

                        }}>
                            {'Postal Code: 10172'}
                        </Text>
                        <Text style={{
                            fontWeight: 400,
                            fontSize: 12 * smallWidthScaleFactor,
                            lineHeight: 14 * smallHeightScaleFactor,
                            marginBottom: 5 * smallHeightScaleFactor,

                        }}>
                            {'Country: United States'}
                        </Text>
                    </View>

                    {selectedChatData.stepIndicator.value < 3 ? null :
                        <View style={{ position: 'absolute', right: 39 * smallWidthScaleFactor, top: 835 * smallHeightScaleFactor, width: 300 * smallWidthScaleFactor, }}>
                            <View style={{
                                width: 300 * smallWidthScaleFactor,
                                alignItems: 'center',
                                paddingBottom: 80 * smallHeightScaleFactor, // Adjust this value to control space between image and line
                            }}>

                                <Image
                                    onLoad={() => setImageLoaded(true)}
                                    source={{ uri: hanko }}
                                    style={{
                                        width: 276 * smallWidthScaleFactor,
                                        height: 81 * smallHeightScaleFactor,
                                        resizeMode: 'contain',
                                        alignSelf: 'center',
                                        marginBottom: 0, // Minimize margin to keep the line close
                                    }}
                                />
                                <View style={{
                                    borderBottomWidth: 1 * smallHeightScaleFactor,
                                    borderColor: 'black', // Change the color as needed
                                    width: '100%', // Line width as per your requirement
                                }} />
                                <Text italic style={{
                                    fontWeight: 700,
                                    fontSize: 16 * smallWidthScaleFactor,
                                }}>
                                    {'Real Motor Japan'}
                                </Text>
                            </View>

                            <View style={{
                                width: 300 * smallWidthScaleFactor,
                                alignItems: 'center',
                                paddingBottom: 5 * smallHeightScaleFactor, // Adjust this value to control space between image and line
                            }}>

                                <View style={{
                                    borderBottomWidth: 1 * smallHeightScaleFactor,
                                    borderColor: 'black', // Change the color as needed
                                    width: '100%', // Line width as per your requirement
                                }} />
                                <Text italic style={{
                                    fontWeight: 700,
                                    fontSize: 16 * smallWidthScaleFactor,
                                }}>
                                    {'Your Signature'}
                                </Text>
                            </View>
                        </View>}


                </View>
            </NativeBaseProvider>
        )
    }



    return (
        <NativeBaseProvider>
            <> {invoiceData &&

                <>
                    <Pressable

                        onPress={handlePreviewInvoiceModalOpen}
                        focusable={false}
                        variant='ghost'
                        onHoverIn={hoverPreviewIn}
                        onHoverOut={hoverPreviewOut}
                        style={({ pressed, hovered }) => ([context === 'chat' ? {
                            backgroundColor: pressed
                                ? '#C0C0C0'  // Darker gray on press
                                : hovered
                                    ? '#E0E0E0'  // Slightly darker gray on hover
                                    : '#FAFAFA',  // Default background color
                            padding: 15,
                            margin: 5,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2, // For Android shadow
                        } : {
                            padding: 5,
                            paddingVertical: 8,
                            paddingHorizontal: 20,
                            flexDirection: 'row', // Align items in a row
                            alignItems: 'center', // Center items vertically
                            justifyContent: 'center',
                            borderRadius: 5,
                            backgroundColor: isPreviewHovered ? '#0772ad' : '#0A8DD5',


                        }])}
                    >

                        {selectedChatData.invoiceNumber && selectedChatData.stepIndicator.value > 2 ?
                            <Text style={{ fontWeight: 700, color: context === 'chat' ? 'black' : 'white', }}>
                                <AntDesign name='filetext1' size={16} color={context === 'chat' ? 'black' : 'white'} /> {context === 'chat' ? messageText : `Invoice No. ${selectedChatData.invoiceNumber}`}
                            </Text>
                            :
                            <Text style={{ fontWeight: 700, color: context === 'chat' ? 'black' : 'white', }}>
                                {context === 'chat' ? messageText : `Preview Invoice`}
                            </Text>}
                    </Pressable>

                    <NativeBaseModal
                        isOpen={previewInvoiceVisible}
                        onClose={() => {
                            handlePreviewInvoiceModalClose();
                        }}
                        size={'full'}
                        useRNModal
                    >
                        <View style={{ flexDirection: 'row', margin: 2, }}>
                            <Pressable onPress={() => {
                                capturedImageUri ? handleCaptureAndCreatePDF() : null;
                            }}
                                style={{ justifyContent: 'center', flexDirection: 'row', padding: 5, borderRadius: 5, marginRight: 5, backgroundColor: '#16A34A', }}>
                                <MaterialCommunityIcons size={20} name='download' color='white' />
                                <Text style={{ color: 'white', }}>Download as PDF</Text>
                            </Pressable>



                            <Pressable
                                onPress={() => {
                                    capturedImageUri ? openImage() : null;
                                }}
                                style={{ position: 'absolute', top: -2, right: -285, flexDirection: 'row', padding: 5, borderRadius: 5, backgroundColor: '#0A8DD5', }}>
                                <Entypo size={20} name='images' color='white' />
                                <Text style={{ color: 'white', }}>View Image</Text>
                            </Pressable>

                        </View>
                        <NativeBaseModal.CloseButton />
                        {previewInvoiceVisible &&
                            <ScrollView
                                keyboardShouldPersistTaps="always"
                                style={{ maxHeight: screenWidth < 960 ? 520 : 720, maxWidth: screenWidth < 960 ? '90%' : 900 }}
                            >
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    backgroundColor: 'white',
                                    zIndex: 999,
                                    flex: 1,
                                    alignItems: 'center', // Center horizontally
                                }}>
                                    {capturedImageUri ? (
                                        (screenWidth < mobileViewBreakpoint ? <PreviewInvoiceForMobile /> :
                                            <Image
                                                key={imagePreviewKey}
                                                source={{ uri: capturedImageUri.toString() }}
                                                style={{
                                                    marginTop: 5,
                                                    width: screenWidth < mobileViewBreakpoint ? 377 : 595,
                                                    height: screenWidth < mobileViewBreakpoint ? 541 : 842,
                                                    resizeMode: 'stretch',
                                                    borderWidth: 1,
                                                    borderColor: '#DADDE1',
                                                }}
                                            />
                                        )
                                    ) : (
                                        <Spinner size={'lg'} color={'#0A9FDC'} style={{ alignSelf: 'center', paddingTop: 80 * heightScaleFactor, }} />
                                    )}
                                </View>

                                {/* Main content with invoice details */}
                                {

                                    <View ref={invoiceRef}
                                        style={{
                                            width: newWidth,
                                            height: newHeight,
                                            backgroundColor: 'white',
                                            zIndex: 1
                                        }}>

                                        <View style={{ position: 'absolute', left: 38 * widthScaleFactor, top: 38 * heightScaleFactor }}>
                                            <Image
                                                source={{ uri: image }}
                                                style={{
                                                    width: 95 * widthScaleFactor,
                                                    height: 85 * heightScaleFactor,
                                                    resizeMode: 'stretch',

                                                }}
                                            />
                                        </View>

                                        <View style={{ position: 'absolute', alignSelf: 'center', top: 80 * heightScaleFactor }}>
                                            {/* Title */}
                                            {selectedChatData.stepIndicator.value < 3 ?
                                                <Text style={{ fontWeight: 700, fontSize: 25 * widthScaleFactor }}>{`PROFORMA INVOICE`}</Text> :
                                                <Text style={{ fontWeight: 700, fontSize: 25 * widthScaleFactor }}>{`INVOICE`}</Text>
                                            }
                                        </View>

                                        <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 38 * heightScaleFactor }}>
                                            {/* QR CODE */}
                                            {selectedChatData.stepIndicator.value < 3 ?
                                                null :
                                                <View
                                                    ref={qrCodeRef}
                                                >
                                                    <QRCode
                                                        value={invoiceData?.cryptoNumber}
                                                        size={80 * widthScaleFactor}
                                                        color="black"
                                                        backgroundColor="white"
                                                    />
                                                </View>

                                            }
                                        </View>

                                        <View style={{ position: 'absolute', right: 121 * widthScaleFactor, top: 34 * heightScaleFactor }}>
                                            {/* Invoice Number */}
                                            {selectedChatData.stepIndicator.value < 3 ?
                                                null :
                                                <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor }}>{`Invoice No. RMJ-${selectedChatData.invoiceNumber}`}</Text>
                                            }
                                        </View>

                                        {selectedChatData.stepIndicator.value < 3 ?
                                            <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 34 * heightScaleFactor, }}>
                                                {/* Issuing Date */}
                                                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                                                    <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor }}>{`Issuing Date: `}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                                                    <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor, color: '#F00A0A', }}>{`Valid Until: `}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor }}>{`${formattedDueDate}`}</Text>
                                                </View>

                                            </View>
                                            :
                                            <View style={{ position: 'absolute', right: 121 * widthScaleFactor, top: 49 * heightScaleFactor, flexDirection: 'row' }}>
                                                {/* Issuing Date */}
                                                <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor }}>{`Issuing Date: `}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                                            </View>
                                        }

                                        <View style={{
                                            position: 'absolute',
                                            left: 40 * widthScaleFactor,
                                            top: 134 * heightScaleFactor,
                                            width: 280 * widthScaleFactor,
                                        }}>
                                            {/* Shipper */}
                                            <Text style={{
                                                fontWeight: 750,
                                                fontSize: 16 * widthScaleFactor,
                                                borderBottomWidth: 3, // Adjust the thickness of the underline
                                                width: 'fit-content', // Make the underline cover the text width
                                                marginBottom: 5, // Add some space between text and underline
                                            }}>
                                                {`Shipper`}
                                            </Text>
                                            <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`Real Motor Japan (YANAGISAWA HD CO.,LTD)`}</Text>
                                            <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`26-2 Takara Tsutsumi-cho Toyota City, Aichi Prefecture, Japan, 473-0932`}</Text>
                                            <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`FAX: +81565850606`}</Text>

                                            <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`Shipped From:`}</Text>
                                            <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.departurePort}, ${invoiceData?.departureCountry}`}</Text>

                                            <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`Shipped To:`}</Text>
                                            <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.discharge.port}, ${invoiceData?.discharge.country}`}</Text>
                                            {invoiceData?.placeOfDelivery && invoiceData?.placeOfDelivery !== '' ?
                                                <>
                                                    <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`Place of Delivery:`}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.placeOfDelivery}`}</Text>
                                                </>
                                                : null}
                                            {invoiceData?.cfs && invoiceData?.cfs !== '' ?
                                                <>
                                                    <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`CFS:`}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.cfs}`}</Text>
                                                </>
                                                : null}

                                            <View style={{ flex: 1, flexDirection: 'row', width: 715 * widthScaleFactor, }}>

                                                <View style={{
                                                    flex: 1, width: 280 * widthScaleFactor,
                                                }}>
                                                    {/* Buyer Information */}
                                                    <Text style={{
                                                        fontWeight: 750,
                                                        fontSize: 18 * widthScaleFactor,
                                                        borderBottomWidth: 3, // Adjust the thickness of the underline
                                                        borderBottomColor: '#0A78BE',
                                                        width: 'fit-content', // Make the underline cover the text width
                                                        marginBottom: 5, // Add some space between text and underline
                                                        color: '#0A78BE',
                                                        marginTop: 25 * heightScaleFactor,

                                                    }}>
                                                        {`Buyer Information`}
                                                    </Text>
                                                    <Text style={{ fontWeight: 750, fontSize: 16 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.consignee.name}`}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 6 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.consignee.address}, ${invoiceData?.consignee.city}, ${invoiceData?.consignee.country}`}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.consignee.email}`}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.consignee.contactNumber}`}</Text>
                                                    <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`FAX: ${invoiceData?.consignee.fax == '' ? 'N/A' : invoiceData?.consignee.fax}`}</Text>

                                                </View>

                                                <View style={{ flex: 1, paddingLeft: 20 * widthScaleFactor, width: 280 * widthScaleFactor, }}>
                                                    {/* Notify Party */}
                                                    <Text style={{
                                                        fontWeight: 750,
                                                        fontSize: 18 * widthScaleFactor,
                                                        borderBottomWidth: 3, // Adjust the thickness of the underline
                                                        borderBottomColor: '#FF0000',
                                                        width: 'fit-content', // Make the underline cover the text width
                                                        marginBottom: 5, // Add some space between text and underline
                                                        color: '#FF0000',
                                                        marginTop: 25 * heightScaleFactor,
                                                    }}>
                                                        {`Notify Party`}
                                                    </Text>
                                                    {invoiceData?.notifyParty.sameAsConsignee == true ? (
                                                        <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, }}>{`Same as consignee / buyer`}</Text>) :
                                                        (<>
                                                            <Text style={{ fontWeight: 750, fontSize: 16 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.notifyParty.name}`}</Text>
                                                            <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.notifyParty.address}`}</Text>
                                                            <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.notifyParty.email}`}</Text>
                                                            <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.notifyParty.contactNumber}`}</Text>
                                                            <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`FAX: ${invoiceData?.notifyParty.fax == '' ? 'N/A' : invoiceData?.notifyParty.fax}`}</Text>
                                                        </>)}
                                                </View>

                                            </View>


                                        </View>
                                        {selectedChatData.stepIndicator.value < 3 ?

                                            <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 130 * heightScaleFactor, borderWidth: 3, width: 430 * widthScaleFactor, borderColor: '#FF5C00', height: 194 * heightScaleFactor, }}>
                                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', }}>
                                                    <Entypo size={50 * widthScaleFactor} name='warning' color={'#FF0000'} />
                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, color: '#FF0000', marginLeft: 20 * widthScaleFactor, }}>{`Bank Information will be provided after placing an order.`}</Text>
                                                </View>
                                            </View>
                                            :
                                            <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 130 * heightScaleFactor, borderWidth: 3, width: 430 * widthScaleFactor, borderColor: '#1ABA3D', }}>

                                                <View style={{ flex: 1, alignItems: 'center', }}>
                                                    <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor, color: '#114B33', }}>{`Bank Information`}</Text>
                                                </View>

                                                <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 5 * widthScaleFactor, marginBottom: 5 * heightScaleFactor, }}>
                                                    <View style={{ flex: 1, marginRight: 50 * widthScaleFactor, }}>
                                                        <Text style={{
                                                            fontWeight: 750,
                                                            fontSize: 14 * widthScaleFactor,
                                                            borderBottomWidth: 3, // Adjust the thickness of the underline
                                                            width: 'fit-content', // Make the underline cover the text width
                                                            marginBottom: 2, // Add some space between text and underline
                                                        }}>
                                                            {`Bank Account`}
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Bank Name: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.bankName}`}</Text>
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Branch Name: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.branchName}`}</Text>
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`SWIFTCODE: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.swiftCode}`}</Text>
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Address: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.address}`}</Text>
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Name of Account Holder: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.accountHolder}`}</Text>
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Account Number: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.bankAccount.accountNumberValue}`}</Text>
                                                        </Text>
                                                    </View>

                                                    <View style={{ flex: 1 }}>

                                                        <Text style={{
                                                            fontWeight: 750,
                                                            fontSize: 14 * widthScaleFactor,
                                                            borderBottomWidth: 3, // Adjust the thickness of the underline
                                                            width: 'fit-content', // Make the underline cover the text width
                                                            marginBottom: 2, // Add some space between text and underline
                                                        }}>
                                                            {`Payment Terms`}
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`Terms: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData?.bankInformations.paymentTerms}`}</Text>
                                                        </Text>

                                                        <View style={{ paddingTop: 30 * heightScaleFactor, }}>

                                                            <Text style={{
                                                                fontWeight: 750,
                                                                fontSize: 14 * widthScaleFactor,
                                                                borderBottomWidth: 3, // Adjust the thickness of the underline
                                                                width: 'fit-content', // Make the underline cover the text width
                                                                marginBottom: 2, // Add some space between text and underline
                                                                color: '#F00A0A',
                                                                borderBottomColor: '#F00A0A',
                                                            }}>
                                                                {`Payment Due`}
                                                            </Text>

                                                            <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, color: '#F00A0A', lineHeight: 14 * widthScaleFactor }}>{`Due Date: `}
                                                                <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, color: 'black', lineHeight: 14 * widthScaleFactor }}>{`${formattedDueDate}`}</Text>
                                                            </Text>

                                                        </View>

                                                    </View>

                                                </View>

                                            </View>}


                                        <View style={{
                                            position: 'absolute',
                                            left: 38 * widthScaleFactor,
                                            top: (invoiceData?.placeOfDelivery && invoiceData?.cfs) || (invoiceData?.placeOfDelivery !== '' && invoiceData?.cfs !== '') ? 577 * heightScaleFactor : 537 * heightScaleFactor,
                                            width: 718 * widthScaleFactor,
                                            borderWidth: 1 * widthScaleFactor,
                                            borderColor: '#C2E2F4',
                                            alignSelf: 'center',
                                        }}>
                                            <View style={{ flex: 1, flexDirection: 'row', }}>

                                                <View style={{ flex: 2, justifyContent: 'center', }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                            color: '#008AC6',
                                                        }}>
                                                        {`Description`}
                                                    </Text>

                                                </View>

                                                <View style={{ flex: 2, justifyContent: 'center', }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                            color: '#008AC6',
                                                        }}>
                                                        {`Notes`}
                                                    </Text>
                                                </View>

                                                <View style={{ flex: 1, justifyContent: 'center', }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                            color: '#008AC6',
                                                        }}>
                                                        {`Quantity`}
                                                    </Text>
                                                </View>

                                                <View style={{ flex: 2, justifyContent: 'center', }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                            color: '#008AC6',
                                                        }}>
                                                        {`Amount`}
                                                    </Text>
                                                </View>

                                            </View>

                                            <View style={{ flex: 1, flexDirection: 'row', }}>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 5,
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            marginLeft: 2 * widthScaleFactor,
                                                        }}>
                                                        {`FOB`}
                                                    </Text>
                                                </View>


                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                        {`${convertedCurrency(Number(invoiceData?.paymentDetails.fobPrice))}`}
                                                    </Text>
                                                </View>

                                            </View>

                                            <View style={{ flex: 1, flexDirection: 'row', }}>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 5,
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            marginLeft: 2 * widthScaleFactor,
                                                        }}>
                                                        {`Freight`}
                                                    </Text>
                                                </View>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                        {`${convertedCurrency(Number(invoiceData?.paymentDetails.freightPrice))}`}
                                                    </Text>
                                                </View>

                                            </View>

                                            <View style={{ flex: 1, flexDirection: 'row', }}>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 5,
                                                    flexDirection: 'row',
                                                }}>
                                                    {invoiceData?.paymentDetails.inspectionIsChecked && (invoiceData?.paymentDetails.incoterms == "C&F" || invoiceData?.paymentDetails.incoterms == "FOB") && <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            marginLeft: 2 * widthScaleFactor,
                                                        }}>
                                                        {invoiceData?.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData?.paymentDetails.inspectionName}]` : ' '}
                                                    </Text>}

                                                    {invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                                        <>
                                                            <Text
                                                                style={{
                                                                    fontWeight: 400,
                                                                    fontSize: 12 * widthScaleFactor,
                                                                    lineHeight: 14 * widthScaleFactor,
                                                                    marginBottom: 3 * heightScaleFactor,
                                                                    marginLeft: 2 * widthScaleFactor,
                                                                }}>
                                                                {invoiceData?.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData?.paymentDetails.inspectionName}]` : ' '}
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    fontWeight: 400,
                                                                    fontSize: 12 * widthScaleFactor,
                                                                    lineHeight: 14 * widthScaleFactor,
                                                                    marginBottom: 3 * heightScaleFactor,
                                                                    marginLeft: 2 * widthScaleFactor,
                                                                }}>
                                                                {invoiceData?.paymentDetails.incoterms == "CIF" ? ` + Insurance` : ' '}
                                                            </Text>
                                                        </>
                                                    }

                                                    {!invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                marginLeft: 2 * widthScaleFactor,
                                                            }}>
                                                            {invoiceData?.paymentDetails.incoterms == "CIF" ? `Insurance` : ' '}
                                                        </Text>
                                                    }

                                                    {!invoiceData?.paymentDetails.inspectionIsChecked && (invoiceData?.paymentDetails.incoterms == "C&F" || invoiceData?.paymentDetails.incoterms == "FOB") &&
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                            }}>
                                                            {' '}
                                                        </Text>
                                                    }


                                                </View>


                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                }}>

                                                    {invoiceData?.paymentDetails.inspectionIsChecked && (invoiceData?.paymentDetails.incoterms == "C&F" || invoiceData?.paymentDetails.incoterms == "FOB") && <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                        {invoiceData?.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData?.paymentDetails.inspectionPrice))}` : ' '}
                                                    </Text>}

                                                    {invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                            {invoiceData?.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData?.paymentDetails.inspectionPrice))}` : ' '}
                                                            <Text
                                                                style={{
                                                                    fontWeight: 400,
                                                                    fontSize: 12 * widthScaleFactor,
                                                                    lineHeight: 14 * widthScaleFactor,
                                                                    marginBottom: 3 * heightScaleFactor,
                                                                }}>
                                                                {invoiceData?.paymentDetails.incoterms === "CIF" ? ` + ${convertedCurrency(Number(invoiceData?.paymentDetails.insurancePrice))}` : ' '}
                                                            </Text>
                                                        </Text>

                                                    }

                                                    {!invoiceData?.paymentDetails.inspectionIsChecked && invoiceData?.paymentDetails.incoterms == "CIF" &&
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',

                                                            }}>
                                                            {invoiceData?.paymentDetails.incoterms == "CIF" ? `${convertedCurrency(Number(invoiceData?.paymentDetails.insurancePrice))}` : ' '}
                                                        </Text>
                                                    }

                                                </View>


                                            </View>

                                            <View style={{ flex: 1, flexDirection: 'row', }}>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 5,
                                                    flexDirection: 'row',
                                                }}>
                                                    {invoiceData?.paymentDetails.additionalName && (invoiceData?.paymentDetails.additionalName).length > 0 && <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            marginLeft: 2 * widthScaleFactor,
                                                        }}>
                                                        {invoiceData?.paymentDetails.additionalName && (invoiceData?.paymentDetails.additionalName).length > 0 ? `${invoiceData?.paymentDetails.additionalName.join(' + ')}` : ' '}
                                                    </Text>}


                                                </View>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                        {invoiceData?.paymentDetails.additionalPrice && invoiceData?.paymentDetails.additionalPrice.length > 0
                                                            ? invoiceData?.paymentDetails.additionalPrice.map(price => {
                                                                const converted = convertedCurrency(Number(price));
                                                                return converted;
                                                            }).join(' + ')
                                                            : ' '}
                                                    </Text>
                                                </View>

                                            </View>

                                            <View style={{ flex: 1, flexDirection: 'row', }}>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                    flexDirection: 'row',
                                                    paddingVertical: 2 * heightScaleFactor,

                                                }}>
                                                    {invoiceData?.carData && invoiceData?.carData.carName ? (
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                            marginLeft: 2 * widthScaleFactor,
                                                        }}>
                                                            {"Used Vehicle\n"}
                                                            <Text style={{
                                                                fontWeight: 700,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${invoiceData?.carData.carName}\n`}
                                                            </Text>
                                                            <Text style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${invoiceData?.carData.chassisNumber}\n`}
                                                            </Text>
                                                            <Text style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${invoiceData?.carData.exteriorColor}\n`}
                                                            </Text>
                                                            <Text style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${Number(invoiceData?.carData.engineDisplacement).toLocaleString('en-US')} cc\n`}
                                                            </Text>
                                                            <Text style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${Number(invoiceData?.carData.mileage).toLocaleString('en-US')} km\n`}
                                                            </Text>
                                                            <Text style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${invoiceData?.carData.fuel}\n`}
                                                            </Text>
                                                            <Text style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                            }}>
                                                                {`${invoiceData?.carData.transmission}\n`}
                                                            </Text>
                                                        </Text>

                                                    ) : (
                                                        <Text>{' '}</Text>
                                                    )}


                                                </View>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                }}>
                                                    {invoiceData?.paymentDetails && invoiceData?.paymentDetails.incoterms && invoiceData?.discharge.port && invoiceData?.discharge ? (
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${invoiceData?.paymentDetails.incoterms} ${invoiceData?.discharge.port}`}
                                                        </Text>
                                                    ) : (
                                                        <Text>{' '}</Text>
                                                    )}
                                                </View>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                }}>
                                                    {invoiceData?.carData && invoiceData?.carData.carName ? (
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {'1'}
                                                        </Text>
                                                    ) : (
                                                        <Text>{' '}</Text>
                                                    )}


                                                </View>

                                                <View style={{
                                                    borderTopWidth: 1 * widthScaleFactor,
                                                    borderColor: '#C2E2F4',
                                                    flex: 2,
                                                    justifyContent: 'center',
                                                    flexDirection: 'row',
                                                }}>
                                                    {invoiceData?.paymentDetails && invoiceData?.paymentDetails.totalAmount ? (
                                                        <>
                                                            <Text style={{
                                                                fontWeight: 700,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                color: '#008AC6',
                                                                marginRight: 10 * widthScaleFactor,
                                                                top: 51 * heightScaleFactor,
                                                                left: 50 * widthScaleFactor,
                                                                position: 'absolute',
                                                            }}>
                                                                {"Total"}
                                                                <Text style={{
                                                                    fontWeight: 700,
                                                                    fontSize: 12 * widthScaleFactor,
                                                                    lineHeight: 14 * widthScaleFactor,
                                                                    marginBottom: 3 * heightScaleFactor,
                                                                    alignSelf: 'center',
                                                                    color: '#00720B',
                                                                    marginLeft: 5 * widthScaleFactor,
                                                                }}>
                                                                    {`${totalPriceCalculated()}`}
                                                                </Text>
                                                            </Text>

                                                        </>
                                                    ) : (
                                                        <Text>{' '}</Text>
                                                    )}
                                                </View>

                                            </View>

                                        </View>

                                        <View style={{ position: 'absolute', left: 38 * widthScaleFactor, top: 825 * heightScaleFactor, width: 350 * widthScaleFactor, }}>
                                            <Text style={{
                                                fontWeight: 700,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'Payment Information:'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'The customer is responsible for the bank charges incurred when the T/T (Telegraphic Transfer) is paid.'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                                marginBottom: 5 * heightScaleFactor,
                                            }}>
                                                {'No warranty service is provided on used vehicles.'}
                                            </Text>

                                            <Text style={{
                                                fontWeight: 700,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'Conditions for order cancellation:'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'(1) Order Cancellation Penalty: If the order is cancelled after payment, a penalty of USD 220 will apply.'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                                marginBottom: 5 * heightScaleFactor,

                                            }}>
                                                {'(2) Non-refund: Payment for vehicles purchased through pre-delivery inspection is non-refundable.'}
                                            </Text>

                                            <Text style={{
                                                fontWeight: 700,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'Intermediary Banking Information:'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'Bank Name: SUMITOMO MITSUI BANKING CORPORATION (NEW YORK BRANCH).'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,

                                            }}>
                                                {'Swift code: SMBCUS33'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                            }}>
                                                {'Address: 277 Park Avenue'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,

                                            }}>
                                                {'City: New York, NY'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,

                                            }}>
                                                {'Postal Code: 10172'}
                                            </Text>
                                            <Text style={{
                                                fontWeight: 400,
                                                fontSize: 12 * widthScaleFactor,
                                                lineHeight: 14 * heightScaleFactor,
                                                marginBottom: 5 * heightScaleFactor,

                                            }}>
                                                {'Country: United States'}
                                            </Text>
                                        </View>

                                        {selectedChatData.stepIndicator.value < 3 ? null :
                                            <View style={{ position: 'absolute', right: 39 * widthScaleFactor, top: 835 * heightScaleFactor, width: 300 * widthScaleFactor, }}>
                                                <View style={{
                                                    width: 300 * widthScaleFactor,
                                                    alignItems: 'center',
                                                    paddingBottom: 80 * heightScaleFactor, // Adjust this value to control space between image and line
                                                }}>
                                                    <Image

                                                        source={{ uri: hanko }}
                                                        style={{
                                                            width: 276 * widthScaleFactor,
                                                            height: 81 * heightScaleFactor,
                                                            resizeMode: 'contain',
                                                            alignSelf: 'center',
                                                            marginBottom: 0, // Minimize margin to keep the line close
                                                        }}
                                                    />
                                                    <View style={{
                                                        borderBottomWidth: 1 * heightScaleFactor,
                                                        borderColor: 'black', // Change the color as needed
                                                        width: '100%', // Line width as per your requirement
                                                    }} />
                                                    <Text italic style={{
                                                        fontWeight: 700,
                                                        fontSize: 16 * widthScaleFactor,
                                                    }}>
                                                        {'Real Motor Japan'}
                                                    </Text>
                                                </View>

                                                <View style={{
                                                    width: 300 * widthScaleFactor,
                                                    alignItems: 'center',
                                                    paddingBottom: 5 * heightScaleFactor, // Adjust this value to control space between image and line
                                                }}>

                                                    <View style={{
                                                        borderBottomWidth: 1 * heightScaleFactor,
                                                        borderColor: 'black', // Change the color as needed
                                                        width: '100%', // Line width as per your requirement
                                                    }} />
                                                    <Text italic style={{
                                                        fontWeight: 700,
                                                        fontSize: 16 * widthScaleFactor,
                                                    }}>
                                                        {'Your Signature'}
                                                    </Text>
                                                </View>
                                            </View>}


                                    </View>
                                }


                            </ScrollView>

                        }

                    </NativeBaseModal>
                </>
            }
            </>
        </NativeBaseProvider>
    );

}

const TimelineStatus = ({ currentStep }) => {
    const stepValue = currentStep?.value
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 3,
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dot: {
            width: 20,
            height: 20,
            borderRadius: 10,
            justifyContent: 'center',
        },
        image: {
            width: 15,
            height: 15,
            alignSelf: 'center',
        },
        line: {
            height: 3,
            width: 20,
        },
    });

    const statusData = [
        { title: 'Negotiation', value: 1 },
        { title: 'Issued Proforma Invoice', value: 2 },
        { title: 'Order Item', value: 3 },
        { title: 'Payment Confirmed', value: 4 },
        { title: 'Shipping Schedule', value: 5 },
        { title: 'Documents', value: 6 },
        { title: 'Vehicle Received', value: 7 },
    ];

    const getImageSource = (value, isActive) => {
        switch (value) {
            case 1:
                return isActive ? require('../assets/chat_step_1_on.webp') : require('../assets/chat_step_1_off.webp');
            case 2:
                return isActive ? require('../assets/chat_step_2_on.webp') : require('../assets/chat_step_2_off.webp');
            case 3:
                return isActive ? require('../assets/chat_step_3_on.webp') : require('../assets/chat_step_3_off.webp');
            case 4:
                return isActive ? require('../assets/chat_step_4_on.webp') : require('../assets/chat_step_4_off.webp');
            case 5:
                return isActive ? require('../assets/chat_step_5_on.webp') : require('../assets/chat_step_5_off.webp');
            case 6:
                return isActive ? require('../assets/chat_step_6_on.webp') : require('../assets/chat_step_6_off.webp');
            case 7:
                return isActive ? require('../assets/chat_step_7_on.webp') : require('../assets/chat_step_7_off.webp');
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {statusData.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <View style={[
                        styles.dot,
                        { backgroundColor: stepValue < item.value ? '#C1C1C1' : '#abf7c7' }
                    ]}>
                        <Image
                            source={getImageSource(item.value, stepValue >= item.value)}
                            style={styles.image}
                        />
                    </View>
                    {index < statusData.length - 1 && (
                        <View style={[
                            styles.line,
                            { backgroundColor: stepValue < item.value ? '#C1C1C1' : '#abf7c7' }
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );
};

const DocDelAdd = ({ screenWidth, accountData, selectedChatId, userEmail, context }) => {
    const activeChatId = selectedChatId;
    console.log('active chat id', activeChatId)
    let formData

    const styles = StyleSheet.create({
        input: {
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginTop: 5,
            marginBottom: 10,
            padding: 10,
            borderRadius: 5
        }
    });

    const [isChecked, setIsChecked] = useState(false);


    //fetch customer information


    const handleOutsidePress = () => {
        if (countryModal) setCountryModal(false);
        if (cityModal) setCityModal(false);

    };

    //fetch countries

    const [countryModal, setCountryModal] = useState(false);

    const [cityModal, setCityModal] = useState(false);
    const [cityModalNotify, setCityModalNotify] = useState(false);
    const toggleCityModal = () => {
        setCityModal(!cityModal)
    };
    const toggleCityModalNotify = () => {
        setCityModalNotify(!cityModalNotify)
    };
    const handleCitySelect = (item) => {
        if (cityModal === true) {
            setSelectedCity(item);
            toggleCityModal();

        } else {
            return;
        }
    };



    //fetch cities



    //variables ref
    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const emailRef = useRef(null);
    const faxRef = useRef(null);
    const [telephoneInputs, setTelephoneInputs] = useState([0]); // Default with one input
    const telephoneRefs = useRef({ 0: '' });
    const [showAlert, setShowAlert] = useState(false);
    // Store input values here
    const addTelephoneInput = () => {
        if (telephoneInputs.length >= 3) {
            setShowAlert(true);
            return;
        }
        const newInputId = telephoneInputs.length;
        telephoneRefs.current[newInputId] = ''; // Initialize new ref value
        setTelephoneInputs(prev => [...prev, newInputId]); // Add new input ID
    };
    const [renderTrigger, setRenderTrigger] = useState(0);
    useEffect(() => {
        if (isChecked && accountData) {
            const fullName = `${accountData?.textFirst || ''} ${accountData?.textLast || ''}`;
            const address = `${accountData?.textStreet || ''} ${accountData?.textZip || ''}`
            const emailAddress = `${accountData?.textEmail || ''}`
            fullNameRef.current = fullName;
            addressRef.current = address;
            emailRef.current = emailAddress;
            const telephones = Array.isArray(accountData?.textPhoneNumber)
                ? accountData.textPhoneNumber // Use it directly if it's already an array
                : accountData?.textPhoneNumber
                    ? [accountData.textPhoneNumber] // Convert to array if it's a string
                    : [];
            telephones.forEach((tel, index) => {
                if (index < 3) { // Limit to 3 inputs
                    telephoneRefs.current[index] = tel;
                    if (!telephoneInputs.includes(index)) {
                        setTelephoneInputs(prev => [...prev, index]);
                    }
                }
            });
            setSelectedCity(accountData?.city)
            setSelectedCountryCode({ name: accountData?.country || '' });
            setRenderTrigger(prev => prev + 1);
        } else {
            fullNameRef.current = '';
            addressRef.current = '';
            emailRef.current = '';
            setRenderTrigger(prev => prev + 1);
            Object.keys(telephoneRefs.current).forEach(key => {
                telephoneRefs.current[key] = '';
            });
            setTelephoneInputs([0]);
            setSelectedCity('')
            setSelectedCountryCode({ name: '', code: '' || '' });
        }
    }, [isChecked, accountData]);

    const [isLoading, setIsLoading] = useState(false);
    const handleFinish = async () => {
        if (
            !fullNameRef.current ||
            !selectedCountryCode?.name ||
            !selectedCity ||
            !addressRef.current ||
            !emailRef.current ||
            Object.values(telephoneRefs.current).every(tel => !tel) // Checks if all telephone entries are empty
        ) {
            alert("Please fill up all the consignee details to continue.");
            return; // Stop further execution
        }
        setIsLoading(true)
        setRenderTrigger(prev => prev + 1);
        const response = await axios.get(timeApi);
        const momentDate = moment(response?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

        const url = ipInfo;

        const responseIP = await axios.get(url);
        const ip = responseIP.data.ip;
        const ipCountry = responseIP.data.country_name;
        const ipCountryCode = responseIP.data.country_code
        const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
        const telephonesArray = Object.values(telephoneRefs.current);
        const messageText = `🌟 DOCUMENT DELIVERY ADDRESS 🌟
        🔍 Delivery Details:
        - Full Name: ${fullNameRef.current || 'N/A'}
        - Country: ${selectedCountryCode?.name || 'N/A'}
        - City: ${selectedCity || 'N/A'}
        - Address: ${addressRef.current || 'N/A'}
        - Fax Number: ${faxRef.current || 'N/A'}
        - Email: ${emailRef.current || 'N/A'}
        - Telephones: ${telephonesArray.length > 0 ? telephonesArray.join(', ') : 'No telephones provided'}

        Kind regards,
        ${fullNameRef.current || 'N/A'}`;

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', activeChatId);
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', activeChatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: messageText,
                timestamp: formattedTime,
                messageType: 'important',
                ip: ip,
                ipCountry: ipCountry,
                ipCountryCode: ipCountryCode
            };
            await setDoc(newMessageDocExtension, messageData, { merge: true });
            await updateDoc(orderRef, {

                docDelAdd: {
                    deliveryInfo: {
                        formData: {
                            fullName: fullNameRef.current,
                            country: selectedCountryCode?.name,
                            city: selectedCity,
                            address: addressRef.current,
                            faxNumber: faxRef.current || '',
                            email: emailRef.current,
                            telephones: telephonesArray,
                        }


                    },


                },

            })
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            await updateDoc(doc(fieldUpdate, activeChatId), {
                lastMessage: messageText,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });

        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        } finally {
            setIsLoading(false);
            setModalVisible(false);
        }


    };
    // useEffect to fetch IP and Country

    //fetch ip address


    //variables ref

    const [modalVisible, setModalVisible] = useState(false);
    const handlePress = () => {
        setModalVisible(true);
        handleOutsidePress();
    };
    const [isCheck, setIsCheck] = useState(false);
    const checkButton = (option) => {
        setIsCheck(option);

    }
    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (id) => {
        setActiveDropdown(prevId => (prevId === id ? null : id));
    };
    const [selectedCountryCode, setSelectedCountryCode] = useState({ name: '', code: '' });
    const [selectedCity, setSelectedCity] = useState('');
    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    return (
        <Pressable
            style={({ pressed, hovered }) => ([context === 'chat' ? {
                backgroundColor: pressed
                    ? '#B22222' // Darker red on press
                    : hovered
                        ? '#FFD700' // DHL yellow on hover
                        : '#FFCC00', // Default DHL yellow
                padding: 15,
                margin: 5,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                flex: 1 // For Android shadow
            } : {
                borderWidth: 1,
                borderColor: '#16A34A',
                backgroundColor: hovered ? '#f0fdf4' : 'transparent',
                opacity: pressed ? 0.5 : 1,
                borderRadius: 5,
                paddingVertical: 7,
                paddingHorizontal: 20,
                padding: 5,
            }])}
            onPress={handlePress}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',

                }}
            >
                {context === 'chat' ? (

                    <Text style={{ color: '#BA0C2F', fontWeight: '700' }}>Delivery Address</Text>

                ) : (
                    <>
                        <FontAwesome name="envelope-o" size={16} color="#16A34A" style={{ marginRight: 5 }} />
                        <Text style={{ color: '#16A34A', fontWeight: '700' }}>Delivery Address</Text>
                    </>
                )}

            </View>

            {
                modalVisible && (
                    <Modal
                        transparent={true}
                        animationType='fade'
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        {showAlert && (
                            <Alert
                                variant="warning"
                                title="Error"
                                description="Max phone numbers reached."
                                onClose={() => setShowAlert(false)}
                            />
                        )}
                        <TouchableWithoutFeedback onPress={() => toggleDropdown(null)}>
                            <View style={{
                                flex: 3,
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                paddingHorizontal: 5// Ensure this is positioned relatively to contain absolute children
                            }}>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                }} />

                                <View style={{
                                    flex: 1,
                                    width: '100%',
                                    maxWidth: 600,
                                    height: '100%',
                                    maxHeight: 650,
                                    backgroundColor: 'white',
                                    borderRadius: 5,
                                    padding: 5,
                                    paddingHorizontal: 5,
                                    marginHorizontal: 15,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 5,

                                }}>
                                    <TouchableOpacity style={{ alignSelf: 'flex-end', margin: 15 }} onPress={() => setModalVisible(false)}>
                                        <AntDesign name="close" size={25} />
                                    </TouchableOpacity>
                                    <View style={{ paddingBottom: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomWidth: 1, borderBottomColor: 'blue', marginHorizontal: 20 }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: 'blue' }}>Document Delivery Information</Text>
                                    </View>
                                    <ScrollView keyboardShouldPersistTaps='always' style={{ flex: 1 }}>
                                        <View style={{ marginBottom: 10, padding: 10, marginHorizontal: 15, flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Delivery Information</Text>
                                                <TouchableOpacity onPress={() => { console.log('clicked'); setIsChecked(!isChecked) }}

                                                    style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                    <MaterialIcons
                                                        name={isChecked === true ? 'check-box' : 'check-box-outline-blank'}
                                                        size={20}
                                                        color="black"
                                                    />
                                                    <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View>
                                                <Text>Full Name</Text>
                                                <TextInput
                                                    key={renderTrigger}
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: '#CCCCCC',
                                                        padding: 10,
                                                        borderRadius: 5,
                                                        marginBottom: 10,
                                                    }}
                                                    placeholder="Enter full name"
                                                    placeholderTextColor="#CCCCCC"
                                                    defaultValue={fullNameRef.current} // Use `value` instead of `defaultValue`
                                                    onChangeText={(e) => {
                                                        fullNameRef.current = e; // Update ref with the current input
                                                    }}
                                                />
                                            </View>

                                            <CountryCityDropdown context={context} area={'consignee'} activeDropdown={activeDropdown} toggleDropdown={toggleDropdown} selectedCountryCode={selectedCountryCode} setSelectedCountryCode={setSelectedCountryCode} selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

                                            <View style={{ marginTop: 5, zIndex: -99 }}>
                                                <Text>Address</Text>
                                                <TextInput
                                                    key={renderTrigger}
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: '#CCCCCC',
                                                        padding: 10,
                                                        borderRadius: 5,
                                                        marginBottom: 10,
                                                        zIndex: -1
                                                    }}
                                                    placeholder="Enter full address"
                                                    placeholderTextColor={'#CCCCCC'}
                                                    defaultValue={addressRef.current} // Use `value` instead of `defaultValue`
                                                    onChangeText={(e) => {
                                                        addressRef.current = e; // Update ref with the current input
                                                    }}
                                                />

                                            </View>

                                            <View style={{ zIndex: -99 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 3 }}>
                                                    <Text>Telephone Number</Text>
                                                    <Pressable
                                                        onPress={addTelephoneInput}
                                                        style={({ pressed, hovered }) => ({
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            padding: 4,  // Reduced padding for a smaller size
                                                            borderRadius: 2,  // Smaller border radius for a tighter shape
                                                            borderWidth: 1,
                                                            borderColor: 'blue',
                                                            marginLeft: 2,
                                                            backgroundColor: pressed ? 'lightgray' : hovered ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                                        })}
                                                    >
                                                        <MaterialCommunityIcons name="plus" color='blue' size={14} />
                                                        <Text selectable={false} style={{ marginLeft: 3, fontSize: 12, color: 'blue', fontWeight: 'bold' }}>Add Telephone</Text>
                                                    </Pressable>

                                                </View>

                                                {telephoneInputs.map((inputId, index) => (
                                                    <View key={inputId} style={{ marginBottom: 10 }}>
                                                        <TextInput
                                                            key={renderTrigger}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: '#CCCCCC',
                                                                padding: 10,
                                                                borderRadius: 5,
                                                                marginBottom: 10,
                                                                zIndex: -1
                                                            }}
                                                            placeholderTextColor={'#CCCCCC'}
                                                            placeholder={`Telephone Number ${index + 1}`}
                                                            defaultValue={telephoneRefs.current[inputId]}
                                                            onChangeText={(text) => {
                                                                telephoneRefs.current[inputId] = text; // Update the value in refs
                                                            }}
                                                        />
                                                    </View>
                                                ))}
                                            </View>

                                            <View style={{ zIndex: -99 }}>
                                                <Text>Fax Number</Text>
                                                <TextInput
                                                    key={renderTrigger}

                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: '#CCCCCC',
                                                        padding: 10,
                                                        borderRadius: 5,
                                                        marginBottom: 10,
                                                        zIndex: -1
                                                    }}
                                                    placeholder="Enter fax number"
                                                    placeholderTextColor={'#CCCCCC'}
                                                    defaultValue={faxRef.current} // Use `value` instead of `defaultValue`
                                                    onChangeText={(e) => {
                                                        faxRef.current = e; // Update ref with the current input
                                                    }}
                                                />
                                            </View>

                                            <View style={{ marginBottom: 5, zIndex: -99 }}>
                                                <Text>E-mail</Text>
                                                <TextInput

                                                    key={renderTrigger}
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: '#CCCCCC',
                                                        padding: 10,
                                                        borderRadius: 5,
                                                        marginBottom: 10,
                                                        zIndex: -1
                                                    }}
                                                    placeholder="Enter full address"
                                                    placeholderTextColor={'#CCCCCC'}
                                                    defaultValue={emailRef.current} // Use `value` instead of `defaultValue`
                                                    onChangeText={(e) => {
                                                        emailRef.current = e; // Update ref with the current input
                                                    }}
                                                />

                                            </View>




                                        </View>
                                    </ScrollView>
                                    <View style={{ marginBottom: 10, }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, zIndex: -5, marginHorizontal: 10 }}>
                                            {isCheck ? (
                                                <Feather name='check-square' size={20} onPress={() => checkButton(false)} />
                                            ) : (
                                                <Feather name='square' size={20} onPress={() => checkButton(true)} />
                                            )}
                                            <Text style={{ marginLeft: 8, fontSize: 14 }}>I agree to Privacy Policy and Terms of Agreement</Text>
                                        </View>

                                        <View style={{ marginTop: 20, flexDirection: 'row', paddingHorizontal: 10, zIndex: -5 }}>
                                            <Pressable
                                                style={({ pressed, hovered }) => [
                                                    {
                                                        backgroundColor: pressed
                                                            ? '#e0e0e0' // Lighter gray when pressed
                                                            : hovered
                                                                ? '#f5f5f5' // Light gray when hovered
                                                                : 'white', // Default color
                                                        padding: 15,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                        marginBottom: 10,
                                                        flex: 1,
                                                        marginRight: 5,
                                                        zIndex: -1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'center',
                                                        borderColor: 'black',
                                                        borderWidth: 2,
                                                    },
                                                ]}
                                            >
                                                <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={handleFinish}
                                                style={({ pressed, hovered }) => [
                                                    {
                                                        backgroundColor: pressed
                                                            ? '#003bb3' // Darker blue on press
                                                            : hovered
                                                                ? '#4b73f8' // Lighter blue on hover
                                                                : '#0642F4', // Default blue
                                                        padding: 15,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                        marginBottom: 10,
                                                        flex: 1,
                                                        marginRight: 5,
                                                        zIndex: -1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'center',
                                                    },
                                                ]}
                                            >
                                                {isLoading ? (
                                                    <ActivityIndicator color="#fff" />
                                                ) : (
                                                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Confirm</Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                )
            }

        </Pressable>
    )
};
const Testimonials = ({ bookingData, invoiceData, selectedData, selectedChatId, userEmail, accountData }) => {
    console.log('all them', bookingData, invoiceData, selectedChatId, selectedData, userEmail, accountData);
    const [modalVisible, setModalVisible] = useState(false);
    const textInputRef = useRef(null);
    const consigneeDetails = invoiceData?.consignee;
    const [selectedFile, setSelectedFile] = useState(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const [showFileExceeded, setShowFileExceeded] = useState(false);
    const [errorHandling, setErrorHandling] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const sendFeedback = async () => {
        if (!textInputRef.current) {
            setErrorHandling(true);
            return;
        }
        setIsLoading(true)
        try {


            // Fetch IP and time information
            const [ipResponse, timeResponse] = await Promise.all([
                axios.get(ipInfo),
                axios.get(timeApi),
            ]);

            const ipData = ipResponse.data;

            const momentDate = moment(timeResponse?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

            const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
            const feedback = {
                carId: selectedData?.carData?.stockID,
                userEmail: userEmail,
                carData: selectedData?.carData,
                formattedTime: formattedTime,
                recipientEmail: [
                    'marc@realmotor.jp',
                    'carl@realmotor.jp',
                    '510@realmotor.jp',
                    'yusuke.k@realmotor.jp',
                    'qiong.han@realmotor.jp',
                ],
                consigneeDetails: consigneeDetails,
                selectedFile: selectedFile ? selectedFile : '',
                textInput: textInputRef.current,
                ip: ipData.ip,
                ipCountry: ipData.country_name,
                ipCountryCode: ipData.country_code,
                accountName: `${accountData?.textFirst} ${accountData?.textLast}`,
                hNumber: selectedData?.hNumber
            };

            await axios.post(
                feedBackData,
                feedback,
                { headers: { 'Content-Type': 'application/json' } }
            );



        } catch (error) {
            console.error('Error during conversation creation:', error);
        } finally {
            setModalVisible(false)
            setErrorHandling(false);
            setIsLoading(false);
        }
    };
    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',  // Restrict to images only
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Allow only common image MIME types
                const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

                if (!allowedImageTypes.includes(fileBlob.type)) {
                    console.log('Only JPEG, PNG, GIF, and WEBP images are allowed.');
                    alert('Only JPEG, PNG, GIF, and WEBP images are allowed.');
                    return;
                }

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };
    const feedBack = selectedData.feedBack;
    return (
        <Pressable
            style={({ pressed, hovered }) => ({
                backgroundColor: feedBack
                    ? '#CCCCCC' // Grey color when disabled
                    : pressed
                        ? '#000099' // Darker blue on press
                        : hovered
                            ? '#3333FF' // Lighter blue on hover
                            : '#0000FF', // Default blue
                padding: 15,
                margin: 5,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: feedBack ? '#AAAAAA' : '#9999FF', // Grey border when disabled
                shadowColor: feedBack ? 'transparent' : '#000', // Remove shadow when disabled
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: feedBack ? 0 : 0.1,
                shadowRadius: 4,
                elevation: feedBack ? 0 : 2,  // Remove elevation when disabled
                flex: 1,
                opacity: feedBack ? 0.5 : 1,  // Lower opacity when disabled
            })}
            onPress={feedBack ? null : () => setModalVisible(true)}  // Disable button functionality if feedBack is true
        >
            <Text style={{ color: feedBack ? '#888888' : '#FFFFFF', textAlign: 'center', fontWeight: '700' }}>
                {feedBack ? 'Thank you for your Feedback' : 'Share your Feedback'}
            </Text>

            {
                modalVisible && (
                    <Modal
                        transparent={true}
                        animationType='fade'
                        visible={modalVisible}
                    >

                        <View style={{
                            flex: 3,
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            paddingHorizontal: 15// Ensure this is positioned relatively to contain absolute children
                        }}>
                            <Pressable style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                            }} />

                            <View style={{

                                width: '100%',
                                maxWidth: 600,
                                backgroundColor: 'white',
                                borderRadius: 5,
                                padding: 5,
                                paddingHorizontal: 5,
                                marginHorizontal: 15,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 5,
                                justifyContent: 'flex-start',
                                alignItems: 'center'
                            }}>
                                <View
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: 12,
                                        width: '100%',
                                        padding: 20,
                                        position: 'relative',
                                    }}
                                >
                                    <TouchableOpacity

                                        style={{
                                            position: 'absolute',
                                            right: 5,
                                            top: 5,
                                            padding: 8,
                                        }}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <AntDesign name='close' size={16} />
                                    </TouchableOpacity>


                                    <Text
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 'bold',
                                            color: '#0000ff',
                                            marginBottom: 8,
                                        }}
                                    >
                                        Delivery Confirmation
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: '#555',
                                            marginBottom: 20,
                                        }}
                                    >
                                        Share your experience with our product. Your feedback is valuable to us!
                                    </Text>

                                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                                        <View style={{ marginBottom: 16 }}>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: '600',
                                                    color: '#0000ff',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                Feedback
                                            </Text>

                                            <TextInput

                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: errorHandling ? 'red' : '#007bff',
                                                    borderRadius: 8,
                                                    padding: 10,
                                                    height: 100,
                                                    textAlignVertical: 'top',
                                                    fontSize: 14,
                                                    color: '#333',
                                                }}
                                                placeholder="Provide us with a feedback."
                                                multiline
                                                numberOfLines={4}
                                                required
                                                defaultValue={textInputRef.current} // Use `value` instead of `defaultValue`
                                                onChangeText={(e) => {
                                                    textInputRef.current = e; // Update ref with the current input
                                                }}
                                            />
                                        </View>


                                        <View style={{ marginBottom: 16 }}>
                                            <TouchableOpacity
                                                style={{
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: 12,
                                                    borderWidth: 1,
                                                    borderColor: '#007bff',
                                                    borderRadius: 8,
                                                    width: '100%',
                                                    maxWidth: 150,

                                                }}
                                                onPress={uploadRemitterFiles}
                                            >
                                                <Text
                                                    style={{
                                                        color: '#0000ff',
                                                        fontSize: 14,
                                                        fontWeight: 'bold',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Submit Image
                                                </Text>
                                            </TouchableOpacity>
                                            {selectedFile && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1 }}>{selectedFile.name}</Text>
                                                    <TouchableOpacity onPress={deleteSelectedFile} style={{ marginLeft: 5 }}>
                                                        <Text style={{ color: 'red' }}>X</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isLoading ? '#888888' : '#0000ff',
                                                padding: 12,
                                                borderRadius: 8,
                                                marginTop: 16,
                                                opacity: isLoading ? 0.7 : 1,  // Visual feedback when loading
                                            }}
                                            onPress={isLoading ? null : sendFeedback}  // Disable press when loading
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator size="small" color="white" />
                                            ) : (
                                                <>
                                                    <Feather name='send' size={16} color='white' />
                                                    <Text
                                                        style={{
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                            fontSize: 14,
                                                            marginLeft: 8,
                                                        }}
                                                    >
                                                        Submit Delivery Confirmation
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>

                                    </ScrollView>
                                </View>
                            </View>
                        </View>

                    </Modal>

                )
            }
            {showFileExceeded && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showFileExceeded}
                    onRequestClose={() => setShowFileExceeded(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, maxWidth: 300, width: '80%' }}>
                                <Text>File size exceeds the maximum limit.</Text>
                                <TouchableOpacity onPress={() => setShowFileExceeded(false)}>
                                    <Text style={{ color: 'blue', marginTop: 10 }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

        </Pressable>
    )
}
const LoadingLeftComponent = () => {
    const styles = StyleSheet.create({
        loadingContainer: {
            flex: 3, // Takes up 3 parts of the flex space
            justifyContent: 'center', // Centers the spinner vertically
            alignItems: 'center', // Centers the spinner horizontally
        },
    });
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" /> {/* You can customize the size and color */}
        </View>
    );
};



const TextInputForChat = ({ inputRefKeyboard, scrollViewRef, chatId, userEmail }) => {


    const [isLoading, setIsLoading] = useState(false)
    const makeTrueRead = async (readTrue) => {
        if (!userEmail) {
            console.log('No user email available.');
            return;
        }

        const fieldUpdate = doc(projectExtensionFirestore, 'chats', chatId);
        try {
            await updateDoc(fieldUpdate, {
                customerRead: readTrue
            })
        } catch (error) {
            console.error('Error updating false:', error);
        }
    }
    useEffect(() => {
        if (chatId) {
            makeTrueRead(true);
        }
    }, [chatId, userEmail, isLoading]);
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
            setScreenHeight(window.height); // Update screenHeight as well
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);


    const [messages, setMessages] = useState({});
    const currentChatId = chatId;
    //fetch the carData

    const handleMessageChange = (text) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [currentChatId]: text
        }));
    };

    //fetch ip address

    //fetch ip address

    const handleSend = async () => {
        setIsLoading(true);
        // onSubmitEditing();

        setInputHeight(40);
        try {
            const response = await axios.get(timeApi);

            const url = ipInfo;

            const responseIP = await axios.get(url);

            const momentDate = moment(response?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

            const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');
            const ip = responseIP.data.ip;
            const ipCountry = responseIP.data.country_name;
            const ipCountryCode = responseIP.data.country_code
            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
                ip: ip,
                ipCountry: ipCountry,
                ipCountryCode: ipCountryCode
            };

            // Set the message data in the new message document
            await setDoc(newMessageDocExtension, messageData);
            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: messageValue,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setMessages('');

            // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false)
        }

    };

    //USES NEW DATABASE BUT STILL NEED CHECKING
    const messageValue = messages[currentChatId] || '';


    //FETCHING IMAGES
    //DOWNLOAD SHIPPING INSTRUCTIONS
    const [isHovered, setIsHovered] = useState(false);

    //DOWNLOAD SHIPPING INSTRUCTIONS

    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const handleCloseModal = () => {
        setShowFileExceeded(false);
    };
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Check if the file is an SVG (disallow)
                if (fileBlob.type === 'image/svg+xml' || name.toLowerCase().endsWith('.svg')) {
                    console.log('SVG files are not allowed to be uploaded.');
                    alert('SVG files are not allowed to be uploaded.');
                    return;
                }

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };


    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const updateCustomerFiles = async () => {
        setIsLoading(true);

        try {
            // 1. Fetch current server time
            const response = await axios.get(timeApi);

            const url = ipInfo;

            // 2. Fetch IP info
            const responseIP = await axios.get(url);

            // 3. Format time
            const momentDate = moment(response?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

            const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
            // 4. Prepare storage reference
            const storageRef = ref(projectExtensionStorage, `ChatFiles/${chatId}/${selectedFile.name}`);
            const fileBlob = await fetch(selectedFile.uri).then((response) => response.blob());

            // 5. Extract file extension (lowercase)
            const fileNameParts = selectedFile.name.split('.');
            const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';
            const ip = responseIP.data.ip;
            const ipCountry = responseIP.data.country_name;
            const ipCountryCode = responseIP.data.country_code;

            // ==================================================================================
            // SECURITY CHECKPOINT
            // ==================================================================================

            // 5a. SVG check (already in your code, leaving it here for clarity)
            if (fileBlob.type === 'image/svg+xml' || fileExtension === 'svg') {
                console.log('SVG files are not allowed to be uploaded.');
                alert('SVG files are not allowed to be uploaded.');
                return;
            }

            // 5b. Whitelist approach: define ALLOWED file extensions
            // You can modify this list to add/remove file types:
            const allowedExtensions = [
                'jpg', 'jpeg', 'png',   // images
                'pdf',                  // pdf
                'doc', 'docx',          // word docs
                'xls', 'xlsx',          // excel
                // add any others you want to explicitly allow
            ];

            // Check if the extension is NOT in the allowed list
            if (!allowedExtensions.includes(fileExtension)) {
                console.log(`File type .${fileExtension} is blocked.`);
                alert(`Uploading .${fileExtension} files is not allowed for security reasons.`);
                return;
            }

            // ==================================================================================

            let fileType = '';
            let messageText = '';

            // 6. Determine file type for your message logic
            if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                fileType = 'image';
                messageText = 'Sent an image';
            } else if (fileExtension === 'pdf') {
                fileType = 'attachment';
                messageText = 'Sent a link';
            } else if (fileExtension === 'xlsx') {
                fileType = 'attachment';
                messageText = 'Sent a link';
            } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                fileType = 'attachment';
                messageText = 'Sent a link';
            } else {
                // For any allowed extension not specifically handled above
                fileType = 'link';
                messageText = 'Sent a link';
            }

            // 7. Debug: log the file size
            console.log('File size:', fileBlob.size);

            // 8. Upload the file
            await uploadBytes(storageRef, fileBlob);
            const downloadURL = await getDownloadURL(storageRef);

            // 9. Create a new message document
            const newMessageDocExtension = doc(
                collection(projectExtensionFirestore, 'chats', chatId, 'messages')
            );

            const messageData = {
                sender: userEmail,      // Sender's email
                text: messageValue,     // Possibly text input from user
                timestamp: formattedTime,
                file: {
                    url: downloadURL,
                    type: fileType,
                    name: selectedFile.name,
                },
                ip: ip,
                ipCountry: ipCountry,
                ipCountryCode: ipCountryCode
            };

            await setDoc(newMessageDocExtension, messageData);

            // 10. Update the "chats" collection to reflect the new message
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');
            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: messageValue ? messageValue : messageText,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });

            // 11. Reset file selection and notify success
            setSelectedFile(null);
            console.log('File uploaded successfully!');

        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleDownloadPDF = (chatId, pdfLink) => {
        // Assuming you want to open PDF links in a browser
        if (pdfLink.endsWith('.pdf')) {
            Linking.openURL(pdfLink);
        } else {
        }
    };

    const handleOpenLink = (link) => {
        Linking.openURL(link);
    };

    const [inputHeight, setInputHeight] = useState(40); // Start with the minimum height

    const resetInput = (e) => {
        if (e && e.nativeEvent && e.nativeEvent.target) {
            e.nativeEvent.target.style.height = '40px'; // Reset height to minHeight on submit
            e.nativeEvent.target.style.overflow = 'hidden'; // Reset scroll to hidden
        }
    };

    return (

        <View style={[styles.inputContainer, { zIndex: 999, margin: 5, marginTop: 0, marginRight: 5, borderRadius: 3 }]}>
            <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
                {selectedFile && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1 }}>{selectedFile.name}</Text>
                        <TouchableOpacity onPress={deleteSelectedFile} style={{ marginLeft: 5 }}>
                            <Text style={{ color: 'red' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TextInput
                    ref={inputRefKeyboard}
                    placeholder="Type your message"
                    placeholderTextColor={'#B1B1B1'}
                    value={messageValue}
                    onChangeText={(text) => handleMessageChange(text)}
                    blurOnSubmit
                    multiline
                    numberOfLines={1}
                    style={[styles.input, { outlineStyle: 'none' }]}
                    onChange={(e) => {
                        const target = e.nativeEvent.target;
                        target.style.height = '0px';  // Reset the height
                        const scrollHeight = Math.min(target.scrollHeight, 300);
                        target.style.height = `${scrollHeight}px`; // Set height based on content up to 300px
                        target.style.overflow = (scrollHeight >= 300 ? 'scroll' : 'hidden'); // Enable scroll only at 300px
                    }}
                    onSubmitEditing={() => {
                        const trimmedMessage = messageValue.trim();  // Trim the message value

                        // Proceed if there is text or a file is selected
                        if (trimmedMessage.length > 0 || selectedFile) {
                            if (selectedFile) {
                                updateCustomerFiles();  // Call updateCustomerFiles if a file is selected
                            } else {
                                handleSend(trimmedMessage);  // Send the trimmed message if no file is selected
                            }
                        }

                        // Clear the message input in the state
                        setMessages('');

                        // Reset the input height and overflow using a simulated event
                        if (inputRef && inputRef.current) {
                            const fakeEvent = { nativeEvent: { target: inputRef.current } };
                            resetInput(fakeEvent);
                        }
                    }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {showFileExceeded && (
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={showFileExceeded}
                            onRequestClose={() => setShowFileExceeded(false)}
                        >
                            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, maxWidth: 300, width: '80%' }}>
                                        <Text>File size exceeds the maximum limit.</Text>
                                        <TouchableOpacity onPress={() => setShowFileExceeded(false)}>
                                            <Text style={{ color: 'blue', marginTop: 10 }}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}
                    {/* {isHovered && (
                    <View style={{
                        position: 'absolute',
                        backgroundColor: '#333',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 10,
                        left: 30,
                        transform: [{ translateX: -25 }],
                        top: -40,
                    }}>
                        <Text style={{ color: '#fff' }}>Upload Files</Text>
                        <View
                            style={{
                                position: 'absolute',
                                top: 25,
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderTopWidth: 0,
                                borderRightWidth: 15,
                                borderBottomWidth: 15,
                                borderLeftWidth: 15,
                                borderLeftColor: 'transparent',
                                borderRightColor: 'transparent',
                                borderTopColor: 'transparent',
                                borderBottomColor: '#333',
                                transform: [{ rotate: '180deg' }],
                                transition: 'transform 0.5s ease, opacity 0.5s ease',
                                zIndex: -999
                            }}
                        ></View>
                    </View>
                )} */}
                    <Pressable
                        onHoverIn={() => setIsHovered(true)}
                        onHoverOut={() => setIsHovered(false)}
                        onPress={() => uploadRemitterFiles()}
                        style={({ pressed, hovered }) => [
                            {
                                opacity: pressed ? 0.5 : 1,
                                backgroundColor: hovered ? '#f1f1f1' : 'transparent',
                                borderRadius: hovered ? 50 : 0,
                                margin: 5,
                                alignItems: 'center',
                            },
                            { zIndex: 999 }
                        ]}
                    >
                        <MaterialIcons name={'attach-file'} size={20} style={{ margin: 5, color: '#7b9cff' }} />
                    </Pressable>






                </View>
                <Pressable
                    style={({ pressed, hovered }) => [
                        {
                            borderRadius: 50,  // Always set borderRadius to 5
                            backgroundColor: hovered ? '#E5EBFE' : 'transparent',
                            height: 50,  // Increase height when hovered
                            width: 50,
                            alignItems: 'center',
                            justifyContent: 'center',

                        },
                    ]}
                    disabled={isLoading}
                    onPress={() => {
                        const trimmedMessage = messageValue.trim();  // Trim the message value

                        // Proceed if there is text or a file is selected
                        if (trimmedMessage.length > 0 || selectedFile) {
                            if (selectedFile) {
                                updateCustomerFiles();  // Call updateCustomerFiles if a file is selected
                            } else {
                                handleSend(trimmedMessage);  // Send the trimmed message if no file is selected
                            }
                        }

                        // Clear the message input in the state
                        setMessages('');

                        // Reset the input height and overflow using a simulated event
                        if (inputRef && inputRef.current) {
                            const fakeEvent = { nativeEvent: { target: inputRef.current } };
                            resetInput(fakeEvent);
                        }
                    }}
                >
                    {isLoading ? (<ActivityIndicator color="#0000ff" />) : (<Ionicons name="send-sharp" size={20} color="blue" />)}

                </Pressable>

            </View>


        </View>

    )
}


const ChatAnnouncementBar = ({ handleOrderModal, chatId, selectedChatData }) => {
    const slideAnim = useRef(new AnimatedRN.Value(-100)).current; // Initial position off-screen
    console.log('chat id', selectedChatData?.carData?.carName)
    useEffect(() => {
        // Reset the animation to off-screen position before animating down
        slideAnim.setValue(-100);

        // Start the animation when chatId changes
        AnimatedRN.timing(slideAnim, {
            toValue: 0, // Move to the final position
            duration: 500, // Animation duration
            useNativeDriver: true, // Use native driver for better performance
        }).start();
    }, [chatId]); // Depend only on chatId to re-trigger the animation
    return (
        <AnimatedRN.View style={{
            transform: [{ translateY: slideAnim }], // Apply slide animation
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginHorizontal: 10,
            zIndex: -99, // Ensures it stays above other content
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        }}>

            {/* Icon */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <AntDesign name="shoppingcart" size={24} color="#333" />
            </View>

            {/* Text */}
            <Text style={{
                flex: 1,
                color: '#333',
                fontSize: 14,
            }}>
                This unit <Text style={{ fontWeight: 'bold', color: '#333' }}>{`${selectedChatData?.carData?.carName}`}</Text> is now ready to be ordered in your name.
            </Text>

            {/* Order Button */}
            <TouchableOpacity
                onPress={handleOrderModal}
                style={{
                    backgroundColor: 'red',
                    borderRadius: 15,
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                }}>
                <Text style={{
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: '600',
                }}>Order Now</Text>
            </TouchableOpacity>
        </AnimatedRN.View>
    );
};
const ChatPaymentNotificationBar = ({ setPaymentModalVisible, selectedChatData, chatId, handleViewPaymentDetails, toggleModal, }) => {
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

    const slideAnim = useRef(new AnimatedRN.Value(-100)).current; // Initial position off-screen

    useEffect(() => {
        // Reset the animation to off-screen position before animating down
        slideAnim.setValue(-100);

        // Start the animation when chatId changes
        AnimatedRN.timing(slideAnim, {
            toValue: 0, // Move to the final position
            duration: 500, // Animation duration
            useNativeDriver: true, // Use native driver for better performance
        }).start();
    }, [chatId]);
    const notificationTextPrefix = screenWidth < 480
        ? "Payment for "
        : "Payment for ";

    const notificationTextSuffix = screenWidth < 480
        ? " needs attention."
        : " is pending and needs immediate attention.";
    return (
        <AnimatedRN.View style={{
            transform: [{ translateY: slideAnim }], // Apply slide animation
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginHorizontal: 10,
            zIndex: -99, // Ensures it stays above other content
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,

        }}>


            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <AntDesign name="creditcard" size={24} color="#333" />
            </View>


            <Text
                style={{
                    flex: 1,
                    fontSize: 14,
                    color: 'black',
                    marginHorizontal: 5  // Default color for non-highlighted text
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {notificationTextPrefix}
                <Text style={{ color: 'red' }}>
                    {selectedChatData?.carData?.carName}
                </Text>
                {notificationTextSuffix}
            </Text>


            <TouchableOpacity
                onPress={handleViewPaymentDetails}
                style={{
                    backgroundColor: '#0000ff',
                    borderRadius: 15,
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                }}>
                <Text style={{
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: '600',
                }}>Show Details</Text>
            </TouchableOpacity>
        </AnimatedRN.View>
    );
};

const ChatD = ({ userEmail, chatId, makeTrueRead, inputRefKeyboard, bookingData, accountData, openModalRequest, updateReadby, scrollViewRef, modalVisible, selectedChatData, invoiceData }) => {
    //BREAKPOINT
    const activeChatId = chatId;
    

    // Use useParams to access the chatId from the route
    const [messages, setMessages] = useState({});
    const currentChatId = chatId;
    const [chatMessages, setChatMessages] = useState([]);
    const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const loadLatestMessages = async () => {
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )
            );

            const newMessages = querySnapshot.docs.map(doc => doc.data()).reverse();

            if (newMessages.length > 0) {
                setOldestMessageTimestamp(newMessages[0].timestamp);
                setChatMessages(newMessages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
    const [paymentNotification, setPaymentNotification] = useState([]);

    console.log('PAYMENT', paymentNotification)
    useEffect(() => {
        if (!userEmail || !activeChatId) {
            console.log('No user email or chat ID available.');
            return;
        }

        const chatsRef = collection(projectExtensionFirestore, 'chats');
        const q = query(chatsRef, where('participants.customer', '==', userEmail));

        const fetchChatData = async () => {
            setChatMessages([]);
            try {
                const chatQuerySnapshot = await getDocs(q);
                if (!chatQuerySnapshot.empty) {
                    chatQuerySnapshot.forEach(async (chatDoc) => {
                        const messagesRef = collection(projectExtensionFirestore, 'chats', activeChatId, 'messages');
                        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(15));

                        const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
                            const messages = querySnapshot.docs.map((doc) => ({
                                id: doc.id,
                                ...doc.data(),
                                timestamp: doc.data().timestamp ? doc.data().timestamp.toString() : null
                            }));

                            if (messages.length > 0) {
                                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                            }
                            setChatMessages(messages);
                        });

                        const paymentRef = doc(projectExtensionFirestore, 'chats', activeChatId);
                        const unsubscribePayment = onSnapshot(paymentRef, (snapshot) => {
                            if (snapshot.exists()) {
                                const paymentNotificationsData = snapshot.data().paymentNotification || [];
                                setPaymentNotification(paymentNotificationsData);
                            }
                        });

                        return () => {
                            unsubscribeMessages();
                            unsubscribePayment();
                        };
                    });
                } else {
                    console.warn("No chats found for the user:", userEmail);
                }
                setIsChatLoaded(true); // Set to true once chat messages are loaded
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        };

        fetchChatData();

        return () => {
            setChatMessages([]); // Clear messages on unmount or dependency change
        };
    }, [activeChatId, userEmail]);


    const [isLoadingMore, setIsLoadingMore] = useState(false);

    console.log('chat messages', chatMessages)
    // Replace 'firestore' with your Firestore instance
    const firestore = getFirestore(); // Make sure to import getFirestore from Firebase

    // useEffect(() => {
    //     // Set up a real-time listener for messages in the specific chat conversation using activeChatId
    //     const unsubscribe = onSnapshot(
    //         collection(projectExtensionFirestore, 'chats', activeChatId, 'messages'),
    //         {
    //             query: orderBy('Time', 'asc'), // Order messages by timestamp
    //         },
    //         (snapshot) => {
    //             const messages = [];
    //             snapshot.forEach((doc) => {
    //                 messages.push(doc.data());
    //             });
    //             setChatMessages(messages);
    //         }
    //     );

    //     return () => {
    //         // Unsubscribe from the real-time listener when the component unmounts
    //         unsubscribe();
    //     };
    // }, [activeChatId]); //STILL USING OLD DATABASE

    //fetch the carId

    const [proformaIssue, setProformaIssue] = useState(null);
    const [chatField, setChatField] = useState([]);
    console.log('CAR ID FOR THIS SHITZZ: ', activeChatId);


    useEffect(() => {

        if (!activeChatId) {
            console.log('No user email available.');
            return;
        }
        if (!userEmail) {
            console.log('No user email available.');
            return;
        }
        // Define the reference to the chat document with the specific activeChatId
        const chatRef = doc(projectExtensionFirestore, 'chats', activeChatId);

        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(chatRef, (chatDocSnapshot) => {
            if (chatDocSnapshot.exists()) {
        
                const chatData = chatDocSnapshot.data();
                if (chatData) {
                    setChatField(chatData);
                }
                const proformaInvoice = chatDocSnapshot.data()?.proformaInvoice;
                if (proformaInvoice) {
                    setProformaIssue(proformaInvoice.proformaIssue);
                }
            }
        }, (error) => {
            console.error('Error listening to chat document:', error);
        });

        return () => {
            // Unsubscribe from the listener when the component unmounts
            unsubscribe();
        };
    }, []); //STILL USING OLD DATABASE

    //fetch the carId

    //fetch customer email
    //Reserved buttons
    const [reservationStatus, setReservationStatus] = useState(false);
    useEffect(() => {
        const fetchVehicleDoc = async () => {
            try {
                // Only fetch the vehicle document if carId is available
                if (carId) {
                    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
                    const docSnapshot = await getDoc(vehicleDocRef);

                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        const reserveValue = data.Reserve || false;
                        setReservationStatus(reserveValue);
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle document:', error);
            }
        };

        fetchVehicleDoc();
    }, [activeChatId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    const handleReserve = async () => {
        const carChatId = carId;
        try {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carChatId);
            await updateDoc(vehicleDocRef, {
                Reserve: true // Send a boolean value
            });

            setReservationStatus(true);
        } catch (error) {
            console.error('Error reserving vehicle:', error);
        }
    };
    //Reserved button




    //fetch the cardata
 
    //fetch the carData

    const handleMessageChange = (text) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [currentChatId]: text
        }));
    };


    //USES NEW DATABASE BUT STILL NEED CHECKING
    const messageValue = messages[currentChatId] || '';
    const navigate = ''
    const handlePress = () => {
        if (proformaIssue) {
            const url = `/ProfileFormChatGroup/${activeChatId}/print`;
            window.open(url, '_blank');
        }
    };

    //FETCHING IMAGES

    const handleImageLoad = () => {
        setLoading(false);
    };

    //DOWNLOAD SHIPPING INSTRUCTIONS

    const [isHovered, setIsHovered] = useState(false);

    //DOWNLOAD SHIPPING INSTRUCTIONS

    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };


    const handleOpenLink = (link) => {
        Linking.openURL(link);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                makeTrueRead(true); // Trigger function when scrolling
            }
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [makeTrueRead]);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0 && !isLoadingMore) {
                setIsLoadingMore(true); // Start loading more messages
                loadMoreMessages();
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [chatMessages, lastVisible, isLoadingMore]);
    useEffect(() => {
        if (isLoadingMore) {
            setIsLoadingMore(false);
        }
    }, [chatMessages.length]);

    // State to track if it's the first time the component is loading
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [previousChatId, setPreviousChatId] = useState(null);

    useEffect(() => {

        // Check for first load or change in activeChatId
        if (isFirstLoad || previousChatId !== chatId) {
            setTimeout(() => {
                const maxScroll = Math.max(
                    document.documentElement.scrollHeight,
                    document.body.scrollHeight
                );

                window.scrollTo({ top: maxScroll, behavior: 'auto' });
            }, 1000);

            setIsFirstLoad(false);
            setPreviousChatId(chatId); // Update the previousChatId state
        }

    }, [
        userEmail,
        chatMessages.length,
        chatId,
        isLoadingMore,
        hasMoreMessages,
        isFirstLoad,
        previousChatId, // Include the new state in dependencies
    ]);



    const loadMoreMessages = async () => {
        if (lastVisible) {
            const chatRef = collection(projectExtensionFirestore, 'chats', currentChatId, 'messages');
            const q = query(chatRef, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10));

            try {
                const querySnapshot = await getDocs(q);
                let messages = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const timestamp = data.timestamp ? data.timestamp.toString() : null;
                    messages.push({ id: doc.id, ...data, timestamp });
                });

                // Reverse the new messages to maintain ascending order before prepending
                messages.reverse();

                // Update lastVisible if there are more messages to load
                if (messages.length > 0) {
                    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                }

                // Prepend messages to keep ascending order from oldest to newest
                setChatMessages((prevMessages) => [...messages, ...prevMessages]);

                if (messages.length < 10) {
                    setHasMoreMessages(false); // No more messages to load
                }
                setIsLoadingMore(false);
            } catch (error) {
                console.error("Error loading more messages:", error);
            }
        }
    };

    const renderTextWithLinks = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <TouchableOpacity key={index} onPress={() => handleOpenLink(part)}>
                        <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{part}</Text>
                    </TouchableOpacity>
                );
            } else {
                return <Text key={index} style={{ color: 'black' }}>{part}</Text>;
            }
        });
    };


    //ANIMATIONS
    const animatedValue = useRef(new AnimatedRN.Value(0)).current;
    const [isChatLoaded, setIsChatLoaded] = useState(false); // Track if chat messages are loaded
    useEffect(() => {
        if (isChatLoaded) {
            AnimatedRN.loop(
                AnimatedRN.sequence([
                    AnimatedRN.timing(animatedValue, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                        isInteraction: false, // Prevents blocking list rendering
                    }),
                    AnimatedRN.timing(animatedValue, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                        isInteraction: false,
                    }),
                ]),
                { iterations: -1 } // Infinite loop
            ).start();
        }


    }, [isChatLoaded]);// Start animation only when chat is loaded

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [
            'rgb(255, 100, 100)', // Red
            'rgb(100, 255, 100)', // Green
            'rgb(100, 100, 255)', // Blue
            'rgb(255, 255, 100)', // Yellow
            'rgb(255, 100, 255)', // Magenta
        ],
    });
    //ANIMATIONS

    const formatTimestampToSortableString = (timestamp) => {
        const [datePart, timePart] = timestamp.split(' at ');
        const formattedDate = datePart.replace(/\//g, '');
        const formattedTime = timePart.replace(/:/g, '');
        return formattedDate + formattedTime;
    };
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
            setScreenHeight(window.height); // Update screenHeight as well
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    return (
        <View style={{
            backgroundColor: '#E5EBFE',

        }}>


            {isLoadingMore && (
                <View style={{ margin: 20 }}>
                    <ActivityIndicator size="small" color="#0000ff" />
                </View>
            )}
            {showFileExceeded && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showFileExceeded}
                    onRequestClose={() => setShowFileExceeded(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, maxWidth: 300, width: '80%' }}>
                            <Text>File size exceeds the maximum limit.</Text>
                            <TouchableOpacity onPress={() => setShowFileExceeded(false)}>
                                <Text style={{ color: 'blue', marginTop: 10 }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            <View style={{ flex: 1, zIndex: -1 }}>
                {chatMessages && (

                    <FlatList
                        nestedScrollEnabled
                        style={{ flexGrow: 0 }}
                        data={chatMessages
                            .map((item) => ({
                                ...item,
                                sortableTimestamp: formatTimestampToSortableString(item.timestamp), // Add sortable timestamp
                            }))
                            .sort((a, b) => a.sortableTimestamp.localeCompare(b.sortableTimestamp))}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={{ paddingHorizontal: 5, flex: 1 }}>

                                {item.messageType === undefined && (
                                    <View
                                        style={{
                                            alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                            backgroundColor: item.sender === userEmail
                                                ? (item.fileType !== 'image' ? '#F1F5FF' : 'transparent')
                                                : 'white',
                                            padding: 10,
                                            margin: 5,
                                            borderRadius: 10,
                                            maxWidth: '70%'
                                        }}
                                    >
                                        {renderTextWithLinks(item.text)}
                                        {item.file && (
                                            <>
                                                {item.file.type === 'image' ? (

                                                    <ImageViewer uri={item.file.url} />

                                                ) : (
                                                    <TouchableOpacity onPress={() => handleOpenLink(item.file.url)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <MaterialIcons name='picture-as-pdf' color='red' size={18} />
                                                        <Text style={{ color: 'red', textDecorationLine: 'underline', marginLeft: 3 }}>
                                                            {item.file.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        )}
                                    </View>
                                )}

                                {item.messageType === 'InputDocDelAdd' && (
                                    <AnimatedRN.View style={{
                                        padding: 10,
                                        margin: 5,
                                        borderRadius: 10,
                                        borderColor,
                                        borderWidth: 2,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                        maxWidth: '70%',
                                        flex: 1,
                                        justifyContent: 'space-between'
                                    }}>

                                        <Text style={{
                                            fontSize: 14,
                                            color: '#555',
                                            marginBottom: 8,
                                        }}>
                                            Please click the button so you can input your DHL document delivery address.
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <DocDelAdd screenWidth={screenWidth} selectedChatId={activeChatId} userEmail={userEmail} context='chat' accountData={accountData} />
                                        </View>
                                    </AnimatedRN.View>
                                )}

                                {item.messageType === 'IssuedInvoice' && (

                                    <AnimatedRN.View style={{
                                        padding: 10,
                                        margin: 5,
                                        borderRadius: 10,
                                        borderColor,
                                        borderWidth: 2,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                        maxWidth: '70%',
                                        justifyContent: 'space-between'
                                    }}>

                                        <Text style={{
                                            fontSize: 14,
                                            color: '#555',
                                            marginBottom: 8,
                                        }}>
                                            {`Invoice No. ${selectedChatData?.invoiceNumber}`}
                                        </Text>
                                        <PreviewInvoice
                                            selectedChatData={selectedChatData}
                                            invoiceData={invoiceData}
                                            context="chat"
                                            messageText={item.text}
                                        />
                                    </AnimatedRN.View>

                                )}

                                {item.messageType === 'important' && (

                                    <AnimatedRN.View style={{
                                        padding: 10,
                                        margin: 5,
                                        borderRadius: 10,
                                        borderColor,
                                        borderWidth: 2,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                        maxWidth: screenWidth <= 360 ? '90%' : '70%',

                                        justifyContent: 'space-between'
                                    }}>
                                        {(item.text.includes("Shipping") || item.text.includes("(B/L)")) && (
                                            <>
                                                <GeneratePdfPreview
                                                    context={item.text.includes("Shipping") ? "SL" : "BL"}
                                                    bookingData={bookingData}
                                                    selectedChatData={selectedChatData}
                                                />
                                                <View style={{ marginVertical: 2 }} />
                                            </>
                                        )}


                                        {renderTextWithLinks(item.text)}
                                    </AnimatedRN.View>

                                )}
                                {item.messageType === 'important' && item.text.includes("(B/L)") && (

                                    <AnimatedRN.View style={{
                                        padding: 10,
                                        margin: 5,
                                        borderRadius: 10,
                                        borderColor,
                                        borderWidth: 2,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                        maxWidth: screenWidth <= 360 ? '90%' : '70%',


                                        justifyContent: 'space-between'
                                    }}>
                                        <Text style={{ color: '#555', fontWeight: '600', fontSize: 16, textAlign: 'center' }}>
                                            Thank you for your purchase!
                                        </Text>
                                        <Text style={{ color: '#555', fontWeight: '500', fontSize: 14, textAlign: 'center' }}>
                                            We'd love to hear your feedback.
                                        </Text>
                                        <Text style={{ color: '#555', fontWeight: '500', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                                            If you have received the unit, kindly press the button below to help us with your feedback on <Text style={{ fontWeight: '700' }}>product quality and service</Text>.
                                        </Text>
                                        <Testimonials bookingData={bookingData} invoiceData={invoiceData} accountData={accountData} selectedData={selectedChatData} selectedChatId={activeChatId} userEmail={userEmail} />
                                    </AnimatedRN.View>

                                )}
                                {item.messageType === 'FullPayment' && (

                                    <AnimatedRN.View style={{
                                        padding: 10,
                                        margin: 5,
                                        borderRadius: 10,
                                        borderColor,
                                        borderWidth: 2,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                        maxWidth: '70%'
                                    }}>

                                        <Text style={{ color: 'black' }}>{item.text}</Text>
                                    </AnimatedRN.View>

                                )}
                                {item.messageType === 'InputPayment' && (

                                    <AnimatedRN.View style={{
                                        padding: 10,
                                        margin: 5,
                                        borderRadius: 10,
                                        borderColor,
                                        borderWidth: 2,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                        maxWidth: '70%'
                                    }}>

                                        <Text style={{ color: 'black' }}>{item.text}</Text>
                                    </AnimatedRN.View>

                                )}

                                {item.messageType && item.messageType !== 'IssuedInvoice' && item.messageType !== 'important' && item.messageType !== 'FullPayment' && item.messageType !== 'InputPayment' && item.messageType !== 'InputDocDelAdd' && (
                                    <View
                                        style={{
                                            alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                            backgroundColor: item.sender === userEmail ? '#F1F5FF' : 'white',
                                            padding: 10,
                                            margin: 5,
                                            borderRadius: 10,
                                            maxWidth: '70%'
                                        }}
                                    >
                                        <Text style={{ color: 'black' }}>{item.text}</Text>
                                    </View>
                                )}

                                <Text
                                    style={{
                                        color: 'black',
                                        fontStyle: 'italic',
                                        fontSize: 9,
                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                        marginTop: 5,
                                    }}
                                >
                                    {item.timestamp}
                                </Text>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />

                )}
            </View>
        </View>
    );
};

const ImageViewer = ({ uri }) => {
    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        loadingIndicator: {
            position: 'absolute',
            zIndex: 10,
        },
    });

    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [screenDimensions, setScreenDimensions] = useState({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Calculate image dimensions based on screen width and aspect ratio
    useEffect(() => {
        Image.getSize(uri, (originalWidth, originalHeight) => {
            const aspectRatio = originalWidth / originalHeight;
            const calculatedWidth = screenDimensions.width <= 768 ? screenDimensions.width : 800; // Full width for small screens, max 800px for larger
            const calculatedHeight = calculatedWidth / aspectRatio;

            setImageDimensions({
                width: calculatedWidth,
                height: calculatedHeight,
            });
        });
    }, [uri, screenDimensions.width]);

    // Update screen dimensions on change
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenDimensions({ width: window.width, height: window.height });
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    const handlePress = () => {
        setIsLoading(true);
        setModalVisible(true);
    };

    return (
        <Pressable
            style={({ pressed, hovered }) => ({
                backgroundColor: hovered ? '#E5EBFE' : 'transparent',
                borderRadius: hovered ? 10 : 0,
            })}
            onPress={handlePress}
        >
            <Image
                source={{ uri }}
                style={{ width: '100%', height: 250, resizeMode: 'contain', aspectRatio: 1 }}
            />
            {modalVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.overlay}
                        />
                        <View style={{
                            width: imageDimensions.width * 0.9,
                            height: screenDimensions.width <= 768
                                ? imageDimensions.height * 0.8 // Use 80% of image height on smaller screens
                                : Math.min(imageDimensions.height * 0.6, screenDimensions.height * 0.8), // Use 60% of image height on larger screens, capped to 80% of screen height
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 10,
                        }}>
                            {isLoading && (
                                <ActivityIndicator
                                    size="large"
                                    color="#0000ff"
                                    style={styles.loadingIndicator}
                                />
                            )}
                            <Image
                                source={{ uri }}
                                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                onLoadEnd={() => setIsLoading(false)}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </Pressable>
    );
};
const GeneratePdfPreview = ({ selectedChatData, bookingData, context }) => {
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
            setScreenHeight(window.height);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //screenheight
    const [iframeKey, setIframeKey] = useState(0); // Key to force re-render
    const [isDelayed, setIsDelayed] = useState(true); // Delay state
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [modalVisible, setModalVisible] = useState(false);

    const downloadURL = context === 'BL' ? bookingData?.bL?.url : bookingData?.sI?.url;
    const src = `https://docs.google.com/viewer?url=${encodeURIComponent(downloadURL)}&embedded=true`;
    const folderType = context === 'BL' ? 'bL' : 'sI'
    const handlePress = () => {
        setModalVisible(true)

    };

    const handleIframeLoad = () => {
        setIsLoading(false); // Set loading to false once iframe loads
    };

    const handleIframeReload = () => {
        setIsLoading(true); // Set loading to true for feedback
        setTimeout(() => {
            setIframeKey(prevKey => prevKey + 1); // Force re-render of iframe
        }, 100);
    };

    const handleModalClose = () => {
        setModalVisible(false);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                // If loading takes too long, reload iframe
                setIsLoading(false);
                setIframeKey(prevKey => prevKey + 1);
            }
        }, 5000); // Reload iframe if it takes longer than 5 seconds

        return () => clearTimeout(timeout);
    }, [isLoading]);

    useEffect(() => {
        // Delay display of iframe for smoother loading
        if (modalVisible) {
            const timer = setTimeout(() => {
                setIsDelayed(false);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [modalVisible]);

    const [previewUrl, setPreviewUrl] = useState(null);
    console.log('Preview URL:', previewUrl);

    const canvasRef = useRef(null);
    const [renderTask, setRenderTask] = useState(null); // Store the render task to cancel if needed

    useEffect(() => {
        if (!downloadURL || !canvasRef.current) return;

        const loadPdf = async () => {
            if (!canvasRef.current) {
                console.error("Invalid canvas reference.");
                return;
            }

            // Cancel any ongoing render task before starting a new one
            if (renderTask) {
                renderTask.cancel();
            }

            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

            try {
                const response = await fetch(downloadURL);
                if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);

                const pdfBlob = await response.blob();
                const pdf = await pdfjsLib.getDocument({ data: await pdfBlob.arrayBuffer() }).promise;
                const page = await pdf.getPage(1);

                const scale = screenWidth <= 992 ? 1.5 : 0.75;
                const viewport = page.getViewport({ scale });

                const heightScale = viewport.width > viewport.height ? 1.2 : 2.1;
                if (!canvasRef.current) {
                    console.error("Failed Reference.");
                    return;
                }
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');


                canvas.width = viewport.width;
                canvas.height = viewport.height / heightScale;

                // Render the page and store the render task
                const task = page.render({ canvasContext: context, viewport });
                setRenderTask(task); // Store the render task so we can cancel it if needed

                await task.promise; // Wait until the render is complete
                setRenderTask(null); // Clear the task after completion
            } catch (error) {
                console.error("Error loading PDF:", error);
            }
        };

        loadPdf();

        // Cleanup function to cancel the rendering if the component unmounts or `downloadURL` changes
        return () => {
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [downloadURL, screenWidth, selectedChatData, bookingData]);

    const [error, setError] = useState(null)
    const [fileDetails, setFileDetails] = useState({ fileName: '', fileSize: '' });
    useEffect(() => {
        const fetchFileDetails = async () => {
            try {
                // Call the Cloud Function with hNumber and folderType as query parameters
                const response = await axios.get(
                    fetchDetails,
                    {
                        params: { hNumber: bookingData?.hNumber, folderType },
                    }
                );

                setFileDetails(response.data);
            } catch (err) {
                console.error("Error fetching file details:", err);
                setError(err.response?.data?.error || "Error fetching file details");
            }
        };

        // Fetch file details only if bookingData.hNumber and folderType are available
        if (bookingData?.hNumber && folderType) {
            fetchFileDetails();
        }
    }, [bookingData, folderType]);
    const handleOpenLink = () => {
        Linking.openURL(downloadURL);
    };
    return (
        <View
            style={{
                backgroundColor: '#F1F5FF',
                borderRadius: 3, // Slightly rounded corners
                padding: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 }, // Lower shadow offset
                shadowOpacity: 0.08, // Lower opacity for a softer shadow
                shadowRadius: 3, // Smaller radius for a subtle blur
                elevation: 1, // Lower elevation for Android
                width: '100%',
                maxWidth: 400, // Optional: Set a max width if needed
                alignItems: 'center', // Center content
                marginBottom: 10

            }}
        >
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        padding: 10,
                        height: screenWidth <= 992 ? '65%' : '50%',
                        backgroundColor: '#F1F5FF',
                        borderTopLeftRadius: '2px',
                        borderTopRightRadius: '2px',
                        color: 'white',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F1F5FF',
                            marginBottom: 5,
                            padding: 5
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="picture-as-pdf" color="red" size={24} style={{ marginRight: 10 }} />
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{fileDetails.fileName}</Text>
                                <Text style={{ fontSize: 14, color: '#888' }}>{fileDetails.fileSize}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',

                    }}>

                        {screenWidth > 992 ? (
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
                                            <View style={{
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
                                                width: '50%',
                                                height: '95%'
                                            }}>

                                                <View style={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    right: 10,
                                                    zIndex: 10,
                                                }}>
                                                    <TouchableOpacity onPress={handleOpenLink} style={{
                                                        flexDirection: 'row',
                                                        backgroundColor: '#16A34A',
                                                        padding: 5,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                    }}>
                                                        <MaterialCommunityIcons size={20} name="download" color="white" />
                                                        <Text style={{
                                                            color: 'white',
                                                            marginLeft: 5,
                                                            textAlign: 'center'
                                                        }}>Download PDF</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <iframe
                                                    src={`${downloadURL}#toolbar=0&navpanes=0&scrollbar=0`} // Add parameters to hide UI elements
                                                    style={{ width: '100%', height: '100%' }}
                                                    frameBorder="0"
                                                    title="PDF Viewer"
                                                />


                                            </View>
                                        </View>
                                    </Modal>
                                )}
                            </Pressable>
                        ) : (

                            <PdfViewer selectedChatData={selectedChatData} bookingData={bookingData} context={context} />
                        )}

                    </View>
                </View>
            </div>

        </View>
    )
}

const ShippingInstructions = ({ selectedChatData, bookingData, context }) => {
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
            style={({ pressed, hovered }) => [

                {
                    borderWidth: 1,
                    borderColor: '#16A34A',
                    backgroundColor: hovered ? '#0F7534' : '#16A34A',
                    opacity: pressed ? 0.5 : 1,
                    opacity: pressed ? 0.5 : 1,
                    borderRadius: 5,
                    paddingVertical: 7,
                    paddingHorizontal: 20,
                    padding: 5,
                }
            ]}
            onPress={handlePress}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',

                }}
            >
                <AntDesign name="download" size={16} color="#fff" style={{ marginRight: 5 }} />
                <Text style={{ color: 'white', fontWeight: '700' }}>{context === 'BL' ? 'Download BL' : 'Download SI'}</Text>
            </View>

            {modalVisible && (
                <Modal
                    transparent={true}
                    animationType='fade'
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    {screenWidth > 992 ? (
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
                            <View style={{
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
                                width: '50%',
                                height: '95%'
                            }}>

                                <View style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 10,
                                }}>
                                    <TouchableOpacity onPress={handleOpenLink} style={{
                                        flexDirection: 'row',
                                        backgroundColor: '#16A34A',
                                        padding: 5,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                    }}>
                                        <MaterialCommunityIcons size={20} name="download" color="white" />
                                        <Text style={{
                                            color: 'white',
                                            marginLeft: 5,
                                            textAlign: 'center'
                                        }}>Download PDF</Text>
                                    </TouchableOpacity>
                                </View>
                                <iframe
                                    src={`${downloadURL}#toolbar=0&navpanes=0&scrollbar=0`} // Add parameters to hide UI elements
                                    style={{ width: '100%', height: '100%' }}
                                    frameBorder="0"
                                    title="PDF Viewer"
                                />



                            </View>
                        </View>
                    ) : (
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
                    )}

                </Modal>
            )}
        </Pressable>
    )
}
const InformationData = ({ chatId, userEmail, showRight, setShowRight, formattedDate, dueDate, loadingForAll, carId, carData, isLoading, chats, context, setPaymentModalVisible, handleViewPaymentDetails, paymentModalVisible, bookingData, toggleModal, modalVisible, setModalVisible, handleButtonClick, accountData, totalAmount, carImages, currentStep, totalSteps, requestToggleRight, setHideLeft, setShowInMobile, hideLeft, activeChatId, selectedChatData, invoiceData }) => {

    console.log('chat id active', activeChatId)
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);




    const [messages, setMessages] = useState({});

    const [chatMessages, setChatMessages] = useState([]);

    const [lastVisible, setLastVisible] = useState(null);

    const [paymentNotification, setPaymentNotification] = useState([]);

    console.log('PAYMENT', paymentNotification)
    useEffect(() => {
        if (!userEmail) {
            console.log('No user email available.');
            return;
        }
        if (!activeChatId) {
            console.log('Chat id unavailable.');
            return;
        }
        const chatsRef = collection(projectExtensionFirestore, 'chats');

        // First, query the chats where the current user is the sales representative
        const q = query(chatsRef, where('participants.customer', '==', userEmail));

        const fetchChatData = async () => {
            try {
                // Query the chats collection for chats where the current user is the salesRep
                const chatQuerySnapshot = await getDocs(q);

                if (!chatQuerySnapshot.empty) {
                    chatQuerySnapshot.forEach(async (chatDoc) => {

                        const paymentRef = doc(projectExtensionFirestore, 'chats', activeChatId);
                        const unsubscribePayment = onSnapshot(paymentRef, (snapshot) => {
                            if (snapshot.exists()) {
                                const paymentNotificationsData = snapshot.data().paymentNotification || [];
                                setPaymentNotification(paymentNotificationsData);
                            }
                        });

                        // Return unsubscribe functions
                        return () => {

                            unsubscribePayment();
                        };
                    });
                } else {
                    console.warn("No chats found for the salesRep:", userEmail);
                }
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        };

        // Fetch chat data and set up listeners
        const unsubscribe = fetchChatData();

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [activeChatId, userEmail]);





    console.log('CAR ID FOR THIS SHITZZ: ', carId);




    console.log('account data', selectedChatData?.currency?.eurToUsd)

    const calculateTotalPrice = () => {
        // Conversion rate from JPY to USD
        const jpyToUsdRate = selectedChatData?.currency?.jpyToUsd || 0;

        // Convert fobPrice from JPY to USD, then add other components
        const usdValue = !invoiceData?.paymentDetails?.fobPrice && !invoiceData?.paymentDetails?.freightPrice
            ? (
                Math.floor(parseFloat(selectedChatData?.carData?.fobPrice) * jpyToUsdRate) + // Convert fobPrice to USD
                Math.floor(parseFloat(selectedChatData?.carData?.dimensionCubicMeters) * parseFloat(selectedChatData?.freightPrice)) +
                (selectedChatData?.inspection ? 300 : 0) + (selectedChatData?.insurance === true ? 50 : 0)
            )
            : Math.floor(Number(invoiceData?.paymentDetails?.fobPrice)) +
            Math.floor(Number(invoiceData?.paymentDetails?.freightPrice)) +
            (selectedChatData?.inspection === true ? 300 : 0) + (selectedChatData?.insurance === true ? 50 : 0);

        // Determine the selected currency, defaulting to USD if none is selected
        const currency = selectedChatData?.selectedCurrencyExchange || 'USD';

        // Map USD to other currency rates by inverting the `ToUsd` rates (except for JPY)
        const rates = {
            'EUR': 1 / (selectedChatData?.currency?.eurToUsd || 1),
            'AUD': 1 / (selectedChatData?.currency?.audToUsd || 1),
            'GBP': 1 / (selectedChatData?.currency?.gbpToUsd || 1),
            'CAD': 1 / (selectedChatData?.currency?.cadToUsd || 1),
            'JPY': selectedChatData?.currency?.usdToJpy || 1,
            'USD': 1  // USD remains unchanged
        };

        // Retrieve the conversion rate for the selected currency
        const conversionRate = rates[currency];

        // Check if the conversion rate is undefined and set default values if it is
        if (conversionRate === undefined) {
            return { symbol: '--', value: '000' }; // Default values when rate is not available
        }

        // Convert the USD value to the selected currency and round down
        const convertedValue = Math.floor(usdValue * conversionRate).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        // Define symbols for each currency, including JPY
        const currencySymbols = {
            'EUR': '€',
            'AUD': 'A$',
            'GBP': '£',
            'CAD': 'C$',
            'JPY': '¥',
            'USD': 'US$'
        };

        // Get the currency symbol or use '--' as a fallback
        const symbol = currencySymbols[currency] || '--';

        return { symbol: symbol, value: convertedValue };
    };


    const { symbol, value } = calculateTotalPrice();



    // Proceed to render formattedDate


    const scrollViewRef = useRef(null);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        // Horizontal scroll animation for new users
        const animateScroll = () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: 500, animated: true });
                setTimeout(() => {
                    scrollViewRef.current.scrollTo({ x: 0, animated: true });
                }, 500); // Scroll back after 1 second
            }
        };

        // Delay animation to ensure component is rendered
        const animationTimeout = setTimeout(animateScroll, 500);

        return () => {
            subscription.remove();
            clearTimeout(animationTimeout);
        };
    }, []);

    const hasUnreadChats = chats.some(chat => chat.customerRead === false); // Check if any chat has unread messages
    const shouldRenderScrollView =
        context !== 'Sold' && invoiceData &&
        ('isCancelled' in selectedChatData ? !selectedChatData.isCancelled : true);


    return (
        <>
            {loadingForAll ? (
                <SkeletonLoader screenWidth={screenWidth} />
            ) : (
                <View style={{ position: 'relative', paddingVertical: 5, boxShadow: '0 1px 1px rgba(2, 2, 2, 0.3)', backgroundColor: 'white', zIndex: 995 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        {screenWidth <= 768 && (

                            <TouchableOpacity
                                style={{ padding: 10, position: 'relative' }} // Added relative positioning for the badge
                                onPress={() => {
                                    if (showRight === true) {
                                        setShowRight(false);
                                        setShowInMobile(true);
                                    }
                                }}
                            >
                                <AntDesign name="left" size={30} />


                                {hasUnreadChats && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: 'red',
                                            borderRadius: 10,
                                            width: 10,
                                            height: 10,
                                        }}
                                    />
                                )}
                            </TouchableOpacity>

                        )}
                        <ScrollView
                            keyboardShouldPersistTaps="always" contentContainerStyle={{ flex: screenWidth <= 1405 ? 0 : 1, maxWidth: 460 }} horizontal={true} >

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>


                                        <View style={{ marginLeft: 5 }}>
                                            <Image source={{ uri: carImages[carId] }} style={{ width: 70, height: 70, flex: 1, aspectRatio: 1, resizeMode: 'stretch', borderRadius: '100%' }} />
                                        </View>

                                        <View style={{ flex: 3, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'blue', }}>{selectedChatData?.carData?.carName}</Text>
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#999', marginBottom: 10, marginTop: 5 }}>{selectedChatData?.carData?.referenceNumber}</Text>

                                            <TimelineStatus currentStep={currentStep} />
                                        </View>

                                        <View style={{ marginLeft: 10 }}>
                                            <Text style={{ fontSize: 12, color: '#999' }}>{selectedChatData?.carData?.chassisNumber}</Text>
                                            <Text style={{ fontSize: 12, color: '#999' }}>{selectedChatData?.carData?.modelCode}</Text>
                                            <Text style={{ fontSize: 12, color: '#999' }}>{selectedChatData?.carData?.mileage} km</Text>
                                            <Text style={{ fontSize: 12, color: '#999' }}>{selectedChatData?.carData?.fuel}</Text>
                                            <Text style={{ fontSize: 12, color: '#999' }}>{selectedChatData?.carData?.transmission}</Text>
                                        </View>
                                        <View style={{ marginLeft: 10, alignItems: 'flex-start' }}>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                                                Total Price:
                                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green', marginLeft: 3 }}>
                                                    {invoiceData?.paymentDetails?.totalAmount
                                                        ? `${symbol}${Number(invoiceData?.paymentDetails?.totalAmount).toLocaleString()}`
                                                        : (value === 'NaN' || selectedChatData?.freightPrice === 0
                                                            ? 'ASK'
                                                            : `${symbol}${value}`)}
                                                </Text>

                                            </Text>

                                            <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>
                                                {selectedChatData.country} / {selectedChatData.port}
                                            </Text>
                                            <Text style={{ fontSize: 14, color: 'green', fontWeight: 'bold' }}>
                                                {[
                                                    selectedChatData.inspection && selectedChatData.inspection === true ? 'INSPECTION' : null,
                                                    selectedChatData.insurance && selectedChatData.insurance === true ? 'CIF' : 'C&F',
                                                    selectedChatData.warranty && selectedChatData.warranty === true ? 'WARRANTY' : null
                                                ].filter(Boolean).join(' + ')}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: 'black', fontWeight: 'bold' }}>Due Date: <Text style={{ color: 'red' }}>{formattedDate}</Text></Text>


                                        </View>


                                    </View>

                                </View>

                            </View>

                        </ScrollView>


                    </View>
                    {shouldRenderScrollView && (
                        <ScrollView
                            keyboardShouldPersistTaps="always"

                            ref={scrollViewRef}
                            horizontal={true}
                            contentContainerStyle={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                paddingHorizontal: 10,
                                justifyContent: 'space-between',
                                marginTop: 10,
                            }}
                        >
                            {invoiceData && selectedChatData?.stepIndicator?.value >= 2 && (
                                <View style={{ marginHorizontal: 5 }}>
                                    <PreviewInvoice selectedChatId={activeChatId} selectedChatData={selectedChatData} invoiceData={invoiceData} />
                                </View>
                            )}

                            {activeChatId && selectedChatData?.stepIndicator?.value >= 3 && (
                                <View style={{ marginHorizontal: 5 }}>
                                    <InvoiceAmendment activeChatId={activeChatId} selectedChatData={selectedChatData} accountData={accountData} screenWidth={screenWidth} />
                                </View>
                            )}

                            {selectedChatData?.stepIndicator?.value >= 4 && (
                                <View style={{ marginHorizontal: 5 }}>
                                    <DocDelAdd selectedChatId={activeChatId} userEmail={userEmail} accountData={accountData} screenWidth={screenWidth} />
                                </View>
                            )}

                            {selectedChatData?.stepIndicator?.value === 3 && (
                                <View style={{ marginHorizontal: 5 }}>
                                    <PaymentNotification
                                        userEmail={userEmail}
                                        chatId={chatId}
                                        value={value}
                                        symbol={symbol}
                                        setPaymentModalVisible={setPaymentModalVisible}
                                        handleViewPaymentDetails={handleViewPaymentDetails}
                                        invoiceData={invoiceData}
                                        handleButtonClick={handleButtonClick}
                                        screenWidth={screenWidth}
                                        paymentModalVisible={paymentModalVisible}
                                    />
                                </View>
                            )}

                            {selectedChatData?.stepIndicator?.value >= 5 && (
                                <View style={{ marginHorizontal: 5 }}>
                                    <ShippingInstructions bookingData={bookingData} selectedChatData={selectedChatData} />
                                </View>
                            )}

                            {selectedChatData?.stepIndicator?.value >= 6 && (
                                <View style={{ marginHorizontal: 5 }}>
                                    <ShippingInstructions context="BL" bookingData={bookingData} selectedChatData={selectedChatData} />
                                </View>
                            )}
                        </ScrollView>
                    )}


                </View>
            )}

        </>

    )
};

const InformationDataLeft = ({ handleIndex, setIndexIndicator, indexIndicator, makeTrueRead, showRight, chatId, setShowMiddleVisible, setShowRight, toggleReadButton, handleToggleRead, hasMoreData, setHasMoreData, handleClear, inputRef, initializeChats, keywords, handleKeyword, loadingLeftSide, setTheLoading, activeChatId, isLoadingForAll, chatField, categories, headerDimensions, fetchVehicleStatuses, useVehicleStatus, setLastVisible, lastVisible, setChats, chats, carImages, userEmail, setHideLeft, setShowInMobile, setRightVisible, setSidebarOpen, setActiveChatId }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const renderItemCategories = ({ item }) => {
        const isHighlighted = chatField.stepIndicator && chatField.stepIndicator[`value`].toString() === item.id;
        return (
            <Pressable
                style={({ pressed, hovered }) => [

                    {
                        backgroundColor: isHighlighted ? '#E1EDF7' : (hovered ? '#DADDE1' : '#fff'),
                        opacity: pressed ? 0.5 : 1,
                        borderRadius: 5,
                        marginLeft: 5,
                        width: 200,
                        marginTop: 5,
                        padding: 5
                    }
                ]}
                onPress={() => {
                    handleIndex(item.id)
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1
                }}>
                    <Text>{item.title}</Text>
                </View>
            </Pressable>
        );

    }
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
            setScreenHeight(window.height); // Update screenHeight as well
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);
    const navigate = ''




    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // New flag to track if more data exists
    const [showButton, setShowButton] = useState(true);

    const loadMore = async () => {
        if (!lastVisible || isLoadingMore || !hasMoreData) return;
        console.log('Last Visible Document:', lastVisible);
        setIsLoadingMore(true); // Prevent multiple triggers

        let queryConstraints = [
            where('participants.customer', '==', userEmail),
            orderBy('lastMessageDate', 'desc'),
            startAfter(lastVisible),
            limit(5), // Fetch the next batch
        ];
        if (indexIndicator !== '10') { // '10' corresponds to 'ALL CHATS'
            queryConstraints.push(where('stepIndicator.value', '==', parseInt(indexIndicator)));
        }
        if (keywords.current.trim().length > 0) {
            queryConstraints.push(where('keywords', 'array-contains', keywords.current.trim()));
        }

        const moreChatsQuery = query(
            collection(projectExtensionFirestore, 'chats'),
            ...queryConstraints
        );

        try {
            const querySnapshot = await getDocs(moreChatsQuery);

            if (!querySnapshot.empty) {
                const newChats = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    carData: doc.data().carData || {},
                }));

                // Append the new chats to the existing list
                setChats((prevChats) => [...prevChats, ...newChats]);

                // Update the last visible document for pagination
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            } else {
                setHasMoreData(false); // No more data available
            }
        } catch (error) {
            console.error('Error loading more chats:', error);
        } finally {
            setIsLoadingMore(false); // Allow future triggers
        }
    };



    // Ensure that useEffect runs when userEmail changes


    const { toggleUnread, setToggleUnread } = useState(false);
    const requestToggleUnread = () => {
        setToggleUnread(!toggleUnread)
    }
    const filterUnread = () => {

    }
    const { toggleRead, setToggleRead } = useState(false);
    const requestToggleRead = () => {
        setToggleRead(!toggleRead)
    }
    const filterRead = () => {

    }



    //sorting
    const getSortableDate = (dateString) => {
        return dateString.replace(/(\d{4})\/(\d{2})\/(\d{2}) at (\d{2}:\d{2}:\d{2})/, '$1-$2-$3T$4');
    };

    // Sort the chats by lastMessageDate in descending order (latest first)
    // const sortedChats = useMemo(() => {
    //     return [...chats].sort((a, b) => {
    //         const dateA = new Date(getSortableDate(a.lastMessageDate));
    //         const dateB = new Date(getSortableDate(b.lastMessageDate));
    //         return dateB - dateA;
    //     });
    // }, [chats]);

    //sorting




    useEffect(() => {
        if (activeChatId && showRight) {
            makeTrueRead(true);
        }
    }, [activeChatId, userEmail, showRight]);
    const [vehicleStatuses, setVehicleStatuses] = useState({});

    useEffect(() => {
        const stockIDs = chats.map(chat => chat.carData?.stockID).filter(Boolean);

        const updateStatuses = (stockID, status) => {
            setVehicleStatuses(prevStatuses => ({
                ...prevStatuses,
                [stockID]: status
            }));
        };

        const cleanup = fetchVehicleStatuses(stockIDs, updateStatuses);

        return () => {
            if (cleanup) cleanup();
        };
    }, [chats]);
    const getRibbonClass = (status) => {
        switch (status) {
            case 'Reserved':
                return 'wdp-ribbon wdp-ribbon-two reserved';
            case 'Sold':
                return 'wdp-ribbon wdp-ribbon-two sold';
            case 'Sale':
            default:
                return 'wdp-ribbon wdp-ribbon-two sale';
        }
    };

    const renderItem = useCallback(({ item }) => {
        const imageUrl = carImages[item.carData?.stockID] || noCar;
        const isChatActive = item.id === activeChatId || item.id === chatId;
        const { stockStatus, reservedTo } = vehicleStatuses[item.carData?.stockID] || {};
        const isReservedOrSold = (stockStatus === "Reserved" || stockStatus === "Sold") && reservedTo !== userEmail;

        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        opacity: isReservedOrSold ? 0.5 : (pressed ? 0.5 : 1), // Apply lower opacity if reserved or sold
                        backgroundColor: isChatActive ? '#f2f2f2' : (hovered ? '#f2f2f2' : 'white'),
                        borderLeftColor: isChatActive ? '#0A9FDC' : 'transparent',
                        borderRightColor: isChatActive ? '#0A9FDC' : 'transparent',
                        borderLeftWidth: 2,
                        borderRightWidth: 2,
                        width: 'auto'
                    },
                ]}
                onPress={() => {


                    setActiveChatId(item.id)// Set this item as active when pressed
                    if (screenWidth <= 768) {

                        setShowRight(true);
                        setShowInMobile(false);
                        setShowMiddleVisible(true)
                    } else {
                        setShowInMobile(true)
                    }
                    navigate(`/ProfileFormChatGroup/${item.id}`);
                }}
            >
                {isReservedOrSold && (
                    <div className="box">
                        <span className={getRibbonClass(stockStatus)}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{stockStatus}</Text>
                        </span>
                    </div>
                )}
                <View style={styles.container}>
                    <Image source={{ uri: imageUrl }} style={styles.avatar} />
                    <View style={{ flex: 1, justifyContent: 'center', marginRight: 10 }}>

                        <Text
                            style={item.customerRead ? styles.participant : { color: '#000', fontWeight: 'bold' }}
                            numberOfLines={1}
                        >
                            {item.carData?.carName}
                        </Text>
                        <Text
                            style={item.customerRead ? styles.lastMessage : { color: '#0A78BE', fontWeight: 'bold' }}
                            numberOfLines={1}
                        >
                            {item.lastMessage}
                        </Text>

                    </View>
                    <Text style={item.customerRead ? styles.timestamp : { color: '#000', fontWeight: '600' }}>
                        {item.lastMessageDate.includes(" at ")
                            ? item.lastMessageDate.split(" at ")[0]
                            : item.lastMessageDate}
                    </Text>
                    {item.customerRead ? (null) : (<View style={{
                        width: 10,        // Width of the circle
                        height: 10,       // Height of the circle
                        borderRadius: 25, // Half of width/height to make it a circle
                        backgroundColor: '#0D97EE',
                        margin: 'auto',
                        marginLeft: 5
                    }} />
                    )}

                </View>
            </Pressable>
        )
    }, [carImages, activeChatId, vehicleStatuses, userEmail, screenWidth]);
    const [headerLeftSize, setHeaderLeftSize] = useState({ width: 0, height: 0 })
    const handleLayoutLeft = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setHeaderLeftSize({ width, height });
    };
    const styles = StyleSheet.create({

        avatar: {
            width: 60,
            maxHeight: 60,
            maxWidth: 60,
            height: 60,
            borderRadius: '100%',
            marginRight: 10,
            aspectRatio: 1,
            resizeMode: 'stretch'
        },
        container: {
            flexDirection: 'row',
            padding: 10,
            width: '100%', // Set the container width to 250
            alignItems: 'center',
        },
        textContainer: {
            flex: 1,
            justifyContent: 'center',
            marginRight: 10, // Added to prevent text overlapping with timestamp
        },
        participant: {
            fontWeight: '400',
            color: 'gray',
        },
        lastMessage: {
            fontWeight: '400',
            color: 'gray',
        },
        timestamp: {
            color: 'gray',
            fontSize: 12,
        },
    });
    const flatListRef = useRef(null)
    const containerStyle = screenWidth <= 768
        ? {
            flex: 1,
            height: screenHeight - headerDimensions.height,
            marginTop: -5
        }
        : {
            maxWidth: 300,
            position: 'fixed',
            left: 0,
            height: screenHeight - headerDimensions.height,
            zIndex: 10,

        };

    const [textInputDimensions, setTextInputDimensions] = useState({ width: 0, height: 0 })
    const handleLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setTextInputDimensions({ width, height });
    };

    const [headerDimensionsView, setHeaderDimensionsView] = useState({ left: 0, top: 0, width: 0, height: 0 });
    const handleLayoutView = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setHeaderDimensionsView({ width, height, top: y + height, left: x, });
    };
    return loadingLeftSide ? (

        <View onLayout={handleLayoutLeft} style={[containerStyle, { width: '100%' }]}>
            <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#ccc', marginTop: 9 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
                        <TextInput
                            onLayout={handleLayout}
                            ref={inputRef}
                            onSubmitEditing={initializeChats}
                            onChangeText={handleKeyword}
                            defaultValue={keywords.current}
                            placeholderTextColor={'#ccc'}
                            placeholder="Search"
                            style={{
                                padding: 10,
                                margin: 10,
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 5,
                                flex: 2,
                            }}
                        />
                        {keywords.current.length > 0 && ( // Show the clear button if input is not empty
                            <TouchableOpacity onPress={handleClear} style={{ position: 'absolute', bottom: textInputDimensions.height / 2, left: textInputDimensions.width - 10 }}>
                                <Text style={styles.clearButtonText}>X</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>


            </View>
            {Array.from({ length: 10 }).map((_, index) => (
                <LoadingComponent key={index} heightDimension={headerDimensions.height} />))}
        </View>) : (
        <View onLayout={handleLayoutLeft} style={containerStyle}>
            {screenWidth <= 768 && (
                <View
                    style={{
                        zIndex: 1000,
                        height: 50,
                        borderBottomWidth: .5,
                        borderBottomColor: '#ccc',
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        backgroundColor: 'white',

                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "120px", // Reduced width for subtle effect
                            height: "100%",
                            background: "linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))", // Reduced opacity
                            zIndex: 1,
                            pointerEvents: "none",
                        }}
                    />
                    <FlatList
                        data={categories}
                        renderItem={renderItemCategories}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "120px",
                            height: "100%",
                            background: "linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
                            zIndex: 1,
                            pointerEvents: "none",
                        }}
                    />
                </View>
            )}

            <View onLayout={handleLayoutView} style={{ borderBottomWidth: 0.5, borderBottomColor: '#ccc', marginTop: 9 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
                        <TextInput
                            onLayout={handleLayout}
                            ref={inputRef}
                            onSubmitEditing={initializeChats}
                            onChangeText={(text) => {
                                handleKeyword(text);
                                if (text.trim() === '') {
                                    initializeChats(); // Re-initialize chats when text is cleared
                                }
                            }}
                            defaultValue={keywords.current}
                            placeholderTextColor={'#ccc'}
                            placeholder="Search"
                            style={{
                                padding: 10,
                                margin: 10,
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 5,
                                flex: 2,
                            }}
                        />

                        {keywords.current.length > 0 && ( // Show the clear button if input is not empty
                            <TouchableOpacity onPress={handleClear} style={{ position: 'absolute', bottom: textInputDimensions.height / 2, left: textInputDimensions.width - 10 }}>
                                <Text style={styles.clearButtonText}>X</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>



            </View>


            <FlatList
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}_${index}`}
                initialNumToRender={10} // Match the initial Firestore query limit
                maxToRenderPerBatch={10} // Render a batch of 10 items
                windowSize={10} // Keep 10 items in memory for smoother scrolling
                showsVerticalScrollIndicator={true}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={

                    <View style={{ padding: 20, alignItems: 'center', width: 300 }}>
                        <Text style={{ color: '#888', fontSize: 16 }}>
                            No results found
                        </Text>
                    </View>

                }
                ListFooterComponent={
                    isLoadingMore && hasMoreData ? (
                        <ActivityIndicator
                            size="large"
                            color="#0000ff"
                            style={{ marginVertical: 5 }}
                        />
                    ) : null
                }

            />



            {screenHeight > 1000 && showButton && (
                <Pressable
                    onPress={loadMore}
                    style={({ pressed, hovered }) => [
                        {
                            opacity: pressed ? 0.7 : 1,
                            borderRadius: 5,
                            backgroundColor: hovered ? '#0036b1' : 'blue',
                            transform: hovered ? [{ scale: 1.02 }] : [{ scale: 1 }],
                            transition: 'transform 0.2s ease-in-out',
                            flex: 1,
                            paddingVertical: 15,
                            height: '100%',
                            width: '90%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            marginVertical: 10
                        },
                    ]}
                >
                    <Text selectable={false} style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Load more messages</Text>
                </Pressable>
            )}
        </View>


    )
}

const SkeletonLoader = ({ screenWidth }) => {

    const styles = StyleSheet.create({

        shimmerOverlay: {

            position: 'absolute', // Instead of absoluteFillObject
            left: 0,
            top: 0,
            right: 0,
            height: '100%', // Or specify exact height if necessary
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            opacity: 0.7,
            overflow: 'hidden', // Ensure no overflow beyond bounds
        }
    });
    const shimmerValue = useRef(new AnimatedRN.Value(0)).current;

    useEffect(() => {
        // Start the shimmer animation loop
        const shimmerAnimation = AnimatedRN.loop(
            AnimatedRN.sequence([
                AnimatedRN.timing(shimmerValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(shimmerValue, {
                    toValue: 0,
                    duration: 0, // Reset immediately to keep the loop smooth
                    useNativeDriver: true,
                })
            ])
        );

        shimmerAnimation.start();

        // Cleanup the animation on unmount
        return () => {
            shimmerAnimation.stop();
        };
    }, [shimmerValue]);

    const shimmerTranslateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-1000, 1000], // Adjust to fit within the bounds of the container
    });
    const circles = [
        { key: 1 },
        { key: 2 },
        { key: 3 },
        { key: 4 },
        { key: 5 },
        { key: 6 },
        { key: 7 }
    ];
    return (
        <View style={{ position: 'sticky', paddingVertical: 5, boxShadow: '0 1px 1px rgba(2, 2, 2, 0.3)', backgroundColor: 'white', overflow: 'hidden' }}>
            <ScrollView
                keyboardShouldPersistTaps="always" contentContainerStyle={{ flex: screenWidth <= 1405 ? 0 : 1, maxWidth: 460, padding: 5 }} horizontal={true} >

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flex: 1, // Space out row items 
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 2, // Occupy more space compared to right section
                        }}
                    >
                        <View
                            style={{
                                height: 60,
                                aspectRatio: 1, // Maintain square shape
                                backgroundColor: "#c0c0c0",
                                borderRadius: 60,
                                marginRight: 10,
                            }}
                        />
                        <View
                            style={{
                                flex: 1,

                                justifyContent: 'center',
                                alignItems: 'flex-end',
                            }}
                        >
                            <View
                                style={{
                                    height: 10,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    marginBottom: 5,
                                    alignSelf: "stretch",
                                }}
                            />
                            <View
                                style={{
                                    height: 10,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    alignSelf: "stretch",
                                }}
                            />
                            <View
                                style={{
                                    alignSelf: 'flex-start',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: 5,
                                }}
                            >

                                {circles.map((circle) => (
                                    <View key={circle.key} style={{ flex: 1, alignItems: 'center' }}>
                                        <View
                                            style={{
                                                height: 20,
                                                width: 20,
                                                borderRadius: 20,
                                                backgroundColor: "#c0c0c0",
                                                marginHorizontal: 5,
                                            }}
                                        />
                                    </View>
                                ))}

                            </View>



                        </View>
                    </View>
                    <View style={{ marginLeft: 10, }}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                            }}
                        >
                            <View
                                style={{
                                    height: 5,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    marginBottom: 5,
                                    width: 50
                                }}
                            />
                            <View
                                style={{
                                    height: 5,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    width: 50
                                }}
                            />
                            <View
                                style={{
                                    height: 5,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    marginTop: 5,
                                    width: 50
                                }}
                            />
                            <View
                                style={{
                                    height: 5,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    marginTop: 5,
                                    width: 50
                                }}
                            />
                            <View
                                style={{
                                    height: 5,
                                    backgroundColor: "#c0c0c0",
                                    borderRadius: 4,
                                    marginTop: 5,
                                    width: 50
                                }}
                            />
                        </View>
                    </View>
                </View>





                {/* Shimmer Effect */}



            </ScrollView>
            <ScrollView
                keyboardShouldPersistTaps="always" contentContainerStyle={{ flex: screenWidth <= 1405 ? 0 : 1, maxWidth: 460, padding: 5 }} horizontal={true} >
                <View
                    style={{
                        alignSelf: 'flex-start',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 5,
                    }}
                >

                    {circles.map((circle) => (
                        <View key={circle.key} style={{ flex: 1, alignItems: 'center' }}>
                            <View
                                style={{
                                    height: 30,
                                    width: 150,
                                    borderRadius: 5,
                                    backgroundColor: "#c0c0c0",
                                    marginHorizontal: 5,
                                }}
                            />
                        </View>
                    ))}

                </View>
            </ScrollView>

            <AnimatedRN.View
                style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslateX }] },
                ]}
            />

        </View>
    );
};




const ShowCalendarShipping = ({ getValueFromDateETD, screenWidth }) => {
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef();

    const toggleCalender = () => setShowCalendar(!showCalendar);

    const handleDateSelect = (date) => {
        setSelectedStartDate(date.dateString);
        getValueFromDateETD(moment(date.dateString).format('YYYY/MM/DD')); // Pass formatted date
        setShowCalendar(false); // Close the calendar after selection
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderArrow = (direction) => (
        <AntDesign
            name={direction === 'right' ? 'right' : 'left'}
            size={20}
            color="#7b9cff"
        />
    );

    const calendarWidth = screenWidth > 600 ? '100%' : screenWidth * 0.9;
    const formattedDate = selectedStartDate ? moment(selectedStartDate).format('YYYY/MM/DD') : 'WIRE DATE';

    return (
        <Pressable
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 5,
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: '#CCCCCC',
                padding: 10,
            }}
            onPress={toggleCalender}
        >
            <Text style={{ fontSize: 14, color: '#000' }}>
                {formattedDate}
            </Text>
            <MaterialIcons name="date-range" size={25} color="blue" style={{ marginRight: 10 }} />

            {showCalendar && (
                <View
                    ref={calendarRef}
                    style={{
                        position: 'absolute',
                        top: '120%',
                        left: screenWidth > 600 ? -8 : -20,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        zIndex: 999,
                        marginHorizontal: 5,
                        width: calendarWidth,
                        borderRadius: 10,
                    }}
                >
                    <Calendar
                        onDayPress={handleDateSelect}
                        markedDates={{ [selectedStartDate]: { selected: true } }}
                        theme={{
                            selectedDayBackgroundColor: '#7b9cff',
                            selectedDayTextColor: '#fff',
                        }}
                        style={{ padding: screenWidth > 600 ? 20 : 10 }}
                        renderArrow={renderArrow}
                    />
                </View>
            )}
        </Pressable>
    );
};

const PaymentNotification = ({ chatId, userEmail, symbol, value, handleViewPaymentDetails, invoiceData, handleButtonClick, screenWidth, setPaymentModalVisible, paymentModalVisible, payment }) => {

    //fetch ip address
    const [ip, setIp] = useState('');
    const [ipCountry, setIpCountry] = useState('');

    // useEffect to fetch IP and Country
    // useEffect(() => {
    //     async function fetchIpAndCountry() {
    //         try {
    //             // Fetch the IP address
    //             const ipResponse = await axios.get('https://api.ipify.org?format=json');
    //             const fetchedIp = ipResponse.data.ip;
    //             setIp(fetchedIp);

    //             // Fetch IP Country
    //             if (fetchedIp) {
    //                 const countryResponse = await axios.get(`https://ipapi.co/${fetchedIp}/json/`);
    //                 const fetchedIpCountry = countryResponse.data.country_name;
    //                 setIpCountry(fetchedIpCountry);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching IP information:", error);
    //         }
    //     }

    //     fetchIpAndCountry();
    // }, []);
    //fetch ip address
    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                if (fileBlob.type === 'image/svg+xml' || name.toLowerCase().endsWith('.svg')) {
                    console.log('SVG files are not allowed to be uploaded.');
                    alert('SVG files are not allowed to be uploaded.');
                    return;
                }

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };

    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const [blankCheck, setBlankCheck] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const updateRemitter = async () => {
        setIsLoading(true)
        const isValidForm = nameOfRemitter.trim() !== '' && messageText.trim() !== '' && calendarETD !== null && selectedFile !== null;
        if (isValidForm) {
            try {
                const response = await axios.get(timeApi);

                const momentDate = moment(response?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

                const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
                const storageRef = ref(projectExtensionStorage, `ChatFiles/${chatId}/${selectedFile.name}`);
                const fileBlob = await fetch(selectedFile.uri).then((response) => response.blob());
                const fileNameParts = selectedFile.name.split('.');
                const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';
                const url = ipInfo;

                const responseIP = await axios.get(url);
                const ip = responseIP.data.ip;
                const ipCountry = responseIP.data.country_name;
                const ipCountryCode = responseIP.data.country_code
                let fileType = '';
                let lastMessageText = '';

                if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                    fileType = 'image';
                    lastMessageText = 'Sent an image';
                } else if (fileExtension === 'pdf') {
                    fileType = 'attachment';
                    lastMessageText = 'Sent a link';
                } else if (fileExtension === 'xlsx') {
                    fileType = 'attachment';
                    lastMessageText = 'Sent a link';
                } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                    fileType = 'attachment';
                    lastMessageText = 'Sent a link';
                } else {
                    fileType = 'link';
                    lastMessageText = 'Sent a link';
                }

                // Log the fileBlob size to help diagnose issues
                console.log('File size:', fileBlob.size);

                await uploadBytes(storageRef, fileBlob);
                const downloadURL = await getDownloadURL(storageRef);

                const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
                const messageData = {
                    sender: userEmail, // Sender's email
                    text: `Wire Date: ${calendarETD}

Name of Remitter: ${nameOfRemitter}

${messageText}

`,
                    timestamp: formattedTime,
                    file: {
                        url: downloadURL,
                        type: fileType,
                        name: selectedFile.name
                    },
                    ip: ip,
                    ipCountry: ipCountry,
                    ipCountryCode: ipCountryCode
                };

                await setDoc(newMessageDocExtension, messageData);

                const fieldUpdate = collection(projectExtensionFirestore, 'chats');

                await updateDoc(doc(fieldUpdate, chatId), {
                    lastMessage: lastMessageText,
                    lastMessageDate: formattedTime,
                    lastMessageSender: userEmail,
                    ttCopy: true,
                    read: false,
                    readBy: [],
                    paymentNotification: {
                        uploadPaymentDate: calendarETD,
                        nameOfRemitter: nameOfRemitter,
                        fileName: selectedFile.name,
                        url: downloadURL
                    }
                });

                console.log('File uploaded successfully!');
            } catch (error) {
                console.error('Error updating remitter:', error);
            } finally {
                setIsLoading(false)
                setPaymentModalVisible(false)
            }
            setNameOfRemitter('');
            setMessageText('');
            setCalendarETD(null); // Replace with the correct function to reset your calendar
            setSelectedFile(null);

        } else {

            return;
        }
    };

    //UPLOAD FILES
    const [calendarETD, setCalendarETD] = useState('');
    const getValueFromDateETD = (etd) => {
        setCalendarETD(etd)
    };
    const [nameOfRemitter, setNameOfRemitter] = useState('');
    const [messageText, setMessageText] = useState('');
    const [toggleModal, setToggleModal] = useState(false);

    return (
        <>
            <Pressable
                style={({ pressed, hovered }) => [

                    {
                        borderWidth: 1,
                        borderColor: '#16A34A',
                        backgroundColor: hovered ? '#f0fdf4' : 'transparent',
                        opacity: pressed ? 0.5 : 1,
                        borderRadius: 5,
                        paddingVertical: 7,
                        paddingHorizontal: 20,
                        padding: 5,
                    }
                ]}
                onPress={handleViewPaymentDetails}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',

                    }}
                >
                    <AntDesign name="wallet" size={16} color="#16A34A" style={{ marginRight: 5 }} />
                    <Text style={{ color: '#16A34A', fontWeight: '700' }}>Payment Slip</Text>
                </View>
            </Pressable>
            {
                paymentModalVisible && (
                    <Modal
                        visible={paymentModalVisible}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setPaymentModalVisible(false)}
                    >
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 20,
                        }}>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                zIndex: -9
                            }} />

                            <View style={{ width: '100%', maxWidth: 600, height: '100%', maxHeight: 480, backgroundColor: 'white', borderRadius: 2, zIndex: 99 }}>
                                <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={{ alignSelf: 'flex-end', margin: 20 }}>
                                    <AntDesign name="close" size={25} />
                                </TouchableOpacity>
                                <View style={{ paddingBottom: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomWidth: 1, borderBottomColor: 'blue', marginHorizontal: 40 }}>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: 'blue' }}>PAYMENT NOTIFICATIONS</Text>
                                </View>
                                <View style={{ padding: 20, marginHorizontal: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 10 }}>
                                        <Text style={{ color: '#333', fontWeight: 'bold', marginRight: 5, fontSize: 16, }}>Amount</Text>
                                        <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold' }}>{`${symbol} ${value}`}</Text>
                                    </View>

                                    <View style={{ marginBottom: 10 }}>

                                        <ShowCalendarShipping getValueFromDateETD={getValueFromDateETD} screenWidth={screenWidth} />

                                    </View>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#CCCCCC',
                                            padding: 10,
                                            borderRadius: 5,
                                            marginBottom: 10,
                                            zIndex: -1
                                        }}
                                        placeholder="Name of Remitter"
                                        defaultValue={nameOfRemitter}
                                        onChangeText={(text) => setNameOfRemitter(text)}
                                    />
                                    <TextInput
                                        style={[{
                                            borderWidth: 1,
                                            borderColor: '#CCCCCC',
                                            padding: 10,
                                            borderRadius: 5,
                                            marginBottom: 10,
                                            zIndex: -1
                                        }, { height: 80, textAlignVertical: 'top' }]}
                                        placeholder="Text Message"
                                        multiline
                                        defaultValue={messageText}
                                        onChangeText={(text) => setMessageText(text)}
                                    />
                                    {selectedFile && (
                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <View style={{ marginLeft: 5, flex: 3 }}>
                                                <Text>{selectedFile.name}</Text>
                                            </View>
                                            <TouchableOpacity onPress={deleteSelectedFile}>
                                                <Text>X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', zIndex: -1, marginTop: 10 }}>
                                        <TouchableOpacity style={{
                                            backgroundColor: '#0642F4',
                                            padding: 10,
                                            borderRadius: 5,
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            flex: 1, // Makes button expand
                                            marginRight: 5,
                                            zIndex: -1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                        }}
                                            onPress={() => uploadRemitterFiles()}
                                        >
                                            <MaterialIcons name="file-upload" size={22} color={'white'} />
                                            <Text style={{ fontWeight: 'bold', color: 'white', marginLeft: 5, textAlign: 'center' }}>Upload File</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{
                                            backgroundColor: '#0F34A3',
                                            padding: 10,
                                            borderRadius: 5,

                                            marginBottom: 10,
                                            flex: 1, // Makes button expand
                                            marginLeft: 5,
                                            zIndex: -1,
                                            justifyContent: 'center',

                                        }}
                                            onPress={() => { updateRemitter(); }}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <MaterialIcons name="update" size={22} color={'white'} />
                                                    <Text style={{ fontWeight: 'bold', color: 'white', marginLeft: 5 }}>Update Remitter</Text>
                                                </View>

                                            )}

                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>


                        </View>

                    </Modal>)}
        </>

    );
};

// const ReceiverInformation = () => {
//     //THIS COMPONENT IS THE DETAILS FOR THE DHL DELIVERY
//     const [modalVisible, setModalVisible] = useState(false);
//     const openModalRequest = () => {
//         setModalVisible(!modalVisible);
//     };
//     const { userEmail } = useContext(AuthContext);
//     const { chatId } = useParams();
//     //COUNTRY AND CITY
//     const [countries, setCountries] = useState([]);
//     const [showCountries, setShowCountries] = useState(false);
//     const [selectedCountry, setSelectedCountry] = useState('');
//     const [selectedCountryLabel, setSelectedCountryLabel] = useState('Country');
//     const [filter, setFilter] = useState('');
//     const toggleCountries = () => {
//         setShowCountries(!showCountries);
//         setFilter('');
//         setFilteredCountries(countries);
//         setShowCities(false);
//     };
//     const [showCountriesNotify, setShowCountriesNotify] = useState(false);
//     const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
//     const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('Country');
//     const [filterNotify, setFilterNotify] = useState('');
//     const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
//     const handleClearNotify = () => {
//         setSelectedCountryNotifyLabel('Country');
//         setSelectedCityNotify('City');
//         setSelectedCountryNotify('');
//     };
//     const toggleCountriesNotify = () => {
//         setShowCountriesNotify(!showCountriesNotify);
//         setFilterNotify('');
//         setFilteredCountriesNotify(countries);
//         setShowCitiesNotify(false);
//     }

//     useEffect(() => {
//         try {
//             const countriesData = Country.getAllCountries().map((country) => ({
//                 value: country.isoCode,
//                 label: country.name
//             }));
//             setFilteredCountries(countriesData);
//             setCountries(countriesData);
//             setFilteredCountriesNotify(countriesData);
//         } catch (error) {
//             console.error('Error Fetching countries:', error)
//         }
//     }, []);
//     const [filteredCountries, setFilteredCountries] = useState(countries);
//     const handleFilterChange = (text) => {
//         setFilter(text);
//         setFilterCities(text);
//         setFilterNotify(text);
//         const filteredData = countries.filter(item =>
//             item.label.toLowerCase().includes(text.toLowerCase()));
//         const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
//         setFilteredCountries(filteredData);
//         setFilteredCities(filteredDataCities);
//         setFilteredCountriesNotify(filteredData);
//         setFilteredCitiesNotify(filteredDataCities);
//     };
//     const [cities, setCities] = useState([]);
//     const [filteredCities, setFilteredCities] = useState(cities);
//     const [showCities, setShowCities] = useState(false);
//     const [selectedCity, setSelectedCity] = useState('City');
//     const [filterCities, setFilterCities] = useState('');
//     const toggleCities = () => {
//         setShowCities(!showCities);
//         setFilterCities('');
//         setFilteredCities(cities);
//         setShowCountries(false);
//     };
//     useEffect(() => {
//         if (selectedCountry) {
//             const countryCities = City.getCitiesOfCountry(selectedCountry);
//             const citiesData = countryCities.map((city) => ({
//                 label: city.name
//             }));
//             console.log('All cities inside', citiesData);
//             setCities(citiesData);

//             if (citiesData.length <= 0) {
//                 setSelectedCity(selectedCountryLabel);
//             }
//         }
//         if (selectedCountryNotify) {
//             const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
//             const citiesData = countryCities.map((city) => ({
//                 label: city.name
//             }));
//             console.log('All cities inside', citiesData);
//             setCities(citiesData);

//             if (citiesData.length <= 0) {
//                 setSelectedCityNotify(selectedCountryNotifyLabel);
//             }
//         }
//     }, [selectedCountry, selectedCountryNotify]);
//     const [showCitiesNotify, setShowCitiesNotify] = useState(false);
//     const [selectedCityNotify, setSelectedCityNotify] = useState('City');
//     const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
//     const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
//     const toggleCitiesNotify = () => {
//         setShowCitiesNotify(!showCitiesNotify)
//         setFilterCitiesNotify('');
//         setFilteredCitiesNotify(cities);
//         setShowCountriesNotify(false);
//     };
//     const handleClear = () => {
//         setSelectedCountryLabel('Country');
//         setSelectedCountry('');
//         setSelectedCity('');
//     };
//     //COUNTRY AND CITY

//     //is CHECKEDNOTIFY
//     const [isChecked, setChecked] = useState(false);
//     const [isCheckedNotify, setCheckedNotify] = useState(false);

//     //if false
//     const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
//     const [addressNotify, setAddressNotify] = useState('');
//     const [telNumberNotify, setTelNumberNotify] = useState('');
//     const [emailNotify, setEmailNotify] = useState('');

//     //fetching data from STOCKID

//     //if true
//     const [fullNameDB, setFullNameDB] = useState('');
//     const [countryDB, setCountryDB] = useState('Country');
//     const [cityDB, setCityDB] = useState('City');
//     const [telNumberDB, setTelNumberDB] = useState('');
//     const [addressDB, setAddressDB] = useState('');
//     //if false
//     const [fullName, setFullName] = useState('');
//     const [address, setAddress] = useState('');
//     const [telNumber, setTelNumber] = useState('');


//     useEffect(() => {
//         const fetchUserData = async () => {
//             const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
//             try {
//                 const userDoc = await getDoc(userDocRef);
//                 if (userDoc.exists()) {
//                     const userData = userDoc.data();
//                     setFullNameDB(userData.textFirst + ' ' + userData.textLast);
//                     setTelNumberDB('+' + userData.textPhoneNumber);
//                     setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
//                     setCountryDB(userData.country);
//                     setCityDB(userData.city);
//                 } else {
//                     console.log('No user with that Email')
//                 }
//             } catch (error) {
//                 console.error('Error fetching user data:', error)
//             }
//         };
//         if (userEmail) {
//             fetchUserData();
//         }
//     }, [userEmail])
//     //fetching the user's information

//     //fetching data from STOCKID carId = STOCKID
//     const [carId, setCarId] = useState(null);
//     useEffect(() => {
//         if (!userEmail) {
//             console.log('No user email available.');
//             return;
//         }
//         if (!chatId) {
//             console.log('No user email available.');
//             return;
//         }
//         const fetchCarId = async () => {
//             try {
//                 const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
//                 const docSnapshot = await getDoc(vehicleIdDocRef);

//                 if (docSnapshot.exists()) {
//                     const carIdValue = docSnapshot.data().carData.stockID;
//                     setCarId(carIdValue);
//                 } else {
//                     console.log('Document does not exist');
//                 }
//             } catch (error) {
//                 console.error('Error getting document:', error);
//             }
//         }

//         fetchCarId(); // Don't forget to call the function!
//     }, [chatId]);
//     //fetching data from STOCKID carId = STOCKID
//     const styles = StyleSheet.create({
//         container: {
//             flexDirection: 'row',
//             alignItems: 'center',
//         },
//         step: {
//             height: 10,
//             width: '30%',
//             backgroundColor: '#ccc',
//         },
//         completed: {
//             backgroundColor: 'green',
//         },
//         circle: {
//             width: 30,
//             height: 30,
//             borderRadius: 15,
//             backgroundColor: '#ff4d4d',
//             justifyContent: 'center',
//             alignItems: 'center',
//         },
//         innerCircle: {
//             width: 20,
//             height: 20,
//             borderRadius: 10,
//             backgroundColor: '#fff',
//         },
//         innerCircleCompleted: {
//             backgroundColor: 'green',
//         },
//         line: {
//             height: 10,
//             width: '30%',
//             backgroundColor: '#ccc',
//             flexShrink: 1,
//         },
//     });

//     const [inputEmail, setInputEmail] = useState('');
//     const [inputEmailNotify, setInputEmailNotify] = useState('');

//     const setDeliveryInfo = async () => {
//         const response = await axios.get('https://asia-northeast2-samplermj.cloudfunctions.net/serverSideTimeAPI/get-tokyo-time');
//         const { datetime } = response.data.datetime;
//         const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
//         const url = 'https://asia-northeast2-samplermj.cloudfunctions.net/ipApi/ipInfo';

//         const responseIP = await axios.get(url);
//         const ip = responseIP.data.ip;
//         const ipCountry = responseIP.data.country_name;
//         const ipCountryCode = responseIP.data.country_code
//         const customerInfo = {
//             fullName: isChecked ? fullNameDB : fullName,
//             country: isChecked ? countryDB : selectedCountryLabel,
//             city: isChecked ? cityDB : selectedCity,
//             address: isChecked ? addressDB : address,
//             telNumber: isChecked ? telNumberDB : telNumber,
//             email: inputEmail,
//         };

//         try {
//             const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
//             // Create a new message document in the chat conversation with the formatted timestamp as the document ID
//             const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
//             const messageData = {
//                 sender: userEmail, // Sender's email
//                 text: `DELIVERY ADDRESS INFORMATION
// Customer Information
//             Full Name: ${isChecked ? fullNameDB : fullName}
//             Country: ${isChecked ? countryDB : selectedCountryLabel}
//             City: ${isChecked ? cityDB : selectedCity}
//             Address: ${isChecked ? addressDB : address}
//             Tel. Number: ${isChecked ? telNumberDB : telNumber}
//             Email: ${inputEmail}
//                 `,
//                 timestamp: formattedTime,
//                 customerInfo,
//                 ip: ip,
//                 ipCountry: ipCountry,
//                 ipCountryCode: ipCountryCode
//             };
//             await updateDoc(orderRef, {
//                 deliveryAddressInformation: {
//                     customerInfo,
//                     dateIssued: formattedTime, // Add formatted date
//                 },
//             });
//             await setDoc(newMessageDocExtension, messageData);
//         } catch (error) {
//             console.error('Error updating Proforma Invoice:', error);
//         }
//     };


//     return (
//         <View>
//             <TouchableOpacity
//                 onPress={openModalRequest}
//                 style={{
//                     height: 50,
//                     backgroundColor: '#FAA000',
//                     borderRadius: 10,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     padding: 10
//                 }}
//             >
//                 <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>ENTER INFORMATION</Text>
//             </TouchableOpacity>

//             <Modal
//                 animationType="fade"
//                 transparent={true}
//                 visible={modalVisible}
//                 onRequestClose={openModalRequest}
//             >
//                 <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
//                     <View style={{ backgroundColor: 'white', width: 400, height: 450, padding: 10, borderRadius: 10 }}>
//                         <ScrollView>
//                             <View style={{ flex: 1, marginTop: 5 }}>
//                                 <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={openModalRequest}>
//                                     <Text style={{ fontSize: 20, fontWeight: '700' }}>X</Text>
//                                 </TouchableOpacity>
//                                 <View style={{ flexDirection: 'row' }}>
//                                     <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
//                                         Delivery Address & Customer Information
//                                     </Text>
//                                     <TouchableOpacity onPress={() => {
//                                         setChecked(prev => {
//                                             if (prev && isChecked) {
//                                                 setFullNameDB(fullNameDB);
//                                                 setCityDB(cityDB);
//                                                 setCountryDB(countryDB);
//                                                 setAddressDB(addressDB);
//                                                 setTelNumberDB(telNumberDB);
//                                             } else {
//                                                 setFullName(' ');
//                                                 setSelectedCountryLabel('Country')
//                                                 setSelectedCity('City')
//                                                 setAddress(' ')
//                                                 setTelNumber(' ')
//                                             }
//                                             return !prev;
//                                         });
//                                     }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
//                                         <MaterialIcons
//                                             name={isChecked ? 'check-box' : 'check-box-outline-blank'}
//                                             size={20}
//                                             color="black"
//                                         />
//                                         <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
//                                     </TouchableOpacity>
//                                 </View>
//                                 <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
//                                     <View style={{ flex: 1 }}>
//                                         <Text>Full Name</Text>
//                                         <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
//                                             {isChecked ? (
//                                                 <TextInput
//                                                     style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                     value={fullNameDB}
//                                                     onChangeText={(text) => setFullNameDB(text)}
//                                                 />
//                                             ) : (
//                                                 <TextInput
//                                                     style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                     value={fullName}
//                                                     onChangeText={(text) => setFullName(text)}
//                                                 />
//                                             )}

//                                         </View>
//                                     </View>

//                                 </View>
//                                 <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
//                                     <View style={{ flex: 1 }}>
//                                         <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
//                                         <View style={{ flex: 1, zIndex: 2 }}>
//                                             <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
//                                                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
//                                                     <View style={{ alignSelf: 'center' }}>
//                                                         {isChecked ? (
//                                                             <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
//                                                         ) : (
//                                                             <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
//                                                         )}
//                                                     </View>
//                                                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
//                                                         <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
//                                                             <AntDesign name="close" size={15} />
//                                                         </TouchableOpacity>
//                                                         <AntDesign
//                                                             name="down"
//                                                             size={15}
//                                                             style={[
//                                                                 { transitionDuration: '0.3s' },
//                                                                 showCountries && {
//                                                                     transform: [{ rotate: '180deg' }],
//                                                                 },
//                                                             ]}
//                                                         />
//                                                     </View>
//                                                 </View>
//                                             </TouchableOpacity>
//                                             {showCountries && (
//                                                 <View style={{
//                                                     marginTop: 5,
//                                                     position: 'absolute',
//                                                     top: '100%',
//                                                     left: 0,
//                                                     elevation: 5,
//                                                     width: '100%',
//                                                     maxHeight: 200,
//                                                     backgroundColor: "white",
//                                                     borderWidth: 1,
//                                                     borderColor: '#ccc',
//                                                     shadowColor: '#000',
//                                                     shadowOffset: { width: 0, height: 4 },
//                                                     shadowOpacity: 0.25,
//                                                     shadowRadius: 4,
//                                                     zIndex: 3
//                                                 }}>
//                                                     <View style={{
//                                                         flexDirection: 'row',
//                                                         alignItems: 'center',
//                                                         backgroundColor: '#fff',
//                                                         borderWidth: 0.5,
//                                                         borderColor: '#000',
//                                                         height: 40,
//                                                         borderRadius: 5,
//                                                         margin: 10,
//                                                         zIndex: 3
//                                                     }}>
//                                                         <AntDesign name="search1" size={20} style={{ margin: 5 }} />
//                                                         <TextInput
//                                                             placeholder='Search Country'
//                                                             style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
//                                                             textAlignVertical='center'
//                                                             placeholderTextColor={'gray'}
//                                                             value={filter}
//                                                             onChangeText={handleFilterChange}
//                                                         />
//                                                     </View>
//                                                     <ScrollView>
//                                                         <FlatList
//                                                             data={filteredCountries}
//                                                             keyExtractor={(item) => item.value} // Use item.label as the key
//                                                             renderItem={({ item }) => (
//                                                                 <TouchableOpacity onPress={() => {
//                                                                     setSelectedCountryLabel(item.label);
//                                                                     setSelectedCountry(item.value);
//                                                                     setShowCountries(false);
//                                                                     setFilteredCountries(countries);
//                                                                     setSelectedCity('City')
//                                                                 }}>
//                                                                     <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
//                                                                         <Text>{item.label}</Text>
//                                                                     </View>
//                                                                 </TouchableOpacity>
//                                                             )}
//                                                         />

//                                                     </ScrollView>
//                                                 </View>
//                                             )}

//                                         </View>
//                                     </View>
//                                     <View style={{ flex: 1, marginLeft: 5 }}>
//                                         <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
//                                         <View style={{ flex: 1, zIndex: 2, }}>
//                                             <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

//                                                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
//                                                     {isChecked ? (
//                                                         <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
//                                                     ) : (
//                                                         <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
//                                                     )}
//                                                     <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
//                                                         <AntDesign
//                                                             name="down"
//                                                             size={15}
//                                                             style={[
//                                                                 { transitionDuration: '0.3s' },
//                                                                 showCities && {
//                                                                     transform: [{ rotate: '180deg' }],
//                                                                 },
//                                                             ]}
//                                                         />
//                                                     </View>
//                                                 </View>

//                                             </TouchableOpacity>
//                                             {showCities && (
//                                                 <View
//                                                     style={{
//                                                         marginTop: 5,
//                                                         position: 'absolute',
//                                                         top: '100%',
//                                                         left: 0,
//                                                         elevation: 5,
//                                                         width: '100%',
//                                                         maxHeight: 200,
//                                                         backgroundColor: 'white',
//                                                         borderWidth: 1,
//                                                         borderColor: '#ccc',
//                                                         elevation: 5,
//                                                         zIndex: 2
//                                                     }}>
//                                                     <View style={{
//                                                         flexDirection: 'row',
//                                                         alignItems: 'center',
//                                                         backgroundColor: '#fff',
//                                                         borderWidth: 0.5,
//                                                         borderColor: '#000',
//                                                         height: 40,
//                                                         borderRadius: 5,
//                                                         margin: 10,
//                                                         zIndex: 3
//                                                     }}>
//                                                         <AntDesign name="search1" size={20} style={{ margin: 5 }} />
//                                                         <TextInput
//                                                             placeholder='Search Cities'
//                                                             style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
//                                                             textAlignVertical='center'
//                                                             placeholderTextColor={'gray'}
//                                                             value={filterCities}
//                                                             onChangeText={handleFilterChange}
//                                                         />
//                                                     </View>
//                                                     <ScrollView>
//                                                         <FlatList
//                                                             data={filteredCities}
//                                                             keyExtractor={(item, index) => index.toString()}
//                                                             renderItem={({ item }) => (
//                                                                 <TouchableOpacity onPress={() => {
//                                                                     setSelectedCity(item.label)
//                                                                     setShowCities(false);
//                                                                     setFilteredCities(cities);
//                                                                 }}>
//                                                                     <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
//                                                                         <Text>{item.label}</Text>
//                                                                     </View>
//                                                                 </TouchableOpacity>
//                                                             )}
//                                                         />
//                                                     </ScrollView>
//                                                 </View>
//                                             )}
//                                         </View>
//                                     </View>
//                                 </View>
//                                 <View style={{ marginTop: 5, zIndex: -1 }}>
//                                     <View style={{ flex: 1 }}>
//                                         <Text>Address</Text>
//                                         <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
//                                             {isChecked ? (
//                                                 <TextInput
//                                                     style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                     value={addressDB}
//                                                     onChangeText={(text) => setAddressDB(text)}
//                                                 />
//                                             ) : (
//                                                 <TextInput
//                                                     style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                     value={address}
//                                                     onChangeText={(text) => setAddress(text)}
//                                                 />
//                                             )}

//                                         </View>
//                                     </View>
//                                 </View>
//                                 <View style={{ marginTop: 5, zIndex: -1 }}>
//                                     <View style={{ flex: 1 }}>
//                                         <Text>Tel. Number</Text>
//                                         <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
//                                             {isChecked ? (
//                                                 <TextInput
//                                                     style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                     value={telNumberDB}
//                                                     onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
//                                                 />
//                                             ) : (
//                                                 <TextInput
//                                                     style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                     value={telNumber}
//                                                     onChangeText={(text) => setTelNumber(text)}
//                                                 />
//                                             )}
//                                         </View>
//                                     </View>
//                                 </View>

//                                 <View style={{ marginTop: 5, zIndex: -1 }}>
//                                     <View style={{ flex: 1 }}>
//                                         <Text>Email</Text>
//                                         <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
//                                             <TextInput
//                                                 style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
//                                                 value={inputEmail}
//                                                 onChangeText={(text) => setInputEmail(text)}
//                                             />
//                                         </View>
//                                     </View>
//                                 </View>

//                             </View>

//                             <TouchableOpacity style={{ backgroundColor: '#7b9cff', borderRadius: 5, marginTop: 20 }} onPress={() => { openModalRequest(); setDeliveryInfo(); }}>
//                                 <View style={{ padding: 10, alignItems: 'center' }}>
//                                     <Text style={{ color: '#fff', fontWeight: '600' }}>Submit Details</Text>
//                                 </View>
//                             </TouchableOpacity>
//                         </ScrollView>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     )
// }

// const ProfileOptions = () => {
//     const navigate = useNavigate();
//     const [showProfileOptions, setShowProfileOptions] = useState(false);

//     //country and city
//     const [countries, setCountries] = useState([]);
//     useEffect(() => {
//         try {
//             const countriesData = Country.getAllCountries().map((country) => ({
//                 value: country.isoCode,
//                 label: country.name
//             }));

//             setCountries(countriesData);
//         } catch (error) {
//             console.error('Error Fetching countries:', error)
//         }
//     }, []);
//     //country and city

//     return (
//         <View>
//             <Pressable
//                 onPress={() => setShowProfileOptions(!showProfileOptions)}
//                 style={({ pressed, hovered }) => ({
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     marginBottom: 10,
//                     backgroundColor: hovered ? '#aaa' : null,
//                     width: '100%',
//                     alignSelf: 'center',
//                     borderRadius: 10,
//                     height: 50,
//                     padding: 5,
//                     opacity: pressed ? 0.5 : 1,
//                     justifyContent: 'center'
//                 })}
//             >
//                 <MaterialCommunityIcons name="account" size={30} />

//             </Pressable>
//             {showProfileOptions && (
//                 <View style={{ justifyContent: 'center', width: '100%', alignItems: 'center' }}>
//                     <TouchableOpacity onPress={() => navigate('/Profile')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
//                         <Ionicons name="person-outline" size={20} />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => navigate('/ProfilePassword')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
//                         <MaterialCommunityIcons name="onepassword" size={20} />
//                     </TouchableOpacity>
//                 </View>
//             )}
//         </View>
//     );
// };
// const RequestProformaInvoice = ({ activeChatId }) => {
//     let formData
//     let formDataNotify
//     const { userEmail } = useContext(AuthContext);
//     const styles = StyleSheet.create({
//         input: {
//             height: 40,
//             borderColor: 'gray',
//             borderWidth: 1,
//             marginTop: 5,
//             marginBottom: 10,
//             padding: 10,
//             borderRadius: 5
//         }
//     });
//     const [showData, setShowData] = useState({});
//     const [selectedCountry, setSelectedCountry] = useState({ value: '', label: 'Select Country' });
//     const [selectedCity, setSelectedCity] = useState('');
//     const [selectedCountryNotify, setSelectedCountryNotify] = useState({ value: '', label: 'Select Country' });
//     const [selectedCityNotify, setSelectedCityNotify] = useState('');
//     const [userData, setUserData] = useState(null);
//     const [isChecked, setIsChecked] = useState(false);
//     const [isCheckedNotify, setIsCheckedNotify] = useState(false);
//     useEffect(() => {
//         const fetchUserData = async () => {
//             const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
//             try {
//                 const userDoc = await getDoc(userDocRef);
//                 if (userDoc.exists()) {
//                     setUserData(userDoc.data());
//                 } else {
//                     console.log('No user with that Email')
//                 }
//             } catch (error) {
//                 console.error('Error fetching user data:', error)
//             }
//         };
//         if (isChecked) {
//             setShowData({
//                 fullName: `${userData?.textFirst} ${userData?.textLast}`,
//                 country: selectedCountry.value ? selectedCountry?.label : userData?.country,
//                 city: selectedCity ? selectedCity?.label : userData?.city,
//                 address: `${userData?.textStreet}, ${userData?.textZip} ${userData?.city}, ${userData?.country}`,
//                 email: userData?.textEmail,
//                 telephones: userData?.textPhoneNumber
//             });
//         }
//         if (userEmail) {
//             fetchUserData();
//         }
//     }, [userEmail, isChecked, selectedCountry, selectedCity])
//     //fetch customer information


//     const handleOutsidePress = () => {
//         if (countryModal) setCountryModal(false);
//         if (cityModal) setCityModal(false);
//         if (countryModalNotify) setCountryModalNotify(false);
//         if (cityModalNotify) setCityModalNotify(false)
//     };

//     //fetch countries
//     const [countryData, setCountryData] = useState([]);
//     const [countryModal, setCountryModal] = useState(false);
//     const [countryModalNotify, setCountryModalNotify] = useState(false);

//     const handleCountrySelect = (item) => {
//         if (countryModalNotify === true) {
//             setSelectedCountryNotify(item);
//             toggleCountryModalNotify();
//         } else if (countryModal === true) {
//             setSelectedCountry(item);
//             toggleCountryModal();

//         }
//     };

//     const renderCountries = ({ item }) => (
//         <Pressable style={{
//             padding: 10,
//             borderBottomWidth: 1,
//             borderBottomColor: '#eee',
//         }}
//             onPress={() => handleCountrySelect(item)}
//         >

//             <Text style={{
//                 fontSize: 16,
//                 color: '#333'
//             }}>{item.label}</Text>
//         </Pressable>
//     );

//     const toggleCountryModal = () => {
//         setCountryModal(!countryModal)
//     }
//     const toggleCountryModalNotify = () => {
//         setCountryModalNotify(!countryModalNotify)
//     }
//     useEffect(() => {
//         try {
//             const countriesData = Country.getAllCountries().map((country) => ({
//                 value: country.isoCode,
//                 label: country.name
//             }));
//             const defaultOption = { value: '', label: 'Select Country' };
//             setCountryData([defaultOption, ...countriesData]);
//         } catch (error) {
//             console.error('Error Fetching countries:', error)
//         }
//     }, []);

//     //fetch countries

//     //fetch cities
//     const [cityData, setCityData] = useState([]);
//     const [cityModal, setCityModal] = useState(false);
//     const [cityModalNotify, setCityModalNotify] = useState(false);
//     const toggleCityModal = () => {
//         setCityModal(!cityModal)
//     };
//     const toggleCityModalNotify = () => {
//         setCityModalNotify(!cityModalNotify)
//     };
//     const handleCitySelect = (item) => {
//         if (cityModalNotify === true) {
//             setSelectedCityNotify(item);
//             toggleCityModalNotify();
//         } else if (cityModal === true) {
//             setSelectedCity(item);
//             toggleCityModal();

//         } else {
//             return;
//         }
//     };
//     useEffect(() => {
//         if (selectedCountry.value) {
//             const countryCities = City.getCitiesOfCountry(selectedCountry?.value);
//             const citiesData = countryCities.map((city) => ({
//                 label: city.name
//             }));

//             setCityData(citiesData);
//         } else if (selectedCountryNotify.value) {
//             const countryCities = City.getCitiesOfCountry(selectedCountryNotify?.value);
//             const citiesData = countryCities.map((city) => ({
//                 label: city.name
//             }));

//             setCityData(citiesData);
//         } else {
//             return;
//         }

//     }, [selectedCountry, selectedCountryNotify]);

//     const renderCities = ({ item }) => (
//         <Pressable style={{
//             padding: 10,
//             borderBottomWidth: 1,
//             borderBottomColor: '#eee',
//         }}
//             onPress={() => handleCitySelect(item)}
//         >
//             <Text style={{
//                 fontSize: 16,
//                 color: '#333'
//             }}>{item.label}</Text>
//         </Pressable>
//     );
//     //fetch cities



//     //variables ref

//     const fullNameRef = useRef(null);

//     const addressRef = useRef(null);
//     const emailRef = useRef(null);
//     const [telephoneInputs, setTelephoneInputs] = useState([0]); // Array of input indices
//     const telephoneRefs = useRef({ 0: '' }); // Initialize the first input with an empty string
//     const addTelephoneInput = () => {
//         // Check if there are already 3 inputs
//         if (telephoneInputs.length >= 3) {
//             alert('Max Telephone numbers.');
//             return; // Stop the function if the limit is reached
//         }
//         const newInputId = Object.keys(telephoneRefs.current).length;
//         // Initialize new input reference with an empty string instead of null
//         telephoneRefs.current[newInputId] = '';
//         setTelephoneInputs(prev => [...prev, newInputId]);
//     };
//     const faxRef = useRef(null);

//     const fullNameNotifyRef = useRef(null);

//     const addressNotifyRef = useRef(null);
//     const emailNotifyRef = useRef(null);
//     const [telephoneInputsNotify, setTelephoneInputsNotify] = useState([0]); // Array of input indices
//     const telephoneNotifyRefs = useRef({ 0: '' }); // Initialize the first input with an empty string
//     const addTelephoneInputNotify = () => {
//         // Check if there are already 3 inputs
//         if (telephoneInputsNotify.length >= 3) {
//             alert('Max Telephone numbers.');
//             return; // Stop the function if the limit is reached
//         }
//         const newInputId = Object.keys(telephoneNotifyRefs.current).length;
//         // Initialize new input reference with an empty string instead of null
//         telephoneNotifyRefs.current[newInputId] = '';
//         setTelephoneInputsNotify(prev => [...prev, newInputId]);
//     };
//     const faxRefNotify = useRef(null);
//     //fetch ip address

//     //fetch ip address

//     const handleSubmit = async () => {

//         const response = await axios.get('https://asia-northeast2-samplermj.cloudfunctions.net/serverSideTimeAPI/get-tokyo-time');
//         const { datetime } = response.data.datetime;

//         const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');

//         console.log("Refs at submission:", telephoneRefs.current);
//         const telephones = telephoneInputs.map(inputId =>
//             telephoneRefs.current[inputId] ? telephoneRefs.current[inputId].value : 'Ref not set'
//         );
//         const telephonesNotify = telephoneInputsNotify.map(inputId =>
//             telephoneNotifyRefs.current[inputId] ? telephoneNotifyRefs.current[inputId].value : 'Ref not set'
//         );
//         console.log("Telephone values:", telephones);


//         if (isChecked) {
//             // If isCheckedNotify and isChecked are true, use user data if available
//             formData = {
//                 fullName: `${userData?.textFirst} ${userData?.textLast}` || (fullNameRef.current ? fullNameRef.current.value : ''),
//                 country: selectedCountry?.label || userData?.country,
//                 city: selectedCity?.label || userData?.city,
//                 address: `${userData?.textStreet}, ${userData?.textZip} ${userData?.city}, ${userData?.country}` || (addressRef.current ? addressRef.current.value : ''),
//                 fax: faxRef.current ? faxRef.current.value : '',
//                 email: userData?.textEmail || (emailRef.current ? emailRef.current.value : ''),
//                 telephones: telephones
//             };
//         } else {
//             // If isCheckedNotify is true but isChecked is false, use form inputs directly
//             formData = {
//                 fullName: fullNameRef.current ? fullNameRef.current.value : '',
//                 country: selectedCountry ? selectedCountry.label : '',
//                 city: selectedCity ? selectedCity.label : '',
//                 address: addressRef.current ? addressRef.current.value : '',
//                 fax: faxRef.current ? faxRef.current.value : '',
//                 email: emailRef.current ? emailRef.current.value : '',
//                 telephones: telephones
//             };
//         }

//         if (isCheckedNotify) {
//             if (isChecked) {
//                 // If isCheckedNotify and isChecked are true, use user data if available
//                 formDataNotify = {
//                     fullName: `${userData?.textFirst} ${userData?.textLast}` || (fullNameRef.current ? fullNameRef.current.value : ''),
//                     country: selectedCountry?.label || userData?.country,
//                     city: selectedCity?.label || userData?.city,
//                     address: `${userData?.textStreet}, ${userData?.textZip} ${userData?.city}, ${userData?.country}` || (addressRef.current ? addressRef.current.value : ''),
//                     fax: faxRef.current ? faxRef.current.value : '',
//                     email: userData?.textEmail || (emailRef.current ? emailRef.current.value : ''),
//                     telephones: telephones
//                 };
//             } else {
//                 // If isCheckedNotify is true but isChecked is false, use form inputs directly
//                 formDataNotify = {
//                     fullName: fullNameRef.current ? fullNameRef.current.value : '',
//                     country: selectedCountry ? selectedCountry.label : '',
//                     city: selectedCity ? selectedCity.label : '',
//                     address: addressRef.current ? addressRef.current.value : '',
//                     fax: faxRef.current ? faxRef.current.value : '',
//                     email: emailRef.current ? emailRef.current.value : '',
//                     telephones: telephones
//                 };
//             }
//         } else {
//             // If isCheckedNotify is false, you might want to handle this case differently or use default values
//             formDataNotify = {
//                 fullName: fullNameNotifyRef.current ? fullNameNotifyRef.current.value : '',
//                 country: selectedCountryNotify ? selectedCountryNotify.label : '',
//                 city: selectedCityNotify ? selectedCityNotify.label : '',
//                 address: addressNotifyRef.current ? addressNotifyRef.current.value : '',
//                 fax: faxRefNotify.current ? faxRefNotify.current.value : '',
//                 email: emailNotifyRef.current ? emailNotifyRef.current.value : '',
//                 telephones: telephonesNotify
//             };
//         }

//         try {
//             const orderRef = doc(projectExtensionFirestore, 'chats', activeChatId);
//             const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', activeChatId, 'messages'));
//             const messageData = {
//                 sender: userEmail, // Sender's email
//                 text: `Request for Proforma Invoice`,
//                 timestamp: formattedTime,
//                 messageType: 'RequestInvoice',
//                 ip: ip,
//                 ipCountry: ipCountry
//             };

//             await setDoc(newMessageDocExtension, messageData, { merge: true });
//             await updateDoc(orderRef, {
//                 requestInvoice: {
//                     consignee: {
//                         formData,
//                         sameAsBuyer: isChecked
//                     },
//                     notifyParty: {
//                         formDataNotify,
//                         sameAsConsignee: isCheckedNotify,
//                     }
//                 },

//             })
//             const fieldUpdate = collection(projectExtensionFirestore, 'chats');

//             await updateDoc(doc(fieldUpdate, activeChatId), {
//                 lastMessage: 'Request for Proforma Invoice',
//                 lastMessageDate: formattedTime,
//                 lastMessageSender: userEmail,
//                 read: false,
//                 readBy: [],
//             });
//             // setModalVisible(false);
//         } catch (error) {
//             console.error('Error updating Proforma Invoice:', error);
//         }
//     };
//     //variables ref

//     const [modalVisible, setModalVisible] = useState(false);
//     const handlePress = () => {
//         setModalVisible(true);
//         handleOutsidePress();
//     };
//     const [isCheck, setIsCheck] = useState(false);
//     const checkButton = (option) => {
//         setIsCheck(option);

//     }
//     const setOrderInvoice = async () => {
//         const response = await axios.get('https://asia-northeast2-samplermj.cloudfunctions.net/serverSideTimeAPI/get-tokyo-time');
//         const { datetime } = response.data.datetime;
//         const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
//         const randomNumber = Math.floor(10000 + Math.random() * 90000);
//         const bookingListCollectionRef = collection(projectExtensionFirestore, 'BookingList');

//         const customerInfo = {
//             fullName: fullName || fullNameDB,
//             country: selectedCountryLabel || countryDB,
//             city: selectedCity || cityDB,
//             address: address || addressDB,
//             telNumber: telNumber || telNumberDB,
//             email: userEmailInput || userEmailInputDB,
//         };


//         const infoCustomerInput = {
//             fullName: fullNameNotifyInput,
//             country: selectedCountryNotifyLabel,
//             city: selectedCityNotify,
//             address: addressNotify,
//             telNumber: telNumberNotify,
//             email: emailNotify,
//         };

//         try {
//             const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
//             const invoiceRef = doc(projectExtensionFirestore, 'IssuedInvoice', chatField?.invoiceNumber);
//             const vehicleRef = doc(projectExtensionFirestore, 'VehicleProducts', carData?.stockID);
//             const newBookingListDocRef = doc(bookingListCollectionRef, chatId);
//             // const fieldUpdate = collection(projectExtensionFirestore, 'chats');
//             const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
//             const messageData = {
//                 sender: userEmail, // Sender's email
//                 text: "I agree with all the condition and place the order.",
//                 timestamp: formattedTime,
//                 orderInvoiceIssue: true,
//                 setPaymentNotification: true,
//                 ip: ip,
//                 ipCountry: ipCountry
//             };
//             await updateDoc(invoiceRef, {
//                 orderPlaced: true,

//             });
//             await updateDoc(vehicleRef, {
//                 reservedTo: userEmail,
//                 stockStatus: 'Reserved'
//             })

//             await updateDoc(orderRef, {
//                 orderInvoice: {
//                     proformaIssue: true,
//                     customerInfo,
//                     notifyParty: isCheckedNotify ? customerInfo : infoCustomerInput,
//                     dateIssued: formattedTime, // Add formatted date
//                 },
//                 lastMessage: 'I agree with all the condition and place the order.',
//                 lastMessageDate: formattedTime,
//                 lastMessageSender: userEmail,
//                 read: false,
//                 readBy: [],
//             });
//             await setDoc(newMessageDocExtension, messageData);
//             // await setDoc(fieldUpdate, chatId, {
//             //     DocumentsUpload: {
//             //         ExportCertificate: '',
//             //         ShippingInstructions: '',
//             //         BillOfLading: '',
//             //         InspectionSheet: '',
//             //         DHLTrackingNumber: '',
//             //         InvoiceNumber: randomNumber.toString()
//             //     },

//             // });
//             await setDoc(newBookingListDocRef, {
//                 DocumentsUpload: {
//                     ExportCertificate: '',
//                     ShippingInstructions: '',
//                     BillOfLading: '',
//                     InspectionSheet: '',
//                     DHLTrackingNumber: '',
//                     InvoiceNumber: randomNumber.toString()
//                 },
//                 lastMessage: 'I agree with all the condition and place the order.',
//                 lastMessageDate: formattedTime,
//                 lastMessageSender: userEmail,
//                 read: false,
//                 readBy: [],
//             });
//         } catch (error) {
//             console.error('Error updating Proforma Invoice:', error);
//         }
//     };

//     return (
//         <Pressable
//             style={({ pressed, hovered }) => [

//                 {
//                     backgroundColor: hovered ? '#0F7534' : '#16A34A',
//                     opacity: pressed ? 0.5 : 1,
//                     borderRadius: 5,
//                     width: 200,
//                     marginTop: 5,
//                     padding: 5
//                 }
//             ]}
//             onPress={handlePress}
//         >
//             <View style={{
//                 flexDirection: 'row',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 flex: 1,

//             }}>
//                 <Text style={{ color: 'white', fontWeight: '700' }}>Request Proforma Invoice</Text>
//             </View>

//             {
//                 modalVisible && (
//                     <Modal
//                         transparent={true}
//                         animationType='fade'
//                         visible={modalVisible}
//                         onRequestClose={() => setModalVisible(false)}
//                     >
//                         <TouchableWithoutFeedback style={{ flex: 1 }} onPress={handleOutsidePress}>
//                             <View style={{
//                                 flex: 1,
//                                 justifyContent: 'center',
//                                 alignItems: 'center',
//                                 position: 'relative',
//                                 backgroundColor: 'rgba(0, 0, 0, 0.5)'// Ensure this is positioned relatively to contain absolute children
//                             }}>

//                                 <TouchableOpacity
//                                     style={{
//                                         position: 'absolute', // Position absolutely to cover the entire container
//                                         width: '100%',
//                                         height: '100%',
//                                         backgroundColor: 'transparent' // Ensure it's transparent to see below views
//                                     }}
//                                     onPress={() => setModalVisible(false)}
//                                 />
//                                 <View
//                                     style={{
//                                         backgroundColor: '#fff',
//                                         padding: 10,
//                                         width: '100%',
//                                         maxWidth: 600,
//                                         borderRadius: 10,
//                                         shadowOpacity: 0.25,
//                                         shadowRadius: 3.84,
//                                         elevation: 5,
//                                         height: '100%',
//                                         maxHeight: 850,
//                                         justifyContent: 'center',
//                                     }}
//                                 >
//                                     <View style={{
//                                         justifyContent: 'center',
//                                         borderBottomColor: 'blue',
//                                         borderBottomWidth: 2,
//                                         marginBottom: 20,
//                                         marginHorizontal: 10
//                                     }}>
//                                         <Text style={{ color: 'blue', fontSize: 22, fontWeight: '700', textAlign: 'center' }}>Proforma Invoice</Text>
//                                     </View>
//                                     <ScrollView style={{ width: '100%' }}>
//                                         <View style={{ marginBottom: 10 }}>
//                                             <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Customer Information</Text>
//                                             <TouchableOpacity onPress={() => {
//                                                 setIsChecked(prevState => {

//                                                     const newState = !prevState;
//                                                     setSelectedCountry({ value: '' });
//                                                     setSelectedCity('');
//                                                     setCityData([]);
//                                                     handleOutsidePress();

//                                                     return newState;
//                                                 });
//                                             }}

//                                                 style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
//                                                 <MaterialIcons
//                                                     name={isChecked ? 'check-box' : 'check-box-outline-blank'}
//                                                     size={20}
//                                                     color="black"
//                                                 />
//                                                 <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
//                                             </TouchableOpacity>
//                                             {isChecked ? (
//                                                 <>
//                                                     <View>
//                                                         <Text>Full Name</Text>
//                                                         <TextInput
//                                                             key={isChecked ? 'controlled' : 'uncontrolled'}
//                                                             ref={fullNameRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter full name"
//                                                             defaultValue={isChecked ? showData?.fullName : ''}
//                                                         />
//                                                     </View>

//                                                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 10, }}>

//                                                         <View style={{
//                                                             flex: 1
//                                                         }}>
//                                                             <Text style={{ marginBottom: 2 }}>Country</Text>
//                                                             <Pressable
//                                                                 onPress={toggleCountryModal}
//                                                                 style={{
//                                                                     padding: 10,
//                                                                     backgroundColor: '#fff',
//                                                                     flexDirection: 'row',
//                                                                     alignItems: 'center',
//                                                                     borderColor: '#d5d5d5',
//                                                                     borderWidth: 1,
//                                                                     borderRadius: 3
//                                                                 }}
//                                                             >
//                                                                 <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
//                                                                     <Text>{isChecked ? showData?.country : 'Select Country'}</Text>
//                                                                 </View>
//                                                                 <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
//                                                                     <TouchableOpacity>
//                                                                         <AntDesign name="close" size={15} color="blue" />
//                                                                     </TouchableOpacity>
//                                                                     <AntDesign
//                                                                         name="down"
//                                                                         size={15}
//                                                                         style={[
//                                                                             { transitionDuration: '0.3s' },
//                                                                             countryModal && {
//                                                                                 transform: [{ rotate: '180deg' }],
//                                                                             },
//                                                                         ]}
//                                                                         color="blue"
//                                                                     />
//                                                                 </View>
//                                                             </Pressable>
//                                                             {countryModal && (
//                                                                 <View style={{
//                                                                     position: 'absolute',
//                                                                     top: 40, // Adjust according to the height of the Pressable
//                                                                     left: 0,
//                                                                     right: 0,
//                                                                     backgroundColor: 'white',
//                                                                     borderColor: '#ddd',
//                                                                     borderWidth: 2,
//                                                                     maxHeight: 200,

//                                                                     zIndex: 10
//                                                                 }}>
//                                                                     <FlatList
//                                                                         data={countryData}
//                                                                         renderItem={renderCountries}
//                                                                         keyExtractor={(item) => item.label}
//                                                                     />

//                                                                 </View>


//                                                             )}

//                                                         </View>

//                                                         <View style={{
//                                                             flex: 1, marginLeft: 10
//                                                         }}>
//                                                             <Text style={{ marginBottom: 2 }}>City</Text>
//                                                             <Pressable
//                                                                 onPress={toggleCityModal}
//                                                                 style={{
//                                                                     padding: 10,
//                                                                     backgroundColor: '#fff',
//                                                                     flexDirection: 'row',
//                                                                     alignItems: 'center',
//                                                                     borderColor: '#d5d5d5',
//                                                                     borderWidth: 1,
//                                                                     borderRadius: 3
//                                                                 }}
//                                                             >
//                                                                 <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
//                                                                     <Text>{isChecked ? showData?.city : 'Select City'}</Text>
//                                                                 </View>
//                                                                 <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
//                                                                     <TouchableOpacity>
//                                                                         <AntDesign name="close" size={15} color="blue" />
//                                                                     </TouchableOpacity>
//                                                                     <AntDesign
//                                                                         name="down"
//                                                                         size={15}
//                                                                         style={[
//                                                                             { transitionDuration: '0.3s' },
//                                                                             cityModal && {
//                                                                                 transform: [{ rotate: '180deg' }],
//                                                                             },
//                                                                         ]}
//                                                                         color="blue"
//                                                                     />
//                                                                 </View>
//                                                             </Pressable>
//                                                             {cityModal && (


//                                                                 <View style={{
//                                                                     position: 'absolute',
//                                                                     top: 40, // Adjust according to the height of the Pressable
//                                                                     left: 0,
//                                                                     right: 0,
//                                                                     backgroundColor: 'white',
//                                                                     borderColor: '#ddd',
//                                                                     borderWidth: 2,
//                                                                     maxHeight: 200,

//                                                                     zIndex: 10
//                                                                 }}>
//                                                                     <FlatList
//                                                                         data={cityData}
//                                                                         renderItem={renderCities}
//                                                                         keyExtractor={(item, index) => `${item.propertyName || ''}-${index}`}
//                                                                     />

//                                                                 </View>



//                                                             )}

//                                                         </View>
//                                                     </View>

//                                                     <View>
//                                                         <Text>Address</Text>
//                                                         <TextInput
//                                                             key={isChecked ? 'controlled' : 'uncontrolled'}
//                                                             ref={addressRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter Address"
//                                                             defaultValue={isChecked ? showData?.address : ''}
//                                                         />

//                                                     </View>
//                                                     <View>
//                                                         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                                                             <Text>Telephone Number</Text>
//                                                             <Button title="Add Telephone" onPress={addTelephoneInput} />
//                                                         </View>
//                                                         {telephoneInputs.map((inputId, index) => (
//                                                             <View key={inputId}>
//                                                                 <TextInput
//                                                                     key={isChecked ? 'controlled' : 'uncontrolled' + inputId}  // Append inputId to ensure uniqueness
//                                                                     style={styles.input}
//                                                                     placeholder={`Telephone Number ${index + 1}`}
//                                                                     ref={el => {
//                                                                         telephoneRefs.current[inputId] = el;
//                                                                         if (el && !isChecked && index !== 0) {  // Clear text only for non-first inputs when not checked
//                                                                             el.setNativeProps({ text: '' });
//                                                                         }
//                                                                     }}
//                                                                     defaultValue={isChecked && index === 0 ? showData?.telephones : ''}
//                                                                 />
//                                                             </View>
//                                                         ))}
//                                                     </View>
//                                                     <View>
//                                                         <Text>Fax Number</Text>
//                                                         <TextInput
//                                                             key={isChecked ? 'controlled' : 'uncontrolled'}
//                                                             ref={faxRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter Fax Number"

//                                                         />
//                                                     </View>

//                                                     <View style={{ marginBottom: 5 }}>
//                                                         <Text>E-mail</Text>
//                                                         <TextInput
//                                                             key={isChecked ? 'controlled' : 'uncontrolled'}
//                                                             ref={emailRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter Address"
//                                                             defaultValue={isChecked ? showData?.email : ''}
//                                                         />

//                                                     </View>
//                                                 </>) : (<>
//                                                     <View>
//                                                         <Text>Full Name</Text>
//                                                         <TextInput
//                                                             ref={fullNameRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter full name"
//                                                         />
//                                                     </View>

//                                                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>

//                                                         <View style={{
//                                                             flex: 1
//                                                         }}>
//                                                             <Text style={{ marginBottom: 2 }}>Country</Text>
//                                                             <Pressable
//                                                                 onPress={toggleCountryModal}
//                                                                 style={{
//                                                                     padding: 10,
//                                                                     backgroundColor: '#fff',
//                                                                     flexDirection: 'row',
//                                                                     alignItems: 'center',
//                                                                     borderColor: '#d5d5d5',
//                                                                     borderWidth: 1,
//                                                                     borderRadius: 3
//                                                                 }}
//                                                             >
//                                                                 <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
//                                                                     <Text>{selectedCountry?.value ? selectedCountry?.label : 'Select Country'}</Text>
//                                                                 </View>
//                                                                 <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
//                                                                     <TouchableOpacity>
//                                                                         <AntDesign name="close" size={15} color="blue" />
//                                                                     </TouchableOpacity>
//                                                                     <AntDesign
//                                                                         name="down"
//                                                                         size={15}
//                                                                         style={[
//                                                                             { transitionDuration: '0.3s' },
//                                                                             countryModal && {
//                                                                                 transform: [{ rotate: '180deg' }],
//                                                                             },
//                                                                         ]}
//                                                                         color="blue"
//                                                                     />
//                                                                 </View>
//                                                             </Pressable>
//                                                             {countryModal && (


//                                                                 <View style={{
//                                                                     position: 'absolute',
//                                                                     top: 40, // Adjust according to the height of the Pressable
//                                                                     left: 0,
//                                                                     right: 0,
//                                                                     backgroundColor: 'white',
//                                                                     borderColor: '#ddd',
//                                                                     borderWidth: 2,
//                                                                     maxHeight: 200,

//                                                                     zIndex: 10
//                                                                 }}>
//                                                                     <FlatList
//                                                                         data={countryData}
//                                                                         renderItem={renderCountries}
//                                                                         keyExtractor={(item) => item.label}
//                                                                     />

//                                                                 </View>



//                                                             )}

//                                                         </View>


//                                                         <View style={{
//                                                             flex: 1, marginLeft: 10
//                                                         }}>
//                                                             <Text style={{ marginBottom: 2 }}>City</Text>
//                                                             <Pressable
//                                                                 onPress={toggleCityModal}
//                                                                 style={{
//                                                                     padding: 10,
//                                                                     backgroundColor: '#fff',
//                                                                     flexDirection: 'row',
//                                                                     alignItems: 'center',
//                                                                     borderColor: '#d5d5d5',
//                                                                     borderWidth: 1,
//                                                                     borderRadius: 3
//                                                                 }}
//                                                             >
//                                                                 <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
//                                                                     <Text>{selectedCity ? selectedCity?.label : 'Select City'}</Text>
//                                                                 </View>
//                                                                 <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
//                                                                     <TouchableOpacity>
//                                                                         <AntDesign name="close" size={15} color="blue" />
//                                                                     </TouchableOpacity>
//                                                                     <AntDesign
//                                                                         name="down"
//                                                                         size={15}
//                                                                         style={[
//                                                                             { transitionDuration: '0.3s' },
//                                                                             cityModal && {
//                                                                                 transform: [{ rotate: '180deg' }],
//                                                                             },
//                                                                         ]}
//                                                                         color="blue"
//                                                                     />
//                                                                 </View>
//                                                             </Pressable>
//                                                             {cityModal && (


//                                                                 <View style={{
//                                                                     position: 'absolute',
//                                                                     top: 40, // Adjust according to the height of the Pressable
//                                                                     left: 0,
//                                                                     right: 0,
//                                                                     backgroundColor: 'white',
//                                                                     borderColor: '#ddd',
//                                                                     borderWidth: 2,
//                                                                     maxHeight: 200,

//                                                                     zIndex: 10
//                                                                 }}>
//                                                                     <FlatList
//                                                                         data={cityData}
//                                                                         renderItem={renderCities}
//                                                                         keyExtractor={(item, index) => `${item.propertyName || ''}-${index}`}
//                                                                     />
//                                                                 </View>



//                                                             )}

//                                                         </View>
//                                                     </View>

//                                                     <View>
//                                                         <Text>Address</Text>
//                                                         <TextInput
//                                                             ref={addressRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter address"
//                                                         />
//                                                     </View>
//                                                     <View>
//                                                         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                                                             <Text>Telephone Number</Text>
//                                                             <Button title="Add Telephone" onPress={addTelephoneInput} />
//                                                         </View>
//                                                         {telephoneInputs.map((inputId, index) => (
//                                                             <View key={index}>
//                                                                 <TextInput
//                                                                     style={styles.input}
//                                                                     placeholder={`Telephone Number ${index + 1}`}
//                                                                     ref={el => {
//                                                                         if (el && !telephoneRefs.current[inputId]) {
//                                                                             console.log("Assigning ref for input", inputId);
//                                                                             telephoneRefs.current[inputId] = el;
//                                                                         }
//                                                                     }}
//                                                                 />
//                                                             </View>
//                                                         ))}
//                                                     </View>
//                                                     <View>
//                                                         <Text>Fax Number</Text>
//                                                         <TextInput
//                                                             key={isChecked ? 'controlled' : 'uncontrolled'}
//                                                             ref={faxRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter Fax Number"

//                                                         />
//                                                     </View>
//                                                     <View style={{ marginBottom: 5 }}>
//                                                         <Text>E-mail</Text>
//                                                         <TextInput
//                                                             ref={emailRef}
//                                                             style={styles.input} placeholder="Enter email" />
//                                                     </View>
//                                                 </>)}

//                                         </View>

//                                         <View style={{ marginBottom: 10 }}>
//                                             <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Notify Party</Text>
//                                             <TouchableOpacity onPress={() => {
//                                                 setIsCheckedNotify(prevState => {

//                                                     const newState = !prevState;
//                                                     setSelectedCountryNotify({ value: '' });
//                                                     setSelectedCityNotify('');
//                                                     setCityData([]);
//                                                     handleOutsidePress();
//                                                     return newState;
//                                                 });
//                                             }}

//                                                 style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
//                                                 <MaterialIcons
//                                                     name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
//                                                     size={20}
//                                                     color="black"
//                                                 />
//                                                 <Text>Same as consignee</Text>
//                                             </TouchableOpacity>
//                                             {isCheckedNotify ? (
//                                                 <>

//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <View>
//                                                         <Text>Full Name</Text>
//                                                         <TextInput
//                                                             ref={fullNameNotifyRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter full name"
//                                                         />
//                                                     </View>

//                                                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>

//                                                         <View style={{
//                                                             flex: 1
//                                                         }}>
//                                                             <Text style={{ marginBottom: 2 }}>Country</Text>
//                                                             <Pressable
//                                                                 onPress={toggleCountryModalNotify}
//                                                                 style={{
//                                                                     padding: 10,
//                                                                     backgroundColor: '#fff',
//                                                                     flexDirection: 'row',
//                                                                     alignItems: 'center',
//                                                                     borderColor: '#d5d5d5',
//                                                                     borderWidth: 1,
//                                                                     borderRadius: 3
//                                                                 }}
//                                                             >
//                                                                 <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
//                                                                     <Text>{selectedCountryNotify?.value ? selectedCountryNotify?.label : 'Select Country'}</Text>
//                                                                 </View>
//                                                                 <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
//                                                                     <TouchableOpacity>
//                                                                         <AntDesign name="close" size={15} color="blue" />
//                                                                     </TouchableOpacity>
//                                                                     <AntDesign
//                                                                         name="down"
//                                                                         size={15}
//                                                                         style={[
//                                                                             { transitionDuration: '0.3s' },
//                                                                             countryModalNotify && {
//                                                                                 transform: [{ rotate: '180deg' }],
//                                                                             },
//                                                                         ]}
//                                                                         color="blue"
//                                                                     />
//                                                                 </View>
//                                                             </Pressable>
//                                                             {countryModalNotify && (


//                                                                 <View style={{
//                                                                     position: 'absolute',
//                                                                     top: 60, // Adjust according to the height of the Pressable
//                                                                     left: 0,
//                                                                     right: 0,
//                                                                     backgroundColor: 'white',
//                                                                     borderColor: '#ddd',
//                                                                     borderWidth: 2,
//                                                                     maxHeight: 200,

//                                                                     zIndex: 10
//                                                                 }}>
//                                                                     <FlatList
//                                                                         data={countryData}
//                                                                         renderItem={renderCountries}
//                                                                         keyExtractor={(item) => item.label}
//                                                                     />

//                                                                 </View>



//                                                             )}

//                                                         </View>

//                                                         <View style={{
//                                                             flex: 1, marginLeft: 10
//                                                         }}>
//                                                             <Text style={{ marginBottom: 2 }}>City</Text>
//                                                             <Pressable
//                                                                 onPress={toggleCityModalNotify}
//                                                                 style={{
//                                                                     padding: 10,
//                                                                     backgroundColor: '#fff',
//                                                                     flexDirection: 'row',
//                                                                     alignItems: 'center',
//                                                                     borderColor: '#d5d5d5',
//                                                                     borderWidth: 1,
//                                                                     borderRadius: 3
//                                                                 }}
//                                                             >
//                                                                 <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
//                                                                     <Text>{selectedCityNotify ? selectedCityNotify?.label : 'Select City'}</Text>
//                                                                 </View>
//                                                                 <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
//                                                                     <TouchableOpacity>
//                                                                         <AntDesign name="close" size={15} color="blue" />
//                                                                     </TouchableOpacity>
//                                                                     <AntDesign
//                                                                         name="down"
//                                                                         size={15}
//                                                                         style={[
//                                                                             { transitionDuration: '0.3s' },
//                                                                             cityModalNotify && {
//                                                                                 transform: [{ rotate: '180deg' }],
//                                                                             },
//                                                                         ]}
//                                                                         color="blue"
//                                                                     />
//                                                                 </View>
//                                                             </Pressable>
//                                                             {cityModalNotify && (


//                                                                 <View style={{
//                                                                     position: 'absolute',
//                                                                     top: 60, // Adjust according to the height of the Pressable
//                                                                     left: 0,
//                                                                     right: 0,
//                                                                     backgroundColor: 'white',
//                                                                     borderColor: '#ddd',
//                                                                     borderWidth: 2,
//                                                                     maxHeight: 200,

//                                                                     zIndex: 10
//                                                                 }}>
//                                                                     <FlatList
//                                                                         data={cityData}
//                                                                         renderItem={renderCities}
//                                                                         keyExtractor={(item, index) => `${item.propertyName || ''}-${index}`}
//                                                                     />
//                                                                 </View>



//                                                             )}

//                                                         </View>

//                                                     </View>

//                                                     <View>
//                                                         <Text>Address</Text>
//                                                         <TextInput
//                                                             ref={addressNotifyRef}
//                                                             style={styles.input}
//                                                             placeholder="Enter address"
//                                                         />
//                                                     </View>
//                                                     <View>
//                                                         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                                                             <Text>Telephone Number</Text>
//                                                             <Button title="Add Telephone" onPress={addTelephoneInputNotify} />
//                                                         </View>
//                                                         {telephoneInputsNotify.map((inputId, index) => (
//                                                             <View key={index}>
//                                                                 <TextInput
//                                                                     style={styles.input}
//                                                                     placeholder={`Telephone Number ${index + 1}`}
//                                                                     ref={el => {
//                                                                         if (el && !telephoneNotifyRefs.current[inputId]) {
//                                                                             console.log("Assigning ref for input", inputId);
//                                                                             telephoneNotifyRefs.current[inputId] = el;
//                                                                         }
//                                                                     }}
//                                                                 />
//                                                             </View>
//                                                         ))}
//                                                     </View>
//                                                     <View>
//                                                         <Text>Fax Number</Text>
//                                                         <TextInput
//                                                             key={isChecked ? 'controlled' : 'uncontrolled'}
//                                                             ref={faxRefNotify}
//                                                             style={styles.input}
//                                                             placeholder="Enter Fax Number"

//                                                         />
//                                                     </View>
//                                                     <View style={{ marginBottom: 5 }}>
//                                                         <Text>E-mail</Text>
//                                                         <TextInput
//                                                             ref={emailNotifyRef}
//                                                             style={styles.input} placeholder="Enter email" />
//                                                     </View>
//                                                 </>
//                                             )}

//                                         </View>

//                                         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, zIndex: -5 }}>
//                                             {isCheck ? (
//                                                 <Feather name='check-square' size={20} onPress={() => checkButton(false)} />
//                                             ) : (
//                                                 <Feather name='square' size={20} onPress={() => checkButton(true)} />
//                                             )}
//                                             <Text style={{ marginLeft: 8, fontSize: 14 }}>I agree to Privacy Policy and Terms of Agreement</Text>
//                                         </View>

//                                         <View style={{ marginTop: 20, flexDirection: 'row', paddingHorizontal: 20, zIndex: -5 }}>
//                                             <TouchableOpacity style={{ backgroundColor: 'white', padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 50, borderColor: 'black', borderWidth: 2 }}>
//                                                 <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
//                                             </TouchableOpacity>

//                                             <TouchableOpacity
//                                                 style={{ backgroundColor: '#7b9cff', padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 50, marginLeft: '5%' }}
//                                                 onPress={async () => {
//                                                     await handleSubmit();
//                                                     setModalVisible(false)
//                                                 }}
//                                             >
//                                                 <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Finish</Text>
//                                             </TouchableOpacity>
//                                         </View>
//                                     </ScrollView>
//                                 </View>
//                             </View>
//                         </TouchableWithoutFeedback>
//                     </Modal>

//                 )
//             }
//         </Pressable>
//     )
// }
const InvoiceAmendment = ({ activeChatId, selectedChatData, accountData, screenWidth, userEmail }) => {
    const [isLoading, setIsLoading] = useState(false);
    let formData
    let formDataNotify

    const styles = StyleSheet.create({
        input: {
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginTop: 5,
            marginBottom: 10,
            padding: 10,
            borderRadius: 5
        }
    });


    const [selectedCountryNotify, setSelectedCountryNotify] = useState({ value: '', label: 'Select Country' });

    const [userDataNotify, setUserDataNotify] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isCheckedNotify, setIsCheckedNotify] = useState(false);
    console.log('chat id inside request', activeChatId)
    // Ensure userEmail is in the dependency array


    //fetch customer information




    //fetch countries

    //fetch cities

    //fetch cities



    //variables ref
    // Runs only when isChecked or firebaseData changes

    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const emailRef = useRef(null);
    const faxRef = useRef(null);
    const [telephoneInputs, setTelephoneInputs] = useState([0]); // Default with one input
    const telephoneRefs = useRef({ 0: '' });
    const [showAlert, setShowAlert] = useState(false) // Store input values here
    const addTelephoneInput = () => {
        if (telephoneInputs.length >= 3) {
            setShowAlert(true)
            return;
        }
        const newInputId = telephoneInputs.length;
        telephoneRefs.current[newInputId] = ''; // Initialize new ref value
        setTelephoneInputs(prev => [...prev, newInputId]); // Add new input ID
    };
    const fullNameRefNotify = useRef(null);
    const addressRefNotify = useRef(null);
    const emailRefNotify = useRef(null);
    const faxRefNotify = useRef(null);
    const [telephoneInputsNotify, setTelephoneInputsNotify] = useState([0]);
    const telephoneRefsNotify = useRef({ 0: '' });
    const addTelephoneInputNotify = () => {
        if (telephoneInputsNotify.length >= 3) {
            alert('Max Telephone numbers.');
            return;
        }
        const newInputId = telephoneRefsNotify.length;
        telephoneRefsNotify.current[newInputId] = '';
        setTelephoneInputsNotify(prev => [...prev, newInputId]);
    };
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [sameAsConsignee, setSameAsConsignee] = useState(true);
    const handleSameAsConsignee = () => {
        setSameAsConsignee(!sameAsConsignee);
        fullNameRefNotify.current = '';
        addressRefNotify.current = '';
        emailRefNotify.current = '';
        setRenderTrigger(prev => prev + 1);
        Object.keys(telephoneRefsNotify.current).forEach(key => {
            telephoneRefsNotify.current[key] = '';
        });
        setTelephoneInputsNotify([0]);
        setSelectedCityNotify('')
        setSelectedCountryNotify({ value: '', label: '' || '' });
    }
    //new trigger
    useEffect(() => {
        if (isChecked && accountData) {
            const fullName = `${accountData?.textFirst || ''} ${accountData?.textLast || ''}`;
            const address = `${accountData?.textStreet || ''} ${accountData?.textZip || ''}`
            const emailAddress = `${accountData?.textEmail || ''}`
            fullNameRef.current = fullName;
            addressRef.current = address;
            emailRef.current = emailAddress;
            const telephones = Array.isArray(accountData?.textPhoneNumber)
                ? accountData.textPhoneNumber // Use it directly if it's already an array
                : accountData?.textPhoneNumber
                    ? [accountData.textPhoneNumber] // Convert to array if it's a string
                    : [];
            telephones.forEach((tel, index) => {
                if (index < 3) { // Limit to 3 inputs
                    telephoneRefs.current[index] = tel;
                    if (!telephoneInputs.includes(index)) {
                        setTelephoneInputs(prev => [...prev, index]);
                    }
                }
            });
            setSelectedCity(accountData?.city)
            setSelectedCountryCode({ name: accountData?.country || '' });
            setRenderTrigger(prev => prev + 1);
        } else {
            fullNameRef.current = '';
            addressRef.current = '';
            emailRef.current = '';
            setRenderTrigger(prev => prev + 1);
            Object.keys(telephoneRefs.current).forEach(key => {
                telephoneRefs.current[key] = '';
            });
            setTelephoneInputs([0]);
            setSelectedCity('')
            setSelectedCountryCode({ name: '', code: '' || '' });
        }
    }, [isChecked, accountData]);
    //new trigger

    const handleFinish = async () => {
        if (
            !fullNameRef.current ||
            !selectedCountryCode?.name ||
            !selectedCity ||
            !addressRef.current ||
            !emailRef.current ||
            Object.values(telephoneRefs.current).every(tel => !tel) // Checks if all telephone entries are empty
        ) {
            alert("Please fill up all the consignee details to continue.");
            return; // Stop further execution
        }
        setIsLoading(true)
        setRenderTrigger(prev => prev + 1);
        const response = await axios.get(timeApi);
        const momentDate = moment(response?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

        const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
        const telephonesArray = Object.values(telephoneRefs.current);
        const telephonesArrayNotify = Object.values(telephoneRefsNotify.current);
        const url = ipInfo;

        const responseIP = await axios.get(url);
        const ip = responseIP.data.ip;
        const ipCountry = responseIP.data.country_name;
        const ipCountryCode = responseIP.data.country_code
        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', activeChatId);
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', activeChatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: `Request for Invoice Amendment`,
                timestamp: formattedTime,
                messageType: 'InvoiceAmendment',
                ip: ip,
                ipCountry: ipCountry,
                ipCountryCode: ipCountryCode
            };
            await setDoc(newMessageDocExtension, messageData, { merge: true });
            await updateDoc(orderRef, {
                requestAmendment: true,
                invoiceAmendment: {
                    consignee: {
                        fullName: fullNameRef.current,
                        country: selectedCountryCode?.name,
                        city: selectedCity,
                        address: addressRef.current,
                        fax: faxRef.current || '',
                        email: emailRef.current,
                        telephones: telephonesArray,
                        sameAsBuyer: isChecked
                    },
                    notifyParty: {
                        fullName: fullNameRefNotify.current || '',
                        country: selectedCountryCodeNotify?.name || '',
                        city: selectedCityNotify || '',
                        address: addressRefNotify.current || '',
                        fax: faxRefNotify.current || '',
                        email: emailRefNotify.current || '',
                        telephones: telephonesArrayNotify || [],
                        sameAsConsignee: sameAsConsignee,
                    }

                },

            })
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            await updateDoc(doc(fieldUpdate, activeChatId), {
                lastMessage: 'Request for Invoice Amendment',
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });

        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        } finally {
            setIsLoading(false);
            setModalVisible(false);
        }


    };



    // useEffect(() => {
    //     const telNumbersNotify = initialTelephonesNotify || [];
    //     const initialInputsNotify = telNumbersNotify.map((_, index) => index);
    //     setTelephoneInputsNotify(initialInputsNotify);

    //     telNumbersNotify.forEach((tel, index) => {
    //         telephoneNotifyRefs.current[index] = tel;
    //     });
    // }, [initialTelephonesNotify]);



    //fetch ip address
    const [ip, setIp] = useState('');
    const [ipCountry, setIpCountry] = useState('');

    // useEffect to fetch IP and Country
    // useEffect(() => {
    //     async function fetchIpAndCountry() {
    //         try {
    //             // Fetch the IP address
    //             const ipResponse = await axios.get('https://api.ipify.org?format=json');
    //             const fetchedIp = ipResponse.data.ip;
    //             setIp(fetchedIp);

    //             // Fetch IP Country
    //             if (fetchedIp) {
    //                 const countryResponse = await axios.get(`https://ipapi.co/${fetchedIp}/json/`);
    //                 const fetchedIpCountry = countryResponse.data.country_name;
    //                 setIpCountry(fetchedIpCountry);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching IP information:", error);
    //         }
    //     }

    //     fetchIpAndCountry();
    // }, []);
    //fetch ip address


    //variables ref

    const [modalVisible, setModalVisible] = useState(false);
    const handlePress = () => {
        setModalVisible(true);

    };
    const [isCheck, setIsCheck] = useState(false);
    const checkButton = (option) => {
        setIsCheck(option);
    };

    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (id) => {
        setActiveDropdown(prevId => (prevId === id ? null : id));
    };
    const [selectedCountryCode, setSelectedCountryCode] = useState({ name: '', code: '' });
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCountryCodeNotify, setSelectedCountryCodeNotify] = useState({ name: '', code: '' });
    const [selectedCityNotify, setSelectedCityNotify] = useState('');
    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);
    return (
        <Pressable
            style={({ pressed, hovered }) => [

                {
                    borderWidth: 1,
                    borderColor: '#16A34A',
                    backgroundColor: hovered ? '#f0fdf4' : 'transparent',
                    opacity: pressed ? 0.5 : 1,
                    borderRadius: 5,
                    paddingVertical: 7,
                    paddingHorizontal: 20,
                    padding: 5,
                }
            ]}
            onPress={handlePress}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',

                }}
            >
                <FontAwesome name="pencil-square-o" size={16} color="#16A34A" style={{ marginRight: 5 }} />
                <Text style={{ color: '#16A34A', fontWeight: '700' }}>Request Amendment</Text>
            </View>


            {
                modalVisible && (
                    <Modal
                        transparent={true}
                        animationType='fade'
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        {
                            showAlert && (
                                <Alert
                                    variant="warning"
                                    title="Error"
                                    description="Max phone numbers reached."
                                    onClose={() => setShowAlert(false)}
                                />
                            )
                        }
                        <TouchableWithoutFeedback onPress={() => toggleDropdown(null)}>
                            <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingHorizontal: 5
                            }}>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                }} />
                                <View
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        maxWidth: 600,
                                        height: '100%',
                                        maxHeight: 700,
                                        backgroundColor: 'white',
                                        borderRadius: 5,
                                        padding: 5,
                                        paddingHorizontal: 5,
                                        marginHorizontal: 15,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 8,
                                        elevation: 5,

                                    }}
                                >
                                    <TouchableOpacity style={{ alignSelf: 'flex-end', margin: 5 }} onPress={() => setModalVisible(false)}>
                                        <AntDesign name="close" size={25} />
                                    </TouchableOpacity>
                                    <View style={{ paddingBottom: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomWidth: 1, borderBottomColor: 'blue', marginHorizontal: 20 }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: 'blue' }}>Request Invoice Amendment</Text>
                                    </View>
                                    <ScrollView
                                        keyboardShouldPersistTaps="always"
                                        style={{
                                        }}>
                                        <View style={{ marginBottom: 10, padding: 10, marginHorizontal: 15 }}>
                                            <View style={{ marginBottom: 10 }}>
                                                <View style={{ alignItems: 'flex-start' }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Customer Information</Text>


                                                    <TouchableOpacity onPress={() => { setIsChecked(!isChecked) }}

                                                        style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                        <MaterialIcons
                                                            name={isChecked === true ? 'check-box' : 'check-box-outline-blank'}
                                                            size={20}
                                                            color="black"
                                                        />
                                                        <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                                    </TouchableOpacity>
                                                </View>



                                                <View>
                                                    <Text>Full Name</Text>
                                                    <TextInput
                                                        key={renderTrigger}
                                                        style={{
                                                            borderWidth: 1,
                                                            borderColor: '#CCCCCC',
                                                            padding: 10,
                                                            borderRadius: 5,
                                                            marginBottom: 10,
                                                        }}
                                                        placeholder="Enter full name"
                                                        placeholderTextColor="#CCCCCC"
                                                        defaultValue={fullNameRef.current} // Use `value` instead of `defaultValue`
                                                        onChangeText={(e) => {
                                                            fullNameRef.current = e; // Update ref with the current input
                                                        }}
                                                    />
                                                </View>

                                                <CountryCityDropdown area={'consignee'} activeDropdown={activeDropdown} toggleDropdown={toggleDropdown} selectedCountryCode={selectedCountryCode} setSelectedCountryCode={setSelectedCountryCode} selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

                                                <View style={{ marginTop: 5, zIndex: -99 }}>
                                                    <Text>Address</Text>
                                                    <TextInput
                                                        key={renderTrigger}
                                                        style={{
                                                            borderWidth: 1,
                                                            borderColor: '#CCCCCC',
                                                            padding: 10,
                                                            borderRadius: 5,
                                                            marginBottom: 10,
                                                            zIndex: -1
                                                        }}
                                                        placeholder="Enter full address"
                                                        placeholderTextColor={'#CCCCCC'}
                                                        defaultValue={addressRef.current} // Use `value` instead of `defaultValue`
                                                        onChangeText={(e) => {
                                                            addressRef.current = e; // Update ref with the current input
                                                        }}
                                                    />

                                                </View>

                                                <View style={{ zIndex: -99 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 3 }}>
                                                        <Text>Telephone Number</Text>
                                                        <Pressable
                                                            onPress={addTelephoneInput}
                                                            style={({ pressed, hovered }) => ({
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                padding: 4,  // Reduced padding for a smaller size
                                                                borderRadius: 2,  // Smaller border radius for a tighter shape
                                                                borderWidth: 1,
                                                                borderColor: 'blue',
                                                                marginLeft: 2,
                                                                backgroundColor: pressed ? 'lightgray' : hovered ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                                            })}
                                                        >
                                                            <MaterialCommunityIcons name="plus" color='blue' size={14} />
                                                            <Text selectable={false} style={{ marginLeft: 3, fontSize: 12, color: 'blue', fontWeight: 'bold' }}>Add Telephone</Text>
                                                        </Pressable>

                                                    </View>
                                                    {telephoneInputs.map((inputId, index) => (
                                                        <View key={inputId} style={{ marginBottom: 10 }}>
                                                            <TextInput
                                                                key={renderTrigger}
                                                                style={{
                                                                    borderWidth: 1,
                                                                    borderColor: '#CCCCCC',
                                                                    padding: 10,
                                                                    borderRadius: 5,
                                                                    marginBottom: 10,
                                                                    zIndex: -1
                                                                }}
                                                                placeholderTextColor={'#CCCCCC'}
                                                                placeholder={`Telephone Number ${index + 1}`}
                                                                defaultValue={telephoneRefs.current[inputId]}
                                                                onChangeText={(text) => {
                                                                    telephoneRefs.current[inputId] = text; // Update the value in refs
                                                                }}
                                                            />
                                                        </View>
                                                    ))}
                                                </View>

                                                <View style={{ zIndex: -99 }}>
                                                    <Text>Fax Number</Text>
                                                    <TextInput
                                                        key={renderTrigger}

                                                        style={{
                                                            borderWidth: 1,
                                                            borderColor: '#CCCCCC',
                                                            padding: 10,
                                                            borderRadius: 5,
                                                            marginBottom: 10,
                                                            zIndex: -1
                                                        }}
                                                        placeholder="Enter fax number"
                                                        placeholderTextColor={'#CCCCCC'}
                                                        defaultValue={faxRef.current} // Use `value` instead of `defaultValue`
                                                        onChangeText={(e) => {
                                                            faxRef.current = e; // Update ref with the current input
                                                        }}
                                                    />
                                                </View>

                                                <View style={{ marginBottom: 5, zIndex: -99 }}>
                                                    <Text>E-mail</Text>
                                                    <TextInput

                                                        key={renderTrigger}
                                                        style={{
                                                            borderWidth: 1,
                                                            borderColor: '#CCCCCC',
                                                            padding: 10,
                                                            borderRadius: 5,
                                                            marginBottom: 10,
                                                            zIndex: -1
                                                        }}
                                                        placeholder="Enter full address"
                                                        placeholderTextColor={'#CCCCCC'}
                                                        defaultValue={emailRef.current} // Use `value` instead of `defaultValue`
                                                        onChangeText={(e) => {
                                                            emailRef.current = e; // Update ref with the current input
                                                        }}
                                                    />

                                                </View>





                                            </View>

                                            <View style={{ marginBottom: 10 }}>
                                                <View style={{ alignItems: 'flex-start' }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Notify Party</Text>
                                                    <TouchableOpacity onPress={handleSameAsConsignee}

                                                        style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <MaterialIcons
                                                            name={sameAsConsignee ? 'check-box' : 'check-box-outline-blank'}
                                                            size={20}
                                                            color="black"
                                                        />
                                                        <Text>Same as consignee</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {sameAsConsignee === true ? (<></>) : (<>
                                                    <View>
                                                        <Text>Full Name</Text>
                                                        <TextInput
                                                            key={renderTrigger}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: '#CCCCCC',
                                                                padding: 10,
                                                                borderRadius: 5,
                                                                marginBottom: 10,
                                                            }}
                                                            placeholder="Enter full name"
                                                            placeholderTextColor="#CCCCCC"
                                                            defaultValue={fullNameRefNotify.current} // Use `value` instead of `defaultValue`
                                                            onChangeText={(e) => {
                                                                fullNameRefNotify.current = e; // Update ref with the current input
                                                            }}
                                                        />
                                                    </View>

                                                    <CountryCityDropdown setSelectedCountryCodeNotify={setSelectedCountryCodeNotify} selectedCountryCodeNotify={selectedCountryCodeNotify} selectedCityNotify={selectedCityNotify} setSelectedCityNotify={setSelectedCityNotify} area={'notify'} activeDropdown={activeDropdown} toggleDropdown={toggleDropdown} />


                                                    <View style={{ marginTop: 5, zIndex: -99 }}>
                                                        <Text>Address</Text>
                                                        <TextInput
                                                            key={renderTrigger}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: '#CCCCCC',
                                                                padding: 10,
                                                                borderRadius: 5,
                                                                marginBottom: 10,
                                                                zIndex: -1
                                                            }}
                                                            placeholder="Enter full address"
                                                            placeholderTextColor={'#CCCCCC'}
                                                            defaultValue={addressRefNotify.current} // Use `value` instead of `defaultValue`
                                                            onChangeText={(e) => {
                                                                addressRefNotify.current = e; // Update ref with the current input
                                                            }}
                                                        />

                                                    </View>

                                                    <View style={{ zIndex: -99 }}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 3 }}>
                                                            <Text>Telephone Number</Text>
                                                            <Pressable
                                                                onPress={addTelephoneInputNotify}
                                                                style={({ pressed, hovered }) => ({
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    padding: 4,  // Reduced padding for a smaller size
                                                                    borderRadius: 2,  // Smaller border radius for a tighter shape
                                                                    borderWidth: 1,
                                                                    borderColor: 'blue',
                                                                    marginLeft: 2,
                                                                    backgroundColor: pressed ? 'lightgray' : hovered ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                                                })}
                                                            >
                                                                <MaterialCommunityIcons name="plus" color='blue' size={14} />
                                                                <Text selectable={false} style={{ marginLeft: 3, fontSize: 12, color: 'blue', fontWeight: 'bold' }}>Add Telephone</Text>
                                                            </Pressable>

                                                        </View>
                                                        {telephoneInputsNotify.map((inputId, index) => (
                                                            <View key={inputId} style={{ marginBottom: 10 }}>
                                                                <TextInput
                                                                    key={renderTrigger}
                                                                    style={{
                                                                        borderWidth: 1,
                                                                        borderColor: '#CCCCCC',
                                                                        padding: 10,
                                                                        borderRadius: 5,
                                                                        marginBottom: 10,
                                                                        zIndex: -1
                                                                    }}
                                                                    placeholderTextColor={'#CCCCCC'}
                                                                    placeholder={`Telephone Number ${index + 1}`}
                                                                    defaultValue={telephoneRefsNotify.current[inputId]}
                                                                    onChangeText={(text) => {
                                                                        telephoneRefsNotify.current[inputId] = text; // Update the value in refs
                                                                    }}
                                                                />
                                                            </View>
                                                        ))}
                                                    </View>

                                                    <View style={{ zIndex: -99 }}>
                                                        <Text>Fax Number</Text>
                                                        <TextInput
                                                            key={renderTrigger}

                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: '#CCCCCC',
                                                                padding: 10,
                                                                borderRadius: 5,
                                                                marginBottom: 10,
                                                                zIndex: -1
                                                            }}
                                                            placeholder="Enter fax number"
                                                            placeholderTextColor={'#CCCCCC'}
                                                            defaultValue={faxRefNotify.current} // Use `value` instead of `defaultValue`
                                                            onChangeText={(e) => {
                                                                faxRefNotify.current = e; // Update ref with the current input
                                                            }}
                                                        />
                                                    </View>

                                                    <View style={{ marginBottom: 5, zIndex: -99 }}>
                                                        <Text>E-mail</Text>
                                                        <TextInput
                                                            key={renderTrigger}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: '#CCCCCC',
                                                                padding: 10,
                                                                borderRadius: 5,
                                                                marginBottom: 10,
                                                                zIndex: -1
                                                            }}
                                                            placeholder="Enter full address"
                                                            placeholderTextColor={'#CCCCCC'}
                                                            defaultValue={emailRefNotify.current} // Use `value` instead of `defaultValue`
                                                            onChangeText={(e) => {
                                                                emailRefNotify.current = e; // Update ref with the current input
                                                            }}
                                                        />

                                                    </View>

                                                </>)}

                                            </View>
                                        </View>

                                    </ScrollView>
                                    <View style={{ marginBottom: 10, }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, zIndex: -5, marginHorizontal: 10 }}>
                                            {isCheck ? (
                                                <Feather name='check-square' size={20} onPress={() => checkButton(false)} />
                                            ) : (
                                                <Feather name='square' size={20} onPress={() => checkButton(true)} />
                                            )}
                                            <Text style={{ marginLeft: 8, fontSize: 14 }}>I agree to Privacy Policy and Terms of Agreement</Text>
                                        </View>

                                        <View style={{ marginTop: 20, flexDirection: 'row', paddingHorizontal: 10, zIndex: -5 }}>
                                            <Pressable
                                                style={({ pressed, hovered }) => [
                                                    {
                                                        backgroundColor: pressed
                                                            ? '#e0e0e0' // Lighter gray when pressed
                                                            : hovered
                                                                ? '#f5f5f5' // Light gray when hovered
                                                                : 'white', // Default color
                                                        padding: 15,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                        marginBottom: 10,
                                                        flex: 1,
                                                        marginRight: 5,
                                                        zIndex: -1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'center',
                                                        borderColor: 'black',
                                                        borderWidth: 2,
                                                    },
                                                ]}
                                            >
                                                <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={handleFinish}
                                                style={({ pressed, hovered }) => [
                                                    {
                                                        backgroundColor: pressed
                                                            ? '#003bb3' // Darker blue on press
                                                            : hovered
                                                                ? '#4b73f8' // Lighter blue on hover
                                                                : '#0642F4', // Default blue
                                                        padding: 15,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                        marginBottom: 10,
                                                        flex: 1,
                                                        marginRight: 5,
                                                        zIndex: -1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'center',
                                                    },
                                                ]}
                                            >
                                                {isLoading ? (
                                                    <ActivityIndicator color="#fff" />
                                                ) : (
                                                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Confirm</Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>

                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                )
            }
        </Pressable>
    )
}
const OrderItem = ({ chatId, userEmail, invoiceData, handleOrderModal, orderModalVisible, toggleModal, openModalRequest, handleButtonClick, chatField, carData }) => {



    //fetch ip address

    //fetch ip address
    //update steps but (ONLY ORDER ITEM)
    const [currentStepDB, setCurrentStepDB] = useState({ value: 2 });
    const statusToValue = {
        'Negotiation': 1,
        'Issue Proforma Invoice': 2,
        'Order Item': 3,
        'Payment Confirmation': 4,
        'Shipping Schedule': 5,
        'Copy of B/L': 6,
        'Documentation': 7,
        'Item Received': 8,
        'Completed': 9
    };
    const valueToStatus = {
        1: 'Negotiation',
        2: 'Issue Proforma Invoice',
        3: 'Order Item',
        4: 'Payment Confirmation',
        5: 'Shipping Schedule',
        6: 'Copy of B/L',
        7: 'Documentation',
        8: 'Item Received',
        9: 'Completed'
    };
    const getNextStatus = (currentStatus) => {
        const statusValues = Object.keys(statusToValue).map(key => statusToValue[key]);
        const currentIndex = statusValues.indexOf(statusToValue[currentStatus]);

        if (currentIndex !== -1 && currentIndex < statusValues.length - 1) {
            const nextValue = statusValues[currentIndex + 1];
            return valueToStatus[nextValue];
        }

        return null; // No next status found
    };
    const [highlightRef, setHighlightRef] = useState(false);
    const updateSteps = async () => {
        if (!isCheck) {
            setHighlightRef(true)
            return;
        }

        try {
            const chatDocRefExtension = doc(projectExtensionFirestore, 'chats', chatId);

            const currentStatus = valueToStatus[currentStepDB.value];
            const nextStatus = getNextStatus(currentStatus);

            if (nextStatus) {
                await updateDoc(chatDocRefExtension, {
                    stepIndicator: {
                        value: 3,
                        status: nextStatus,
                    },
                });
                setCurrentStepDB({ value: statusToValue[nextStatus] });
                console.log('Steps updated successfully!');
            } else {
                console.log('No next status found.');
            }
        } catch (error) {
            console.error('Error updating steps:', error);
        }
    };

    //update steps but (ONLY ORDER ITEM)


    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }


    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };

    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(true);
    const [isCheckedNotify, setCheckedNotify] = useState(true);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('');
    const [cityDB, setCityDB] = useState('');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [telNumberDBArr, setTelNumberDBArr] = useState([])
    const [faxNumberDB, setFaxNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    const [userEmailInputDB, setUserEmailInputDB] = useState('')


    const [fullNameDBNotify, setFullNameDBNotify] = useState('');
    const [countryDBNotify, setCountryDBNotify] = useState('');
    const [cityDBNotify, setCityDBNotify] = useState('');
    const [telNumberDBNotify, setTelNumberDBNotify] = useState('');
    const [telNumberDBArrNotify, setTelNumberDBArrNotify] = useState([])
    const [faxNumberDBNotify, setFaxNumberDBNotify] = useState('');
    const [addressDBNotify, setAddressDBNotify] = useState('');
    const [userEmailInputDBNotify, setUserEmailInputDBNotify] = useState('');


    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');
    const [userEmailInput, setUserEmailInput] = useState('');

    // useEffect(() => {
    //     const fetchUserData = () => {
    //         const invoice = chatField?.requestInvoice?.consignee?.formData;
    //         setFullNameDB(invoice?.fullName || '');
    //         const telephones = invoice?.telephones;
    //         if (telephones && Array.isArray(telephones)) {
    //             const formattedTelephones = telephones.map(number => `+${number}`).join(', ');
    //             setTelNumberDB(formattedTelephones);
    //             setTelNumberDBArr(telephones);
    //         }
    //         setFaxNumberDB(invoice?.fax || '');
    //         setAddressDB(invoice?.address || '');
    //         setCountryDB(invoice?.country || '');
    //         setCityDB(invoice?.city || '');
    //         setUserEmailInputDB(invoice?.email || '');
    //     };

    //     const fetchUserNotify = () => {
    //         const notify = chatField?.requestInvoice?.notifyParty?.formDataNotify;
    //         setFullNameDBNotify(notify?.fullName || '');
    //         const telephonesNotify = notify?.telephones;
    //         if (telephonesNotify && Array.isArray(telephonesNotify)) {
    //             const formattedTelephones = telephonesNotify.map(number => `+${number}`).join(', ');
    //             setTelNumberDBNotify(formattedTelephones);
    //             setTelNumberDBArrNotify(telephonesNotify);
    //         }
    //         setFaxNumberDBNotify(notify?.fax || '');
    //         setAddressDBNotify(notify?.address || '');
    //         setCountryDBNotify(notify?.country || '');
    //         setCityDBNotify(notify?.city || '');
    //         setUserEmailInputDBNotify(notify?.email || '');
    //     };

    //     if (chatField && chatField.requestInvoice) {
    //         fetchUserData();
    //         fetchUserNotify();
    //     } else {
    //         // Set all states to empty strings if chatField or chatField.requestInvoice is not present
    //         setFullNameDB('');
    //         setTelNumberDB('');
    //         setTelNumberDBArr([]);
    //         setFaxNumberDB('');
    //         setAddressDB('');
    //         setCountryDB('');
    //         setCityDB('');
    //         setUserEmailInputDB('');

    //         setFullNameDBNotify('');
    //         setTelNumberDBNotify('');
    //         setTelNumberDBArrNotify([]);
    //         setFaxNumberDBNotify('');
    //         setAddressDBNotify('');
    //         setCountryDBNotify('');
    //         setCityDBNotify('');
    //         setUserEmailInputDBNotify('');
    //     }
    // }, [chatField]);


    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        if (!userEmail) {
            console.log('No user email available.');
            return;
        }
        if (!chatId) {
            console.log('No user email available.');
            return;
        }
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().carData.stockID;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [chatId]);

    //fetching data from STOCKID carId = STOCKID



    //STEP TRACKER
    const [isLoading, setIsLoading] = useState(false);

    const setOrderInvoice = async () => {
        setIsLoading(true); // Start loading

        const response = await axios.get(timeApi);
        const momentDate = moment(response?.data.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');

        const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');
        const url = ipInfo;

        const responseIP = await axios.get(url);
        const ip = responseIP.data.ip;
        const ipCountry = responseIP.data.country_name;
        const ipCountryCode = responseIP.data.country_code
        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));

            const messageData = {
                sender: userEmail,
                text: "I agree with all the conditions and place the order.",
                timestamp: formattedTime,
                orderInvoiceIssue: true,
                setPaymentNotification: true,
                messageType: 'important',
                ip: ip,
                ipCountry: ipCountry,
                ipCountryCode: ipCountryCode
            };

            // Call the Cloud Function to update IssuedInvoice and VehicleProducts
            await axios.post(updateInvoiceAndVehicle, {
                invoiceNumber: chatField?.invoiceNumber,
                stockID: chatField?.carData?.stockID,
                userEmail: userEmail,
            });

            // Update 'chats' document in Firestore
            await updateDoc(orderRef, {
                lastMessage: 'I agree with all the conditions and place the order.',
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });

            // Save the new message to the 'messages' subcollection
            await setDoc(newMessageDocExtension, messageData);
        } catch (error) {
            console.error('Error setting order invoice:', error);
        } finally {
            handleOrderModal();
            setIsLoading(false); // Stop loading
        }
    };
    //STEP TRACKER

    //CHECKMARK
    const [isCheck, setIsCheck] = useState(false);
    const checkButton = (option) => {

        setIsCheck(option);

    }
    //CHECKMARK

    //CALENDAR
    const [selectedDate, setSelectedDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef();
    const handleDateSelect = (date) => {
        setSelectedDate(date.dateString);
    };
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar)
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])
    //CALENDAR
    console.log('country', selectedCountryNotifyLabel);
    const [currentStep, setCurrentStep] = useState(1);
    const addStep = () => {
        // Email validation based on toggle states
        const isEmailValid = isCheckedNotify ?
            (!isChecked ? userEmailInput.trim() : userEmailInputDB.trim()) :
            emailNotify.trim();

        // Country validation
        const isCountryValid = isCheckedNotify ?
            (isChecked ? (countryDB && countryDB !== 'Country') : (selectedCountryLabel && selectedCountryLabel !== 'Country')) :
            (selectedCountryNotifyLabel && selectedCountryNotifyLabel !== 'Country');

        // City validation
        const isCityValid = isCheckedNotify ?
            (isChecked ? (cityDB && cityDB !== 'City') : (selectedCity && selectedCity !== 'City')) :
            (selectedCityNotify && selectedCityNotify !== 'City');

        // Full name validation, assumed similar toggle state handling
        const isFullNameValid = isCheckedNotify ?
            (!isChecked ? fullName.trim() : fullNameDB.trim()) :
            fullNameNotifyInput.trim();

        // Address validation, consider the context where the field might not be editable
        const isAddressValid = isCheckedNotify ?
            (!isChecked ? address.trim() : addressDB.trim()) :
            addressNotify.trim();

        // Check all conditions are true
        if (isEmailValid && isCountryValid && isCityValid && isFullNameValid && isAddressValid) {
            setCurrentStep(currentStep + 1);
        } else {
            console.log('there is an error', isEmailValid, isCountryValid, isCityValid, isFullNameValid, isAddressValid)
            return;
        }
    };
    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            maxWidth: 600,
            height: '100%',
            maxHeight: 700,
            backgroundColor: '#f7f9fc',
            borderRadius: 5,
            padding: 10,
            paddingHorizontal: 10,
            marginHorizontal: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,

        },
        scrollContent: {
            paddingBottom: 10,
            paddingHorizontal: 20, marginHorizontal: 15
        },
        header: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: 20,
        },
        section: {
            marginBottom: 25,
            paddingHorizontal: 10,
            marginTop: 5
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: '#2a2a2a',

            paddingBottom: 8,
            marginBottom: 10,
        },
        infoBox: {


        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            paddingVertical: 5,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
            color: '#4f4f4f',
            width: '45%',
        },
        value: {
            fontSize: 16,
            color: '#595959',
            width: '55%',
            textAlign: 'right',
        },
    });

    return (
        <View style={{ flex: 1 }}>
            <>
                {/* <View style={{ marginTop: 5, width: '90%', alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ justifyContent: `flex-start`, alignItems: 'center', zIndex: 3 }}>
                            <TouchableOpacity style={[styles.circle]} disabled={currentStep < 1}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 150, left: -50 }}><Text>Fill in your information</Text></View></TouchableOpacity>

                        </View>
                        <View style={{ marginTop: -2, width: '100%', height: 7, backgroundColor: '#ccc', position: 'absolute', top: '50%' }} />
                        <View style={{
                            zIndex: 2,
                            marginTop: -2, height: 7, backgroundColor:
                                currentStep === 1 ? '#ccc' : currentStep === 2 ? '#ff4d4d' : '#ff4d4d',
                            position: 'absolute', top: '50%',
                            width: currentStep === 1 ? 0 : currentStep === 2 ? '50%' : '100%'
                        }} />
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.circle, { backgroundColor: currentStep < 2 ? '#ccc' : '#ff4d4d' }]} disabled={currentStep < 2}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 50 }}><Text>Confirm</Text></View></TouchableOpacity>

                        </View>
                        <View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.circle, { backgroundColor: currentStep < 3 ? '#ccc' : '#ff4d4d' }]} disabled={currentStep < 3}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 60 }}><Text>Complete</Text></View></TouchableOpacity>

                        </View>
                    </View>

                </View> */}
            </>
            <>
                {/* {currentStep === 1 && (
                    <View style={{ marginTop: 5 }}>

                        <View>
                            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', padding: 5, borderRadius: 5, marginTop: -5, zIndex: -1 }}>
                                <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>Please Fill in you Details</Text>
                            </View>
                            <View style={{ zIndex: -2 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', padding: 5 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Customer Information
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setChecked(!isChecked); setAddress(''); setFullName(''); setSelectedCountry(''); setSelectedCountryLabel('Country')
                                            setSelectedCity('City');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', padding: 5 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>Full Name</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: isChecked ? (fullNameDB === '' ? '#FF0000' : '#E1E4E8') : (fullName === '' ? '#FF0000' : '#E1E4E8'),
                                                backgroundColor: '#FFFFFF', borderRadius: 8, height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, color: '#333', borderRadius: 8 }}
                                                    placeholder="Enter full name"
                                                    placeholderTextColor="#A9A9A9"
                                                    value={isChecked ? fullNameDB : fullName}
                                                    onChangeText={isChecked ? setFullNameDB : setFullName}
                                                />
                                            </View>
                                            {((isChecked && fullNameDB === '') || (!isChecked && fullName === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Full name is required.</Text>
                                            )}
                                        </View>
                                    </View>


                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', padding: 5 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity onPress={toggleCountries} style={{
                                                    borderWidth: 1, borderRadius: 5,
                                                    borderColor: isChecked ? (countryDB === '' ? '#FF0000' : '#E1E4E8') : (selectedCountry === '' ? '#FF0000' : '#E1E4E8')
                                                }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isChecked ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountries && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountries && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filter}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCountries}
                                                                keyExtractor={(item) => item.value} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryLabel(item.label);
                                                                        setSelectedCountry(item.value);
                                                                        setShowCountries(false);
                                                                        setFilteredCountries(countries);
                                                                        setSelectedCity('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />

                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>

                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity
                                                    onPress={selectedCountry ? toggleCities : null}
                                                    disabled={!selectedCountry || selectedCountryLabel === 'Country'}
                                                    style={{
                                                        borderWidth: 1,
                                                        borderRadius: 5,
                                                        borderColor: isChecked ?
                                                            (countryDB === '' || cityDB === '') ? '#FF0000' : '#E1E4E8'
                                                            :
                                                            (!selectedCountry || selectedCountryLabel === 'Country' || !selectedCity) ? '#FF0000' : '#E1E4E8'
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        {isChecked ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCities && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCities && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 200,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCities}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCities}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCity(item.label)
                                                                        setShowCities(false);
                                                                        setFilteredCities(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, zIndex: -1, padding: 5 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>Address</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: (isChecked ? addressDB === '' : address === '') ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 8,
                                                height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16 }}
                                                    placeholder="1234 Main St, Apt 101"
                                                    value={isChecked ? addressDB : address}
                                                    onChangeText={isChecked ? setAddressDB : setAddress}
                                                    placeholderTextColor="#A9A9A9"
                                                />
                                            </View>
                                            {((isChecked && addressDB === '') || (!isChecked && address === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Address is required.</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, zIndex: -1, padding: 5 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>Tel. Number</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: (isChecked ? telNumberDB === '' : telNumber === '') ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 8,
                                                height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, borderRadius: 8 }}
                                                    placeholder="(+123) 456-7890"
                                                    value={isChecked ? telNumberDB : telNumber}
                                                    onChangeText={isChecked ? setTelNumberDB : setTelNumber}
                                                    placeholderTextColor="#A9A9A9"
                                                />
                                            </View>
                                            {((isChecked && telNumberDB === '') || (!isChecked && telNumber === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Telephone number is required.</Text>
                                            )}
                                        </View>
                                    </View>


                                    <View style={{ marginTop: 5, zIndex: -1, padding: 5 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>E-mail</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: (isChecked ? userEmailInputDB === '' : userEmailInput === '') ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 8,
                                                height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, borderRadius: 8 }}
                                                    placeholder="email@example.com"
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    value={isChecked ? userEmailInputDB : userEmailInput}
                                                    onChangeText={isChecked ? setUserEmailInputDB : setUserEmailInput}
                                                    placeholderTextColor="#A9A9A9"
                                                />
                                            </View>
                                            {((isChecked && userEmailInputDB === '') || (!isChecked && userEmailInput === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Email is required.</Text>
                                            )}
                                        </View>
                                    </View>



                                </View>


                                <View style={{ marginTop: 10 }}>
                                    <View style={{ flexDirection: 'row', padding: 5 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Notify Party
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setCheckedNotify(!isCheckedNotify);
                                            setSelectedCountryNotifyLabel('');
                                            setSelectedCityNotify('');
                                            setFullNameNotifyInput('');
                                            setAddressNotify('');
                                            setTelNumberNotify('');
                                            setEmailNotify('');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', padding: 5 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>Full Name</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: (isCheckedNotify ? (!isChecked ? fullName === '' : fullNameDB === '') : fullNameNotifyInput === '') ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 8,
                                                height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, borderRadius: 8 }}
                                                    placeholder="Full Name"
                                                    placeholderTextColor="#A9A9A9"
                                                    value={!isCheckedNotify ? fullNameNotifyInput : (!isChecked ? fullName : fullNameDB)}
                                                    onChangeText={!isCheckedNotify ? setFullNameNotifyInput : (!isChecked ? setFullName : setFullNameDB)}
                                                    keyboardType="default"
                                                />
                                            </View>
                                            {((isCheckedNotify ? (!isChecked ? fullName === '' : fullNameDB === '') : fullNameNotifyInput === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Full name is required.</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', padding: 5, alignItems: 'center' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity
                                                    onPress={toggleCountriesNotify}
                                                    style={{
                                                        borderWidth: 1,
                                                        borderRadius: 5,
                                                        borderColor: (isCheckedNotify ? (isChecked ? (!countryDB && (!selectedCountryLabel || selectedCountryLabel === 'Country')) : (!selectedCountryLabel || selectedCountryLabel === 'Country')) : (!selectedCountryNotifyLabel || selectedCountryNotifyLabel === 'Country')) ? '#FF0000' : '#E1E4E8'
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isCheckedNotify ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isChecked ? (selectedCountryLabel || 'Country') : (countryDB || selectedCountryLabel || 'Country')}
                                                                </Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isCheckedNotify ? (selectedCountryNotifyLabel || 'Country') : (selectedCountryNotifyLabel || 'Country')}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountriesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>


                                                {showCountriesNotify && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        elevation: 5,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>

                                                            <FlatList
                                                                data={filteredCountriesNotify}
                                                                keyExtractor={(item) => item.label} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryNotifyLabel(item.label)
                                                                        setSelectedCountryNotify(item.value)
                                                                        setShowCountriesNotify(false);
                                                                        setFilteredCountriesNotify(countries);
                                                                        setSelectedCityNotify('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity
                                                    onPress={selectedCountryNotify ? toggleCitiesNotify : null}
                                                    disabled={!selectedCountryNotify || selectedCountryNotifyLabel === 'Country'}
                                                    style={{
                                                        borderWidth: 1,
                                                        borderRadius: 5,
                                                        borderColor: (isCheckedNotify ?
                                                            (isChecked ? (!cityDB && (!selectedCity || selectedCity === 'City')) : (!selectedCity || selectedCity === 'City'))
                                                            :
                                                            (!selectedCityNotify || selectedCityNotify === 'City')) ? '#FF0000' : '#E1E4E8'
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                        {isCheckedNotify ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{
                                                                !isChecked ? selectedCity : cityDB
                                                            }</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{!isCheckedNotify ? !selectedCityNotify ? 'City' : selectedCityNotify : selectedCityNotify}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCitiesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCitiesNotify && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 150,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCitiesNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCitiesNotify}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {

                                                                        setSelectedCityNotify(item.label);
                                                                        setShowCitiesNotify(false);
                                                                        setFilteredCitiesNotify(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, padding: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>Address</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: (isCheckedNotify ? (!isChecked ? address === '' : addressDB === '') : addressNotify === '') ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF', borderRadius: 8, height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, borderRadius: 8 }}
                                                    placeholder="1234 Main St, Apt 101"
                                                    placeholderTextColor="#A9A9A9"
                                                    value={isCheckedNotify ? (isChecked ? addressDB : address) : addressNotify}
                                                    onChangeText={isCheckedNotify ? (isChecked ? setAddressDB : setAddress) : setAddressNotify}
                                                />
                                            </View>
                                            {((isCheckedNotify ? (!isChecked ? address === '' : addressDB === '') : addressNotify === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Address is required.</Text>
                                            )}
                                        </View>
                                    </View>


                                    <View style={{ marginTop: 5, padding: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>Tel. Number</Text>
                                            <View style={{
                                                borderWidth: 1, // Consistent border width
                                                borderColor: (isCheckedNotify ? (!isChecked ? telNumber === '' : telNumberDB === '') : telNumberNotify === '') ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 8,
                                                height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, borderRadius: 8 }}
                                                    placeholder="(+123) 456-7890"
                                                    placeholderTextColor="#A9A9A9" // Placeholder text color
                                                    value={isCheckedNotify ? (isChecked ? telNumberDB : telNumber) : telNumberNotify}
                                                    onChangeText={isCheckedNotify ? (isChecked ? setTelNumberDB : setTelNumber) : setTelNumberNotify}
                                                    keyboardType="phone-pad"
                                                />
                                            </View>
                                            {((isCheckedNotify ? (!isChecked ? telNumber === '' : telNumberDB === '') : telNumberNotify === '')) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Telephone number is required.</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, padding: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '500', marginBottom: 5 }}>E-mail</Text>
                                            <View style={{
                                                borderWidth: 1, // Consistent border width
                                                borderColor: (isCheckedNotify ?
                                                    (!isChecked ? !userEmailInput : !userEmailInputDB) :
                                                    !emailNotify) ? '#FF0000' : '#E1E4E8',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 8,
                                                height: 40
                                            }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10, fontSize: 16, borderRadius: 8 }}
                                                    placeholder="example@email.com"
                                                    placeholderTextColor="#A9A9A9" // Placeholder text color
                                                    keyboardType="email-address" // Set keyboard type for email input
                                                    autoCapitalize="none" // Ensure that email addresses are entered in lowercase
                                                    value={isCheckedNotify ? (isChecked ? userEmailInputDB : userEmailInput) : emailNotify}
                                                    onChangeText={isCheckedNotify ? (isChecked ? setUserEmailInputDB : setUserEmailInput) : setEmailNotify}
                                                />
                                            </View>
                                            {((isCheckedNotify ? (!isChecked ? !userEmailInput : !userEmailInputDB) : !emailNotify)) && (
                                                <Text style={{ color: '#FF0000', marginTop: 5 }}>Email is required.</Text>
                                            )}
                                        </View>
                                    </View>

                                </View>
                            </View>

                        </View>

                        <View style={{ marginTop: 20, flexDirection: 'row' }}>
                            <TouchableOpacity style={{ backgroundColor: 'black', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 40 }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 3 }} />
                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 40 }} onPress={() => addStep()}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Continue</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                )} */}</>
            <>
                <Modal

                    transparent={true}
                    visible={orderModalVisible}
                    onRequestClose={handleOrderModal}
                    style={{ zIndex: 99 }}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}>
                        <TouchableOpacity onPress={handleOrderModal} style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }} />


                        <View style={styles.container}>
                            <TouchableOpacity style={{ alignSelf: 'flex-end', margin: 5 }} onPress={handleOrderModal}>
                                <AntDesign name="close" size={25} />
                            </TouchableOpacity>
                            <View style={{ paddingBottom: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomWidth: 1, borderBottomColor: 'blue', paddingHorizontal: 20, marginHorizontal: 15 }}>
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: 'blue' }}>Confirm Consignee and Notify Party Details</Text>
                            </View>
                            <ScrollView
                                keyboardShouldPersistTaps="always"
                                contentContainerStyle={styles.scrollContent}>
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Consignee</Text>
                                    <View style={styles.infoBox}>
                                        <InfoRow label="Full Name" value={invoiceData?.consignee?.name || 'default'} />
                                        <InfoRow label="Country" value={invoiceData?.consignee?.country || 'default'} />
                                        <InfoRow label="City" value={invoiceData?.consignee?.city || 'default'} />
                                        <InfoRow label="Contact Number" value={invoiceData?.consignee?.contactNumber || 'default'} />
                                        <InfoRow label="FAX" value={invoiceData?.consignee?.fax || 'None'} />
                                        <InfoRow label="Email" value={invoiceData?.consignee?.email || 'default'} />
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Notify Party</Text>
                                    {invoiceData?.consignee?.sameAsBuyer === true ? (<Text>Same as consignee</Text>) : (
                                        <View style={styles.infoBox}>
                                            <InfoRow label="Full Name" value="NAME" />
                                            <InfoRow label="Country" value="NAME" />
                                            <InfoRow label="City" value="NAME" />
                                            <InfoRow label="Contact Number" value="NAME" />
                                            <InfoRow label="FAX" value="NAME" />
                                            <InfoRow label="Email" value="NAME" />
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                            <View style={{ marginBottom: 10, paddingHorizontal: 20, marginHorizontal: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, zIndex: -5 }}>
                                    {isCheck ? (
                                        <Feather
                                            name="check-square"
                                            size={20}

                                            onPress={() => checkButton(false)}
                                        />
                                    ) : (
                                        <Feather
                                            name="square"
                                            size={20}
                                            color={highlightRef === true ? 'red' : 'black'}
                                            onPress={() => {
                                                checkButton(true);
                                                setHighlightRef(false); // Directly set ref value to false
                                            }}
                                        />
                                    )}
                                    <Text style={{ marginLeft: 8, fontSize: 14 }}>I agree to Privacy Policy and Terms of Agreement</Text>
                                </View>

                                <View style={{ marginTop: 5, flexDirection: 'row', zIndex: -5, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => [
                                            {
                                                backgroundColor: pressed
                                                    ? '#e0e0e0' // Lighter gray when pressed
                                                    : hovered
                                                        ? '#f5f5f5' // Light gray when hovered
                                                        : 'white', // Default color
                                                padding: 15,
                                                borderRadius: 5,
                                                alignItems: 'center',
                                                marginBottom: 10,
                                                flex: 1,
                                                marginRight: 5,
                                                zIndex: -1,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                borderColor: 'black',
                                                borderWidth: 2,
                                            },
                                        ]}
                                    >
                                        <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={async () => {
                                            setIsLoading(true);
                                            await updateSteps();
                                            if (isCheck) {
                                                await setOrderInvoice();
                                            }
                                            setIsLoading(false);
                                        }}
                                        style={({ pressed, hovered }) => [
                                            {
                                                backgroundColor: pressed
                                                    ? '#003bb3' // Darker blue on press
                                                    : hovered
                                                        ? '#4b73f8' // Lighter blue on hover
                                                        : '#0642F4', // Default blue
                                                padding: 15,
                                                borderRadius: 5,
                                                alignItems: 'center',
                                                marginBottom: 10,
                                                flex: 1,
                                                marginRight: 5,
                                                zIndex: -1,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                            },
                                        ]}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Order Now</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        {/* <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 50, marginLeft: '5%' }}
                                        onPress={async () => {
                                            await setOrderInvoice();
                                            addStep();
                                            openModalRequest();
                                            updateSteps();
                                            handleButtonClick();
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Finish</Text>
                                    </TouchableOpacity> */}



                    </View>
                </Modal>
            </>








        </View>
    )

}
const StickyHeader = ({ handleIndex, setIndexIndicator, setContactUsOpen, parentPositionNew, setParentPositionNew, isProfileDropdownOpen, setIsProfileDropdownOpen, handleLayout, handleOpen, isOpen, openModal, closeModal, slideAnim, chatField, isHighlighted, categories }) => {
    const [selectedIndex, setSelectedIndex] = useState(null); // Track the selected index

    const renderItem = ({ item }) => {
        const isHighlighted = chatField.stepIndicator && chatField.stepIndicator[`value`].toString() === item.id;
        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        backgroundColor:
                            selectedIndex === item.id // Selected index color
                                ? '#CCE5FF' // Picked color
                                : isHighlighted
                                    ? '#E1EDF7' // Highlighted color
                                    : hovered
                                        ? '#DADDE1' // Hover color
                                        : '#fff', // Default color
                        opacity: pressed ? 0.5 : 1,
                        borderRadius: 5,
                        marginLeft: 5,
                        width: 200,
                        marginTop: 5,
                        padding: 5,
                    },
                ]}
                onPress={() => {
                    setSelectedIndex(item.id); // Update selected index
                    handleIndex(item.id); // Trigger the handleIndex function
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1
                }}>
                    <Text style={{ fontWeight: selectedIndex === item.id ? '700' : null, color: selectedIndex === item.id ? 'blue' : null }}>{item.title}</Text>
                </View>
            </Pressable>
        );

    }

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
            setScreenHeight(window.height); // Update screenHeight as well
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);



    const navigate = ''
    const searchQueryWorldRef = useRef('');
    const handleChangeQuery = (value) => {
        searchQueryWorldRef.current = value;
    };

    const handleSearch = () => {
        if (searchQueryWorldRef.current.trim() !== '') {
            navigate(`/SearchCar?searchTerm=${searchQueryWorldRef.current}`)
        }
    };
    const [scrollY] = useState(new AnimatedRN.Value(0));


    {/* <>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, }}>
                            <TouchableOpacity onPress={() => navigate(`/ProfileFormTransaction`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text>Profile</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
                            <TouchableOpacity onPress={logout} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text >Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </> */}
    const parentHeight = screenWidth > 1440 ? 100 : 90; // maxHeight of parent view
    const iconSize = parentHeight * 0.25; // Adjust this multiplier as needed
    const fontSize = parentHeight * 0.2; // Adjust this multiplier as needed


    const viewHeight = screenWidth > 1440 ? 30 : 20;
    const iconSizeCurrency = viewHeight * 0.6; // Adjust this multiplier as needed
    const fontSizeCurrency = viewHeight * 0.5;

    const handleParentLayout = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setParentPositionNew({ top: y + height, left: x, width, height });
    };
    return (
        <AnimatedRN.View
            onLayout={handleLayout}
            style={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                backgroundColor: 'lightblue',
                justifyContent: 'center',
                backgroundColor: '#0000ff',
                zIndex: 998,
                maxHeight: parentHeight,
                transform: [
                    {
                        translateY: scrollY.interpolate({
                            inputRange: [0, 100],
                            outputRange: [0, -100],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }}>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: screenWidth <= 768 ? 50 : 30, marginTop: screenHeight <= 768 ? 0 : 10 }}>
                <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: 350 }}>
                    <View style={{ height: 'auto', paddingHorizontal: 5, margin: 5, zIndex: 5 }}>
                        <Pressable
                            style={{ height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 5, width: 50, zIndex: 500 }}
                            onPress={() => { openModal(); console.log('CLICK OPEN MODAL') }}
                        >
                            <SimpleLineIcons name="menu" size={iconSize} color={'white'} />
                        </Pressable>
                    </View>

                    <View
                        onLayout={(event) => {

                            handleParentLayout(event);
                        }}
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            onPress={() => { setIsProfileDropdownOpen((prev) => !prev) }}
                            selectable={false}
                            style={{ fontWeight: '900', fontSize: 28, textAlignVertical: 'center', margin: 5, marginTop: -1, color: 'white' }}>Transactions</Text>
                        <AntDesign
                            onPress={() => { setIsProfileDropdownOpen((prev) => !prev) }}
                            name="down"
                            color="white"
                            size={30}
                            style={[
                                { transitionDuration: '0.2s' },
                                isProfileDropdownOpen && { transform: [{ rotate: '180deg' }] },
                            ]}
                        />
                    </View>





                </View>


            </View>
            {screenWidth <= 768 ? (<></>) : (
                <View
                    style={{

                        zIndex: 998,
                        height: 50,
                        borderBottomWidth: .5,
                        marginTop: 5,
                        borderBottomColor: '#ccc',
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        backgroundColor: 'white',

                    }}
                >
                    <FlatList
                        data={categories}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            )}

        </AnimatedRN.View>
    )
};

const ProfileFormChatGroup = ({ chatId, userEmail, stockId }) => {
    const [activeChatId, setActiveChatId] = useState(chatId);


    const [isLoading, setIsLoading] = useState(true);
    const [loadingLeftSide, setLoadingLeftSide] = useState(true)
    const [modalVisibleHeader, setModalVisibleHeader] = useState(false);
    const slideAnim = useRef(new AnimatedRN.Value(-Dimensions.get('window').width)).current; // Initial position of the modal

    const openModal = () => {
        setIsProfileDropdownOpen(false)
        setModalVisibleHeader(true);
        AnimatedRN.timing(slideAnim, {
            toValue: 0, // Slide to the visible position (0px from the left)
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        AnimatedRN.timing(slideAnim, {
            toValue: -Dimensions.get('window').width, // Slide out to the left (off-screen)
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setModalVisibleHeader(false); // Hide modal after sliding out
        });
    };


    const makeTrueRead = async (readTrue) => {
        if (!userEmail) {
            console.log('No user email available.');
            return;
        }

        const fieldUpdate = doc(projectExtensionFirestore, 'chats', activeChatId);
        try {
            await updateDoc(fieldUpdate, {
                customerRead: readTrue
            })
        } catch (error) {
            console.error('Error updating false:', error);
        }
    }


    const hideThis = false

    const [getStep, setGetStep] = useState(0);
    const [currentStep, setCurrentStep] = useState({ value: 1 });
    const [selectedChatId, setSelectedChatId] = useState(null);
    console.log('PROFILEFORMCHATGROUP', selectedChatId)


    const totalSteps = 8;



    // This effect runs when screenWidth changes


    // Call this function to manually toggle rightVisible
    const toggleRightVisible = () => {
        setHasBeenToggled(true); // Indicate that it has been manually toggled
        setRightVisible(prev => !prev);
    };
    //HIDE RIGHT SIDE

    useEffect(() => {
        setCurrentStep({ value: getStep });
        console.log('value per ChatID: ', getStep);
    }, [getStep]);

    useEffect(() => {

        console.log('loading in current step', isLoading)
        if (!userEmail) {
            console.log('No user email available.');
            return;
        }
        if (!activeChatId) {
            console.log('No user email available.');
            return;
        }

        const targetChatId = activeChatId; // Use selectedChatId if available, otherwise use activeChatId

        if (targetChatId) {
            const chatDocRef = doc(projectExtensionFirestore, 'chats', targetChatId);
            const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        if (data.stepIndicator) {
                            const value = data.stepIndicator.value;
                            const parsedValue = parseInt(value, 10);

                            if (!isNaN(parsedValue)) {
                                setGetStep(parsedValue);
                                setCurrentStep({ value: parsedValue });
                            } else {
                                console.error('Value is not a valid number:', value);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            });

            // Clean up the listener when the component unmounts
            return () => {
                unsubscribe();
                setIsLoading(false);
                console.log('loading in current step', isLoading)
            }
        }
    }, [activeChatId]);
    //status checker

    //chatid getter

    //chatid getter

    //fetch customer email
    //fetch customer email

    //fetch customer email

    //from progress stepper
    const navigate = ''
    useEffect(() => {
        if (!chatId) {
            navigate('/');  // Replace with the route you want to redirect to
        }
    }, [chatId, navigate]);

    const scrollViewRef = useRef(null);


    //temp
    const [selectedChatData, setSelectedChatData] = useState({});
    const [invoiceData, setInvoiceData] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');
    const [bookingData, setBookingData] = useState(null);

    useEffect(() => {
        if (!userEmail || !activeChatId) {
            // If no user email or active chat ID, reset state and start loading
            setSelectedChatData({});

            console.log('No user email or active chat ID available.');
            return;
        }

        setIsLoading(true);

        console.time('chatLoadTime');
        const chatDocRef = doc(projectExtensionFirestore, 'chats', activeChatId);

        // Set up real-time listener for selected chat data
        const unsubscribeChat = onSnapshot(chatDocRef, (docSnapshot) => {
            try {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setSelectedChatData(data);
                } else {
                    console.log('No such document!');
                    setSelectedChatData({});
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        });

        return () => {
            console.log('useEffect cleanup');
            unsubscribeChat();
        };
    }, [userEmail, activeChatId]);

    // Lazy Load Invoice Data Based on Selected Chat Data
    useEffect(() => {
        if (!selectedChatData?.invoiceNumber) {
            setInvoiceData(null);
            setFormattedDate('No due date available');
            return;
        }

        setIsLoading(true);

        console.time('invoiceLoadTime');
        const invoiceDocRef = doc(projectExtensionFirestore, 'IssuedInvoice', selectedChatData.invoiceNumber);

        // Set up real-time listener for invoice data
        const unsubscribeInvoice = onSnapshot(invoiceDocRef, (docSnapshot) => {
            try {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setInvoiceData(data);

                    const dueDate = data?.bankInformations?.dueDate;
                    if (dueDate) {
                        const formattedDueDate = new Intl.DateTimeFormat('en-US', {
                            month: 'long',
                            day: '2-digit',
                            year: 'numeric',
                        }).format(new Date(dueDate));
                        setFormattedDate(formattedDueDate);
                    } else {
                        setFormattedDate('No due date available');
                    }
                } else {
                    console.log('No such invoice document!');
                    setInvoiceData(null);
                    setFormattedDate('No due date available');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setFormattedDate('Error fetching due date');
            }
        });

        // Clean up the listener when the component unmounts or `selectedChatData` changes
        return () => {
            console.log('Invoice data listener cleanup');
            unsubscribeInvoice();
        };
    }, [selectedChatData.invoiceNumber]);

    useEffect(() => {
        if (!selectedChatData?.hNumber) {
            setBookingData(null);
            return;
        }

        setIsLoading(true);

        const bookingDocRef = doc(projectExtensionFirestore, 'booking', selectedChatData?.hNumber);

        const unsubscribe = onSnapshot(bookingDocRef, (docSnapshot) => {
            try {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setBookingData(data);
                } else {
                    console.log('No such document!');
                    setBookingData(null);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [selectedChatData.hNumber, userEmail, activeChatId]);



    useEffect(() => {
        if (!selectedChatData || Object.keys(selectedChatData).length === 0) {
            // No `selectedChatData`, keep loading
            setIsLoading(true);
            return;
        }

        // Define if the additional data is required and loaded
        const allDataAvailable =
            invoiceData !== null ||
            bookingData !== null ||
            formattedDate !== '' ||
            formattedDate !== 'No due date available';

        // Define if no additional data is required
        const noAdditionalDataNeeded =
            invoiceData === null &&
            bookingData === null &&
            (formattedDate === '' || formattedDate === 'No due date available');

        if (allDataAvailable || noAdditionalDataNeeded) {
            setIsLoading(false);
        } else {
            // Either still waiting for additional data or in transition
            setIsLoading(true);
        }
    }, [selectedChatData, invoiceData, bookingData, formattedDate]);



    //temp

    // Function to handle the ScrollView's scroll event


    useEffect(() => {
        // Add a scroll event listener to the ScrollView
        if (scrollViewRef.current) {
            scrollViewRef.current.addEventListener('onScroll', handleScroll);
        }

        // Clean up the event listener when the component unmounts
        return () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.removeEventListener('onScroll', handleScroll);
            }
        };
    }, []);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const sidebarWidth = 70;
    const sidebarAnimation = useRef(new AnimatedRN.Value(0)).current;
    //Function to open the sidebar
    const openSidebar = () => {
        AnimatedRN.timing(sidebarAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
        }).start();
        setSidebarOpen(true);
    };
    const closeSidebar = () => {
        AnimatedRN.timing(sidebarAnimation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
        }).start(() => setSidebarOpen(false));
    };

    //get data from firebase
    const [profileData, setProfileData] = useState(null);

    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
            setScreenHeight(window.height); // Update screenHeight as well
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    const data = [
        1
    ];

    //HIDE RIGHT SIDE
    const [rightVisible, setRightVisible] = useState(true);
    const [middleVisible, setMiddleVisible] = useState(true)
    const [disableOutsideClick, setDisableOutsideClick] = useState(false);
    console.log('wat is bro', screenWidth)
    useEffect(() => {

        if (screenWidth > 768) {
            setShowRight(false)
        }
    }, [screenWidth]);
    const requestToggleRight = () => {
        setRightVisible(!rightVisible)
    };
    const scrollViewRightRef = useRef();
    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (!disableOutsideClick && scrollViewRightRef.current && !scrollViewRightRef.current.contains(event.target)) {
    //             setRightVisible(false);
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, [scrollViewRightRef, disableOutsideClick]);

    const handleButtonClick = () => {
        // Toggle the behavior of handleClickOutside
        setDisableOutsideClick(current => !current);
        // Other button logic...
    };
    //  const renderTransactionDetails = ({ item }) => {
    //     return (



    //     )
    // };
    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    }




    //CHAT DATA

    //CHAT DATA
    const updateReadby = async (idValue) => {
        try {
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');
            await updateDoc(doc(fieldUpdate, idValue), {
                customerRead: true
            });
        } catch (error) {
            console.error('Error updating message:', error);
        }
    }
    const [showInMobile, setShowInMobile] = useState(true)
    useEffect(() => {
        if (screenWidth > 768) {
            setShowRight(true);
            setShowInMobile(true);
            setMiddleVisible(true)
        } else {
            setShowRight(false);
            setShowInMobile(true);
            setMiddleVisible(false)
        }
    }, [screenWidth])
    // useEffect(() => {
    //     if (screenWidth <= 768) {
    //         setShowInMobile(true);
    //         setHideLeft(false);
    //         setMiddleVisible(true);
    //         setShowRight(false)
    //     } else {
    //         setShowInMobile(true);
    //         setShowRight(true)
    //     }
    // }, [screenWidth])
    const [hideLeft, setHideLeft] = useState(false)

    console.log('fetch here', chatId)
    //

    const [chatField, setChatField] = useState([]);

    const [notification, setNotification] = useState(null)
    // console.log('SIDE BAR NOTIFICATION', chatField.stepIndicator?.sideBarNotification)
    useEffect(() => {


        // If userEmail or activeChatId is not available, do not proceed
        if (!userEmail || !activeChatId) {
            console.log('No user email or active chat ID available.');
            setIsLoading(false);
            return;
        }

        // Define the reference to the chat document with the specific activeChatId
        const chatRef = doc(projectExtensionFirestore, 'chats', activeChatId);

        // To avoid updating state after unmounting, use a flag
        let isMounted = true;

        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(
            chatRef,
            (chatDocSnapshot) => {
                if (isMounted && chatDocSnapshot.exists()) {
                    // Extract the data from the document snapshot
                    const chatData = chatDocSnapshot.data();
                    if (chatData) {
                        setChatField(chatData);

                    }
                }

                // Set loading to false after data is loaded
                if (isMounted) {
                    setIsLoading(false);
                }
            },
            (error) => {
                console.error('Error listening to chat document:', error);
                if (isMounted) {
                    setIsLoading(false); // End loading if there's an error
                }
            }
        );

        return () => {
            // Set the flag to false so no state updates happen after unmounting
            isMounted = false;
            // Unsubscribe from the real-time listener
            unsubscribe();
        };
    }, [activeChatId, userEmail]);

    //

    const categories = [
        { id: '10', title: 'All messages' },
        { id: '1', title: 'Negotation' },
        { id: '2', title: 'Issued Proforma Invoice' },
        { id: '3', title: 'Order Item' },
        { id: '4', title: 'Payment Confirmation' },
        { id: '5', title: 'Shipping Schedule' },
        { id: '6', title: 'Documents' },
        { id: '7', title: 'Vehicle Received' },
    ];

    const [toggleDown, setToggleDown] = useState(false);
    useEffect(() => {
        if (screenHeight > 600) {
            setToggleDown(false)
        }
    }, [screenHeight])
    const requestToggleDown = () => {
        setToggleDown(!toggleDown)
    }
    const topValue = toggleDown
        ? (screenWidth < 1440 ? 205 : null)  // Adjusted value when toggleDown is true
        : (screenWidth < 1440 ? 90 : 100);


    const [accountData, setAccountData] = useState({});
    useEffect(() => {
        if (!userEmail) {
            return;
        }
        const accountRef = doc(projectExtensionFirestore, 'accounts', userEmail);

        // Real-time listener
        const unsubscribe = onSnapshot(accountRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setAccountData(docSnapshot.data());
            } else {
                console.log('Document does not exist!');
            }
        }, (error) => {
            console.error('Error fetching vehicle data:', error);
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();

    }, [userEmail]);

    //fetch image
    const [chats, setChats] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const keywords = useRef('');
    const [render, setRender] = useState(false);
    console.log('keywords curre', keywords.current)
    const handleKeyword = (value) => {
        keywords.current = value;

        if (!render && value.length > 0) {
            setRender(true);
        }

        if (render && value.length === 0) {
            setRender(false);
        }
    };
    const [hasMoreData, setHasMoreData] = useState(true);
    const inputRef = useRef(null);
    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.clear(); // Clear the TextInput
        }

        keywords.current = ''; // Reset the stored keyword
        setLastVisible(null); // Reset pagination reference
        setHasMoreData(true); // Allow loading more data again
        setChats([]); // Clear current chats

        // Reload chats without the keyword filter
        initializeChats();
    };
    const [toggleReadButton, setToggleReadButton] = useState(false); // Default is inactive (normal mode)

    const handleToggleRead = () => {
        setToggleReadButton((prevState) => !prevState); // Toggle active/inactive state
        initializeChats(true, !toggleReadButton); // Pass the updated state to fetch data
    };
    const [indexIndicator, setIndexIndicator] = useState('10');
    const handleIndex = (index) => {
        if (index === indexIndicator) {
            // Do nothing if the same indicator is clicked
            return;
        }

        setIndexIndicator(index);
        setChats([]);
        setLastVisible(null); // Reset lastVisible for the new query
        setHasMoreData(true); // Allow new data to load
    };
    const initializeChats = async (isReset = false, isUnreadActive = false) => {
        console.log("Keywords current:", keywords.current);
        setLoadingLeftSide(true);

        if (isReset) {
            setLastVisible(null);  // Reset pagination reference only
        }

        try {
            let queryConstraints = [
                where('participants.customer', '==', userEmail),
                orderBy('lastMessageDate', 'desc'),
                limit(10),
            ];

            if (indexIndicator !== '10') {
                queryConstraints.push(where('stepIndicator.value', '==', parseInt(indexIndicator)));
            }
            if (isUnreadActive) {
                queryConstraints.push(where('customerRead', '==', false));
            }
            if (keywords.current.trim().length > 0) {
                queryConstraints.push(where('keywords', 'array-contains', keywords.current.trim()));
            }

            // Initial data fetch
            const initialQuery = query(collection(projectExtensionFirestore, 'chats'), ...queryConstraints);
            const querySnapshot = await getDocs(initialQuery);
            const chatData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            setChats((prevChats) => {
                const newIds = new Set(chatData.map(chat => chat.id));
                const filteredChats = prevChats.filter(chat => !newIds.has(chat.id));
                return [...filteredChats, ...chatData];  // Merge new data with previous chats
            });

            if (!querySnapshot.empty) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            }

            // Set up real-time listener
            const realTimeQuery = query(collection(projectExtensionFirestore, 'chats'), ...queryConstraints);
            const unsubscribeChats = onSnapshot(realTimeQuery, (snapshot) => {
                const liveChatData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                setChats((prevChats) => {
                    const newChatIds = new Set(liveChatData.map(chat => chat.id));
                    const filteredChats = prevChats.filter(chat => !newChatIds.has(chat.id));
                    return [...liveChatData, ...filteredChats];  // Prepend new chats without overriding
                });
            });

            setLoadingLeftSide(false);
            return unsubscribeChats;
        } catch (error) {
            console.error("Error initializing chats:", error);
            setLoadingLeftSide(false);
        }
    };




    useEffect(() => {
        if (toggleReadButton !== null) {
            let unsubscribe;

            const setupChats = async () => {
                unsubscribe = await initializeChats(true, toggleReadButton); // Pass toggleReadButton as isUnreadActive
            };

            setupChats(); // Call the async function

            return () => {
                console.log("Cleaning up previous listener");
                if (unsubscribe) {
                    unsubscribe(); // Unsubscribe the real-time listener
                }
            };
        }
    }, [toggleReadButton, indexIndicator]);

    const [carImages, setCarImages] = useState({});

    useEffect(() => {
        // Fetch and preload image from VehicleProducts based on stockID
        const loadImage = async (stockID) => {
            // Proceed only if a valid stockID is provided and an image has not been loaded already.
            if (!stockID || carImages[stockID]) return;

            try {
                // Create a reference to the document in VehicleProducts using the stockID
                const docRef = doc(projectExtensionFirestore, 'VehicleProducts', stockID);
                // Retrieve the document data once
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = docSnap.data();
                    const images = productData.images; // Expecting images to be an array of URL strings

                    if (images && images.length > 0) {
                        const imageUrl = images[0]; // Use the first image URL from the array

                        // Preload the image using Image.prefetch
                        await Image.prefetch(imageUrl);

                        // Update the carImages state with the preloaded image URL for this stockID
                        setCarImages((prevImages) => ({
                            ...prevImages,
                            [stockID]: imageUrl,
                        }));
                    } else {
                        console.error(`No images available for stockID: ${stockID}`);
                    }
                } else {
                    console.error(`No document found for stockID: ${stockID}`);
                }
            } catch (error) {
                console.error(`Error preloading image for stockID ${stockID}:`, error);
            }
        };

        // Iterate over all chats and preload images using only the stockID from chat.carData
        const preloadImages = async () => {
            try {
                const imagePromises = chats.map((chat) => {
                    const stockID = chat.carData?.stockID;
                    return loadImage(stockID);
                });
                // Wait for all preloading promises to complete
                await Promise.all(imagePromises);
            } catch (error) {
                console.error("Error preloading one or more images:", error);
            } finally {
                // Indicate that the loading process is finished
                setLoadingLeftSide(false);
            }
        };

        // Only trigger preloading if there's at least one chat with a valid stockID
        if (chats && Array.isArray(chats) && chats.some((chat) => chat.carData?.stockID)) {
            preloadImages();
        }
    }, [chats, carImages, setLoadingLeftSide]);

    // fetchVehicleStatuses remains unchanged
    const fetchVehicleStatuses = (stockIDs, updateStatuses) => {
        if (!stockIDs || stockIDs.length === 0) return;

        // Store unsubscribe functions to clean up listeners
        const unsubscribeMap = {};

        // Set up onSnapshot for each stockID in VehicleProducts
        stockIDs.forEach((stockID) => {
            const docRef = doc(projectExtensionFirestore, 'VehicleProducts', stockID);

            // Listen for real-time updates on each document
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    updateStatuses(stockID, { stockStatus: data.stockStatus, reservedTo: data.reservedTo });
                } else {
                    console.log(`No document for stockID: ${stockID}`);
                    updateStatuses(stockID, { stockStatus: null, reservedTo: null });
                }
            });

            // Store each unsubscribe function
            unsubscribeMap[stockID] = unsubscribe;
        });

        // Return a cleanup function to remove all listeners when needed
        return () => {
            Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());
        };
    };

    //fetch total Price
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const handleOrderModal = () => {
        setOrderModalVisible(!orderModalVisible)
    };
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const handleViewPaymentDetails = () => {
        setPaymentModalVisible(!paymentModalVisible)
    }

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    //fetch booking field

    //fetch booking field  

    //fetch stock status 
    const [vehicleStatuses, setVehicleStatuses] = useState({});

    useEffect(() => {
        const stockIDs = chats.map(chat => chat.carData?.stockID).filter(Boolean);

        const updateStatuses = (stockID, status) => {
            setVehicleStatuses(prevStatuses => ({
                ...prevStatuses,
                [stockID]: status
            }));
        };

        const cleanup = fetchVehicleStatuses(stockIDs, updateStatuses);

        return () => {
            if (cleanup) cleanup();
        };
    }, [chats]);

    const { stockStatus, reservedTo } = vehicleStatuses[selectedChatData?.carData?.stockID] || {};
    const isReservedOrSold = (stockStatus === "Reserved" || stockStatus === "Sold") && reservedTo !== userEmail;

    //fetch stock status
    const [isValidId, setIsValidId] = useState(null); // Track if the ID is valid

    // Define the expected pattern for "chat_<carID>_<email>"
    const validChatIdPattern = /^chat_\d+_.+@.+\..+$/;

    useEffect(() => {
        const validateChatId = async () => {

            if (!validChatIdPattern.test(activeChatId)) {
                setIsValidId(false);
                return;
            }

            // Attempt to fetch the document from Firestore
            const docRef = doc(projectExtensionFirestore, "chats", activeChatId); // Update "chatCollection" with your collection name
            const docSnap = await getDoc(docRef);

            // Set validation result based on document existence
            setIsValidId(docSnap.exists());
        };

        validateChatId();
    }, [activeChatId]);

    // If isValidId is false, navigate to error
    if (isValidId === false) {
        return <Navigate to="/error" />;
    };

    console.log('Chat IDs:', chats.map(chat => chat.id));
    const slideAnime = useRef(new AnimatedRN.Value(screenWidth)).current; // Start position off-screen to the left
    const [showRight, setShowRight] = useState(false);
    useEffect(() => {
        slideAnime.setValue(screenWidth);
        if (!showInMobile && showRight) {
            AnimatedRN.timing(slideAnime, {
                toValue: 0, // Target position
                duration: 250, // Duration of the animation in milliseconds
                useNativeDriver: true, // Enable native driver for better performance
            }).start();
        }
    }, [showInMobile, showRight, screenWidth]);
    const [headerDimensions, setHeaderDimension] = useState({ width: 0, height: 0 });

    const handleLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setHeaderDimension({ width, height });
    };

    // Get the reference number
    const carId = stockId;

    const [carData, setCarData] = useState('');
    const inputRefKeyboard = useRef(null)
    useEffect(() => {

        if (carId) {
            // Create a reference to the document
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            // Listen for real-time updates to the document
            const unsubscribe = onSnapshot(vehicleDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const carDataFromFirestore = docSnapshot.data();
                    setCarData((prevData) => ({ ...prevData, ...carDataFromFirestore }));

                } else {
                    console.log('Document does not exist.');
                }
            }, (error) => {
                console.error('Error listening to document:', error);
            });

            // Return a cleanup function to unsubscribe when the component unmounts
            return () => { unsubscribe(); };
        }
    }, [carId]);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const dropdownProfile = useMemo(() => [
        { label: 'Profile', link: '/Profile', icon: 'user', component: FontAwesome },
        { label: 'Transactions', link: chats?.length > 0 ? `/ProfileFormChatGroup/${chats}` : null, icon: 'chatbubble-ellipses-outline', component: Ionicons },
        { label: 'My Orders', link: '/ProfileFormTransaction', icon: 'history', component: FontAwesome },
        { label: 'Favorites', link: '/Favorite', icon: 'favorite', component: Fontisto },
        { label: 'Log Out', link: '/Logout', icon: 'log-out', component: Feather },
    ], [chats]);
    const opacityAnim = useRef(new AnimatedRN.Value(0)).current; // Start with 0 opacity

    // Animate opacity when dropdown state changes
    useEffect(() => {
        if (isProfileDropdownOpen) {
            // Animate to fade in
            AnimatedRN.timing(opacityAnim, {
                toValue: 1,
                duration: 200, // Duration of fade-in animation
                useNativeDriver: true,
            }).start();
        } else {
            // Animate to fade out
            AnimatedRN.timing(opacityAnim, {
                toValue: 0,
                duration: 200, // Duration of fade-out animation
                useNativeDriver: true,
            }).start();
        }
    }, [isProfileDropdownOpen]);
    const [parentPositionNew, setParentPositionNew] = useState({ top: 0, left: 0, width: 0, height: 0, });
    const [isProfileHoveredIndex, setIsProfileHoveredIndex] = useState(null);
    const [contactUsOpen, setContactUsOpen] = useState(false);
    return (
        <TouchableWithoutFeedback onPress={() => setIsProfileDropdownOpen(false)}>
            <View style={{ flex: 3 }}>


                <StickyHeader handleIndex={handleIndex} setContactUsOpen={setContactUsOpen} isProfileHoveredIndex={isProfileHoveredIndex} setIsProfileHoveredIndex={setIsProfileHoveredIndex} parentPositionNew={parentPositionNew} setParentPositionNew={setParentPositionNew} setIsProfileDropdownOpen={setIsProfileDropdownOpen} isProfileDropdownOpen={isProfileDropdownOpen} handleLayout={handleLayout} openModal={openModal} closeModal={closeModal} slideAnim={slideAnim} chatField={chatField} categories={categories} />
                {isProfileDropdownOpen && (
                    <AnimatedRN.View
                        style={{
                            position: 'fixed',
                            top: parentPositionNew.top - 10,
                            left: parentPositionNew.left,
                            width: 200, // 1.5 times smaller than parent width
                            backgroundColor: 'white',
                            borderRadius: 5,
                            padding: 10,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            elevation: 5,
                            zIndex: 999,
                            opacity: opacityAnim,

                        }}
                    >

                        {dropdownProfile.map((dropdownOption, i) => {
                            const IconComponent = dropdownOption.component;
                            return (
                                <Pressable
                                    onHoverIn={() => setIsProfileHoveredIndex(i)}
                                    onHoverOut={() => setIsProfileHoveredIndex(null)}

                                    key={i}
                                    onPress={() => {
                                        if (dropdownOption.label === 'Log Out') {
                                            logout();
                                            setIsProfileDropdownOpen(false);
                                        } else {
                                            navigate(dropdownOption.link);
                                            setIsProfileDropdownOpen(false); // Close the dropdown after navigation
                                        }
                                    }}
                                    style={({ hovered }) => [
                                        {
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: hovered ? 'blue' : null,
                                            paddingVertical: 10,
                                            paddingHorizontal: 15,
                                            borderBottomColor: '#ddd',
                                        },
                                    ]}
                                >
                                    <View

                                        style={{
                                            width: 24, // Fixed width for all icons
                                            height: 24, // Fixed height for all icons
                                            justifyContent: 'center',
                                            alignItems: 'center', // Center icon within the container
                                            marginRight: 15, // Add spacing between icon and text
                                        }}
                                    >
                                        <IconComponent
                                            name={dropdownOption.icon}
                                            size={20} // Set consistent icon size
                                            color={isProfileHoveredIndex === i ? '#fff' : '#555'}
                                        />
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: isProfileHoveredIndex === i ? '#fff' : '#333',
                                            flex: 1, // Ensures the text takes up remaining space
                                        }}
                                    >
                                        {dropdownOption.label}
                                    </Text>
                                </Pressable>
                            );
                        })}

                    </AnimatedRN.View>
                )}
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
                {modalVisibleHeader && (
                    <>
                        <Modal

                            transparent={true}
                            visible={modalVisibleHeader}
                            onRequestClose={closeModal}
                            style={{ zIndex: 99 }}
                        >
                            <View style={{
                                flex: 3,
                                justifyContent: 'flex-end',
                            }}>
                                <TouchableOpacity onPress={closeModal} style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                }} />
                                <AnimatedRN.View
                                    style={{
                                        position: 'absolute',
                                        left: 0, // Make it appear from the left side
                                        top: 0,
                                        bottom: 0,
                                        width: screenWidth <= 554 ? screenWidth * 0.7 : 300,
                                        transform: [{ translateX: slideAnim }], // Animating from left
                                        backgroundColor: 'white',

                                        shadowColor: '#000',
                                        shadowOffset: { width: 5, height: 0 }, // Shadow on the right side
                                        shadowOpacity: 0.25,
                                        shadowRadius: 5,
                                        elevation: 5,
                                    }}
                                >
                                    <ScrollView style={{ flex: 1 }}>
                                        <Pressable onPress={closeModal} style={{ alignSelf: 'flex-end', padding: 10 }}>
                                            <Ionicons name="close" size={25} color={'blue'} />
                                        </Pressable>
                                        <View style={{
                                            flex: 3,
                                            paddingVertical: 10,
                                        }}>
                                            {[
                                                { label: 'Home', route: '/' },
                                                { label: 'Car Stock', route: '/SearchCarDesign' },
                                                { label: 'How to Buy', route: '/HowToBuy' },
                                                { label: 'About Us', route: '/AboutUs' },
                                                { label: 'Local Introduction', route: '/LocalIntroduction' },
                                                { label: 'Contact Us', action: () => setContactUsOpen(true), isContact: true },

                                            ].map((item, index) => (
                                                <Pressable
                                                    key={index}
                                                    id={item.route || item.label}  // Assign unique ID, fallback to label for Log Out, Log In, and Favorites
                                                    style={{
                                                        paddingVertical: 15,
                                                        paddingHorizontal: 10,
                                                        marginBottom: 5,
                                                        marginLeft: 20
                                                    }}

                                                    onPress={() => {
                                                        // Trigger the appropriate action or navigate
                                                        if (item.action) {
                                                            item.action(); // Trigger actions like Log In, Log Out, Favorites, or Contact Us
                                                        } else if (item.route) {
                                                            navigate(`${item.route}`); // Navigate to the route
                                                        }
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text
                                                            style={{
                                                                fontWeight: 'bold',
                                                                fontSize: 18,
                                                                textAlign: 'left',
                                                                color: 'black',  // Different color for Log In/Log Out/Favorites
                                                            }}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            ))}

                                        </View>
                                    </ScrollView>
                                </AnimatedRN.View>
                            </View>
                        </Modal>
                    </>
                )}

                <View style={{ flexDirection: 'row', flex: 3 }}>

                    {showInMobile && (
                        <InformationDataLeft
                            handleIndex={handleIndex}
                            setIndexIndicator={setIndexIndicator}
                            indexIndicator={indexIndicator}
                            makeTrueRead={makeTrueRead}
                            showRight={showRight}
                            chatId={chatId}
                            setShowMiddleVisible={setMiddleVisible}
                            setShowRight={setShowRight}
                            toggleReadButton={toggleReadButton}
                            handleToggleRead={handleToggleRead}
                            hasMoreData={hasMoreData}
                            setHasMoreData={setHasMoreData}
                            handleClear={handleClear}
                            inputRef={inputRef}
                            initializeChats={initializeChats}
                            keywords={keywords}
                            handleKeyword={handleKeyword}
                            loadingLeftSide={loadingLeftSide}
                            isLoadingForAll={isLoading}
                            chatField={chatField}
                            categories={categories}
                            headerDimensions={headerDimensions}
                            setShowInMobile={setShowInMobile}
                            setHideLeft={setHideLeft}
                            hideLeft={hideLeft}
                            setRightVisible={setRightVisible}
                            setSidebarOpen={setSidebarOpen}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                            userEmail={userEmail}
                            carImages={carImages}
                            chats={chats}
                            setChats={setChats}
                            lastVisible={lastVisible}
                            setLastVisible={setLastVisible}
                            fetchVehicleStatuses={fetchVehicleStatuses}
                        />

                    )}

                    {middleVisible && (
                        <>
                            {screenWidth <= 768 ? (
                                <>
                                    {showRight && (
                                        <AnimatedRN.View
                                            style={{
                                                // transform: [{ translateX: slideAnime }], // Slide horizontally based on animated value
                                                flex: 3,
                                                backgroundColor: '#fff',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexShrink: 0,
                                                    position: 'sticky',
                                                    top: headerDimensions.height,
                                                    backgroundColor: '#E5EBFE',
                                                    zIndex: 1,
                                                }}
                                            >
                                                {isReservedOrSold ? (
                                                    <>
                                                        <InformationData
                                                            chatId={chatId}
                                                            userEmail={userEmail}
                                                            showRight={showRight}
                                                            setShowRight={setShowRight}
                                                            loadingForAll={isLoading}
                                                            context={'Sold'}
                                                            formattedDate={formattedDate}
                                                            selectedChatId={selectedChatId}
                                                            carId={carId}
                                                            carData={carData}
                                                            chats={chats}
                                                            isLoading={isLoading}
                                                            setPaymentModalVisible={setPaymentModalVisible}
                                                            activeChatId={activeChatId}
                                                            selectedChatData={selectedChatData}
                                                            invoiceData={invoiceData}
                                                            currentStep={chatField.stepIndicator}
                                                            totalSteps={totalSteps}
                                                            requestToggleRight={requestToggleRight}
                                                            setShowInMobile={setShowInMobile}
                                                            setHideLeft={setHideLeft}
                                                            hideLeft={hideLeft}
                                                            carImages={carImages}
                                                            accountData={accountData}
                                                            handleButtonClick={handleButtonClick}
                                                            toggleModal={toggleModal}
                                                            modalVisible={modalVisible}
                                                            setModalVisible={setModalVisible}
                                                            bookingData={bookingData}
                                                            paymentModalVisible={paymentModalVisible}
                                                            handleViewPaymentDetails={handleViewPaymentDetails}
                                                        />
                                                        <View
                                                            style={{
                                                                backgroundColor: stockStatus === 'Reserved' ? '#FFA500' : '#FF6347',
                                                                padding: 10,
                                                                textAlign: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                                {stockStatus === 'Reserved' ? 'This item is already reserved.' : 'This item is already sold.'}
                                                            </Text>
                                                        </View>
                                                    </>
                                                ) : (
                                                    <>
                                                        <InformationData
                                                            chatId={chatId}
                                                            userEmail={userEmail}
                                                            showRight={showRight}
                                                            loadingForAll={isLoading}
                                                            setShowRight={setShowRight}
                                                            formattedDate={formattedDate}
                                                            selectedChatId={selectedChatId}
                                                            carId={carId}
                                                            carData={carData}
                                                            chats={chats}
                                                            isLoading={isLoading}
                                                            setPaymentModalVisible={setPaymentModalVisible}
                                                            activeChatId={activeChatId}
                                                            selectedChatData={selectedChatData}
                                                            invoiceData={invoiceData}
                                                            currentStep={chatField.stepIndicator}
                                                            totalSteps={totalSteps}
                                                            requestToggleRight={requestToggleRight}
                                                            setShowInMobile={setShowInMobile}
                                                            setHideLeft={setHideLeft}
                                                            hideLeft={hideLeft}
                                                            carImages={carImages}
                                                            accountData={accountData}
                                                            handleButtonClick={handleButtonClick}
                                                            toggleModal={toggleModal}
                                                            modalVisible={modalVisible}
                                                            setModalVisible={setModalVisible}
                                                            bookingData={bookingData}
                                                            paymentModalVisible={paymentModalVisible}
                                                            handleViewPaymentDetails={handleViewPaymentDetails}
                                                        />
                                                        {('isCancelled' in selectedChatData ? !selectedChatData.isCancelled : true) ? (<>
                                                            {selectedChatData?.stepIndicator?.value === 2 && (
                                                                <View style={{ marginTop: 5, zIndex: -99 }}>
                                                                    <ChatAnnouncementBar selectedChatData={selectedChatData} handleOrderModal={handleOrderModal} chatId={chatId} />
                                                                </View>
                                                            )}
                                                            {selectedChatData?.stepIndicator?.value === 3 && !selectedChatData?.ttCopy && (
                                                                <View style={{ marginTop: 5, zIndex: -99 }}>
                                                                    <ChatPaymentNotificationBar
                                                                        setPaymentModalVisible={setPaymentModalVisible}
                                                                        setModalVisible={setModalVisible}
                                                                        context="Notif"
                                                                        selectedChatData={selectedChatData}
                                                                        handleViewPaymentDetails={handleViewPaymentDetails}
                                                                        paymentModalVisible={paymentModalVisible}
                                                                        chatId={chatId}
                                                                        toggleModal={toggleModal}
                                                                    />
                                                                </View>
                                                            )}
                                                        </>) : (
                                                            <View
                                                                style={{
                                                                    backgroundColor: '#A52A2A', // Brown for Cancelled
                                                                    padding: 10,
                                                                    textAlign: 'center',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                                    {"This unit has been cancelled."}
                                                                </Text>
                                                            </View>
                                                        )}

                                                    </>
                                                )}
                                            </View>

                                            <View style={{ backgroundColor: '#E5EBFE', flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
                                                {orderModalVisible && (
                                                    <OrderItem
                                                        invoiceData={invoiceData}
                                                        orderModalVisible={orderModalVisible}
                                                        handleOrderModal={handleOrderModal}
                                                        openModalRequest={openModalRequest}
                                                        chatField={chatField}
                                                    />
                                                )}

                                                <ChatD
                                                    userEmail={userEmail}
                                                    chatId={chatId}
                                                    makeTrueRead={makeTrueRead}
                                                    activeChatId={activeChatId}
                                                    selectedChatData={selectedChatData}
                                                    invoiceData={invoiceData}
                                                    selectedChatId={selectedChatId}
                                                    openModalRequest={openModalRequest}
                                                    bookingData={bookingData}
                                                    scrollViewRef={scrollViewRef}
                                                    modalVisible={modalVisible}
                                                    accountData={accountData}
                                                    inputRefKeyboard={inputRefKeyboard}
                                                />
                                            </View>

                                            <View
                                                style={{
                                                    backgroundColor: '#E5EBFE',
                                                    position: 'sticky',
                                                    bottom: 0,
                                                    padding: 5,
                                                    zIndex: 999
                                                }}
                                            >
                                                <TextInputForChat userEmail={userEmail} inputRefKeyboard={inputRefKeyboard} scrollViewRef={scrollViewRef} chatId={chatId} />
                                            </View>
                                        </AnimatedRN.View>
                                    )}
                                </>
                            ) : (

                                <View style={{ flex: 3, backgroundColor: '#fff' }} >


                                    <View style={{ flexShrink: 0, position: 'sticky', top: headerDimensions.height, backgroundColor: '#E5EBFE', zIndex: 1, marginLeft: 300 }}>
                                        {isReservedOrSold ? (
                                            <>



                                                <InformationData
                                                    chatId={chatId}
                                                    userEmail={userEmail}
                                                    showRight={showRight}
                                                    loadingForAll={isLoading}
                                                    setShowRight={setShowRight}
                                                    formattedDate={formattedDate}
                                                    selectedChatId={selectedChatId}
                                                    carId={carId}
                                                    carData={carData}
                                                    chats={chats}
                                                    isLoading={isLoading}
                                                    setPaymentModalVisible={setPaymentModalVisible}
                                                    activeChatId={activeChatId}
                                                    selectedChatData={selectedChatData}
                                                    invoiceData={invoiceData}
                                                    currentStep={chatField.stepIndicator}
                                                    totalSteps={totalSteps}
                                                    requestToggleRight={requestToggleRight}
                                                    setShowInMobile={setShowInMobile}
                                                    setHideLeft={setHideLeft}
                                                    hideLeft={hideLeft}
                                                    carImages={carImages}
                                                    accountData={accountData}
                                                    handleButtonClick={handleButtonClick}
                                                    toggleModal={toggleModal}
                                                    modalVisible={modalVisible}
                                                    setModalVisible={setModalVisible}
                                                    bookingData={bookingData}
                                                    paymentModalVisible={paymentModalVisible}
                                                    handleViewPaymentDetails={handleViewPaymentDetails}
                                                />
                                                <View
                                                    style={{
                                                        backgroundColor: stockStatus === "Reserved" ? '#FFA500' : '#FF6347', // Orange for Reserved, Red for Sold
                                                        padding: 10,
                                                        textAlign: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                        {stockStatus === "Reserved" ? "This item is already reserved." : "This item is already sold."}
                                                    </Text>
                                                </View>
                                            </>
                                        ) : (
                                            <>


                                                <InformationData
                                                    chatId={chatId}
                                                    userEmail={userEmail}
                                                    showRight={showRight}
                                                    loadingForAll={isLoading}
                                                    setShowRight={setShowRight}
                                                    formattedDate={formattedDate}
                                                    selectedChatId={selectedChatId}
                                                    carId={carId}
                                                    carData={carData}
                                                    chats={chats}
                                                    isLoading={isLoading}
                                                    setPaymentModalVisible={setPaymentModalVisible}
                                                    activeChatId={activeChatId}
                                                    selectedChatData={selectedChatData}
                                                    invoiceData={invoiceData}
                                                    currentStep={chatField.stepIndicator}
                                                    totalSteps={totalSteps}
                                                    requestToggleRight={requestToggleRight}
                                                    setShowInMobile={setShowInMobile}
                                                    setHideLeft={setHideLeft}
                                                    hideLeft={hideLeft}
                                                    carImages={carImages}
                                                    accountData={accountData}
                                                    handleButtonClick={handleButtonClick}
                                                    toggleModal={toggleModal}
                                                    modalVisible={modalVisible}
                                                    setModalVisible={setModalVisible}
                                                    bookingData={bookingData}
                                                    paymentModalVisible={paymentModalVisible}
                                                    handleViewPaymentDetails={handleViewPaymentDetails}
                                                />







                                                {('isCancelled' in selectedChatData ? !selectedChatData.isCancelled : true) ? (<>
                                                    {selectedChatData?.stepIndicator?.value === 2 && (
                                                        <View style={{ marginTop: 5, zIndex: -99 }}>
                                                            <ChatAnnouncementBar selectedChatData={selectedChatData} handleOrderModal={handleOrderModal} chatId={chatId} />
                                                        </View>
                                                    )}
                                                    {selectedChatData?.stepIndicator?.value === 3 && !selectedChatData?.ttCopy && (
                                                        <View style={{ marginTop: 5, zIndex: -99 }}>
                                                            <ChatPaymentNotificationBar
                                                                setPaymentModalVisible={setPaymentModalVisible}
                                                                setModalVisible={setModalVisible}
                                                                context="Notif"
                                                                selectedChatData={selectedChatData}
                                                                handleViewPaymentDetails={handleViewPaymentDetails}
                                                                paymentModalVisible={paymentModalVisible}
                                                                chatId={chatId}
                                                                toggleModal={toggleModal}
                                                            />
                                                        </View>
                                                    )}
                                                </>) : (
                                                    <View
                                                        style={{
                                                            backgroundColor: '#A52A2A', // Brown for Cancelled
                                                            padding: 10,
                                                            textAlign: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                            {"This unit has been cancelled."}
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </View>






                                    <View style={{ marginLeft: 300, flex: 1, flexDirection: 'column', justifyContent: 'flex-end', backgroundColor: '#E5EBFE', }} >
                                        {orderModalVisible && (<OrderItem invoiceData={invoiceData} orderModalVisible={orderModalVisible} handleOrderModal={handleOrderModal} openModalRequest={openModalRequest} chatField={chatField} />)}

                                        <ChatD
                                            userEmail={userEmail}
                                            chatId={chatId}
                                            makeTrueRead={makeTrueRead}
                                            inputRefKeyboard={inputRefKeyboard}
                                            activeChatId={activeChatId}
                                            selectedChatData={selectedChatData}
                                            invoiceData={invoiceData}
                                            bookingData={bookingData}
                                            selectedChatId={selectedChatId}
                                            openModalRequest={openModalRequest}
                                            scrollViewRef={scrollViewRef}
                                            modalVisible={modalVisible}
                                            accountData={accountData}
                                        />
                                    </View>
                                    <View style={{ backgroundColor: '#E5EBFE', position: 'sticky', bottom: 0, padding: 5, marginLeft: 300, zIndex: 999 }}>
                                        <TextInputForChat
                                            inputRefKeyboard={inputRefKeyboard}
                                            scrollViewRef={scrollViewRef}
                                            chatId={chatId}
                                            userEmail={userEmail}
                                        />
                                    </View>

                                </View>

                            )}
                        </>
                    )}
                </View>




            </View>
        </TouchableWithoutFeedback>
    )

}

export default ProfileFormChatGroup;

const styles = StyleSheet.create({
    profileHeader: {
        alignItems: 'center',
        padding: 10,
    },
    divider: {
        alignSelf: 'center',
        width: '80%',
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        marginVertical: 10,
    },
    profileOptions: {
        padding: 10,
    },
    pressableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECEDF0',
        borderRadius: 10,
        height: 50,
        padding: 5,
        marginVertical: 5, // Consistent vertical margin
        width: '100%',
        justifyContent: 'center',
    },
    touchableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5, // Consistent vertical margin
        padding: 10,
    },
    scrollViewDefault: {
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: '#ccc',
        zIndex: 10,
        maxWidth: 300,
        width: '100%',
    },
    scrollViewSmallScreen: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        width: 300,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 20,
        zIndex: 1000,

    },
    container: {
        paddingTop: "60px",
    },
    chatContainer: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '60%',
    },
    inputContainer: {

        borderTopColor: 'gray',
        padding: 5,
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
        margin: 5,
        borderRadius: 5,
        minHeight: 40
    },
    sendButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },

});





