import Head from "next/head";
import dynamic from "next/dynamic";
const ProfileFormChatGroup = dynamic(() => import('../../transactionComponents/ProfileFormChatGroup'), { ssr: false });
export async function getServerSideProps(context) {
    const { slug } = context.params;
    if (!slug) return { props: { transactionData: null } };

    // Expecting slug in the format: "chat_productId_userEmail"
    const [prefix, productId, userEmail] = slug.split("_");
    const transactionData = { productId, userEmail, slug };

    return { props: { transactionData } };
}

export default function TransactionPage({ transactionData }) {
    const chatId = transactionData.slug;
    const stockId = transactionData.productId;
    const userEmail = transactionData.userEmail
    console.log('CHAT ID IS HERE', chatId)
    return (
        <>
            <Head>
                {/* Push the transaction data to GTM's dataLayer */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: 'transactionData',
                transaction: ${JSON.stringify(transactionData)}
              });
            `,
                    }}
                />
            </Head>
            <ProfileFormChatGroup stockId={stockId} chatId={chatId} userEmail={userEmail} />
        </>
    );
}
