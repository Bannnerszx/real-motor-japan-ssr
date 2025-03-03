// components/OptimizeCarouselSSR.jsx
// Server component for initial render
export function OptimizeCarouselSSR({ unsoldVehicleCount }) {
    const screenWidth = window.innerWidth;
    return (
      <div style={{
        width: '100%',
        height: `${screenWidth <= 640 ? 360 : 720}px`,
        overflow: 'hidden',
        zIndex: -1,
    
      }}>
        <img
          src="/samplebanner3.webp"
          srcSet="
           /samplebannerMobile.webp 640w, 
           /samplebanner3.webp 1280w
          "
          sizes="(max-width: 640px) 100vw, 100vw"
          alt="Hero Banner"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          fetchPriority="high"
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