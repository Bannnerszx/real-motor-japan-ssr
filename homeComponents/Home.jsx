
import dynamic from 'next/dynamic';
import { StyleSheet, Text, View, Animated, TouchableWithoutFeedback, Dimensions, FlatList, Image, ScrollView, TouchableOpacity, Linking, Modal, Pressable } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import Svg, { Path, G, Mask, Defs, ClipPath } from "react-native-svg";
const Ionicons = dynamic(() => import('@expo/vector-icons/Ionicons'), { ssr: false });
const FontAwesome5 = dynamic(() => import('@expo/vector-icons/FontAwesome5'), { ssr: false });
const AntDesign = dynamic(() => import('@expo/vector-icons/AntDesign'), { ssr: false });
const Entypo = dynamic(() => import('@expo/vector-icons/Entypo'), { ssr: false });
const Feather = dynamic(() => import('@expo/vector-icons/Feather'), { ssr: false });
const SearchQuery = dynamic(() => import('./SearchQuery'), { ssr: false });
const SearchByMakes = dynamic(() => import('./SearchByMakes'), { ssr: false });
const SearchByTypes = dynamic(() => import('./SearchByTypes'), { ssr: false });
const HowToBuySection = dynamic(() => import('./HowToBuySection'), { ssr: false });
import StickyFooter from './StickyFooter';
const OptimizeCarousel = dynamic(() => import('./OptimizeCarousel'), { ssr: false });


