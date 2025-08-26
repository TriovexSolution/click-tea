    // // src/context/AuthContext.tsx
    // import React, { createContext, useEffect, useState, ReactNode } from "react";
    // import AsyncStorage from "@react-native-async-storage/async-storage";
    // import axios from "axios";
    // import { registerForPushToken } from "@/src/assets/utils/registerForPushToken";
    // import { BASE_URL } from "@/api";

    // type AuthContextType = {
    //   isLoading: boolean;        // restoring token state
    //   isLoggedIn: boolean;
    //   userId: number | null;
    //   token: string | null;
    //   signIn: (token: string, userId?: number) => Promise<void>;
    //   signOut: () => Promise<void>;
    // };

    // export const AuthContext = createContext<AuthContextType>({
    //   isLoading: true,
    //   isLoggedIn: false,
    //   userId: null,
    //   token: null,
    //   signIn: async () => {},
    //   signOut: async () => {},
    // });

    // export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    //   const [isLoading, setIsLoading] = useState(true);
    //   const [isLoggedIn, setIsLoggedIn] = useState(false);
    //   const [token, setToken] = useState<string | null>(null);
    //   const [userId, setUserId] = useState<number | null>(null);

    //   useEffect(() => {
    //     // Restore token & userId on app start
    //     (async () => {
    //       try {
    //         const storedToken = await AsyncStorage.getItem("authToken");
    //         const storedUserId = await AsyncStorage.getItem("userId");
    //         if (storedToken) {
    //           setToken(storedToken);
    //           setIsLoggedIn(true);
    //           if (storedUserId) setUserId(Number(storedUserId));
    //         }
    //       } catch (err) {
    //         console.log("Auth restore error:", err);
    //       } finally {
    //         setIsLoading(false);
    //       }
    //     })();
    //   }, []);

    //   const signIn = async (newToken: string, newUserId?: number) => {
    //     try {
    //       // persist
    //       await AsyncStorage.setItem("authToken", newToken);
    //       if (newUserId !== undefined) {
    //         await AsyncStorage.setItem("userId", String(newUserId));
    //       }

    //       setToken(newToken);
    //       if (newUserId !== undefined) setUserId(newUserId);
    //       setIsLoggedIn(true);

    //       // register push token (non-blocking but we await to handle errors)
    //       try {
    //         const expoPushToken = await registerForPushToken();
    //         if (expoPushToken && (newUserId || userId)) {
    //           const sendUserId = newUserId ?? userId;
    //           // replace endpoint with your server
    //           await axios.post(`${BASE_URL}/api/save-token`, {
    //             userId: sendUserId,
    //             deviceToken: expoPushToken,
    //           });
    //         }
    //       } catch (pushErr) {
    //         console.log("Push token registration error (non-fatal):", pushErr);
    //       }
    //     } catch (err) {
    //       console.log("signIn error:", err);
    //       throw err; // allow caller to show UI
    //     }
    //   };

    //   const signOut = async () => {
    //     try {
    //       await AsyncStorage.removeItem("authToken");
    //       await AsyncStorage.removeItem("userId");
    //       setToken(null);
    //       setUserId(null);
    //       setIsLoggedIn(false);
    //     } catch (err) {
    //       console.log("signOut error:", err);
    //     }
    //   };

    //   return (
    //     <AuthContext.Provider
    //       value={{ isLoading, isLoggedIn, userId, token, signIn, signOut }}
    //     >
    //       {children}
    //     </AuthContext.Provider>
    //   );
    // };
    // src/context/AuthContext.tsx
// src/context/authContext.tsx
import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notificationsService from "@/src/services/notification";
import socketService from "@/src/services/socketService";
import axiosClient from "@/src/api/client";

type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  userId: number | null;
  token: string | null;
  signIn: (token: string, userId?: number) => Promise<void>;
  signOut: () => Promise<void>;
};

const defaultValue: AuthContextType = {
  isLoading: true,
  isLoggedIn: false,
  userId: null,
  token: null,
  signIn: async () => {},
  signOut: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const PUSH_TOKEN_KEY = "expoPushToken";

  // helper: do not import redux here or call useSelector
  const setupPushAndSocket = async (uid: number) => {
    try {
      // 1) register and get expo push token (or cached)
      const expoPushToken = await notificationsService.registerForPushNotificationsAsync();

      // 2) save token to backend (axiosClient handles auth header)
      if (expoPushToken) {
        try {
          await axiosClient.post("/api/notifications/register-push-token", {
            userId: uid,
            expoPushToken,
          });
          console.log("Saved expo token to server:", expoPushToken);
        } catch (err) {
          console.warn("Failed to save push token on server:", err);
        }
      }

      // 3) connect socket and register
      socketService.connectSocket();
      socketService.registerUserOnSocket(uid, null);
    } catch (err) {
      console.warn("setupPushAndSocket error:", err);
    }
  };

  // restore token/userId from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedToken) {
          setToken(storedToken);
          setIsLoggedIn(true);
          if (storedUserId) {
            const uid = Number(storedUserId);
            setUserId(uid);
            // setup push/socket for restored user
            setupPushAndSocket(uid); // run in background — non-blocking
          }
        }
      } catch (err) {
        console.warn("Auth restore error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // signIn: persist token and userId, then setup push/socket
  const signIn = async (newToken: string, newUserId?: number) => {
    try {
      await AsyncStorage.setItem("authToken", newToken);
      if (newUserId !== undefined) {
        await AsyncStorage.setItem("userId", String(newUserId));
      }

      setToken(newToken);
      if (newUserId !== undefined) setUserId(newUserId);
      setIsLoggedIn(true);

      // If we have a userId, register push token + socket
      const idForSetup = newUserId ?? userId;
      if (idForSetup) {
        await setupPushAndSocket(idForSetup);
      } else {
        // still obtain push permissions/token (will be saved when user id comes)
        await notificationsService.registerForPushNotificationsAsync();
      }
    } catch (err) {
      console.error("signIn error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      // disconnect socket
      try {
        socketService.disconnectSocket();
      } catch (e) {
        console.warn("Socket disconnect error:", e);
      }

      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userId");
      setToken(null);
      setUserId(null);
      setIsLoggedIn(false);
    } catch (err) {
      console.error("signOut error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, userId, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// small helper hook
export const useAuth = () => useContext(AuthContext);

