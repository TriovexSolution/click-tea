// src/navigation/routes.ts
export const ROUTES = {
    // Auth stack
    ONBOARD: "onBoardScreen",
    SIGN_UP: "signUpScreen",
    SIGN_IN: "signInScreen",
    OTP_VERIFICATION: "otpVerificationScreen",
    FORGOT_PASSWORD: "forgotPasswordScreen", // normalized name
    RESET_PASSWORD: "resetPasswordScreen",
    NEW_PASSWORD: "newPasswordScreen", // consistent name
  
    // App / availability
    AVAILABILITY_GATE: "availabilityGate",
    LOCATION: "locationScreen",
    SERVICE_NOT_AVAILABLE: "serviceNotAvailable",
    NEAREST_SHOP: "nearestShopScreen",
  
    // Main / app screens
    BOTTOM_TABS: "bottomTabScreen",
    HOME:"Home",
    TEA_AND_COFFEE: "teaAndCoffeeScreen",
    SHOP_DETAIL: "shopDetailScreen",
    CART: "cartScreen",
    CHANGE_ADDRESS: "changeAddressScreen",
    ADD_NEW_ADDRESS: "addNewAddressScreen",
    ORDERS: "orderScreen",
    ORDER_DETAILS: "orderDetailScreen",
    VIEW_ALL_CATEGORY: "viewAllCategoryScreen",
    CATEGORY_DETAIL: "categoryDetailScreen",
    MENU_DETAIL: "menuDetailScreen",
    SEARCH: "searchScreen",
  
    // Profile-related
    CHANGE_PASSWORD: "changePasswordScreen",
    COIN_WALLET: "coinWalletScreen",
    OFFER: "offferScreen", // normalized (was 'offferScreen')
    EDIT_PROFILE: "editProfileScreen",
    TERMS_AND_CONDITIONS: "termsAndConditionScreen",
    FAQ: "faqScreen",
    ABOUT_US: "aboutUsScreen",
    PROFILE:"profileScreen",
    // Pay-later
    PAY_LATER: "payLaterScreen",
    SINGLE_PAY_LATER: "singlePayLaterScreen",
  
    // OTP / password flow (if you want separate keys)
    OTP_VERIFICATION_SCREEN: "otpVerificationScreen",
    NEW_PASSWORD_SCREEN: "newPasswordScreen",
  } as const;
  