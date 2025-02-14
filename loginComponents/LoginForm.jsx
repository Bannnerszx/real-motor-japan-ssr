import { StyleSheet, Text as TextRN, View, Animated as AnimatedRN, Easing, TouchableOpacity, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, FlatList, ScrollView, Pressable as PressableRN, Linking, Modal, Image as ImageRN, Button as ButtonRN, ActivityIndicator, PanResponder } from "react-native";
import React, { useEffect, useState, useRef, useMemo, useReducer, useCallback, useContext } from 'react';
import { MaterialIcons, Ionicons, AntDesign, FontAwesome, Foundation, Entypo, Octicons, MaterialCommunityIcons, FontAwesome5, Fontisto, Feather } from "@expo/vector-icons";
import { Button, NativeBaseProvider, Alert, Input, Icon, Pressable, extendTheme, Spinner, PresenceTransition, Checkbox } from 'native-base';
import Svg, { Mask, Path, G, Defs, Pattern, Use, Image, Rect, Text, Circle } from "react-native-svg";
import { projectExtensionFirestore } from "../firebaseConfig/firebaseConfig";
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc, limit, startAfter, runTransaction, increment } from 'firebase/firestore';
import { AuthContext } from "../apiContext/AuthProvider";
import logo4 from '../assets/Mini Logo RMJ.png'
import mini from '../assets/Mini Logo RMJ.png';
import icon from '../assets/icon.png';
import axios from 'axios';
import { AnimatedCircle, AnimatedPath } from "./SvgOmitter";
const checkChatExists = process.env.CHECK_CHAT_EXISTS;
const ipInfo = process.env.IP_INFO;
const timeApi = process.env.TIME_API;
const addChatData = process.env.ADD_CHAT_DATA;
const checkUserExists = process.env.CHECK_USER_EXISTS;
const submitUserData = process.env.SUBMIT_USER_DATA;
const styles = StyleSheet.create({

    container: {

        justifyContent: 'center',

        flex: 1,

    },


})

