import { projectExtensionFirebase } from './firebaseConfig';

export let isAppCheckInitialized = false; // Export the variable
const appCheckKey = process.env.NEXT_PUBLIC_APP_CHECK_KEY;
// Your predefined Firebase app instance and reCAPTCHA site key
const siteKey = appCheckKey;

console.log('Site key:', appCheckKey);


export async function initializeAppCheckIfNeeded() {
    if (isAppCheckInitialized) {
        console.log('App Check already initialized.');
        return;
    }

    try {
        const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('firebase/app-check');

        // Get the default Firebase app instance
        initializeAppCheck(projectExtensionFirebase, {
            provider: new ReCaptchaEnterpriseProvider(siteKey),
            isTokenAutoRefreshEnabled: true, // Automatically refresh tokens
        });

        isAppCheckInitialized = true; // Update the variable
        console.log('App Check initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize App Check:', error);
    }
}