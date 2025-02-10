
import dynamic from 'next/dynamic';
const HomePage = dynamic(() => import('../homeComponents/Home'), { ssr: false });
import Link from 'next/link';
import SEOBrandList from '../SEOListings/SEOBrandList';
import SEOTypeList from '../SEOListings/SEOTypeList';
import StickyFooter from '../homeComponents/StickyFooter';
import OptimizeCarousel from '../homeComponents/OptimizeCarousel';

export async function getServerSideProps() {
  const { db } = await import('../lib/firebaseAdmin');

  try {

    const vehicleProductsRef = db.collection('VehicleProducts');

    // Create a query to filter documents with stockStatus equal to 'On-Sale' and imageCount > 0
    const onSaleQuery = vehicleProductsRef
      .where('stockStatus', '==', 'On-Sale')
      .where('imageCount', '>', 0);

    // Execute the query and get the snapshot
    const snapshot = await onSaleQuery.get();

    // Calculate the count of matching documents
    const unsoldVehicleCount = snapshot.size;
    console.log('Fetched data:', unsoldVehicleCount);

    return {
      props: {
        unsoldVehicleCount,
      },
    };
  } catch (error) {
    console.error('Error fetching document count:', error);
    return {
      props: {
        unsoldVehicleCount: 0,
        error: 'Failed to fetch data',
      },
    };
  }
}

export default function App({ unsoldVehicleCount }) {
  console.log('HOW MANY', unsoldVehicleCount)
  const brand = [
    { id: '1', name: 'TOYOTA' },
    { id: '2', name: 'NISSAN' },
    { id: '3', name: 'HONDA' },
    { id: '4', name: 'MITSUBISHI' },
    { id: '5', name: 'MERCEDES-BENZ' },
    { id: '6', name: 'BMW' },
    { id: '7', name: 'SUZUKI' },
    { id: '8', name: 'SUBARU' },
    { id: '9', name: 'VOLKSWAGEN' },
    { id: '10', name: 'MAZDA' },
  ];
  const types = [
    { id: '1', name: 'SEDAN' },
    { id: '2', name: 'TRUCK' },
    { id: '3', name: 'SUV' },
    { id: '4', name: 'HACHBACK' },
    { id: '5', name: 'WAGON' },
    { id: '6', name: 'VAN/MINIVAN' }
  ];
  return (
    <div>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/products">Products</Link>
      </nav>
      <OptimizeCarousel unsoldVehicleCount={unsoldVehicleCount}/>
      <SEOBrandList logos={brand} />
      <SEOTypeList types={types} />
      <HomePage />

      <StickyFooter />
    </div>
  );
}
