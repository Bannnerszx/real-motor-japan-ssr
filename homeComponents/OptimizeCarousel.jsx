import { useState, useEffect } from "react";
import { View, Text } from "react-native";
export default function OptimizeCarousel({ unsoldVehicleCount, error }) {
    const [screenWidth, setScreenWidth] = useState(0);

    // Update screen width on resize
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        handleResize(); // Set the initial width
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sampleBanner = "/samplebanner3.webp"; // Desktop banner image
    const sampleBannerMobile = "/samplebannerMobile.webp"; // Mobile banner image
    const parentPosition = { left: 50, top: 100 }; // Example parent offset for absolute positioning

    const currentBanner = screenWidth <= 640 ? sampleBannerMobile : sampleBanner;
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <View

            style={{
                width: '100%',
                height: screenWidth <= 640 ? 360 : 720, // Adjust for desktop
         
                overflow: 'hidden',
                zIndex: -1,
            }}
        >
            <img
                src={sampleBanner} // Fallback for older browsers
                srcSet={`
      ${sampleBannerMobile} 640w, 
      ${sampleBanner} 1280w
    `}
                sizes="(max-width: 640px) , (min-width: 641px) "
                alt="Hero Banner"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                }}
            />


            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)', // Optional dark overlay
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View style={{ padding: 10, width: '100%', maxWidth: 1280, position: 'absolute', left: screenWidth <= 640 ? null : parentPosition.left + 10, top: screenWidth <= 640 ? 120 : 120 }}>
                    <Text
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: screenWidth <= 640 ? '32px' : 64, // Scaled to 16:9 ratio
                            opacity: 1,
                            textAlign: screenWidth <= 640 ? 'center' : 'left',
                            letterSpacing: 1,
                            textShadowColor: 'rgba(0, 0, 0, 0.75)', // Shadow color
                            textShadowOffset: { width: 2, height: 2 }, // Shadow offset
                            textShadowRadius: 4, // Shadow blur radius
                        }}
                    >
                        REAL MOTOR JAPAN {unsoldVehicleCount}
                    </Text>

                    <Text
                        style={{
                            color: 'white',
                            fontWeight: '600',
                            fontSize: screenWidth <= 640 ? '16px' : 24, // Scaled to 16:9 ratio
                            opacity: 1,
                            textAlign: screenWidth <= 640 ? 'center' : 'left',
                            letterSpacing: 1,
                            textShadowColor: 'rgba(0, 0, 0, 0.75)', // Shadow color
                            textShadowOffset: { width: 2, height: 2 }, // Shadow offset
                            textShadowRadius: 4, // Shadow blur radius
                        }}
                    >
                        Established in 1979, offers affordable, quality used vehicles sourced in Japan.
                    </Text>
              
                </View>
       


            </View>
        </View>

    );
}

// Placeholder Counter Component
