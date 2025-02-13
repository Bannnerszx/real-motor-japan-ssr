import Head from 'next/head';
import dynamic from 'next/dynamic';
import { db } from '../../lib/firebaseAdmin';
import HomeHeader from '../../headerComponents/HomeHeader';
const ProductDetailScreen = dynamic(() => import('../../productScreenComponents/ProductScreen'), { ssr: false });
const ProductScreen = ({ product, country, city }) => {
    if (!product) {
        return <h1>Product Not Found</h1>;
    }

    return (
        <div>
            <HomeHeader />
            <Head>
                <title>{`${product?.carName}`}</title>
                <meta name="description" content={`Buy ${product.carName} for only $${product.fobPrice}`} />
                <meta property="og:title" content={product.carName} />
                <meta property="og:description" content={`Limited offer: $${product.fobPrice}`} />
                <meta property="og:image" content={product.images[0]} />
            </Head>

            <ProductDetailScreen productId={product.stockID} />
        </div>
    );
};

// ✅ Fetch data on the server BEFORE rendering the page (better for SEO)
export async function getServerSideProps(context) {
    const { id } = context.params; // Get only the product ID
    const { country, city } = context.query;
    try {
        const docRef = db.collection("VehicleProducts").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return { notFound: true }; // Show 404 page if the product is missing
        }

        const product = docSnap.data();

        return {
            props: { product, country: country || null, city: city || null },
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        return { notFound: true };
    }
}

export default ProductScreen;
