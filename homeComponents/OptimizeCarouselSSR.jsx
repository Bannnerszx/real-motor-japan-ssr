import React, { useState, useEffect } from "react";


export function OptimizeCarouselSSR({ unsoldVehicleCount }) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // Update height on client-side after hydration
    const updateHeight = () => {
      setHeight(window.innerWidth <= 640 ? 360 : 720);
    };

    updateHeight(); // Set initial value on mount
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  const sampleBanner = "/samplebanner3.webp"; // Desktop banner image
  const sampleBannerMobile = "/samplebannerMobile.webp"; 
  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      overflow: 'hidden',
      zIndex: -1,

    }}>
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
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          padding: '10px',
          width: '100%',
          maxWidth: '1280px',
          position: 'absolute',
          left: '10px',
          top: '120px'
        }}>
          <h1 style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '32px',
            opacity: 1,
            textAlign: 'center',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.75)'
          }}>
            REAL MOTOR JAPAN {unsoldVehicleCount}
          </h1>
          <p style={{
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            opacity: 1,
            textAlign: 'center',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.75)'
          }}>
            Established in 1979, offers affordable, quality used vehicles sourced in Japan.
          </p>
        </div>
      </div>

      {/* Media queries for responsiveness */}
      <style jsx>{`
          @media (min-width: 641px) {
            div {
              height: 720px;
            }
            h1 {
              font-size: 64px;
              text-align: left;
            }
            p {
              font-size: 24px;
              text-align: left;
            }
          }
        `}</style>
    </div>
  );
}