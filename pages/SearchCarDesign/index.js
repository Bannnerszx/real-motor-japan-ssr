export async function getServerSideProps() {

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