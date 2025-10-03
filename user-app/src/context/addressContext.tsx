// // src/context/addressContext.tsx
// import React, { createContext, useContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export type Address = {
//   id: string;
//   addressType: string;
//   fullName: string;
//   phoneNumber: string;
//   pincode: string;
//   state: string;
//   city: string;
//   houseNumber?: string;
//   roadArea?: string;
//   landmark?: string;
// };

// type AddressContextType = {
//   selectedAddress: Address | null;
//   setSelectedAddress: (address: Address) => Promise<void>;
//   clearAddress: () => Promise<void>;
//   ready: boolean; // true once AsyncStorage load finished
// };

// const AddressContext = createContext<AddressContextType>({
//   selectedAddress: null,
//   // noop async functions so consumers can call without checking
//   setSelectedAddress: async () => {},
//   clearAddress: async () => {},
//   ready: false,
// });

// export const AddressProvider = ({ children }: { children: React.ReactNode }) => {
//   const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     const loadStoredAddress = async () => {
//       try {
//         const stored = await AsyncStorage.getItem("selectedAddress");
//         if (!mounted) return;
//         if (stored) {
//           setSelectedAddressState(JSON.parse(stored));
//         }
//       } catch (e) {
//         console.warn("AddressProvider load error", e);
//       } finally {
//         if (mounted) setReady(true);
//       }
//     };
//     loadStoredAddress();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const setSelectedAddress = async (address: Address) => {
//     try {
//       setSelectedAddressState(address);
//       await AsyncStorage.setItem("selectedAddress", JSON.stringify(address));
//     } catch (e) {
//       console.warn("AddressProvider setSelectedAddress error", e);
//     }
//   };

//   const clearAddress = async () => {
//     try {
//       setSelectedAddressState(null);
//       await AsyncStorage.removeItem("selectedAddress");
//     } catch (e) {
//       console.warn("AddressProvider clearAddress error", e);
//     }
//   };

//   return (
//     <AddressContext.Provider value={{ selectedAddress, setSelectedAddress, clearAddress, ready }}>
//       {children}
//     </AddressContext.Provider>
//   );
// };

// export const useAddress = () => useContext(AddressContext);
// src/context/addressContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Address = {
  id: string;
  addressType: string;
  fullName: string;
  phoneNumber: string;
  pincode: string;
  state: string;
  city: string;
  houseNumber?: string;
  roadArea?: string;
  landmark?: string;
};

type AddressContextType = {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address) => Promise<void>;
  clearAddress: () => Promise<void>;
  ready: boolean; // true once AsyncStorage load finished
};

const AddressContext = createContext<AddressContextType>({
  selectedAddress: null,
  // noop async functions so consumers can call without checking
  setSelectedAddress: async () => {},
  clearAddress: async () => {},
  ready: false,
});

export const AddressProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadStoredAddress = async () => {
      try {
        const stored = await AsyncStorage.getItem("selectedAddress");
        if (!mounted) return;
        if (stored) {
          setSelectedAddressState(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("AddressProvider load error", e);
      } finally {
        if (mounted) setReady(true);
      }
    };
    loadStoredAddress();
    return () => {
      mounted = false;
    };
  }, []);

  const setSelectedAddress = async (address: Address) => {
    try {
      setSelectedAddressState(address);
      await AsyncStorage.setItem("selectedAddress", JSON.stringify(address));
    } catch (e) {
      console.warn("AddressProvider setSelectedAddress error", e);
    }
  };

  const clearAddress = async () => {
    try {
      setSelectedAddressState(null);
      await AsyncStorage.removeItem("selectedAddress");
    } catch (e) {
      console.warn("AddressProvider clearAddress error", e);
    }
  };

  return (
    <AddressContext.Provider value={{ selectedAddress, setSelectedAddress, clearAddress, ready }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