const HomePage = ({ }) => {

    const [carModels, setCarModels] = useState('');
    const [bodyType, setBodyType] = useState([]);
    const [isFetchingBodyType, setIsFetchingBodyType] = useState(false);
    const [makes, setMakes] = useState([]);
    const [carMakes, setCarMakes] = useState('');
    const [isFetchingMakes, setIsFetchingMakes] = useState(false);
    const [models, setModels] = useState([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [carBodyType, setCarBodyType] = useState('');
    const [carMinYear, setCarMinYear] = useState('');
    const [carMaxYear, setCarMaxYear] = useState('');
    //global text input
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [currentCurrencyGlobal, setCurrentCurrencyGlobal] = useState({});
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [currentCurrency, setCurrentCurrency] = useState(null);
    const [isFetchingCurrency, setIsFetchingCurrency] = useState(false);

    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const scrollThreshold = 1; // Customize the scroll threshold value

    //dropdown bodytype

    //dropdown Country

    //dropdown Price
    //Minprice
    const [minPrice, setMinPrice] = useState('');
    const minPriceData = [
        '1000',
        '3000',
        '5000',
        '10000',
        '15000',
        '20000',
    ];

    //MinPrice
    //Minprice
    const [maxPrice, setMaxPrice] = useState('');
    const maxPriceData = [
        '1000',
        '3000',
        '5000',
        '10000',
        '15000',
        '20000',
    ];

    //MinPrice



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



    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //global text input

    //currency



    //currency


    //carousel

    const carouselRef = useRef(null);
    const carouselWidth = screenWidth
    const carouselHeight = carouselWidth * 0.5; // Maintain an aspect ratio (e.g., 4:3)


    //carousel



    //FETCH NEW ARRIVALS

    //FETCH NEW ARRIVALS
    const searchKeywords = useRef(null)

    const handleTextChange = (value) => {
        searchKeywords.current = value

    };

    useEffect(() => {
        document.documentElement.scrollTop = 0;  // Scroll to the top
        document.body.scrollTop = 0;  // For older browsers (or in case body is scrollable)
    }, []);

    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (id) => {
        setActiveDropdown(prevId => (prevId === id ? null : id));
    };
    useEffect(() => {
        setCarModels('');
        setModels([]); // Reset to default when carMakes changes
    }, [carMakes]);
    const handleOutsidePress = () => {
        setActiveDropdown(null);
        setModalVisible(false);
        setIsProfileDropdownOpen(null) // Close dropdowns on outside press
    };
    const currentYear = new Date().getFullYear();
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    const [isActive, setIsActive] = useState(false);
    const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [carouselDimension, setCarouselDimension] = useState({ width: 0, height: 0 });
    const handleCarouselLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setCarouselDimension({ width, height });
    };
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(null);
    const listTranslateY = useRef(new Animated.Value(50)).current; // Start FlatList below the view
    const listOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(listTranslateY, {
                toValue: 0, // Move to its base location
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(listOpacity, {
                toValue: 1, // Fade in
                duration: 1000,
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

    //how to buy
    const steps = [
        { id: "1", icon: <Feather name='user-plus' size={34} color='black' />, title: "Create an account", description: "Sign up to get started" },
        { id: "2", icon: <FontAwesome5 name='car' size={34} color='black' />, title: "Find cars", description: "Browse our extensive inventory" },
        { id: "3", icon: <Feather name='message-square' size={34} color='black' />, title: "Negotiate", description: "Get the best deal possible" },
        { id: "4", icon: <AntDesign name='bank' size={34} color='black' />, title: "Pay", description: "Secure and easy payment options" },
        { id: "5", icon: <Feather name='truck' size={34} color='black' />, title: "Deliver", description: "Get your car delivered to you" },
    ];
    let isMobile = screenWidth > 440 ? 120 : 60
    const brand = [
        {
            id: '1', name: 'TOYOTA', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Path d="M12 4.236c-6.627 0-12 3.476-12 7.762 0 4.289 5.373 7.766 12 7.766s12-3.476 12-7.766-5.373-7.762-12-7.762zm0 12.196c-.986 0-1.79-1.942-1.84-4.385a21.093 21.093 0 003.68 0c-.05 2.442-.854 4.385-1.84 4.385zm-1.719-6.324c.268-1.727.937-2.953 1.719-2.953s1.45 1.226 1.719 2.953a19.436 19.436 0 01-3.438 0zM12 5.358c-1.287 0-2.385 1.928-2.79 4.619-2.44-.38-4.143-1.248-4.143-2.256 0-1.36 3.104-2.461 6.933-2.461 3.83 0 6.933 1.102 6.933 2.461 0 1.008-1.703 1.876-4.143 2.256-.405-2.69-1.503-4.618-2.79-4.618zm-10.28 6.35c0-1.315.507-2.55 1.388-3.61-.009.074-.015.15-.015.226 0 1.657 2.485 3.07 5.953 3.59-.003.12-.003.242-.003.364 0 3.09.866 5.705 2.063 6.593-5.26-.317-9.385-3.403-9.385-7.163zm11.174 7.163c1.197-.888 2.063-3.504 2.063-6.593 0-.123-.002-.243-.003-.363 3.466-.52 5.953-1.932 5.953-3.591 0-.076-.006-.152-.015-.226.881 1.063 1.387 2.295 1.387 3.61 0 3.76-4.125 6.846-9.385 7.163zm0 0z" />
                </Svg>
        },
        {
            id: '2', name: 'NISSAN', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Path d="M20.576 14.955l-.01.028c-1.247 3.643-4.685 6.086-8.561 6.086-3.876 0-7.32-2.448-8.562-6.09l-.01-.029H.71v.329l1.133.133c.7.08.847.39 1.038.78l.048.096c1.638 3.495 5.204 5.752 9.08 5.752 3.877 0 7.443-2.257 9.081-5.747l.048-.095c.19-.39.338-.7 1.038-.781l1.134-.134v-.328zM3.443 9.012c1.247-3.643 4.686-6.09 8.562-6.09 3.876 0 7.319 2.447 8.562 6.09l.01.028h2.728v-.328l-1.134-.133c-.7-.081-.847-.39-1.038-.781l-.047-.096C19.448 4.217 15.88 1.96 12.005 1.96c-3.881 0-7.443 2.257-9.081 5.752l-.048.095c-.19.39-.338.7-1.038.781l-1.133.133v.329h2.724zm13.862 1.586l-1.743 2.795h.752l.31-.5h2.033l.31.5h.747l-1.743-2.795zm1.033 1.766h-1.395l.7-1.124zm2.81-1.066l2.071 2.095H24v-2.795h-.614v2.085l-2.062-2.085h-.795v2.795h.619zM0 13.393h.619v-2.095l2.076 2.095h.781v-2.795h-.619v2.085L.795 10.598H0zm4.843-2.795h.619v2.795h-.62zm4.486 2.204c-.02.005-.096.005-.124.005H6.743v.572h2.5c.019 0 .167 0 .195-.005.51-.048.743-.472.743-.843 0-.381-.243-.79-.705-.833-.09-.01-.166-.01-.2-.01H7.643a.83.83 0 01-.181-.014c-.129-.034-.176-.148-.176-.243 0-.086.047-.2.18-.238a.68.68 0 01.172-.014h2.357v-.562H7.6c-.1 0-.176.004-.238.014a.792.792 0 00-.695.805c0 .343.214.743.685.81.086.009.205.009.258.009H9.2c.029 0 .1 0 .114.005.181.023.243.157.243.276a.262.262 0 01-.228.266zm4.657 0c-.02.005-.096.005-.129.005H11.4v.572h2.5c.019 0 .167 0 .195-.005.51-.048.743-.472.743-.843 0-.381-.243-.79-.705-.833-.09-.01-.166-.01-.2-.01H12.3a.83.83 0 01-.181-.014c-.129-.034-.176-.148-.176-.243 0-.086.047-.2.18-.238a.68.68 0 01.172-.014h2.357v-.562h-2.395c-.1 0-.176.004-.238.014a.792.792 0 00-.695.805c0 .343.214.743.686.81.085.009.204.009.257.009h1.59c.029 0 .1 0 .114.005.181.023.243.157.243.276a.267.267 0 01-.228.266z" />
                </Svg>
        },
        {
            id: '3', name: 'HONDA', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Path d="M23.903 6.87c-.329-3.219-2.47-3.896-4.354-4.205-.946-.16-2.63-.299-3.716-.339-.946-.06-3.168-.09-3.835-.09-.658 0-2.89.03-3.836.09-1.076.04-2.77.18-3.716.339C2.563 2.984.42 3.66.092 6.869c-.08.877-.1 2.023-.09 3.248.03 2.032.2 3.407.3 4.364.069.657.338 2.62.687 3.636.478 1.395.916 1.803 1.424 2.222.937.757 2.471.996 2.79 1.056 1.733.309 5.24.368 6.785.368 1.544 0 5.05-.05 6.784-.368.329-.06 1.863-.29 2.79-1.056.508-.419.946-.827 1.424-2.222.35-1.016.628-2.979.698-3.636.1-.957.279-2.332.299-4.364.04-1.225.01-2.371-.08-3.248m-1.176 5.4c-.189 2.57-.418 4.105-.747 5.22-.289.977-.637 1.624-1.165 2.093-.867.787-2.063.956-2.76 1.056-1.514.229-4.055.299-6.057.299-2.003 0-4.544-.08-6.058-.3-.697-.099-1.893-.268-2.76-1.055-.518-.469-.876-1.126-1.155-2.093-.329-1.105-.558-2.65-.747-5.22-.11-1.544-.09-4.055.08-5.4.258-2.012 1.255-3.019 3.387-3.397.996-.18 2.34-.309 3.606-.369 1.016-.07 2.7-.1 3.637-.09.936-.01 2.62.03 3.636.09 1.275.06 2.61.19 3.606.369 2.142.378 3.139 1.395 3.388 3.397.199 1.345.229 3.856.11 5.4M17.526 3.88c-.548 2.461-.767 3.587-1.216 5.37-.428 1.714-.767 3.298-1.335 4.065-.587.777-1.365.947-1.893 1.006-.279.03-.478.04-1.066.05-.597 0-.797-.02-1.076-.05-.528-.06-1.315-.229-1.892-1.006-.578-.767-.907-2.351-1.335-4.065-.469-1.773-.678-2.909-1.236-5.37 0 0-.548.02-.797.04-.329.02-.588.05-.867.09 0 0 .32 5.061.459 7.203.15 2.252.418 6.057.667 8.927 0 0 .458.07 1.226.12.807.049 1.165.049 1.165.049.329-1.265.747-3.019 1.206-3.766.378-.608.966-.677 1.295-.717.518-.07.956-.08 1.166-.08.199-.01.637 0 1.165.08.329.05.917.11 1.295.717.469.747.877 2.5 1.206 3.766 0 0 .358-.01 1.165-.05a11.35 11.35 0 001.226-.12c.249-2.869.518-6.665.667-8.926.14-2.142.459-7.203.459-7.203-.28-.04-.538-.07-.867-.09-.23-.02-.787-.04-.787-.04z" />
                </Svg>
        },
        {
            id: '4', name: 'MITSUBISHI', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Path
                        fill={'red'}
                        d="M8 22.38H0l4-6.92h8zm8 0h8l-4-6.92h-8zm0-13.84l-4-6.92-4 6.92 4 6.92z" />
                </Svg>
        },
        {
            id: '5', name: 'MERCEDES-BENZ', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="14.81 -30.400999999999996 232.379 232.379"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Path
                        d="M163.92 146.99h8.648v2.002h-8.648v-2.002zM20.076 134.848l-.773 20.094v.349c0 1.701.501 2.052 3.213 2.244v.931c-1.974-.152-2.751-.191-3.833-.191-1.085 0-1.859.039-3.872.191v-.931c2.709-.192 3.098-.503 3.175-2.593l.813-19.008v-.229c0-1.784-.543-2.17-3.212-2.324v-.97c1.507.117 2.088.156 3.173.156a30.25 30.25 0 003.679-.191l7.198 19.586 7.315-19.586c1.745.152 2.557.191 3.719.191.964 0 1.586-.039 3.056-.156v.97c-2.631.154-3.215.54-3.215 2.282v.271l.427 19.008c.042 2.09.388 2.398 3.176 2.593v.931c-2.438-.232-3.369-.312-4.839-.312-1.473 0-2.402.076-4.84.312v-.931c2.631-.153 3.212-.581 3.212-2.397v-.191l-.345-20.055-6.39 17.264-.463 1.279-.542 1.43-.506 1.476-.425 1.276h-.581l-.424-1.238-.544-1.514-.541-1.508-.465-1.354-6.346-17.155zm29.067 12.504c.388-4.451 1.857-6.732 4.335-6.732 2.517 0 3.794 2.167 4.025 6.732h-8.36zm5.034 10.142c-3.523 0-5.074-2.71-5.109-8.749h11.536c-.079-5.961-2.518-9.136-7.087-9.136-4.642 0-7.547 3.756-7.547 9.718 0 5.961 2.906 9.444 7.897 9.444 3.794 0 6.273-2.363 6.773-6.349h-1.55c-.464 3.29-2.167 5.072-4.913 5.072zm8.73-16.453v-.695c2.205-.193 3.523-.425 5.109-.891.194 1.434.271 2.051.348 3.214v.427c.854-2.207 2.515-3.486 4.53-3.486 1.934 0 3.368 1.279 3.368 3.139 0 1.123-.658 1.857-1.626 1.857-.89 0-1.586-.543-1.586-1.315 0-.077.04-.229.075-.39l.077-.385v-.352c0-.542-.465-.928-1.162-.928-2.01 0-3.287 2.438-3.287 6.271v8.089c0 1.668.385 1.977 2.748 2.092v.775c-2.132-.191-2.944-.234-4.299-.234-1.393 0-2.205.043-4.333.234v-.775c2.359-.115 2.785-.424 2.785-2.092v-12.654c-.037-1.666-.233-1.857-2.243-1.898l-.504-.003zm28.164-1.777v6.389h-.854c-.697-3.371-2.128-4.996-4.488-4.996-2.906 0-4.607 3.138-4.607 8.673 0 5.418 1.509 8.167 4.489 8.167 2.4 0 3.832-1.702 4.297-5.107h1.586c-.504 4.143-2.71 6.387-6.192 6.387-4.491 0-7.547-3.795-7.547-9.444 0-5.771 3.095-9.718 7.663-9.718 1.665 0 2.71.427 3.951 1.627l1.042-1.975h.661v-.003zm6.356 8.088c.387-4.451 1.856-6.732 4.335-6.732 2.516 0 3.793 2.167 4.023 6.732h-8.358zm5.032 10.142c-3.523 0-5.07-2.71-5.109-8.749h11.534c-.077-5.961-2.518-9.136-7.082-9.136-4.648 0-7.552 3.756-7.552 9.718 0 5.961 2.903 9.444 7.9 9.444 3.793 0 6.271-2.363 6.772-6.349h-1.548c-.464 3.29-2.167 5.072-4.915 5.072zm17.145.235c-2.787 0-4.257-2.906-4.257-8.438 0-5.61 1.354-8.36 4.142-8.36 2.866 0 4.337 2.941 4.337 8.635-.001 5.375-1.434 8.163-4.222 8.163zm7.277-3.293v-22.348c-1.935.518-3.675.825-5.842 1.057v.66c2.438 0 2.748.271 2.748 2.283v6.773c-1.432-2.321-2.555-3.02-4.646-3.02-4.141 0-7.046 3.909-7.046 9.483 0 5.575 2.94 9.481 7.162 9.481 2.206 0 3.716-1.006 4.799-3.172.154 1.471.154 1.625.543 3.094 1.585-.504 2.245-.658 4.529-.928l.58-.076v-.658c-2.594-.077-2.827-.268-2.827-2.629zm7.469-7.084c.387-4.451 1.857-6.732 4.336-6.732 2.516 0 3.791 2.167 4.023 6.732h-8.359zm5.033 10.142c-3.525 0-5.07-2.71-5.111-8.749h11.535c-.078-5.961-2.516-9.136-7.082-9.136-4.648 0-7.55 3.756-7.55 9.718 0 5.961 2.902 9.444 7.898 9.444 3.793 0 6.27-2.363 6.771-6.349h-1.549c-.461 3.29-2.167 5.072-4.912 5.072zm9.711 1.317v-6.467l.852-.037c.695 3.524 2.322 5.228 5.033 5.228 2.281 0 3.986-1.511 3.986-3.481 0-1.316-.734-2.205-2.634-3.059l-1.47-.66-1.78-.812c-2.829-1.315-3.718-2.4-3.718-4.646 0-3.059 2.398-5.146 5.807-5.146 1.51 0 2.635.348 3.949 1.234l.656-1.586h.697v6h-.892c-.351-3.098-1.626-4.566-4.063-4.566-2.051 0-3.642 1.394-3.642 3.213 0 1.547.581 2.053 4.104 3.6l1.627.699c2.939 1.273 3.988 2.515 3.988 4.8 0 3.252-2.595 5.571-6.23 5.571-1.782 0-3.176-.465-4.646-1.625l-.933 1.74h-.692zm34.028-13.356c2.05 0 3.211.35 4.103 1.238.891.894 1.396 2.557 1.396 4.412 0 3.871-1.938 6.041-5.382 6.041h-1.393c-2.053 0-2.4-.312-2.4-2.015v-9.679l3.676.003zm-3.679-11.73h3.291c3.252 0 4.683 1.59 4.683 5.188 0 1.78-.425 3.06-1.276 4.063-.852.971-1.896 1.277-4.062 1.277h-2.633v-10.529h-.003v.001zm11.418 5.11c0-2.013-.85-3.791-2.322-4.917-1.314-.967-2.822-1.391-5.342-1.391h-10.18v.967c2.789.156 3.174.465 3.174 2.555v18.773c0 2.091-.312 2.359-3.174 2.595v.931h9.793c2.863 0 4.414-.351 6.041-1.357 1.934-1.238 3.211-3.6 3.211-6.034 0-2.095-.891-3.99-2.4-5.147-.811-.619-1.664-.972-3.059-1.24 2.79-1.05 4.258-3.025 4.258-5.735zm7.52 8.517c.389-4.451 1.859-6.732 4.338-6.732 2.514 0 3.793 2.167 4.023 6.732h-8.361zm5.035 10.142c-3.523 0-5.074-2.71-5.111-8.749h11.537c-.078-5.961-2.518-9.136-7.086-9.136-4.645 0-7.549 3.756-7.549 9.718 0 5.961 2.904 9.444 7.896 9.444 3.793 0 6.271-2.363 6.774-6.349h-1.549c-.461 3.29-2.164 5.072-4.912 5.072zm8.473-16.299v-.655c2.246-.312 3.562-.619 5.108-1.162.196.894.313 1.897.388 3.368 1.395-2.092 2.98-3.018 5.227-3.018 2.324 0 4.334 1.195 5.111 3.094.389.931.582 2.013.582 3.482v9.291c0 1.666.387 1.975 2.746 2.09v.775c-2.051-.195-2.824-.232-4.218-.232-1.435 0-2.207.037-4.222.232v-.775c2.09-.074 2.594-.463 2.594-2.011v-9.485c0-3.367-1.006-4.724-3.482-4.724-2.635 0-4.027 1.667-4.027 4.839v9.37c0 1.548.506 1.937 2.52 2.011v.775c-2.014-.195-2.787-.232-4.182-.232-1.355 0-2.17.037-4.182.232v-.775c2.359-.115 2.748-.424 2.748-2.09v-12.539c-.039-1.591-.271-1.82-2.205-1.82-.12 0-.311-.041-.506-.041zm20.666 17.153l10.49-17.266h-4.762c-2.514 0-3.137.54-4.529 4.025h-.771l.891-5.032h13.316l-10.53 17.265h4.527c2.635 0 3.717-1.043 4.879-4.568h.813l-1.005 5.576h-13.319z"
                        fill="#091923"
                    />
                    <Path
                        d="M178.357 96.382a54.964 54.964 0 007.861-28.404c0-30.497-24.724-55.219-55.22-55.219-30.497 0-55.219 24.723-55.219 55.219a54.953 54.953 0 007.863 28.404l-.201.161.24-.093c9.665 16.026 27.238 26.747 47.317 26.747 20.08 0 37.651-10.721 47.315-26.747l.24.093-.196-.161zm1.077-28.404a48.168 48.168 0 01-6.428 24.094l-34.16-27.513-7.006-44.992c26.359.45 47.594 21.944 47.594 48.411zm-96.866 0c0-26.466 21.233-47.96 47.592-48.411l-7.006 44.992-34.16 27.513a48.183 48.183 0 01-6.426-24.094zM131 116.41c-17.186 0-32.271-8.96-40.867-22.455L131 78.145l40.867 15.811C163.27 107.45 148.188 116.41 131 116.41z"
                        fill="#838383"
                    />
                </Svg>

        },
        {
            id: '6', name: 'BMW', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 439.543 439.543"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <Path
                        d="M219.772 0c121.046 0 219.771 98.725 219.771 219.771 0 121.047-98.725 219.771-219.771 219.771S0 340.818 0 219.771C0 98.725 98.726 0 219.772 0z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    />
                    <Path
                        d="M92.087 153.86l-51.859-44.604 19.419-22.578c3.952-4.594 7.651-7.821 11.075-9.701 3.446-1.883 6.932-2.664 10.467-2.353 3.521.301 6.491 1.466 8.882 3.522 2.209 1.9 3.695 4.397 4.446 7.48.765 3.069.526 6.545-.687 10.398 4.049-2.852 8.017-4.289 11.912-4.349 3.908-.05 7.371 1.223 10.39 3.819a17.765 17.765 0 015.233 7.618c1.064 2.986 1.404 5.839 1.034 8.566-.37 2.727-1.417 5.653-3.102 8.784-1.686 3.132-4.178 6.617-7.479 10.455L92.087 153.86zm-23.21-33.828l11.19-13.01c3.024-3.517 4.999-6.228 5.926-8.111 1.214-2.463 1.671-4.728 1.343-6.789-.329-2.06-1.392-3.876-3.204-5.435-1.714-1.475-3.645-2.307-5.769-2.476-2.146-.165-4.221.438-6.221 1.788-2.012 1.364-4.88 4.208-8.604 8.537l-10.335 12.017 15.674 13.479zm23.943 20.593l12.877-14.971c2.216-2.577 3.686-4.457 4.42-5.63 1.288-2.083 2.13-4.016 2.526-5.818.409-1.794.311-3.633-.258-5.511-.593-1.875-1.693-3.527-3.347-4.95-1.931-1.662-4.104-2.532-6.529-2.618-2.412-.077-4.788.657-7.127 2.205-2.313 1.542-5.133 4.234-8.422 8.058l-11.961 13.907 17.821 15.328zm85.491-63.388v-58.66h15.465l18.357 41.533c1.698 3.866 2.945 6.761 3.704 8.687.885-2.131 2.258-5.273 4.136-9.41l18.573-40.81h13.821v58.66h-9.9v-49.1l-22.548 49.1h-9.268l-22.44-49.934v49.934h-9.9zm140.285 34.253l35.893-48.668 4.898 6.045-24.308 30.931a207.258 207.258 0 01-7.785 9.418c5.783-2.797 9.116-4.398 10.036-4.801l37.566-16.409 5.764 7.113-17.85 25.027c-4.413 6.22-8.847 11.721-13.285 16.503 3.323-1.765 7.231-3.695 11.686-5.795l34.874-16.701 4.806 5.93-55.367 24.636-4.604-5.683 27.037-37.454c2.263-3.139 3.663-5.046 4.202-5.723-2.466 1.223-4.596 2.228-6.396 3.017l-42.294 18.626-4.873-6.012z"
                        fill="#fff"
                    />
                    <Path
                        d="M349.594 221.948c0 70.306-57.34 127.646-127.646 127.646V221.948h127.646z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        fill="#00acec"
                    />
                    <Path
                        d="M349.594 217.595c0-70.305-57.34-127.646-127.646-127.646v127.646h127.646z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        fill="#fff"
                    />
                    <Path
                        d="M89.95 217.595c0-70.305 57.34-127.646 127.646-127.646v127.646H89.95z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        fill="#00acec"
                    />
                    <Path
                        d="M89.95 221.948c0 70.306 57.34 127.646 127.646 127.646V221.948H89.95z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        fill="#fff"
                    />
                </Svg>
        },
        {
            id: '7', name: 'SUZUKI', logo:
                <Svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 951.1 951.1"
                    width={isMobile}
                    height={isMobile}
                    xmlSpace="preserve"
                    fill={'red'}

                >
                    <Path
                        d="M1029.1 734.5s-87.2 25.3-256.3 129.2c-151.8 93.3-211.3 156-211.3 156L93.7 696.4S290.5 551.7 455 662.5l220.6 151.3 26.9-17.7L93.7 369.8s87.5-25.3 256.6-129.2C502.2 147.2 561.5 84.5 561.5 84.5l468 323.3s-196.8 144.8-361.3 33.9L447.6 290.3 420.7 308l608.4 426.5"
                        transform="translate(-87.778 -79.892)"
                    />
                    ,
                </Svg>
        },
        {
            id: '8', name: 'SUBARU', logo:
                <Svg
                    fill="blue"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 612 612"
                    xmlSpace="preserve"
                    width={isMobile}
                    height={isMobile}

                >
                    <Path d="M517.3 164.1c-55.8-32.5-130.7-54.4-212-54.4S149.8 131.6 94 164.1C36.7 198 0 245.4 0 292.7c0 46.7 36 93.3 94 127.2 55.1 32.5 130 53.7 211.3 53.7s156.9-21.2 212-53.7c58-33.9 94.7-80.6 94.7-127.2 0-48-36.7-94.7-94.7-128.6zM453 208.6l12-29.7 13.4 29.7 58.7 12-58.7 12.1-12 32.5-13.4-32.5-53.7-12.1 53.7-12zM432.5 309l-58.7 13.4-12 31.1-13.4-32.5-53.7-12 53.7-12 12-29.7 13.4 29.7 58.7 12zM38.9 256.7l125.8-26.9 28.2-72.1 29.7 68.6 137.8 30.4L224 284.9l-29.7 75-29.6-76.4-125.8-26.8zM269.3 403l-12.1 31.8-13.4-33.2-53.7-10.6 53.7-12.1 12-31.1 13.5 29.7 57.9 13.5-57.9 12zm155.4-10.6l-13.4 31.8-13.4-31.8-52.3-12 52.3-12.1 13.4-29.6 12 28.2 60.1 13.5-58.7 12zm91.2-70l-12 31.1-13.5-32.5-52.2-12 52.2-12 13.5-29.7 12 29.7 58.6 12-58.6 13.4z" />
                </Svg>
        },
        {
            id: '9', name: 'VOLKSWAGEN', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 192.756 192.756"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <G fillRule="evenodd" clipRule="evenodd">
                        <Path fill="#fff" d="M0 0h192.756v192.756H0V0z" />
                        <Path
                            d="M96.411 16.258c44.115 0 80.087 35.974 80.087 80.153 0 44.048-35.973 80.088-80.087 80.088-44.114 0-80.153-36.04-80.153-80.088-.001-44.18 36.039-80.153 80.153-80.153z"
                            fill="#295ca7"
                        />
                        <Path
                            d="M96.411 26.433c38.468 0 69.914 31.444 69.914 69.979 0 38.469-31.445 69.847-69.914 69.847S26.499 134.88 26.499 96.411c0-38.534 31.443-69.978 69.912-69.978zM49.605 58.796l25.077 65.055 9.19-23.764h24.092l9.189 23.764 25.34-65.843a60.408 60.408 0 00-15.887-13.522l-17.592 48.446H84.199L66.542 44.288c-6.499 3.742-12.21 8.666-16.937 14.508zm102.999 16.346l-28.557 74.508c19.17-10.044 32.363-30.131 32.363-53.238 0-7.484-1.312-14.64-3.806-21.27zm-41.03 79.365l-.195-1.51-15.494-40.175-15.492 40.175-.065 1.248c5.12 1.443 10.503 2.166 16.083 2.166 5.251 0 10.306-.656 15.163-1.904zm-43.982-5.514L39.759 76.455c-2.232 6.236-3.414 12.932-3.414 19.956 0 22.582 12.604 42.406 31.247 52.582zM96.411 36.345c5.251 0 10.437.657 15.361 1.969L96.608 80.262l-15.23-42.013a59.721 59.721 0 0115.033-1.904z"
                            fill="#fff"
                        />
                    </G>
                </Svg>
        },
        {
            id: '10', name: 'MAZDA', logo:
                <Svg
                    fill="#000"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 182.6 182.6"
                    xmlSpace="preserve"
                    width={isMobile}
                    height={isMobile}

                >
                    <Path d="M37.3 135.3c-4.9-3-6.5-6.9-14-9.9-7.4-9.7-10.3-21.9-10.3-34 0-8.9 1.5-17.7 4-25.7l7.5 14.9c-.4 3.3-.6 6.9-.6 10.8 0 49.5 32.8 59.5 67.5 59.4 34.6.1 67.5-9.9 67.5-59.4 0-5.1-.3-9.7-1-14l5.4-11c2.8 7 4.4 16 4.2 25.1-.3 14.6-5 29.4-16 36.4l-1.8 2.6-1.9 2.4-2 2.2-2.1 2.1-2.3 1.9-2.4 1.8-2.5 1.6-2.6 1.5-2.7 1.3-2.7 1.2-2.8 1-2.9.9-2.9.8-3 .7-3.1.6-3.1.5-3.1.4-3.2.3-3.2.2-3.2.2-3.3.1H88l-3.3-.1-3.2-.2-3.2-.2-3.2-.3-3.1-.4-3.1-.5-3.1-.6-3-.7-2.9-.8-2.9-.9-2.8-1-2.7-1.2-2.7-1.3-2.6-1.5-2.5-1.6-2.4-1.8-2.3-1.9-1.7-1.9zM164.6 42.9c-18.2-19.8-48.3-24-73.3-24-25.6 0-56.4 4.4-74.5 25.3l.3.3.5.4.2.2c3.9 3.8 8.2 7.8 12.6 10.1.7.3 1.5.4 2.3.1C44.8 36.6 67.6 32 91.3 32c23.3-.1 45.7 4.4 58 22.5l14.5-11 .8-.6zm-8.7 3.8c-19.4-17-40-21.2-64.6-21-24.9-.2-46.6 4.3-65.8 22.4L18.8 44l1.9-2 2.8-2.6 2.9-2.4 3-2.2 3.2-2 3.3-1.8 3.4-1.6 3.5-1.5 3.6-1.3 3.6-1.2 3.7-1 3.7-.9 3.8-.8L65 22l3.8-.5 3.8-.4 3.8-.3 3.8-.3 3.8-.2 3.7-.1h7.2l3.7.1 3.8.2 3.8.3 3.8.3 3.8.4 3.8.5 3.8.7 3.8.8 3.7.9 3.7 1 3.6 1.2 3.6 1.3 3.5 1.5 3.4 1.6 3.3 2 3.2 2 3 2.2 2.9 2.4 2.8 2.6.6.6-6.6 3.9z" />
                    <Path d="M91.1 122.1c-8.3-17.8-17.4-25.8-31.2-31.6L25.3 78.8l-4.8-13.2c8.5 6.5 21.1 11 33 15.6 18.5 7.1 28.5 16 37.6 34.4v6.5zM91.1 122.1c8.3-17.8 17.4-27 31.2-32.7l34.3-12.2 4.8-12.8c-8.5 6.5-22 11.5-34 16.1-18.5 7.1-27.2 16.8-36.2 35.1l-.1 6.5z" />
                    <Path d="M166.6 45.2l-1 1c-.2 5.5-1.1 11.1-1.9 16.4 3.9 8.3 5.7 18.3 6 28.8.6 31-15.2 63.6-78.4 65.7-39.7-.3-64.7-12.6-74.9-38.1-6.8-4.3-10-12.2-13.2-19.9L3.1 97 3 91.4l.1-5.6.4-5.3.7-5 1-4.7 1.2-4.5 1.4-4.2 1.7-3.9 1.9-3.7 2.1-3.4 1.9-2.7c.7 5.3 1.6 12.2 3.3 13.6 20.1 16.9 55.5 14.7 72.5 48.7 18.5-37.7 51.1-32.9 71.2-49.8l1.9-16.2C140.9 70 109 61.4 91.2 99.3 71.9 62 40.5 71.2 17 46.2l-1-1C7.1 55.9 1.5 70.8 1.5 91.4c0 62.4 50.9 72.5 89.7 72.5 38.8 0 89.7-10.1 89.7-72.5.1-20.6-5.4-35.5-14.3-46.2zm-49.9 27.9l2.2-1.2 2.4-1.2 4.8-2.2c4.1-1.8 8.3-3.5 12.4-5.2l5-2.3 2.5-1.2 2.5-1.3L151 57l2.5-1.5 2.4-1.7 2.4-1.8 2.4-2 1.7-1.6L161 60l-1.4 1.1-1.9 1.4-2 1.3-2.1 1.2-2.1 1.1-2.2 1-2.2 1-2.3.9c-4.7 1.9-9.5 3.6-14.3 5.5l-4.9 2-2.5 1.1-2.5 1.2-2.4 1.3-2.4 1.4-2.4 1.5-2.4 1.6-2.4 1.7-1.5 1.3c1.1-5 4-9.7 9.6-14.5zm-13.8 10.8l.6-.6 2.1-2 2.1-1.9 2.2-1.7.3-.2c-2.8 4.1-4.5 8-5.1 11.9l-1 .9-2.2 2.2-1.7 1.9c-.2-3.4.7-6.8 2.7-10.5zM18.3 49.5l2.3 2.1 2.4 1.9 2.4 1.8 2.4 1.6 2.4 1.5 2.5 1.4 2.5 1.3 2.5 1.2 5 2.2c4.1 1.7 8.3 3.3 12.4 5l4.9 2.1c3.8 4.7 7.5 9.3 10.5 14.2l-1.3-.8-2.5-1.4-2.5-1.3-2.5-1.3-2.5-1.2-5.2-2.3c-5-2-10-3.9-15-5.9l-4.8-2-2.3-1.1-2.2-1.1-2.2-1.2-2.1-1.2-2-1.3-2-1.4-1.8-1.4-.4-.5-.4-1-.4-1.5-.5-1.9-.4-2.1-.9-6 1.7 1.6z" />
                </Svg>
        }

    ];




    const types = [
        {
            id: '1', name: 'SEDAN', logo:
                <Svg
                    fill="#d5d5d5"
                    xmlns="http://www.w3.org/2000/svg"
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 98.967 98.967"
                    xmlSpace="preserve"
                >
                    <Path d="M17.275 52.156a7.468 7.468 0 00-7.468 7.468c0 .318.026.631.066.938.463 3.681 3.596 6.528 7.401 6.528a7.467 7.467 0 007.437-6.83c.017-.209.031-.422.031-.637a7.466 7.466 0 00-7.467-7.467zm-3.738 4.654l1.522 1.523a2.578 2.578 0 00-.271.656h-2.146c.11-.812.421-1.554.895-2.179zm-.905 3.472h2.163c.061.23.151.448.271.648l-1.526 1.525a4.672 4.672 0 01-.908-2.173zm3.997 3.981a4.652 4.652 0 01-2.166-.899l1.518-1.519c.2.117.419.203.648.263v2.155zm0-7.123a2.594 2.594 0 00-.66.275l-1.521-1.521a4.64 4.64 0 012.181-.902v2.148zm1.293-2.15a4.648 4.648 0 012.181.903l-1.52 1.521a2.594 2.594 0 00-.66-.275l-.001-2.149zm0 9.271v-2.152a2.55 2.55 0 00.647-.264l1.519 1.519a4.654 4.654 0 01-2.166.897zm3.092-1.799l-1.531-1.533c.12-.201.217-.416.278-.646h2.146a4.659 4.659 0 01-.893 2.179zm-1.25-3.473a2.615 2.615 0 00-.271-.656l1.524-1.523c.471.625.782 1.367.894 2.18h-2.147zM79.284 52.156a7.468 7.468 0 00-7.468 7.468c0 .318.026.631.066.938.463 3.681 3.596 6.528 7.4 6.528 3.908 0 7.112-3.004 7.438-6.83.017-.209.031-.422.031-.637a7.465 7.465 0 00-7.467-7.467zm-3.738 4.654l1.521 1.523a2.578 2.578 0 00-.271.656H74.65a4.624 4.624 0 01.896-2.179zm-.904 3.472h2.163c.061.23.151.448.271.648l-1.525 1.525a4.633 4.633 0 01-.909-2.173zm3.996 3.981a4.652 4.652 0 01-2.166-.899l1.518-1.519c.2.117.419.203.648.263v2.155zm0-7.123a2.594 2.594 0 00-.66.275l-1.521-1.521a4.636 4.636 0 012.181-.902v2.148zm1.294-2.15a4.648 4.648 0 012.181.903l-1.521 1.521a2.524 2.524 0 00-.66-.275V54.99zm0 9.271v-2.152a2.55 2.55 0 00.647-.264l1.519 1.519a4.658 4.658 0 01-2.166.897zm3.091-1.799l-1.531-1.531c.12-.202.218-.416.278-.647h2.146a4.65 4.65 0 01-.893 2.178zm-1.25-3.473a2.578 2.578 0 00-.271-.656l1.523-1.523c.472.625.782 1.367.895 2.18h-2.147z" />
                    <Path d="M97.216 48.29v-5.526c0-.889-.646-1.642-1.524-1.779-2.107-.33-5.842-.953-7.52-1.47-2.406-.742-11.702-4.678-14.921-5.417-3.22-.739-17.738-4.685-31.643.135-2.353.815-12.938 5.875-19.162 8.506-1.833.04-19.976 3.822-20.942 6.414C.538 51.746.235 53.004.057 53.662c-.178.658 0 3.807 1.348 6 1.374.777 4.019 1.299 7.077 1.649-.035-.187-.073-.371-.097-.56a8.6 8.6 0 01-.078-1.125c0-4.945 4.022-8.969 8.968-8.969s8.968 4.023 8.968 8.969c0 .254-.017.506-.036.754a8.728 8.728 0 01-.292 1.613h.024l44.516-.896c-.02-.115-.046-.229-.061-.346a8.565 8.565 0 01-.078-1.125c0-4.945 4.022-8.968 8.968-8.968s8.969 4.022 8.969 8.968c0 .019-.002.035-.003.053l.19-.016 7.611-1.433s2.915-1.552 2.915-5.822c.001-2.848-1.75-4.118-1.75-4.118zm-44.159-5.239l-16.625.509c.306-2.491-1.169-3.05-1.169-3.05 6.609-5.999 19.929-6.202 19.929-6.202l-2.135 8.743zm18.658-.761l-15.15.509 1.373-8.49c7.83-.102 12.303 1.626 12.303 1.626l2.237 3.61-.763 2.745zm8.541-.052h-4.221l-4.22-5.795a79.895 79.895 0 017.209 3.287 2.354 2.354 0 011.232 2.508z" />
                </Svg>
        },
        {
            id: '2', name: 'TRUCK', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 100 43"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Mask
                        id="a"
                        style={{
                            maskType: "luminance"
                        }}
                        maskUnits="userSpaceOnUse"
                        x={0}
                        y={0}
                        width={100}
                        height={43}
                    >
                        <Path d="M100 0H0v42.52h100V0z" fill="#fff" />
                    </Mask>
                    <G mask="url(#b)" fill="#D5D5D5">
                        <Path d="M99.324 0H35.087a.677.677 0 00-.677.676v32.216H33.4V11.775a.378.378 0 00-.393-.378l-.4.017.535-.529a.86.86 0 00.258-.612V1.594a.11.11 0 00-.061-.093.11.11 0 00-.111.009c-6.22 4.318-9.821 8.016-11.39 10.871-.065.118-.013.251.188.389.038.025.077.048.117.068-2.31 1.334-6.333 5.351-10.089 9.841A53.094 53.094 0 002 27.324a1.821 1.821 0 00-.792 1.176c-.236 1.271-.393 3.55-.393 3.55l-.529.739c-.187.26-.287.573-.286.894v2.292c0 .583.418.968 1.3 1.32l2.189.877c.729.291 1.506.44 2.291.441h1.787v-1.329a5.906 5.906 0 015.709-5.942 5.836 5.836 0 015.964 5.835v1.436h13.554a.6.6 0 00.6-.6v-.3h34.68a5.837 5.837 0 1111.673 0h2.569A36.784 36.784 0 0088.4 37.2l8.615-1.447v2.377h1.251v-1.006h.48a.392.392 0 00.392-.392v-2.573a.392.392 0 00-.392-.392h-.48v-.875h1.059a.677.677 0 00.676-.677V.676A.677.677 0 0099.324 0zM6.456 28.4a12.268 12.268 0 01-1.7 1.657c-.29.237-.633.4-1 .472-.644.121-1.28.278-1.906.471 0-.626.084-1.25.25-1.853a1.5 1.5 0 01.8-.792 7.025 7.025 0 013.16-.728c.587 0 .747.346.4.776m12.531-3.922v-5.392a38.132 38.132 0 013.677-3.632l-.57 8.485-3.107.539zm11.735-9.2l-.814 5.066a3.273 3.273 0 01-2.672 2.7l-4.679.811.405-8.639a4.38 4.38 0 01.7-.454c.046-.021 1.049-.461 5.824-.828a1.16 1.16 0 011.235 1.339" />
                        <Path d="M73.911 32.89a4.815 4.815 0 10-.002 9.631 4.815 4.815 0 00.002-9.63zM13.4 32.89a4.815 4.815 0 10-.002 9.631 4.815 4.815 0 00.002-9.63z" />
                    </G>
                </Svg>
        },
        {
            id: '3', name: 'SUV', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 100 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Mask
                        id="a"
                        style={{
                            maskType: "luminance"
                        }}
                        maskUnits="userSpaceOnUse"
                        x={0}
                        y={0}
                        width={100}
                        height={38}
                    >
                        <Path d="M100 0H0v37.784h100V0z" fill="#fff" />
                    </Mask>
                    <G mask="url(#c)" fill="#D5D5D5">
                        <Path d="M99.482 20.614l-.81-1a44.296 44.296 0 00-.5-6.063c-.154-.815-.268-1.254-.714-1.545a5.774 5.774 0 00-1.314-.514 45.018 45.018 0 00-4.16-8.742 7.337 7.337 0 002.475-.85c.352-.208.423-.53-.074-.58L89.1.8C74.975-.587 54.923.021 43.336 1.18a15.52 15.52 0 00-6.892 2.39 90.895 90.895 0 00-9.635 7.49c-14.515.48-23.768 1.04-25.127 4.194a15.666 15.666 0 00-.689 4.682l-.277.4a2.383 2.383 0 00-.411 1.65l.195 1.6a1.4 1.4 0 01-.118.758l-.253.556a1.408 1.408 0 00-.129.653L.066 26.9c.094 1.962 2.678 2.925 5.825 3.213l.916.085a11.956 11.956 0 012.356-7.78 6.023 6.023 0 014.149-2.383 38.38 38.38 0 017.261-.128 4.366 4.366 0 013.181 1.733 13.29 13.29 0 012.519 9.542h40.658a11.95 11.95 0 012.263-8.765 6.021 6.021 0 014.148-2.383 38.38 38.38 0 017.261-.127 4.366 4.366 0 013.181 1.733 13.342 13.342 0 012.521 9.56L94.6 30c3.076-.443 4.661-1.7 4.845-3.212l.539-4.431a2.322 2.322 0 00-.5-1.745M9.27 15.881c-.874 1.21-1.137 1.729-1.665 2.4a1.617 1.617 0 01-1.3.595c-.929-.014-3.185.2-4.284.325.096-.787.261-1.563.493-2.32.411-1.4 1.022-1.848 1.509-1.848h4.789c.849 0 .829.33.458.844m39.821-3.494l-15.325.442.672-5.042a18.245 18.245 0 013.28-2.663 12.2 12.2 0 015.813-2.084c2.279-.228 4.862-.43 7.64-.6l-2.08 9.948zm17.335-.5l-12.751.368.887-10c3.939-.195 8.163-.322 12.419-.362l-.555 9.995zm.752-.021l.335-9.98c.511 0 1.023-.009 1.535-.01l1.5 9.892-3.37.098zm19.122-1.81c-.48.314-.978.6-1.49.858a4.74 4.74 0 01-2 .5l-7.447.216-3.225-9.742c3.651.03 7.249.13 10.635.316a2.27 2.27 0 012.109 1.533 30.628 30.628 0 011.869 5.084c.17.636.086.888-.447 1.236m7.876 8.884a22.55 22.55 0 00.783-5.327c0-.562.214-.817.744-.8.2.006.277.012.552.038.783.075.949.468 1.12 1.217.283 1.549.415 3.12.393 4.694-.771.113-2.712.181-3.592.181" />
                        <Path d="M16.582 22.18a7.8 7.8 0 100 15.6 7.8 7.8 0 000-15.6zM76.612 22.18a7.8 7.8 0 100 15.6 7.8 7.8 0 000-15.6z" />
                    </G>
                </Svg>
        },
        {
            id: '4', name: 'HACHBACK', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 100 35"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Mask
                        id="a"
                        style={{
                            maskType: "luminance"
                        }}
                        maskUnits="userSpaceOnUse"
                        x={0}
                        y={0}
                        width={100}
                        height={35}
                    >
                        <Path d="M100 0H0v34.121h100V0z" fill="#fff" />
                    </Mask>
                    <G mask="url(#f)" fill="#D5D5D5">
                        <Path d="M16.79 19.724a7.2 7.2 0 100 14.4 7.2 7.2 0 000-14.4zM80.211 19.724a7.2 7.2 0 100 14.4 7.2 7.2 0 000-14.4z" />
                        <Path d="M99.5 19.167l-1.215-1.35a2.26 2.26 0 01-.581-1.45l-.164-5.717a.964.964 0 00-.857-.93l-1.162-.129a75.797 75.797 0 00-6.051-5.4 8.509 8.509 0 001.746-.643c.441-.22.533-.513-.036-.606l-6.045-.993A147.679 147.679 0 0050.05.423c-2.82.211-5.577.95-8.125 2.177a144.772 144.772 0 00-13.548 7.464c-13.048.621-23.035 3.191-26.2 5.9A1.7 1.7 0 001.6 17l-.35 2.293-.315.407a2.54 2.54 0 00-.53 1.657l.12 3.12a2.05 2.05 0 01-.2.97l-.211.437a1.1 1.1 0 00-.094.671l.2 1.167a.8.8 0 00.683.656l6.832.916v-2.443a9.053 9.053 0 1118.108-.135v2.951h45.314v-2.816a9.053 9.053 0 1118.108-.135v1.811l8.206-1.587a2.593 2.593 0 002.085-2.266l.433-3.985a1.956 1.956 0 00-.491-1.522m-90.715-2.82a21.572 21.572 0 01-2.52 2.11c-.418.296-.92.452-1.433.443a18.842 18.842 0 00-2.706.1 5.516 5.516 0 01.576-1.84 1.953 1.953 0 011.185-1.06 21.647 21.647 0 014.466-.678c.639-.032.9.468.432.924zM54.1 10.561c-5.808.362-11.608.68-17.4.951l.6-4.55a144.752 144.752 0 015.4-2.755A20.758 20.758 0 0150.185 2.2c2.19-.166 4.383-.282 6.58-.349L54.1 10.562zm17.31-1.208c-4.308.333-8.612.643-12.913.928l.7-8.486c4.275-.065 8.55.117 12.803.544l-.59 7.014zm9.429-1.744L80.2 8.638c-2.596.22-5.191.432-7.785.636l.4-6.845c1.149.133 2.276.29 3.367.47a5.815 5.815 0 013.247 1.7l1.234 1.283a1.409 1.409 0 01.18 1.725m15.4 8.163c-.493.01-.97-.177-1.325-.519-1.152-1.1-2.321-2.192-3.553-3.213-.56-.464-.3-1.03.391-1.01 1.2.038 2.4.091 3.586.178.739.054.925.265 1.085.935.273 1.187.405 2.403.393 3.621-.192 0-.385 0-.577.008z" />
                    </G>
                </Svg>
        },
        {
            id: '5', name: 'WAGON', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 100 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Mask
                        id="a"
                        style={{
                            maskType: "luminance"
                        }}
                        maskUnits="userSpaceOnUse"
                        x={0}
                        y={0}
                        width={100}
                        height={38}
                    >
                        <Path d="M100 .503H0V37.28h100V.503z" fill="#fff" />
                    </Mask>
                    <G mask="url(#d)" fill="#D5D5D5">
                        <Path d="M99.316 19.595a43.05 43.05 0 00-.492-5.9c-.15-.794-.26-1.22-.695-1.505a5.626 5.626 0 00-1.278-.5 43.858 43.858 0 00-4.045-8.51 7.125 7.125 0 002.409-.83c.343-.2.412-.517-.072-.564L90 1.28C76.25-.069 52.168.523 40.89 1.651a15.1 15.1 0 00-6.708 2.326 88.53 88.53 0 00-9.382 7.29c-11.472.472-21.862 2.1-22.839 4.42a10.317 10.317 0 00-.753 3.367l-.27.387a4.57 4.57 0 00-.741 1.8C.036 22.684 0 25.583 0 27.903c0 1.911 2.606 2.846 5.669 3.128l1.365.131v-1.98a9.042 9.042 0 1118.084 0v2.89h39.63v-2.89a9.042 9.042 0 1118.084 0v2.947l12.52-1.21c2.994-.43 4.278-1.61 4.416-3.084.168-1.8.232-4.236.232-5.624a3.64 3.64 0 00-.684-2.614m-91-3.147c-.213.353-.366.647-.513.89a1.369 1.369 0 01-1.207.513 45.966 45.966 0 00-4.633.483c.024-.285.061-.614.119-.979.2-1.263.717-1.669 1.176-1.669h4.516c.8 0 .826.3.544.762m38.174-3.889l-14.917.43.654-4.908a17.762 17.762 0 013.193-2.592 11.877 11.877 0 015.658-2.03c2.218-.222 4.733-.42 7.437-.587l-2.025 9.687zm16.873-.487l-12.411.358.863-9.738c3.834-.188 7.946-.312 12.089-.35l-.541 9.73zm.732-.02l.326-9.715 1.494-.009 1.457 9.63-3.277.093zm23.18-1.765c-.468.305-.952.583-1.45.834a4.59 4.59 0 01-1.942.491l-11.812.21L68.9 2.28c3.628-.048 11.673.131 14.942.363a2.23 2.23 0 012.053 1.492 29.723 29.723 0 011.819 4.948c.166.62.084.865-.435 1.2m6.4 4.48c-.5 0-.721-.2-.708-.685 0-.187-.024-.457 0-.71a.976.976 0 011.072-1.032c2.081 0 3.375.167 3.844.494a4.07 4.07 0 01.454 1.933h-4.662z" />
                        <Path d="M16.076 22.092a7.594 7.594 0 100 15.188 7.594 7.594 0 000-15.188zM73.791 22.092a7.594 7.594 0 100 15.189 7.594 7.594 0 000-15.19z" />
                    </G>
                </Svg>
        },
        {
            id: '6', name: 'VAN/MINIVAN', logo:
                <Svg
                    width={isMobile}
                    height={isMobile}
                    viewBox="0 0 100 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"

                >
                    <Mask
                        id="a"
                        style={{
                            maskType: "luminance"
                        }}
                        maskUnits="userSpaceOnUse"
                        x={0}
                        y={0}
                        width={100}
                        height={38}
                    >
                        <Path d="M100 0H0v37.308h100V0z" fill="#fff" />
                    </Mask>
                    <G mask="url(#e)" fill="#D5D5D5">
                        <Path d="M14.455 23.962a6.672 6.672 0 10.002 13.344 6.672 6.672 0 00-.002-13.344zM79.986 23.962a6.672 6.672 0 10.002 13.344 6.672 6.672 0 00-.002-13.344z" />
                        <Path d="M99.874 26.418l-.785-1.741c-.012-9.01-.584-15.648-2.694-21.134A4.153 4.153 0 0092.929.885C78.471-.525 55.882.008 40.523.71a20.126 20.126 0 00-9.157 2.695 149.948 149.948 0 00-13.793 9.026C9.529 14.7 5.417 16.308 3.266 17.66A4.034 4.034 0 001.6 19.79 15.747 15.747 0 00.839 24a1.49 1.49 0 01-.261.753l-.313.457a1.5 1.5 0 00-.265.856v1.169c0 .36.077.717.226 1.046L.9 29.763a.317.317 0 01-.093.382l-.414.327a.318.318 0 00-.054.448l.245.31a4.468 4.468 0 002.779 1.049l3.005.4v-2.114a8.186 8.186 0 017.912-8.236 8.09 8.09 0 018.267 8.087v1.95l49.353-.474V30.05a8.187 8.187 0 017.912-8.237 8.088 8.088 0 018.263 8.086v1.072l9.608-1a2.065 2.065 0 001.675-1.218l.52-1.174a1.43 1.43 0 000-1.165m-92.09-7.907A34.172 34.172 0 015.5 21.462a3.04 3.04 0 01-1.3.907 18.72 18.72 0 00-2.451.964 7.91 7.91 0 01.525-2.065 3.355 3.355 0 011.08-1.46A14.56 14.56 0 017.4 17.7c.726-.258.812.193.388.808zm35.139-6.063c-5.912.338-11.821.73-17.727 1.177L24.843 9.7a72.778 72.778 0 017.374-5.011 18.513 18.513 0 018.377-2.444c.853-.04 1.814-.081 2.864-.123l-.531 10.323zm4.289-.236L47 1.99c5.635-.2 12.861-.37 20.19-.343l.442 9.7c-6.81.216-13.616.504-20.42.864m24.7-.99l-1.059-9.544c6.233.083 12.362.332 17.468.857a4.664 4.664 0 012.922 1.424 15.825 15.825 0 013.507 6.906c-7.612.028-15.223.146-22.834.354m23.2 10.092c.45-2.642.561-5.33.329-8a3.64 3.64 0 011.6.413 1 1 0 01.426.665c.4 2.285.585 4.603.553 6.924l-2.908-.002z" />
                    </G>
                </Svg>
        },
    ];
    const searchByMakesRef = useRef(null);
    const newArrivalsRef = useRef(null);
    const searchByTypesRef = useRef(null);
    const searchByTrucksRef = useRef(null);
    const howToBuySectionRef = useRef(null);
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





    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > scrollThreshold) {
                setIsVisible(true);

            }
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    useEffect(() => {
        let timer;
        if (isVisible) {
            // Delay the animation start by 50ms
            timer = setTimeout(() => {
                setShouldAnimate(true);
            }, 50);
        } else {
            // Reset animation state when `isVisible` is false
            setShouldAnimate(false);
        }

        return () => {
            clearTimeout(timer); // Cleanup timer on unmount or `isVisible` change
        };
    }, [isVisible]);

    return (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>

            <View style={{
                flex: 3,
                zIndex: 9999
            }}>

                <SearchQuery
                    // fetchBodyTypes={fetchBodyTypes}
                    // fetchModels={fetchModels}
                    // fetchMakes={fetchMakes}
                    isFetchingMakes={isFetchingMakes}
                    screenWidth={screenWidth}
                    carouselHeight={carouselHeight}
                    listTranslateY={listTranslateY}
                    listOpacity={listOpacity}
                    makes={makes}
                    carMakes={carMakes}
                    setCarMakes={setCarMakes}
                    models={models}
                    carModels={carModels}
                    setCarModels={setCarModels}
                    bodyType={bodyType}
                    carBodyType={carBodyType}
                    setCarBodyType={setCarBodyType}
                    minPriceData={minPriceData}
                    maxPriceData={maxPriceData}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    years={years}
                    carMinYear={carMinYear}
                    setCarMinYear={setCarMinYear}
                    carMaxYear={carMaxYear}
                    setCarMaxYear={setCarMaxYear}
                    minMileageData={minMileageData}
                    maxMileageData={maxMileageData}
                    minMileage={minMileage}
                    setMinMileage={setMinMileage}
                    maxMileage={maxMileage}
                    setMaxMileage={setMaxMileage}
                    activeDropdown={activeDropdown}
                    toggleDropdown={toggleDropdown}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    handleTextChange={handleTextChange}
                // handleSearch={handleSearch}
                />
                <View style={{ flexDirection: 'row', position: 'relative', overflow: 'hidden' }}>
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "80px", // Reduced width for subtle effect
                            height: "100%",
                            background: "linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))", // Reduced opacity
                            zIndex: 1,
                            pointerEvents: "none",
                        }}
                    />
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 10, marginVertical: 20, padding: 10, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center', width: screenWidth <= 500 ? 780 : screenWidth }}
                    >

                        <Pressable onPress={() => scrollToSectionWithOffset(searchByMakesRef)}>
                            <Text selectable={false} style={{ fontWeight: 'bold', textAlign: 'center' }}>By Makers</Text>
                        </Pressable>

                        <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                        <Pressable onPress={() => scrollToSectionWithOffset(newArrivalsRef)}>
                            <Text selectable={false} style={{ fontWeight: 'bold', textAlign: 'center' }}>New Arrivals</Text>
                        </Pressable>

                        <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                        <Pressable onPress={() => scrollToSectionWithOffset(searchByTypesRef)}>
                            <Text selectable={false} style={{ fontWeight: 'bold', textAlign: 'center' }}>By Types</Text>
                        </Pressable>

                        <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                        <Pressable onPress={() => scrollToSectionWithOffset(searchByTrucksRef)}>
                            <Text selectable={false} style={{ fontWeight: 'bold', textAlign: 'center' }}>By Trucks</Text>
                        </Pressable>

                        <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                        <Pressable onPress={() => scrollToSectionWithOffset(howToBuySectionRef)}>
                            <Text selectable={false} style={{ fontWeight: 'bold', textAlign: 'center' }}>How to Buy</Text>
                        </Pressable>

                    </ScrollView>

                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "80px",
                            height: "100%",
                            background: "linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
                            zIndex: 1,
                            pointerEvents: "none",
                        }}
                    />
                </View>
                <View style={{}} ref={searchByMakesRef}>
                    <SearchByMakes logos={brand} />
                </View>
                <View style={{ backgroundColor: 'black' }} ref={searchByTypesRef}>
                    <SearchByTypes types={types} />
                </View>
                <View ref={howToBuySectionRef}>
                    <HowToBuySection steps={steps} screenWidth={screenWidth} />
                </View>

            </View>
        </TouchableWithoutFeedback>
    )

};




export default HomePage;