//google svg
const GoogleIcon = ({ }) => {
    return (

        <View style={{ paddingHorizontal: 15 }}>
            <Svg width={30} height={30} viewBox="0 0 48 48">

                <Path
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    fill="#fbc02d"
                />
                <Path
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    fill="#e53935"
                />
                <Path
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    fill="#4caf50"
                />
                <Path
                    d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    fill="#1565c0"
                />

            </Svg>
        </View>

    );
};
const NewBackgroundImage = ({ children }) => {
    return (

        <View style={{ position: 'relative', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 3, padding: 5 }}>

            <Svg height="0" width="0">
                <Defs>
                    <Pattern
                        id="backgroundPattern"
                        patternUnits="userSpaceOnUse"
                        width={132} // width of your pattern
                        height={137} // height of your pattern
                        viewBox="0 0 132 137"
                    >

                        <Path
                            d="M118.829 68.387l12.746-22.077a.868.868 0 000-.872l-12.99-22.5a.868.868 0 00-.754-.435H92.338L79.598.436A.871.871 0 0078.844 0H52.861a.87.87 0 00-.754.436l-12.74 22.068H13.861a.871.871 0 00-.754.436L.117 45.44a.87.87 0 000 .872l12.744 22.08L.117 90.465a.874.874 0 000 .872l12.99 22.5a.866.866 0 00.754.436h25.51l12.735 22.06a.877.877 0 00.754.436h25.98a.865.865 0 00.754-.436l12.736-22.06h25.5a.869.869 0 00.754-.436l12.99-22.5a.868.868 0 000-.872l-12.745-22.078zm-62.72 51.1l8.645-4.989-11.5 19.911v-13.272l2.855-1.65zm-38.99-22.5l8.635-4.982-11.5 19.911V98.642l2.865-1.655zM14.252 38.14V24.865l11.5 19.91-.958-.552-10.542-6.083zm39-35.78l11.5 19.911-11.5-6.634V2.36zm-39 80.807V69.891l11.5 19.91-.958-.552-10.542-6.082zM17.11 51.96l8.635-4.982-11.5 19.91V53.615l2.865-1.655zm36.151 40.427l11.5 19.91-11.5-6.634V92.387zm13-67.509l11.5 19.911-11.5-6.636V24.878zm-.41 73.045l-10.663-6.156h21.333l-10.67 6.156zm37.891-50.946l-11.5 19.911V53.615l2.852-1.648 8.648-4.99zm-11.5 22.912l11.5 19.911-11.5-6.634V69.889zm-39-22.514l11.5 19.91-11.5-6.634V47.375zm25.2 0v13.274l-11.494 6.635 11.494-19.909zm-13 35.789l-11.5 6.638 11.5-19.91v13.272zm.81-13.273l11.5 19.911-11.5-6.636V69.891zm12.591-8.544l11.5 6.634H67.354l11.49-6.634zm-26 0l11.5 6.636h-23l11.5-6.636zm11.494 7.441l-8.769 5.066-2.727 1.573-11.5-6.637 22.996-.002zm-8.239 5.689l8.646-4.988-11.5 19.911V76.123l2.854-1.646zm9.742 9.383l10.661 6.152H55.188L65.84 83.86zm1.106-14.37l11.494 6.636v13.273L66.946 69.49zm11.9 5.938l-11.5-6.64h23l-11.5 6.64zm.4-14.778v-12.3L89.9 66.803 79.246 60.65zm-12.994 6.232V53.607l11.5-6.636-11.5 19.911zm-.809-13.272v13.271l-11.5-19.909 11.5 6.638zm-13 7.04l-10.662 6.156L52.443 48.34v12.31zm0 15.474v12.3L41.788 69.968l10.655 6.156zm26.8 0l10.66-6.158-10.654 18.457-.006-12.299zm-13.4-23.212L55.18 46.755h21.332l-10.669 6.157zm25.6.7v12.3L80.787 47.457l10.656 6.155zm-51.186 12.3v-12.3l10.66-6.158-10.66 18.458zm-.808-12.3v13.274l-11.5-19.909 11.5 6.635zm.008 16.277v13.273l-11.496 6.639 11.496-19.912zm.8.97l10.655 18.454-10.659-6.149.004-12.305zm64.18 5.265v13.272l-11.5-19.91 11.5 6.638zm0-28.745v13.272l-11.5 6.637 11.5-19.909zm-9.807 3.924l-2.792 1.611-11.5-6.637h22.992l-8.7 5.026zm-54.783 1.62l-11.5-6.641h23l-11.5 6.641zm-12.592-5.537l11.5 19.911-11.5-6.636V47.386zm0 42.019V76.13l11.5-6.636-11.5 19.911zm12.592-5.535l11.5 6.633h-22.99l11.49-6.633zm25.6 14.758V111.9l-11.5-19.91 11.5 6.638zm.806 0l11.5-6.637-11.5 19.912V98.628zm25.185-27.764v12.312l-10.66 6.147 10.66-18.459zm13.4 4.573l-10.663-6.156h21.332l-10.669 6.156zM94.184 67.51l10.654-6.152 10.661 6.152H94.184zm-2.342-28.665l11.5 6.636h-23l11.5-6.636zm-24.88-14.369l11.491 6.636v13.273L66.961 24.476zm-1.107 14.371l10.661 6.151H55.197l10.658-6.151zm-37.5 6.626l11.492-6.636 11.5 6.633-22.992.003zM26.846 61.35l10.661 6.152H16.193l10.653-6.152zm10.674 7.923l-10.669 6.156-10.663-6.156H37.52zm2.331 28.672l-11.5-6.641h23l-11.5 6.641zm38.6-5.558v13.273l-11.49 6.636 11.49-19.909zm13.39-8.523L103.34 90.5h-23l11.5-6.636zm13.399-7.74l11.5-6.636-11.5 19.911V76.124zm0-15.469V47.38l11.5 19.911-11.5-6.636zM91.44 38.14l-10.66 6.156L91.44 25.83v12.31zm-25.989.009l-11.5 6.638 11.5-19.91v13.272zm-14.543 6.139L40.25 38.139v-12.3l10.658 18.449zM26.446 60.653l-11.5 6.638 11.5-19.909v13.271zm0 15.474v13.272l-11.5-19.91 11.5 6.638zm13.8 22.515l10.66-6.158L40.26 110.94l-.015-12.298zm40.532-6.152l10.655 6.152v12.3L80.778 92.49zm11.056 5.454l-11.5-6.637h22.992l-8.77 5.066-2.722 1.571zm14.1-8.144l11.5-19.909v13.273l-11.5 6.636zm0-42.821l11.492 6.635v13.274l-11.492-19.909zm-13.7-8.84V24.865l11.5 19.91-11.5-6.636zM79.261 43.41v-12.3l10.658-6.158L79.261 43.41zm-14.5-18.933l-11.5 19.91V31.112l2.852-1.648 8.648-4.987zm-12.3 6.636v12.3L41.805 24.958l10.656 6.155zm-13-6.247V38.14l-11.494 6.635 11.494-19.909zm0 73.778v13.273l-11.5-19.909 11.5 6.636zm13-5.29v12.312l-10.67 6.157 10.67-18.469zm26.8.006l10.654 18.454-10.657-6.149.003-12.305zm12.987 18.558V98.642l2.852-1.648 8.645-4.989-11.497 19.913zm25.595-59l-11.5-6.641h23l-11.5 6.641zm-11.894-8.145l11.5-19.909v13.274l-11.5 6.635zm-.7-.4V31.098l11.5-6.636-11.5 19.911zm-.809-13.272v13.272l-11.5-19.91 11.5 6.638zm-25.586-.686l-11.5-6.641h23l-11.5 6.641zm-11.893-8.144l11.5-19.909v13.273l-11.5 6.636zm-.7-.4V8.596l11.5-6.636-11.5 19.911zm-.809-13.273V21.87l-11.5-19.91 11.5 6.638zm-9.806 20.207l-2.792 1.611-11.5-6.637h22.992l-8.7 5.026zm-28.39 15.568V31.098l11.5-6.636-11.5 19.911zm-.81-13.272v13.272l-11.5-19.91 11.5 6.638zm-9.72 20.156l-2.877 1.66-11.5-6.637H25.34l-8.614 4.977zm-2.87 32.608l10.048 5.8 1.451.838h-23l11.5-6.638zm12.6 8.544v13.272l-11.5 6.638 11.5-19.91zm.808 0l11.497 19.914-11.5-6.636.003-13.278zm25.6 13.953l11.5 6.635h-23l11.5-6.635zm12.6 8.544v13.272l-11.5 6.638 11.5-19.91zm.808 0l11.5 19.912-11.5-6.637v-13.275zm.7-.4l11.492 6.636v13.273l-11.492-19.909zm11.894-8.142l11.5 6.633h-22.99l11.49-6.633zm25.587-13.952v13.272l-11.5 6.638 11.5-19.91zm.808 0l11.5 19.912-11.5-6.636V92.412zm.7-.4l11.492 6.636v13.274l-11.492-19.91zm11.9-8.142l11.5 6.633h-22.99l11.49-6.633zm.4-.7V70.865l10.655 18.454-10.655-6.149zm0-17.256v-12.3l10.658-6.158-10.658 18.458zm-11.9-20.439l11.493-6.636 11.5 6.633-22.993.003zm-1.508-15.07L94.19 24.248h21.332l-10.669 6.157zM67.361 22.97l11.492-6.635 11.5 6.633-22.992.002zM65.853 7.9L55.19 1.744h21.332L65.853 7.9zm-13 8.436l11.5 6.636h-23l11.5-6.636zM26.847 30.403l-10.663-6.157h21.332l-10.669 6.157zm-13 8.435l10.05 5.8 1.45.838h-23l11.5-6.638zm-.4 14.777v12.3L2.792 47.46l10.655 6.155zm0 17.241v12.312L2.791 89.323l10.656-18.467zm11.9 20.448l-8.686 5.019-2.812 1.623-11.5-6.637 22.998-.005zm1.5 15.074l10.661 6.151h-21.31l10.65-6.151zm37.5 7.422l-8.77 5.066-2.726 1.574-11.5-6.638 22.996-.002zm1.5 15.074l10.661 6.151h-21.31l10.65-6.151zm13-8.433l-11.5-6.641h23l-11.5 6.641zm25.987-14.063l10.661 6.151h-21.31l10.649-6.151zm13-8.433l-11.5-6.641h23l-11.5 6.641zm11.061-53.656l-10.658-6.149v-12.3l10.658 18.449zm-38.989-22.5L79.25 15.64V3.334l10.657 18.455zM52.453 3.323v12.312l-10.662 6.158 10.662-18.47zm-39.005 22.5v12.311L2.786 44.29l10.662-18.467zM2.798 92.484l10.654 6.152v12.3L2.797 92.484zm39 22.5l10.654 6.151v12.3l-10.655-18.451zm37.46 18.449v-12.3l10.657-6.158-10.658 18.458zm38.987-22.5v-12.3l10.658-6.158-10.658 18.458z"
                            fill="#0000ff"
                            opacity="0.2"
                        />
                    </Pattern>
                </Defs>
            </Svg>
            <Svg
                width={'100%'}
                height={'30%'}
                viewBox="0 0 1439 788"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', top: 0 }}
            >
                <Path
                    d="M1282.01 1.196c-71.67 7.749-74.64 72.617-74.64 72.617s-74.98-26.2-89.58 46.848c0 0-64.45-41.536-134.645-4.343-70.192 37.193-44.732 123.012-44.732 123.012s-136.694 13.512-145.321 142.525c0 0-65.195 17.658-70.375 56.606 0 0-178.4-45.6-276.894 105.616 0 0-35.407-20-89.85 6.6 0 0-47.556-77.09-146.882-51.849 0 0-41.7-116.97-209.091-65.44v166.49a44.52 44.52 0 014.351-.21h378.385c20.218 0 36.608 13.429 36.608 29.99s-16.39 29.989-36.608 29.989H279.724a29.994 29.994 0 00-21.509 8.622 30.016 30.016 0 00-6.622 9.788 30.01 30.01 0 000 23.173 30.016 30.016 0 0016.511 16.26 29.994 29.994 0 0011.62 2.15h58.083a29.994 29.994 0 110 59.987H53.735a29.877 29.877 0 00-20.689 8.278H1439v-99.681H913.046a30 30 0 010-59.993h117.614c7.95 0 15.58-3.159 21.2-8.783a29.968 29.968 0 000-42.408 29.975 29.975 0 00-21.2-8.783H717.696a30 30 0 010-59.992h538.954a29.986 29.986 0 0020.89-8.957 30.006 30.006 0 008.62-21.039c0-7.872-3.1-15.428-8.62-21.039a29.986 29.986 0 00-20.89-8.957h-103.37c-20.23 0-36.62-13.425-36.62-29.99 0-16.565 16.39-29.986 36.62-29.986H1439V17.552a49.215 49.215 0 00-23.93-7.151c-40.37-1.437-42.35 15.473-42.35 15.473S1357.53.001 1303.2 0c-7.08.02-14.15.42-21.19 1.2"
                    fill="url(#backgroundPattern)" // Apply the pattern to the cloud shape
                />
            </Svg>

            {children}

            <Svg
                width={'100%'}
                height={'30%'}
                viewBox="0 0 1439 788"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: 0, zIndex: -99 }}
            > <Path
                    d="M1282.01 1.196c-71.67 7.749-74.64 72.617-74.64 72.617s-74.98-26.2-89.58 46.848c0 0-64.45-41.536-134.645-4.343-70.192 37.193-44.732 123.012-44.732 123.012s-136.694 13.512-145.321 142.525c0 0-65.195 17.658-70.375 56.606 0 0-178.4-45.6-276.894 105.616 0 0-35.407-20-89.85 6.6 0 0-47.556-77.09-146.882-51.849 0 0-41.7-116.97-209.091-65.44v166.49a44.52 44.52 0 014.351-.21h378.385c20.218 0 36.608 13.429 36.608 29.99s-16.39 29.989-36.608 29.989H279.724a29.994 29.994 0 00-21.509 8.622 30.016 30.016 0 00-6.622 9.788 30.01 30.01 0 000 23.173 30.016 30.016 0 0016.511 16.26 29.994 29.994 0 0011.62 2.15h58.083a29.994 29.994 0 110 59.987H53.735a29.877 29.877 0 00-20.689 8.278H1439v-99.681H913.046a30 30 0 010-59.993h117.614c7.95 0 15.58-3.159 21.2-8.783a29.968 29.968 0 000-42.408 29.975 29.975 0 00-21.2-8.783H717.696a30 30 0 010-59.992h538.954a29.986 29.986 0 0020.89-8.957 30.006 30.006 0 008.62-21.039c0-7.872-3.1-15.428-8.62-21.039a29.986 29.986 0 00-20.89-8.957h-103.37c-20.23 0-36.62-13.425-36.62-29.99 0-16.565 16.39-29.986 36.62-29.986H1439V17.552a49.215 49.215 0 00-23.93-7.151c-40.37-1.437-42.35 15.473-42.35 15.473S1357.53.001 1303.2 0c-7.08.02-14.15.42-21.19 1.2"
                    fill="url(#backgroundPattern)" // Apply the pattern to the cloud shape
                />
            </Svg>

        </View>
    )
};

