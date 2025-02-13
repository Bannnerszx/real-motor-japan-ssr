import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const signUpAndVerifyEmail = async (email, password) => {
  try {
    // Dynamically import Firebase Auth methods
    const { getAuth, createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");

    // Initialize Firebase Auth
    const auth = getAuth();

    // Step 1: Sign up the user using createUserWithEmailAndPassword
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Step 2: Extract the user object from the result
    const user = result.user;

    // Step 3: Define actionCodeSettings for email verification
    const actionCodeSettings = {
      // Update the URL as needed for your Next.js project
      url: "https://real-motor-japan.web.app/EmailVerification",
      handleCodeInApp: true,
    };

    // Step 4: Send email verification
    await sendEmailVerification(user, actionCodeSettings);
    console.log("Verification email sent.");
  } catch (error) {
    console.error("Error during sign-up and email verification:", error);
    throw error; // Propagate the error back to handleSubmit
  }
};

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [name, setProfileDataAuth] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // Store user email here
  const [currentUser, setCurrentUser] = useState(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [step, setStep] = useState(1);
  // oobCode
  // Function to handle user login
  const login = async (email, password) => {
    setIsError(false); // Reset the error state before attempting login

    try {
      // Dynamically import Firebase Auth methods
      const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");

      // Initialize Firebase Auth
      const auth = getAuth();

      // Attempt login
      const userCredentialAuth = await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      console.log("Login success");
      return userCredentialAuth.user; // Return the authenticated user object
    } catch (error) {
      // Handle specific authentication errors
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setIsError(true);
      } else {
        console.log("Login error:", error);
      }
      return null; // Return null when login fails
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      // Dynamically import Firebase Auth methods
      const { getAuth, signOut } = await import("firebase/auth");

      // Initialize Firebase Auth
      const auth = getAuth();

      // Sign out from Firebase Auth (this includes Google sign-ins)
      await signOut(auth);

      setUser(null); // Reset user state
      setStep(1); // Reset to initial step
      console.log("User logged out from all sessions successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const handleAuthStateChanged = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import("firebase/auth");
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (loggedInUser) => {
          if (loggedInUser) {
            const providerData = loggedInUser.providerData;
            const isGoogleUser = providerData.some(
              (provider) => provider.providerId === "google.com"
            );
            const emailVerified = loggedInUser.emailVerified;
            setUser(loggedInUser);
            setUserEmail(loggedInUser.email);

            // Check Firestore if user exists
            try {
              const { default: axios } = await import("axios");
              const response = await axios.post(
                "https://asia-northeast2-samplermj.cloudfunctions.net/checkUserExists",
                { userEmail: loggedInUser.email },
                { headers: { "Cache-Control": "no-cache" } }
              );

              if (response.data.exists) {
                if (response.data.missingFields && response.data.missingFields.length > 0) {
                  console.log("User has missing fields:", response.data.missingFields);
                  // Set the form as incomplete and go to the form step
                  setIsFormComplete(false);
                  setStep(2); // Redirect to form step to complete missing fields
                } else {
                  console.log("User exists with all required fields. Skipping form step.");
                  setIsFormComplete(true);
                  setStep(1); // Skip to home step
                }
              } else {
                console.log("User does not exist in Firestore. Moving to form step.");
                setIsFormComplete(false);
                setStep(2); // Go to form step for new user registration
              }
            } catch (error) {
              console.error("Error checking user existence:", error);
              alert("An error occurred while checking your account. Please try again later.");
            }
          } else {
            setUser(null);
            setUserEmail(null);
            setIsFormComplete(false);
          }
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error handling auth state change:", error);
      }
    };

    // Instead of listening to location changes, we're now listening to router.asPath changes
    handleAuthStateChanged();
  }, [router.asPath]);

  const [notificationCount, setNotificationCount] = useState(0);

  // Notification update using Firestore
  useEffect(() => {
    if (!userEmail) return; // Skip if userEmail is not available

    async function setupListener() {
      try {
        const { projectExtensionFirestore } = await import("../firebaseConfig/firebaseConfig");
        const { query, collection, where, onSnapshot } = await import("firebase/firestore");

        // Reference the 'chats' collection and set up a query
        const chatsRef = collection(projectExtensionFirestore, "chats");
        const chatsQuery = query(
          chatsRef,
          where("participants.customer", "==", userEmail),
          where("customerRead", "==", false) // Additional condition
        );

        // Set up a real-time listener with onSnapshot
        const unsubscribe = onSnapshot(
          chatsQuery,
          (snapshot) => {
            const updatedCount = snapshot.size;
            setNotificationCount(updatedCount); // Update count in context
          },
          (error) => {
            console.error("Error listening for real-time updates:", error);
          }
        );

        // Cleanup listener on component unmount or userEmail change
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up Firestore listener:", error);
      }
    }

    // Call the setupListener function
    const unsubscribe = setupListener();

    // Cleanup listener when the component unmounts or userEmail changes
    return () => {
      if (unsubscribe) {
        unsubscribe.then((fn) => fn && fn());
      }
    };
  }, [userEmail]);

  return (
    <AuthContext.Provider
      value={{
        notificationCount,
        name,
        user,
        isLoading,
        login,
        logout,
        isError,
        setIsError,
        userEmail,
        currentUser,
        signUpAndVerifyEmail,
        setUserEmail,
        isFormComplete,
        setIsFormComplete,
        step,
        setStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