const SuccessModal = ({ modalTrue, handleCreatConversation2 }) => {
    // Define your animated values
    const outerScale = useRef(new AnimatedRN.Value(1)).current; // Pulsating animation
    const circleDashOffset = useRef(new AnimatedRN.Value(2 * Math.PI * 96)).current; // Encircling effect
    const fillCircleScale = useRef(new AnimatedRN.Value(0)).current; // Blue-filled inner circle
    const checkDashOffset = useRef(new AnimatedRN.Value(150)).current; // Checkmark animation
    const outerRippleScale = useRef(new AnimatedRN.Value(1)).current; // Expanding ripple effect
    const outerRippleOpacity = useRef(new AnimatedRN.Value(1)).current; // Fading opacity for the expanding ripple
    const bounceScale = useRef(new AnimatedRN.Value(1)).current; // Bounce effect after fill
    useEffect(() => {
        if (modalTrue) {
            // Reset animated values before starting
            outerScale.setValue(1);
            circleDashOffset.setValue(2 * Math.PI * 96); // Reset to new circumference
            checkDashOffset.setValue(150); // Reset for the checkmark
            fillCircleScale.setValue(0); // Reset for the full circle fill
            outerRippleScale.setValue(1); // Reset for ripple effect
            outerRippleOpacity.setValue(1); // Reset for ripple opacity
            bounceScale.setValue(1); // Reset for bounce scale

            // Pulsating effect - 1 iteration
            const pulsatingEffect = AnimatedRN.sequence([
                AnimatedRN.timing(outerScale, {
                    toValue: 1.2,
                    duration: 300, // Faster pulsation
                    useNativeDriver: true,
                }),
                AnimatedRN.timing(outerScale, {
                    toValue: 1,
                    duration: 300, // Faster return
                    useNativeDriver: true,
                }),
            ]);

            // Encircling animation - 1 iteration
            const circleEncirclingAnimation = AnimatedRN.timing(circleDashOffset, {
                toValue: 0,
                duration: 500, // Faster encircle animation
                useNativeDriver: false,
            });

            // Run both pulsating and encircling animations in parallel
            AnimatedRN.parallel([pulsatingEffect, circleEncirclingAnimation]).start(() => {
                // After pulsating and encircling, start the full circle expansion
                AnimatedRN.timing(fillCircleScale, {
                    toValue: 1,
                    duration: 300, // Faster fill expansion
                    useNativeDriver: true,
                }).start(() => {
                    // After the full circle is filled, start the bounce expand scale effect
                    AnimatedRN.timing(bounceScale, {
                        toValue: 1.1, // Expand beyond original size
                        duration: 100, // Fast expansion for a "baam" effect
                        useNativeDriver: true,
                    }).start(() => {
                        // Settle the bounce back to its original state
                        AnimatedRN.timing(bounceScale, {
                            toValue: 1,
                            duration: 80, // Quick return to normal
                            useNativeDriver: true,
                        }).start(() => {
                            // After the bounce, start the checkmark animation
                            AnimatedRN.timing(checkDashOffset, {
                                toValue: 0,
                                duration: 400, // Faster checkmark animation
                                useNativeDriver: false,
                            }).start(() => {
                                // After the checkmark appears, start the outer expanding ripple (single iteration)
                                AnimatedRN.parallel([
                                    AnimatedRN.timing(outerRippleScale, {
                                        toValue: 3, // Expand outward
                                        duration: 800, // Faster expansion
                                        useNativeDriver: true,
                                    }),
                                    AnimatedRN.timing(outerRippleOpacity, {
                                        toValue: 0, // Fade out
                                        duration: 800, // Faster fade out
                                        useNativeDriver: true,
                                    }),
                                ]).start();
                            });
                        });
                    });
                });
            });

            // Cleanup function to reset animations when modal is closed
            return () => {
                outerScale.setValue(1);
                circleDashOffset.setValue(2 * Math.PI * 96); // Reset to new circumference
                checkDashOffset.setValue(150); // Reset for the checkmark
                fillCircleScale.setValue(0); // Reset for the full circle fill
                outerRippleScale.setValue(1); // Reset for ripple effect
                outerRippleOpacity.setValue(1); // Reset for ripple opacity
                bounceScale.setValue(1); // Reset for bounce scale
            };
        }
    }, [modalTrue]);


    return (
        modalTrue && (

            <View
                style={{
                    flex: 3,
                    justifyContent: 'center',
                    alignItems: 'center',

                }}
            >



                <AnimatedRN.View
                    style={{
                        position: 'absolute',
                        width: 200,
                        height: 200,
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: '#0000ff',
                        transform: [{ scale: outerRippleScale }],
                        opacity: outerRippleOpacity,
                    }}
                />

                {/* Animated View for Pulsating Effect */}
                <AnimatedRN.View
                    style={[
                        {
                            width: 200, // Width of outer circle
                            height: 200, // Height of outer circle
                            borderRadius: 100, // Rounded corners to make it a circle
                            backgroundColor: 'white', // Background color
                            shadowColor: '#0000ff',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            elevation: 3,
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                        {
                            transform: [
                                {
                                    scale: AnimatedRN.multiply(outerScale, bounceScale), // Apply both pulsating and bounce scale
                                },
                            ],
                        },
                    ]}
                >
                    <Svg width={200} height={200} viewBox="0 0 200 200">
                        {/* Outer Circle Stroke Animation (Encircling Line) */}
                        <AnimatedCircle
                            cx="100"
                            cy="100"
                            r="96"
                            stroke="#0000ff" // Blue stroke for encircling line
                            strokeWidth="5" // Thicker stroke for visibility
                            strokeDasharray={2 * Math.PI * 96} // Full circumference of the circle
                            strokeDashoffset={circleDashOffset}
                            fill="none"
                        />
                    </Svg>

                    {/* Full Circle Fill Animation */}
                    <AnimatedRN.View
                        style={{
                            position: 'absolute',
                            width: 200,
                            height: 200,
                            borderRadius: 100,
                            backgroundColor: '#0000ff', // Blue color to fill the entire circle
                            transform: [{ scale: fillCircleScale }],
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {/* Checkmark SVG */}
                        <Svg width={150} height={150} viewBox="0 0 150 150">
                            <AnimatedPath
                                d="M40 75 L65 100 L110 55" // Adjusted path coordinates for the inner circle
                                stroke="#ffffff" // White checkmark
                                strokeWidth="10"
                                strokeDasharray="150" // Path length of the checkmark
                                strokeDashoffset={checkDashOffset}
                                fill="none"
                            />
                        </Svg>
                    </AnimatedRN.View>
                </AnimatedRN.View>

                {/* Success Message */}

            </View>


        )
    );
};


const DropDownMake = React.memo(
    ({
        error,
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

                <PressableRN
                    onLayout={handleViewLayout}
                    onPress={handlePress}
                    style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: error
                            ? "#ff0000" // Error border color
                            : isActive
                                ? "#0000ff" // Active state border color
                                : "#7b9cff", // Default border color
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
                            <TextRN
                                selectable={false}
                                style={{ fontWeight: "500", color: '#71717a' }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {selectedValue || placeholder}
                            </TextRN>
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
                </PressableRN>


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
                                    <PressableRN
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
                                        <TextRN
                                            selectable={false}
                                            style={{
                                                padding: 10,
                                                fontWeight: "600",
                                                color: hoveredIndex === index ? "white" : "black",
                                            }}
                                        >
                                            {item}
                                        </TextRN>
                                    </PressableRN>
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
        prevProps.isActive === nextProps.isActive &&
        prevProps.error === nextProps.error
);
const LoginForm = ({ onLogin }) => {
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
    const location = '';
    const navigate = '';

    // Get the previous location from the state
    const from = location.state?.from?.pathname;

    const { setIsFormComplete, step, setStep, user, isError, setIsError, userEmail } = useContext(AuthContext)
    const customTheme = extendTheme({
        colors: {
            info: {
                50: '#0000ff',
                100: '#3333ff',
                500: '#627dcc', // Primary shade of the color
                900: '#4a5e99',
            },
            whiteText: {
                100: '#ffffff'
            },
            blackText: {
                100: '#000000'
            },
            primary: {
                50: '#000000'
            }

        },
        config: {

        }
    })
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const isValidPassword = (password) => {
        // Regular expression for password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;

        return passwordRegex.test(password); // Validate against regex
    };
    const textEmailRef = useRef('');
    const passwordRef = useRef('');
    const handleChangePassword = (value) => {
        passwordRef.current = value;
    };
    const handleChangeEmail = (value) => {
        textEmailRef.current = value;
    };

    const [loading, setLoading] = useState(false);


    // const handleSubmit = async () => {
    //     const textEmail = textEmailRef.current;
    //     const password = passwordRef.current;
    //     setTextEmailError(false);
    //     setPasswordError(false);
    //     setBlankEmailError(false);
    //     setBlankPasswordError(false);

    //     // Perform input validation
    //     if (password.trim() === '' || textEmail.trim() === '') {
    //         if (password.trim() === '') {
    //             setBlankPasswordError(true);
    //         }
    //         if (textEmail.trim() === '') {
    //             setBlankEmailError(true);
    //         }
    //         return;
    //     }

    //     if (!isValidEmail(textEmail)) {
    //         setTextEmailError(true);
    //         return;
    //     }

    //     if (!isValidPassword(password)) {
    //         setPasswordError(true);
    //         return;
    //     }

    //     setLoading(true);

    //     try {
    //         const userCredentialAuth = await signInWithEmailAndPassword(projectExtensionAuth, textEmail, password);

    //         if (!userCredentialAuth.user.emailVerified) {
    //             console.log('Error: Email not verified. Please verify your email.');
    //             setLoading(false);
    //             setTextEmailError(true);
    //             return;
    //         }

    //         // User's email is verified, proceed with writing user data to Firestore
    //         console.log('User logged in successfully.');



    //         console.log('User data successfully written to Firestore.');
    //     } catch (error) {
    //         // Handle login or Firestore write errors
    //         console.log('Login or Firestore error:', error);
    //         setIsError(true);
    //     }

    //     setLoading(false); // Set loading state back to false after the process is complete
    //     console.log('Submit button pressed');
    // };
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };
        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    let formWidth;
    if (screenWidth >= 1280) {
        formWidth = 625;
    } else if (screenWidth >= 992) {
        formWidth = 485;
    } else if (screenWidth >= 768) {
        formWidth = 380;
    } else if (screenWidth >= 480) {
        formWidth = 400;
    } else {

        formWidth = 320;
    }
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
    //
    const textFirst = useRef(accountData?.textFirst || '');
    const handleFirstTextChange = (value) => {
        // Regex to allow only letters, dots, commas, and spaces, but no digits
        const validInput = value.replace(/[^a-zA-Z., ]/g, '');

        // Check if the input contains any digits or starts with numbers
        if (!validInput || /[0-9]/.test(value)) {
            setNameError('Names cannot be blank and must contain only letters, dots, or commas without numbers.');
        } else {
            setNameError(''); // Clear error if the input is valid
        }

        textFirst.current = validInput; // Update the ref with valid input
    };
    const textLast = useRef(null);
    const handleLastTextChange = (value) => {
        // Regex to allow only letters, dots, commas, and spaces, but no digits
        const validInput = value.replace(/[^a-zA-Z., ]/g, '');

        // Check if the input contains any digits or starts with numbers
        if (!validInput || /[0-9]/.test(value)) {
            setNameError('Names cannot be blank and must contain only letters, dots, or commas without numbers.');
        } else {
            setNameError(''); // Clear error if the input is valid
        }

        textLast.current = validInput; // Update the ref with valid input
    };

    const [phoneNumber, setPhoneNumber] = useState(accountData?.textPhoneNumber ? accountData?.textPhoneNumber : '');
    const textPhoneNumber = useRef('');
    const handleTextPhoneNumberChange = (value) => {
        // Allow only digits
        const validInput = value.replace(/[^0-9]/g, '').trim();
        setPhoneNumber(validInput); // Update the state with valid input
    };
    const textStreet = useRef(accountData?.textStreet || '');
    const handleTextStreetChange = (value) => {
        textStreet.current = value
    }
    const textZip = useRef(accountData?.textStreet || '');
    const handleTextZipChange = (value) => {
        textZip.current = value;
    }

    //country
    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (id) => {
        setActiveDropdown(prevId => (prevId === id ? null : id));
    };
    const [countryData, setCountryData] = useState([]);
    console.log('data', countryData)
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

                    setCountryData(countryList); // Set the countries state
                }
            } else {
                console.error("CountryData document does not exist.");
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);
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
    const [selectedCountry, setSelectCountry] = useState({ name: '', code: '' });
    console.log(selectedCountry.name || '')

    const [isUser, setIsUser] = useState('');

    //country
    const [stepEmail, setStepEmail] = useState('');
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleLoginError, setGoogleLoginError] = useState(false);



    const handleNext = async () => {
        const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");

        const auth = getAuth();

        const userEmail = textEmailRef.current || user?.email || stepEmail;
        const password = passwordRef.current;
        setStepEmail(userEmail);

        // Reset error states
        setTextEmailError(false);
        setPasswordError(false);
        setBlankEmailError(false);
        setBlankPasswordError(false);
        setGoogleLoginError(false); // New error state for Google login

        // Perform input validation
        if (password.trim() === '' || userEmail.trim() === '') {
            if (password.trim() === '') {
                setBlankPasswordError(true);
            }
            if (userEmail.trim() === '') {
                setBlankEmailError(true);
            }
            return;
        }

        // if (!isValidEmail(password)) {
        //     setPasswordError(true);
        //     return;
        // }
        if (!isValidEmail(userEmail)) {
            setTextEmailError(true);
            return;
        }
        setLoading(true); // Start loading indicator to prevent rendering Step 2 prematurely
        setStep(1); // Lock step at 1 while loading

        try {
            console.log("Attempting to sign in with email and password...");

            // Try signing in with email/password
            await signInWithEmailAndPassword(auth, userEmail, password);

            console.log("Sign-in successful. Checking Firestore...");

            // Now check if the user exists in Firestore
            const response = await axios.post(checkUserExists, {
                userEmail: userEmail,
            });

            if (response.data.exists) {
                console.log("User exists in Firestore. Proceeding...");
                setIsFormComplete(true);
                await handleAutoLogin();
            } else {
                console.log("User does not exist in Firestore. Moving to Step 2.");
                setStep(2);
            }
        } catch (error) {
            console.error("Error during login:", error.code, error.message);

            // Handle errors based on the code
            if (error.code === "auth/wrong-password") {
                console.error("Wrong password for this email.");
                setPasswordError(true);
            } else if (error.code === "auth/user-not-found") {
                console.error("User not found. Prompting for signup.");
                setTextEmailError(true);
            } else if (error.code === "auth/invalid-credential") {
                console.error("This email is associated with Google. Please log in using Google.");
                setGoogleLoginError(true);
            } else {
                setIsError(true); // General error handling
            }

            setLoading(false);
            return;
        }

        setLoading(false); // Stop loading after the process is done
    };



    // const handleNext = async () => {
    //     const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");

    //     const auth = getAuth();

    //     const userEmail = textEmailRef.current || user?.email || stepEmail;
    //     const password = passwordRef.current;
    //     setStepEmail(userEmail);

    //     // Reset error states
    //     setTextEmailError(false);
    //     setPasswordError(false);
    //     setBlankEmailError(false);
    //     setBlankPasswordError(false);

    //     // Perform input validation
    //     if (password.trim() === '' || userEmail.trim() === '') {
    //         if (password.trim() === '') {
    //             setBlankPasswordError(true);
    //         }
    //         if (userEmail.trim() === '') {
    //             setBlankEmailError(true);
    //         }
    //         return;
    //     }

    //     if (!isValidEmail(userEmail)) {
    //         setTextEmailError(true);
    //         return;
    //     }

    //     if (!isValidPassword(password)) {
    //         setPasswordError(true);
    //         return;
    //     }

    //     setLoading(true); // Start loading indicator to prevent rendering Step 2 prematurely
    //     setStep(1); // Lock step at 1 while loading

    //     try {
    //         console.log('User authenticated successfully. Checking Firestore...');

    //         // Now check if the user exists in Firestore
    //         const response = await axios.post('https://asia-northeast2-samplermj.cloudfunctions.net/checkUserExists', {
    //             userEmail: userEmail,
    //         });

    //         if (response.data.exists) {
    //             console.log('User exists in Firestore. Proceeding with login...');

    //             // Check if the user has migrated and if password reset email has not been sent
    //             if (response.data.migrated === true && !response.data.passwordResetSent) {
    //                 await signInWithEmailAndPassword(auth, userEmail, password);

    //                 // Update Firestore to mark that password reset email has been sent
    //                 await axios.post('https://asia-northeast2-samplermj.cloudfunctions.net/updatePasswordResetStatus', {
    //                     userEmail: userEmail,
    //                     passwordResetSent: true,
    //                 });

    //                 setStep(3);
    //             } else {
    //                 setIsFormComplete(true);  // Set form complete before auto-login
    //                 await handleAutoLogin();  // Proceed with the next steps after Firestore check is complete
    //             }
    //         } else {
    //             await handleAutoLogin();
    //             console.log('User authenticated but does not exist in Firestore. Moving to Step 2.');
    //             setStep(2);  // Move to Step 2 only if user doesn't exist in Firestore
    //         }

    //     } catch (error) {
    //         console.error('Error checking user existence in Firestore or during login:', error);
    //         setIsError(true);
    //         setLoading(false);
    //         return;
    //     }

    //     setLoading(false); // Stop loading after the process is done
    // };

    const [isSubmitting, setIsSubmitting] = useState(false); // For controlling the loading modal
    const [isFormSubmitted, setIsFormSubmitted] = useState(false); // For controlling the "Proceed" modal
    const fetchCurrentId = async () => {
        const countsDocRef = doc(projectExtensionFirestore, "counts", "jackall_ids");
        const countsDoc = await getDoc(countsDocRef);

        if (!countsDoc.exists()) {
            throw new Error("Counts document does not exist!");
        }

        const currentId = countsDoc.data()["account-ftp-id"];
        return currentId;
    };
    const handleSubmit = async () => {
        let isValid = validateForm();

        // If any field is invalid, stop submission
        if (!isValid) {
            console.error('Error: Some fields are missing.');
            return;
        }

        setIsLoading(true);
        const userEmail = stepEmail || googleEmail || user.email;
        const generatedKeywords = generateKeywords([userEmail]);

        try {
            setIsSubmitting(true); // Show loading modal

            // === Step 1: Fetch Server Time ===
            const accountCreated = await fetchServerTime();

            // === Step 2: Submit Form Data ===
            const newClientId = await submitFormData(userEmail, accountCreated, generatedKeywords);

            // === Step 3: Submit Jackall Client Data ===
            await submitJackallClient(userEmail, newClientId);

            console.log('Form submitted successfully.');
        } catch (error) {
            console.error('Error during form submission:', error);
            setIsSubmitting(false); // Hide loading modal if there's an error
        } finally {
            handleCreatConversation2();
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (accountData?.textFirst) {
            textFirst.current = accountData.textFirst;
        }
        if (accountData?.textLast) {
            textLast.current = accountData.textLast;
        }
        if (accountData?.textPhoneNumber) {
            setPhoneNumber(accountData?.textPhoneNumber)
        }
        if (accountData?.country) {
            setSelectCountry({ name: accountData?.country })
        }
        if (accountData?.city) {
            setSelectedCity(accountData?.city)
        }
        if (accountData?.textStreet) {
            textStreet.current = accountData?.textStreet
        }
        if (accountData?.textZip) {
            textZip.current = accountData?.textZip
        }
    }, [accountData]);
    // Helper function to validate form inputs
    const validateForm = () => {
        let isValid = true;

        setNameError('');
        setBlankPhoneNumberError(false);
        setBlankCityError(false);
        setBlankAddressError(false);
        setBlankZipError(false);
        setBlankCountryError(false);

        if (!textFirst.current || !textLast.current) {
            setNameError('Names cannot be blank.');
            isValid = false;
        }

        if (!phoneNumber) {
            setBlankPhoneNumberError(true);
            isValid = false;
        }

        if (!selectedCountry.name) {
            setBlankCountryError(true);
            isValid = false;
        }

        if (!selectedCity) {
            setBlankCityError(true);
            isValid = false;
        }

        if (!textStreet.current) {
            setBlankAddressError(true);
            isValid = false;
        }

        return isValid;
    };

    // Helper function to fetch server time
    const fetchServerTime = async () => {
        const response = await axios.get(
            timeApi
        );
        const datetime = new Date(response.data.datetime);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = months[datetime.getMonth()];
        const day = datetime.getDate();
        const year = datetime.getFullYear();
        let hours = datetime.getHours();
        const minutes = datetime.getMinutes().toString().padStart(2, '0');
        const seconds = datetime.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const timezoneOffset = -datetime.getTimezoneOffset() / 60;
        const timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

        return `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds} ${ampm} ${timezone}`;
    };

    // Helper function to submit Jackall client data
    const submitJackallClient = async (userEmail, newClientId) => {
        const jackallClientData = {
            id: newClientId,
            client_name: `${textFirst.current} ${textLast.current}`,
            address: `${textZip.current} ${textStreet.current} ${selectedCity}`,
            phone: phoneNumber,
            email: userEmail,
            country_name: selectedCountry.name,
            note: '',
        };

        const jackallResponse = await fetch(
            'https://asia-northeast2-samplermj.cloudfunctions.net/uploadJackallClients',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([jackallClientData]),
            }
        );

        if (!jackallResponse.ok) {
            throw new Error('Error uploading Jackall clients data.');
        }

        console.log('Jackall clients data uploaded successfully.');
    };

    // Helper function to submit form data
    const submitFormData = async (userEmail, accountCreated, keywords) => {
        const currentId = await fetchCurrentId();
        const newId = currentId + 1;

        const formData = {
            userEmail: userEmail,
            city: selectedCity,
            country: selectedCountry.name,
            textFirst: textFirst.current,
            textLast: textLast.current,
            textPhoneNumber: phoneNumber,
            textStreet: textStreet.current,
            textZip: textZip.current,
            accountCreated: accountCreated,
            client_id: newId,
            currentId: currentId,
            keywords: keywords,
        };

        const response = await axios.post(
            submitUserData,
            formData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.data) {
            throw new Error('Error submitting form data.');
        }

        console.log('Form data submitted successfully:', response.data);
        return newId;
    };


    const [isLoading, setIsLoading] = useState(false);

    const handleAutoLogin = async () => {
        const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
        const auth = getAuth();
        try {
            const textEmail = textEmailRef.current || user.email || stepEmail;  // Get the email from the form or input field
            const password = passwordRef.current;    // Get the password from the input field

            // Log in the user with email and password
            const userCredentialAuth = await signInWithEmailAndPassword(auth, textEmail, password);

            // Check if the email is verified
            if (!userCredentialAuth.user.emailVerified) {
                console.log('Error: Email not verified. Please verify your email.');
                setLoading(false);
                setIsError(true);
                setTextEmailError(true);
                return;
            }

            console.log('User logged in successfully after form submission.');

        } catch (error) {
            setIsError(true);
            setTextEmailError(true);
            console.error('Error during automatic login after form submission:', error);
            // Handle login errors, such as incorrect password, user not found, etc.
        } finally {
            navigate(from)
        }
    };

    //

    //NEW BREAKPOINT ENDS HERE
    const [showPass, setShowPass] = useState(false);
    const [textEmailError, setTextEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [blankEmailError, setBlankEmailError] = useState(false);
    const [blankPasswordError, setBlankPasswordError] = useState(false);
    const [nameError, setNameError] = useState(''); // Empty string means no error
    const [blankPhoneNumberError, setBlankPhoneNumberError] = useState(false);
    const [blankCityError, setBlankCityError] = useState(false);
    const [blankAddressError, setBlankAddressError] = useState(false);
    const [blankZipError, setBlankZipError] = useState(false);
    const [blankCountryError, setBlankCountryError] = useState(false);
    useEffect(() => {

        setTextEmailError(false);
        setPasswordError(false);
        setBlankEmailError(false);
        setBlankPasswordError(false);
        setIsError(false)
    }, []);


    const handleGoogleLogin = async () => {

        const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
        //google auth provider
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Google User logged in:', user);
            setGoogleEmail(user.email);
        } catch (error) {
            console.error('Error during Google Sign-In:', error);
        } finally {
            navigate(from)
        }
    };
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const [buttonDimensions, setButtonDimensions] = useState({ width: 0, height: 0 })
    const handleMapLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setButtonDimensions({ width, height });
    };



    const [modalTrue, setModalTrue] = useState(false);
    const handleCreatConversation2 = () => {
        setModalTrue(!modalTrue)
        setIsFormSubmitted(true);
    };
    const listTranslateY = useRef(new AnimatedRN.Value(-50)).current; // Start FlatList below the view
    const listOpacity = useRef(new AnimatedRN.Value(0)).current;

    useEffect(() => {
        // Start animations
        listTranslateY.setValue(-50);
        listOpacity.setValue(0);

        AnimatedRN.parallel([
            AnimatedRN.timing(listTranslateY, {
                toValue: 0, // Move to its base location
                duration: 500,
                useNativeDriver: true,
            }),
            AnimatedRN.timing(listOpacity, {
                toValue: 1, // Fade in
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [step]);


    const listTranslateX = useRef(new AnimatedRN.Value(-50)).current; // Start FlatList below the view
    const listOpacityX = useRef(new AnimatedRN.Value(0)).current;

    useEffect(() => {
        // Start animations
        listTranslateX.setValue(-50);
        listOpacityX.setValue(0);

        AnimatedRN.parallel([
            AnimatedRN.timing(listTranslateX, {
                toValue: 0, // Move to its base location
                duration: 500,
                useNativeDriver: true,
            }),
            AnimatedRN.timing(listOpacityX, {
                toValue: 1, // Fade in
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [step]);


    useEffect(() => {
        if (isFormSubmitted) {
            const timer = setTimeout(() => {
                setIsFormComplete(true);
                navigate(from)
            }, 2500); // Delay of 1000ms (1 second)

            // Optional cleanup to clear the timer if component unmounts
            return () => clearTimeout(timer);
        }
    }, [isFormSubmitted]);




    const [generatedKeywords, setGeneratedKeywords] = useState([]); // Store keywords

    // The generateKeywords function
    const generateKeywords = (fields) => {
        const keywords = new Set();

        fields.forEach((field) => {
            const words = field.toLowerCase().split(" ");

            // Generate substrings for each word
            words.forEach((word) => {
                for (let i = 1; i <= word.length; i++) {
                    keywords.add(word.substring(0, i));
                }
            });
            const maxSubstringLength = 50;
            // Generate all possible substrings within a reasonable length limit
            for (let i = 0; i < field.length; i++) {
                for (let j = i + 1; j <= field.length && j - i <= maxSubstringLength; j++) {
                    keywords.add(field.substring(i, j).toLowerCase());
                }
            }
        });

        return Array.from(keywords);
    };







    return (
        <TouchableWithoutFeedback onPress={() => { setIsProfileDropdownOpen(false); toggleDropdown(null) }}>
            <View style={{ flex: 3, }}>
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
                                <TouchableOpacity onPress={() => setContactUsOpen(false)} style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                }} />

                                <View
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: 8,
                                        padding: 20,
                                        width: 425,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 5,
                                    }}
                                >
                                    {/* Modal Header */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 16,
                                        }}
                                    >
                                        <TextRN style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                                            Contact Us
                                        </TextRN>
                                        <PressableRN onPress={() => setContactUsOpen(false)}>
                                            <TextRN style={{ fontSize: 18, fontWeight: 'bold', color: '#555' }}>×</TextRN>
                                        </PressableRN>
                                    </View>

                                    {/* Contact Items */}
                                    <View style={{ marginBottom: 16, alignItems: 'flex-start' }}>
                                        <TextRN style={{ fontSize: 16, color: '#555', marginBottom: 8 }}>
                                            📧 info@realmotor.jp
                                        </TextRN>
                                        <TextRN style={{ fontSize: 16, color: '#555', marginBottom: 8 }}>
                                            📱 WhatsApp: +81 803 541 9928
                                        </TextRN>
                                        <TextRN style={{ fontSize: 16, color: '#555', marginBottom: 16 }}>
                                            ☎ Telephone: +81 565 85 0602
                                        </TextRN>
                                        <TextRN
                                            style={{ fontSize: 16, color: '#007bff', marginBottom: 8 }}
                                            onPress={() => Linking.openURL('https://www.facebook.com/RealMotorJP')}
                                        >
                                            📘 Facebook Page
                                        </TextRN>
                                        <TextRN
                                            style={{ fontSize: 16, color: '#007bff' }}
                                            onPress={() => Linking.openURL('https://www.instagram.com/realmotorjp')}
                                        >
                                            📷 Instagram Profile
                                        </TextRN>
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
                                        <PressableRN onPress={() => setOpenDetails(false)} style={{ alignSelf: 'flex-end' }}>
                                            <TextRN style={{ fontSize: 25, fontWeight: 'bold', color: '#555' }}>×</TextRN>
                                        </PressableRN>
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
                {isLoading && (
                    <Modal
                        transparent={true}
                        visible={isLoading}
                        onRequestClose={() => { }}
                        style={{ zIndex: 99 }}
                    >
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <View style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                            }} />
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    </Modal>

                )}
                <NewBackgroundImage>

                    {!isFormSubmitted && step === 1 && (
                        <AnimatedRN.View style={{
                            transform: [{ translateY: listTranslateY }],
                            opacity: listOpacity,
                            width: '100%', maxWidth: 500, height: '100%', maxHeight: screenWidth <= 605 ? 600 : 630, paddingVertical: 5, padding: screenWidth <= 605 ? 5 : null
                        }}>
                            <View
                                style={{
                                    width: '100%',
                                    backgroundColor: '#fff',
                                    height: '100%',
                                    borderWidth: 1,
                                    borderColor: '#ececec',
                                    elevation: screenWidth > 768 ? 3 : 0, // Disable elevation for smaller screens
                                    shadowColor: screenWidth > 768 ? '#000' : 'transparent', // No shadow color for smaller screens
                                    shadowOffset: screenWidth > 768 ? { width: 0, height: 1 } : { width: 0, height: 0 },
                                    shadowOpacity: screenWidth > 768 ? 0.3 : 0, // Disable shadow opacity for smaller screens
                                    shadowRadius: screenWidth > 768 ? 3 : 0, // Disable shadow radius for smaller screens
                                    borderRadius: 5,
                                    paddingHorizontal: screenWidth <= 605 ? 10 : 10,
                                    flex: 1,
                                    justifyContent: 'space-between',
                                    marginVertical: screenWidth <= 605 ? 10 : 5,
                                }}
                            >
                                <View style={{ width: '100%', flex: 1 }}>
                                    <NativeBaseProvider theme={customTheme}>
                                        {step === 1 && (

                                            <View>

                                                <View style={{ width: '100%', padding: 20, alignItems: 'flex-start', justifyContent: 'center' }}>
                                                    <TextRN style={{ fontWeight: 'bold', fontSize: 32, textAlign: 'left', color: '#0000ff' }}>Log in to continue</TextRN>
                                                    <TextRN style={{ fontWeight: '400', fontSize: 22, textAlign: 'left', color: '#aaa' }}>Welcome Back!</TextRN>
                                                </View>

                                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                                    <Input
                                                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                        _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                        _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                        InputLeftElement={<Icon as={<MaterialIcons name="person" />} ml={2} size={5} color="muted.400" />}
                                                        placeholder="Email"
                                                        onChangeText={handleChangeEmail}
                                                        style={{ flex: 1, padding: 15, color: '#000', borderColor: '#0000ff' }}
                                                        w={'90%'}
                                                        _invalid={{ borderColor: 'red.500' }}
                                                        isInvalid={textEmailError || blankEmailError || isError || googleLoginError}
                                                        focusOutlineColor={isError || textEmailError || blankEmailError || googleLoginError ? 'red.500' : 'info.50'}
                                                    />
                                                    {blankEmailError && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                            <MaterialIcons name="error" size={10} color="red" />
                                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Email cannot be blank!</TextRN>
                                                        </View>
                                                    )}

                                                    {textEmailError && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                            <MaterialIcons name="error" size={10} color="red" />
                                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Account does not exist.</TextRN>
                                                        </View>
                                                    )}
                                                    {googleLoginError && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                            <MaterialIcons name="error" size={10} color="red" />
                                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>This email is registered with Google. Please log in using Google.</TextRN>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                                    <Input
                                                        _hover={{ borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                        _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                        _focusVisible={{ outlineColor: "info.50", borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                        InputRightElement={<PressableRN onPress={() => setShowPass(!showPass)}><Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" /></PressableRN>}
                                                        placeholder="Password"
                                                        onChangeText={handleChangePassword}
                                                        style={{ flex: 1, padding: 15, color: '#000', borderColor: '#0000ff' }}
                                                        w={'90%'}
                                                        type={showPass ? "text" : "password"}
                                                        _invalid={{ borderColor: 'red.500' }}
                                                        isInvalid={passwordError || blankPasswordError || isError}
                                                        focusOutlineColor={isError || passwordError || blankPasswordError ? 'red.500' : 'info.50'}
                                                    />
                                                    {passwordError && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                            <MaterialIcons name="error" size={10} color="red" />
                                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>
                                                                Password must include uppercase, lowercase, number, special character, and be 8+ characters.
                                                            </TextRN>
                                                        </View>
                                                    )}

                                                    {blankPasswordError && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                            <MaterialIcons name="error" size={10} color="red" />
                                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password cannot be blank!</TextRN>
                                                        </View>
                                                    )}
                                                    {isError && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                            <MaterialIcons name="error" size={10} color="red" />
                                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Invalid password.</TextRN>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    <View style={{ width: '90%', alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: 5 }}>
                                                        <TouchableOpacity onPress={() => navigate('/ChangePassword')}>
                                                            <TextRN style={{ justifyContent: 'flex-end', color: '#0000ff' }}>Forgot Password?</TextRN>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{ width: '90%', justifyContent: 'flex-start', marginTop: 10 }}>
                                                        <Checkbox _checked={{ bg: 'info.50', borderColor: 'info.50', _hover: { bg: 'info.100', borderColor: 'info.100' } }} _hover={{ bg: 'white', borderColor: 'info.100' }} style={{ alignItems: 'center' }}><TextRN style={{ fontSize: 14 }}>Remember Me</TextRN></Checkbox>
                                                    </View>
                                                </View>

                                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                                    <Button
                                                        onLayout={handleMapLayout}
                                                        w={'90%'}
                                                        onPress={handleNext}
                                                        _pressed={{ bg: "info.100" }}
                                                        bg={loading ? "gray.300" : "info.50"}  // Change background color when loading
                                                        _hover={{ bg: "info.100" }}
                                                        isDisabled={loading} // Disable the button while loading
                                                    >
                                                        {loading ? (
                                                            <ActivityIndicator size="small" color="#ffffff" />  // Show spinner when loading
                                                        ) : (
                                                            "Log in"  // Default button text
                                                        )}
                                                    </Button>
                                                </View>

                                                <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                                                    <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '40%' }} />
                                                    <TextRN style={{ paddingHorizontal: 10, color: '#aaa' }}>or</TextRN>
                                                    <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '40%' }} />
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>

                                                    <PressableRN
                                                        onPress={handleGoogleLogin}
                                                        style={({ pressed, hovered }) => [
                                                            {
                                                                backgroundColor: hovered ? '#f7f7f7' : '#fff',
                                                                opacity: pressed ? 0.5 : 1,
                                                                borderRadius: 5,
                                                                width: buttonDimensions.width,
                                                                height: buttonDimensions.height,
                                                                borderWidth: 2,
                                                                borderColor: '#ececec',
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                paddingVertical: 5,
                                                                padding: 5

                                                            }
                                                        ]}
                                                    >

                                                        <GoogleIcon />
                                                        <TextRN style={{ color: 'black', fontWeight: '600', textAlign: 'center' }}>Sign in with Google</TextRN>
                                                    </PressableRN>
                                                    {/* <AntDesign name="twitter" size={30} color={'#1DA1F2'} /> */}
                                                </View>




                                            </View>
                                        )}
                                    </NativeBaseProvider>
                                    {step === 1 && (
                                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 30 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                <TextRN>Don't have an account yet?</TextRN>
                                                <TouchableOpacity style={{ cursor: 'pointer' }} onPress={() => navigate('/SignUp')}>
                                                    <TextRN style={{ color: '#0000ff' }}> Sign Up</TextRN>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    )}

                                </View>
                            </View>
                        </AnimatedRN.View>
                    )}


                    {isUser === 'Changed password.' && step === 3 && (
                        <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                            <View style={{ alignItems: 'center', marginVertical: 20 }}>

                                <View style={{ borderRadius: 150, position: 'relative', marginBottom: 20 }}>
                                    <Entypo
                                        name="check"
                                        size={100}
                                        color={'#fff'}
                                        style={{ position: 'absolute', top: 25, left: 25, zIndex: 2 }}
                                    />
                                    <View
                                        style={{
                                            width: 150,
                                            height: 150,
                                            borderRadius: 150,
                                            backgroundColor: '#00cc00',
                                        }}
                                    />
                                </View>

                                <TextRN style={{ fontWeight: 'bold', fontSize: 24, color: '#000', marginBottom: 10 }}>
                                    Email successfully sent for old accounts.
                                </TextRN>
                                <TextRN style={{ fontSize: 16, color: '#666' }}>
                                    Kindly follow the instructions in the email we sent.
                                </TextRN>
                                <PressableRN
                                    onPress={() => setStep(1)}
                                    style={({ pressed }) => ({
                                        backgroundColor: pressed ? '#0000cc' : '#0000ff',
                                        padding: 15,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 200,
                                        marginTop: 20
                                    })}
                                >
                                    <TextRN style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Go to Login</TextRN>
                                </PressableRN>
                            </View>
                        </View>

                    )}


                    {!isFormSubmitted && step === 2 && (

                        <AnimatedRN.View style={{
                            transform: [{ translateX: listTranslateX }],
                            opacity: listOpacityX,
                            padding: 10,
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            margin: 10,
                            maxWidth: 700,
                            width: '100%',
                            shadowColor: '#000', // Black color shadow
                            shadowOffset: { width: 0, height: 5 }, // Offset of the shadow
                            shadowOpacity: 0.25, // Opacity of the shadow
                            shadowRadius: 6.68, // Radius of the shadow blur
                            elevation: 10, // Shadow depth on Android
                        }}>
                            <View style={{ alignItems: 'flex-start', padding: 10, width: '100%', }}>
                                <TextRN style={{ fontSize: 24, fontWeight: 'bold', color: '#0000dd' }}>
                                    New User Log In
                                </TextRN>
                                <TextRN style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                                    Kindly complete the form to gain full access to all features of the website.
                                </TextRN>
                            </View>

                            <View style={{ padding: 10, width: '100%', alignSelf: 'center', marginTop: screenWidth < 425 ? 5 : 3 }}>
                                <View style={{
                                    flexDirection: screenWidth < 425 ? 'column' : 'row',
                                    alignItems: screenWidth < 425 ? null : 'center',
                                    marginBottom: screenWidth < 425 ? 5 : 5,
                                    justifyContent: 'center',
                                    width: '100%',
                                }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 12,
                                            paddingLeft: 10,
                                            borderWidth: 1.2,
                                            borderColor: nameError ? 'red' : '#7b9cff',
                                            borderRadius: 2,
                                            width: '100%',
                                            zIndex: -99,
                                            marginRight: screenWidth >= 425 ? 10 : 0,

                                        }}
                                        defaultValue={accountData?.textFirst || ''}
                                        placeholder='First Name'
                                        placeholderTextColor={'#71717a'}
                                        onChangeText={handleFirstTextChange}
                                    />
                                    {screenWidth < 425 && <View style={{ marginVertical: 5 }} />}
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 12,
                                            paddingLeft: 10,
                                            borderWidth: 1.2,
                                            borderColor: nameError ? 'red' : '#7b9cff',
                                            borderRadius: 2,
                                            width: '100%',
                                            zIndex: -99

                                        }}
                                        defaultValue={accountData?.textLast || ''}
                                        placeholder='Last Name'
                                        placeholderTextColor={'#71717a'}
                                        onChangeText={handleLastTextChange}
                                    />
                                </View>

                                {nameError === 'Names cannot be blank and must contain only letters, dots, or commas.' && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginVertical: screenWidth < 425 ? 5 : 8 }}>
                                        <MaterialIcons name="error" size={12} color="red" />
                                        <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>{nameError}</TextRN>
                                    </View>
                                )}

                                <View style={{ marginTop: 5, zIndex: -99 }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 12,
                                            paddingLeft: 10,
                                            borderWidth: 1.2,
                                            borderColor: blankPhoneNumberError ? 'red' : '#7b9cff',
                                            borderRadius: 2,
                                            width: '100%',
                                            marginBottom: screenWidth < 425 ? 5 : 0,
                                        }}
                                        placeholder='Telephone Number'
                                        inputMode="tel"
                                        placeholderTextColor={'#71717a'}
                                        onChangeText={handleTextPhoneNumberChange}
                                        defaultValue={accountData?.textPhoneNumber ? accountData?.textPhoneNumber : phoneNumber}
                                    />
                                    {blankPhoneNumberError && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start', marginVertical: screenWidth < 425 ? 5 : 0 }}>
                                            <MaterialIcons name="error" size={10} color="red" />
                                            <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Telephone Number cannot be blank!</TextRN>
                                        </View>
                                    )}
                                </View>

                                <View style={{
                                    flexDirection: screenWidth < 425 ? 'column' : 'row',
                                    alignItems: screenWidth < 425 ? null : 'center',
                                    marginTop: screenWidth < 425 ? 5 : 10,
                                }}>
                                    <View style={{ flex: 1, marginBottom: screenWidth < 425 ? 10 : 0 }}>
                                        <DropDownMake
                                            error={blankCountryError}
                                            id={`country`}
                                            data={countryData.map((country) => country.name)} // Display country names
                                            selectedValue={selectedCountry.name || ""} // Show selected country name
                                            handleSelect={(name) => {
                                                const selected = countryData.find((country) => country.name === name);
                                                if (selected) {
                                                    setSelectCountry({ code: selected.code, name: selected.name })  // Set the country code
                                                    fetchCities(selected.code); // Fetch cities for the selected country
                                                }

                                            }}
                                            placeholder="Select Country"
                                            isActive={activeDropdown === `country`}
                                            toggleDropdown={(id) => toggleDropdown(id)}
                                        />
                                        {blankCountryError && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start', zIndex: -99, marginVertical: screenWidth < 425 ? 5 : 0 }}>
                                                <MaterialIcons name="error" size={10} color="red" />
                                                <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Country cannot be blank!</TextRN>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ marginLeft: screenWidth >= 425 ? 10 : 0, flex: 1, marginBottom: screenWidth < 425 ? 5 : 0, zIndex: -99 }}>
                                        <DropDownMake
                                            error={blankCityError}
                                            id={`city`}
                                            data={cities} // Display country names
                                            selectedValue={selectedCity || ""} // Show selected country name
                                            handleSelect={(name) => {
                                                setSelectedCity(name)
                                            }}
                                            placeholder="Select City"
                                            isActive={activeDropdown === `city`}
                                            toggleDropdown={(id) => toggleDropdown(id)}
                                        />
                                        {blankCityError && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start', marginVertical: screenWidth < 425 ? 5 : 0 }}>
                                                <MaterialIcons name="error" size={10} color="red" />
                                                <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>City cannot be blank!</TextRN>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={{

                                    flexDirection: screenWidth < 425 ? 'column' : 'row',
                                    alignItems: screenWidth < 425 ? null : 'center',
                                    marginTop: screenWidth < 425 ? 5 : 10,
                                    zIndex: -99,
                                }}>
                                    <View style={{ flex: 1, marginBottom: screenWidth < 425 ? 10 : 0 }}>
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                paddingVertical: 12,
                                                paddingLeft: 10,
                                                borderWidth: 1.2,
                                                borderColor: blankAddressError ? 'red' : '#7b9cff',
                                                borderRadius: 2,
                                                width: '100%',
                                            }}
                                            placeholder='Address'
                                            defaultValue={accountData?.textStreet || ''}
                                            placeholderTextColor={'#71717a'}
                                            onChangeText={(e) => handleTextStreetChange(e)}
                                        />
                                        {blankAddressError && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start', marginVertical: screenWidth < 425 ? 5 : 0 }}>
                                                <MaterialIcons name="error" size={10} color="red" />
                                                <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Address cannot be blank!</TextRN>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ marginLeft: screenWidth >= 425 ? 10 : 0, flex: 1, marginBottom: screenWidth < 425 ? 5 : 0 }}>
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                paddingVertical: 12,
                                                paddingLeft: 10,
                                                borderWidth: 1.2,
                                                borderColor: blankZipError ? 'red' : '#7b9cff',
                                                borderRadius: 2,
                                                width: '100%',
                                            }}
                                            placeholder='Zip Code'
                                            defaultValue={accountData?.textZip || ''}
                                            placeholderTextColor={'#71717a'}
                                            onChangeText={(e) => handleTextZipChange(e)}
                                        />
                                        {blankZipError && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start', marginVertical: screenWidth < 425 ? 5 : 0 }}>
                                                <MaterialIcons name="error" size={10} color="red" />
                                                <TextRN style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Zip Code cannot be blank!</TextRN>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>


                            <View style={{ padding: 10, width: '100%', alignSelf: 'center', zIndex: -99, }}>
                                <PressableRN
                                    onPress={() => { handleSubmit(); }}
                                    // onPress={handleCreatConversation2}
                                    style={({ pressed, hovered }) => ({
                                        backgroundColor: pressed
                                            ? '#0000cc'
                                            : hovered
                                                ? '#0000d2'
                                                : '#0000ff',
                                        padding: 15,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        marginBottom: 10,

                                        alignSelf: 'center',
                                    })}
                                >
                                    <TextRN
                                        selectable={false}
                                        style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
                                    >
                                        Submit
                                    </TextRN>
                                </PressableRN>
                            </View>
                        </AnimatedRN.View>

                    )}
                    {isFormSubmitted && (
                        <View style={{
                            padding: 20,
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            margin: 10,
                            maxWidth: 500,
                            width: '100%',
                            shadowColor: '#000', // Black color shadow
                            shadowOffset: { width: 0, height: 5 }, // Offset of the shadow
                            shadowOpacity: 0.25, // Opacity of the shadow
                            shadowRadius: 6.68, // Radius of the shadow blur
                            elevation: 10, // Shadow depth on Android
                        }}>
                            <SuccessModal modalTrue={modalTrue} handleCreatConversation2={handleCreatConversation2} />
                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                <TextRN style={{ fontSize: 24, fontWeight: '600', color: '#7b9cff', marginBottom: 10 }}>
                                    Sign Up Completed!
                                </TextRN>
                                <TextRN style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                                    Your sign-up process is complete.
                                </TextRN>
                            </View>
                            <PressableRN
                                onPress={() => { navigate('/'); }} // Replace with your navigation handler
                                style={({ pressed, hovered }) => ({
                                    backgroundColor: pressed ? '#0000cc' : hovered ? '#0000e6' : '#0000ff', // Slightly darker on hover and pressed
                                    padding: 15,
                                    borderRadius: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    maxWidth: 300,
                                    marginTop: 20,
                                })}
                            >
                                <TextRN
                                    selectable={false}
                                    style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
                                >
                                    Proceed to Homepage
                                </TextRN>
                            </PressableRN>
                        </View>

                    )}


                </NewBackgroundImage>
            </View>
        </TouchableWithoutFeedback>
    )

};
export default LoginForm;
