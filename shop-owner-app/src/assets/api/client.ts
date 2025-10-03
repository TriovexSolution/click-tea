// // // // src/api/axiosClient.ts
// // // import axios from "axios";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import { BASE_URL } from "@/api";

// // // const axiosClient = axios.create({
// // //   baseURL: BASE_URL,
// // //   timeout: 15000,
// // // });

// // // axiosClient.interceptors.request.use(async (config) => {
// // //   const token = await AsyncStorage.getItem("authToken");
// // //   if (token && config.headers) {
// // //     config.headers.Authorization = `Bearer ${token}`;
// // //   }
// // //   return config;
// // // }, (err) => Promise.reject(err));

// // // export default axiosClient;
// // // src/api/axiosClient.ts
// // import axios, { AxiosError, AxiosRequestConfig } from "axios";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { BASE_URL } from "@/api";

// // /**
// //  * axiosClient
// //  * - central baseURL + timeout
// //  * - in-memory tokens for fast header injection (falls back to AsyncStorage)
// //  * - refresh-token flow with request queueing
// //  * - exports setAuthTokens / clearAuthTokens / registerOnAuthFailure
// //  */

// // const axiosClient = axios.create({
// //   baseURL: BASE_URL,
// //   timeout: 15000,
// // });

// // // in-memory copies (fast)
// // let accessToken: string | null = null;
// // let refreshToken: string | null = null;

// // // optional auth-failure callback (e.g. to sign out user + navigate)
// // let onAuthFailureCallback: (() => void) | null = null;

// // export const setAuthTokens = async (tokens: {
// //   accessToken?: string | null;
// //   refreshToken?: string | null;
// // }) => {
// //   if (tokens.accessToken !== undefined) {
// //     accessToken = tokens.accessToken ?? null;
// //     if (tokens.accessToken) await AsyncStorage.setItem("authToken", tokens.accessToken);
// //     else await AsyncStorage.removeItem("authToken");
// //   }
// //   if (tokens.refreshToken !== undefined) {
// //     refreshToken = tokens.refreshToken ?? null;
// //     if (tokens.refreshToken) await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
// //     else await AsyncStorage.removeItem("refreshToken");
// //   }
// // };

// // export const clearAuthTokens = async () => {
// //   accessToken = null;
// //   refreshToken = null;
// //   await AsyncStorage.removeItem("authToken");
// //   await AsyncStorage.removeItem("refreshToken");
// // };

// // export const registerOnAuthFailure = (cb: () => void) => {
// //   onAuthFailureCallback = cb;
// // };

// // // Request interceptor: attach Authorization header using in-memory token
// // axiosClient.interceptors.request.use(
// //   async (config: AxiosRequestConfig) => {
// //     try {
// //       if (!accessToken) {
// //         const stored = await AsyncStorage.getItem("authToken");
// //         accessToken = stored ?? null;
// //       }
// //       if (accessToken && config.headers) {
// //         config.headers["Authorization"] = `Bearer ${accessToken}`;
// //       }
// //     } catch (e) {
// //       // ignore - request proceeds without header
// //       console.warn("axiosClient: token read failed", e);
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // // Response interceptor: refresh-token flow with queueing
// // let isRefreshing = false;
// // type QueuedReq = {
// //   resolve: (value?: unknown) => void;
// //   reject: (reason?: any) => void;
// //   originalConfig: AxiosRequestConfig;
// // };
// // let failedQueue: QueuedReq[] = [];

// // const processQueue = (error: any, token: string | null = null) => {
// //   failedQueue.forEach((p) => {
// //     if (error) p.reject(error);
// //     else {
// //       if (token && p.originalConfig.headers) {
// //         p.originalConfig.headers["Authorization"] = `Bearer ${token}`;
// //       }
// //       p.resolve(axiosClient(p.originalConfig));
// //     }
// //   });
// //   failedQueue = [];
// // };

// // axiosClient.interceptors.response.use(
// //   (res) => res,
// //   async (err: AxiosError & { config?: AxiosRequestConfig }) => {
// //     const originalConfig = err.config;
// //     if (!originalConfig) return Promise.reject(err);

// //     // handle 401 once
// //     if (err.response?.status === 401 && !originalConfig._retry) {
// //       originalConfig._retry = true;

// //       if (isRefreshing) {
// //         // queue the request
// //         return new Promise((resolve, reject) => {
// //           failedQueue.push({ resolve, reject, originalConfig });
// //         });
// //       }

// //       isRefreshing = true;
// //       try {
// //         // ensure refreshToken present
// //         if (!refreshToken) {
// //           const storedRefresh = await AsyncStorage.getItem("refreshToken");
// //           refreshToken = storedRefresh ?? null;
// //         }

// //         if (!refreshToken) {
// //           // cannot refresh -> sign out
// //           if (onAuthFailureCallback) onAuthFailureCallback();
// //           return Promise.reject(err);
// //         }

// //         // call refresh endpoint with plain axios
// //         const plain = axios.create({ baseURL: BASE_URL, timeout: 15000 });
// //         const refreshRes = await plain.post("/api/auth/refresh", { refreshToken });

// //         const newAccess = refreshRes.data?.accessToken ?? null;
// //         const newRefresh = refreshRes.data?.refreshToken ?? null;

// //         if (!newAccess) {
// //           // refresh failed
// //           await clearAuthTokens();
// //           if (onAuthFailureCallback) onAuthFailureCallback();
// //           processQueue(new Error("Refresh failed"), null);
// //           return Promise.reject(err);
// //         }

// //         await setAuthTokens({ accessToken: newAccess, refreshToken: newRefresh ?? refreshToken });
// //         axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

// //         processQueue(null, newAccess);

// //         if (originalConfig.headers) originalConfig.headers["Authorization"] = `Bearer ${newAccess}`;
// //         return axiosClient(originalConfig);
// //       } catch (refreshErr) {
// //         await clearAuthTokens();
// //         if (onAuthFailureCallback) onAuthFailureCallback();
// //         processQueue(refreshErr, null);
// //         return Promise.reject(refreshErr);
// //       } finally {
// //         isRefreshing = false;
// //       }
// //     }

// //     return Promise.reject(err);
// //   }
// // );

// // export default axiosClient;
// // src/api/client.ts
// // import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { BASE_URL } from "@/api"; // <- use same BASE_URL used in your SignInScreen

// // const API_BASE_URL = BASE_URL; // e.g. "https://api.example.com"
// // const ACCESS_TOKEN_KEY = "authToken";
// // const REFRESH_TOKEN_KEY = "refreshToken";

// // const axiosClient: AxiosInstance & { isCancel?: any; CancelToken?: any } = axios.create({
// //   baseURL: API_BASE_URL,
// //   timeout: 30000,
// // });

// // // ---------- in-memory tokens ----------
// // let inMemoryAccessToken: string | null = null;
// // let inMemoryRefreshToken: string | null = null;

// // // ---------- refresh queue ----------
// // let isRefreshing = false;
// // let refreshPromise: Promise<string | null> | null = null;
// // let subscribers: Array<(token: string | null) => void> = [];

// // const authFailureCallbacks: Array<() => void> = [];

// // export function registerOnAuthFailure(cb: () => void) {
// //   authFailureCallbacks.push(cb);
// // }
// // function notifyAuthFailure() {
// //   authFailureCallbacks.forEach((cb) => {
// //     try { cb(); } catch (e) { console.warn("authFailure cb error", e); }
// //   });
// // }

// // function addSubscriber(cb: (token: string | null) => void) {
// //   subscribers.push(cb);
// // }
// // function onRefreshed(token: string | null) {
// //   subscribers.forEach((cb) => cb(token));
// //   subscribers = [];
// // }

// // // ---------- persist helpers ----------
// // export async function setAuthTokens({
// //   accessToken,
// //   refreshToken,
// // }: {
// //   accessToken: string | null;
// //   refreshToken: string | null;
// // }) {
// //   inMemoryAccessToken = accessToken;
// //   inMemoryRefreshToken = refreshToken;

// //   if (accessToken) {
// //     axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
// //     await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
// //   } else {
// //     delete axiosClient.defaults.headers.common["Authorization"];
// //     await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
// //   }

// //   if (refreshToken) {
// //     await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
// //   } else {
// //     await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
// //   }
// // }

// // export async function clearAuthTokens() {
// //   inMemoryAccessToken = null;
// //   inMemoryRefreshToken = null;
// //   delete axiosClient.defaults.headers.common["Authorization"];
// //   await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
// //   await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
// // }

// // // ---------- perform refresh (single concurrent call) ----------
// // async function performRefresh(): Promise<string | null> {
// //   if (isRefreshing && refreshPromise) return refreshPromise;

// //   isRefreshing = true;
// //   refreshPromise = (async () => {
// //     try {
// //       const token = inMemoryRefreshToken ?? (await AsyncStorage.getItem(REFRESH_TOKEN_KEY));
// //       if (!token) throw new Error("No refresh token available");

// //       // call refresh endpoint (use a direct axios call to avoid interceptor loop)
// //       const res = await axios.post(
// //         `${API_BASE_URL}/api/auth/refresh`,
// //         { refreshToken: token },
// //         { timeout: 15000 }
// //       );

// //       const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data ?? {};

// //       if (!newAccessToken || !newRefreshToken) throw new Error("Invalid refresh response");

// //       await setAuthTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

// //       isRefreshing = false;
// //       refreshPromise = null;
// //       onRefreshed(newAccessToken);
// //       return newAccessToken;
// //     } catch (err) {
// //       // refresh failed -> clear tokens & notify app to sign out
// //       await clearAuthTokens();
// //       isRefreshing = false;
// //       refreshPromise = null;
// //       onRefreshed(null);
// //       notifyAuthFailure();
// //       return null;
// //     }
// //   })();

// //   return refreshPromise;
// // }

// // // ---------- request interceptor: attach token ----------
// // axiosClient.interceptors.request.use(
// //   async (cfg: AxiosRequestConfig) => {
// //     const token = inMemoryAccessToken ?? (await AsyncStorage.getItem(ACCESS_TOKEN_KEY));
// //     if (token) {
// //       cfg.headers = cfg.headers ?? {};
// //       (cfg.headers as any)["Authorization"] = `Bearer ${token}`;
// //     }
// //     return cfg;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // // ---------- response interceptor: on 401, attempt refresh & retry ----------
// // axiosClient.interceptors.response.use(
// //   (res) => res,
// //   async (error: AxiosError) => {
// //     const originalReq = (error.config as AxiosRequestConfig & { _retry?: boolean }) || {};

// //     if (!error.response) return Promise.reject(error);
// //     if (error.response.status === 401 && !originalReq._retry) {
// //       originalReq._retry = true;

// //       const newToken = await performRefresh();
// //       if (!newToken) return Promise.reject(error);

// //       originalReq.headers = originalReq.headers ?? {};
// //       (originalReq.headers as any).Authorization = `Bearer ${newToken}`;
// //       try {
// //         return axiosClient(originalReq);
// //       } catch (retryErr) {
// //         return Promise.reject(retryErr);
// //       }
// //     }

// //     return Promise.reject(error);
// //   }
// // );

// // // expose cancel helpers
// // axiosClient.CancelToken = axios.CancelToken;
// // axiosClient.isCancel = axios.isCancel;

// // export default axiosClient;
// // src/api/client.ts
// import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "@/api"; // keep this consistent with your SignInScreen

// const API_BASE_URL = BASE_URL;
// const ACCESS_TOKEN_KEY = "authToken";
// const REFRESH_TOKEN_KEY = "refreshToken";

// const axiosClient: AxiosInstance & { isCancel?: any; CancelToken?: any } = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
// });

// // In-memory tokens
// let inMemoryAccessToken: string | null = null;
// let inMemoryRefreshToken: string | null = null;

// // Refresh queue
// let isRefreshing = false;
// let refreshPromise: Promise<string | null> | null = null;
// let subscribers: Array<(token: string | null) => void> = [];

// // Auth-failure callbacks (AuthContext registers signOut)
// const authFailureCallbacks: Array<() => void> = [];
// export function registerOnAuthFailure(cb: () => void) {
//   authFailureCallbacks.push(cb);
// }
// function notifyAuthFailure() {
//   authFailureCallbacks.forEach((cb) => {
//     try { cb(); } catch (e) { console.warn("authFailure cb error", e); }
//   });
// }

// function addSubscriber(cb: (token: string | null) => void) {
//   subscribers.push(cb);
// }
// function onRefreshed(token: string | null) {
//   subscribers.forEach((cb) => cb(token));
//   subscribers = [];
// }

// /** Persist tokens and update default header */
// export async function setAuthTokens({
//   accessToken,
//   refreshToken,
// }: {
//   accessToken: string | null;
//   refreshToken: string | null;
// }) {
//   inMemoryAccessToken = accessToken;
//   inMemoryRefreshToken = refreshToken;

//   if (accessToken) {
//     axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//     await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
//     console.log("[client] setAuthTokens - accessToken stored");
//   } else {
//     delete axiosClient.defaults.headers.common["Authorization"];
//     await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
//     console.log("[client] setAuthTokens - accessToken removed");
//   }

//   if (refreshToken) {
//     await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
//     console.log("[client] setAuthTokens - refreshToken stored");
//   } else {
//     await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
//     console.log("[client] setAuthTokens - refreshToken removed");
//   }
// }

// /** Clear all tokens */
// export async function clearAuthTokens() {
//   inMemoryAccessToken = null;
//   inMemoryRefreshToken = null;
//   delete axiosClient.defaults.headers.common["Authorization"];
//   await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
//   await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
//   console.log("[client] clearAuthTokens called");
// }

// /** Single concurrent refresh (returns new access token or null) */
// async function performRefresh(): Promise<string | null> {
//   if (isRefreshing && refreshPromise) {
//     console.log("[client] performRefresh: already refreshing - waiting");
//     return refreshPromise;
//   }

//   isRefreshing = true;
//   refreshPromise = (async () => {
//     try {
//       const token = inMemoryRefreshToken ?? (await AsyncStorage.getItem(REFRESH_TOKEN_KEY));
//       if (!token) {
//         console.warn("[client] performRefresh: no refreshToken available");
//         throw new Error("No refresh token");
//       }

//       console.log("[client] performRefresh: calling /api/auth/refresh");
//       // use plain axios (not client) to avoid interceptors
//       const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken: token }, { timeout: 15000 });

//       const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data ?? {};
//       console.log("[client] performRefresh: server response", !!newAccessToken, !!newRefreshToken);

//       if (!newAccessToken || !newRefreshToken) {
//         console.warn("[client] performRefresh: invalid refresh response", res.data);
//         throw new Error("Invalid refresh response");
//       }

//       await setAuthTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

//       isRefreshing = false;
//       refreshPromise = null;
//       onRefreshed(newAccessToken);
//       return newAccessToken;
//     } catch (err) {
//       console.error("[client] performRefresh failed:", err?.response?.data ?? err.message ?? err);
//       await clearAuthTokens();
//       isRefreshing = false;
//       refreshPromise = null;
//       onRefreshed(null);
//       notifyAuthFailure();
//       return null;
//     }
//   })();

//   return refreshPromise;
// }

// /** Request interceptor: attach access token */
// axiosClient.interceptors.request.use(
//   async (cfg: AxiosRequestConfig) => {
//     const token = inMemoryAccessToken ?? (await AsyncStorage.getItem(ACCESS_TOKEN_KEY));
//     if (token) {
//       cfg.headers = cfg.headers ?? {};
//       (cfg.headers as any)["Authorization"] = `Bearer ${token}`;
//     }
//     return cfg;
//   },
//   (error) => Promise.reject(error)
// );

// /** Response interceptor: try refresh on 401 and retry. */
// // axiosClient.interceptors.response.use(
// //   (res) => res,
// //   async (error: AxiosError) => {
// //     const originalReq = (error.config as AxiosRequestConfig & { _retry?: boolean }) || {};

// //     if (!error.response) {
// //       // network or CORS
// //       console.warn("[client] network/no-response error", error.message);
// //       return Promise.reject(error);
// //     }

// //     // If server returns 401 (token expired/invalid)
// //     if (error.response.status === 401 && !originalReq._retry) {
// //       originalReq._retry = true;
// //       console.warn("[client] got 401 for", originalReq.url, " — attempting refresh");

// //       // Wait for refresh (single concurrency safe)
// //       const newToken = await performRefresh();
// //       if (!newToken) {
// //         console.warn("[client] refresh failed -> rejecting original request");
// //         return Promise.reject(error);
// //       }

// //       // Try retrying the original request with new token.
// //       // Use axios.request as fallback to avoid any edge-case interceptor recursion.
// //       try {
// //         originalReq.headers = originalReq.headers ?? {};
// //         (originalReq.headers as any)["Authorization"] = `Bearer ${newToken}`;
// //         // Try using client first (so interceptors/cancel tokens are preserved)
// //         return axiosClient(originalReq);
// //       } catch (retryErr) {
// //         console.warn("[client] retry via client failed, trying axios.request fallback", retryErr);
// //         try {
// //           // remove custom baseURL if missing; use absolute URL to be safe
// //           const fullUrl = originalReq.baseURL ? `${originalReq.baseURL}${originalReq.url}` : originalReq.url;
// //           const fallbackConfig = { ...originalReq, url: fullUrl };
// //           // @ts-ignore
// //           fallbackConfig.headers = { ...(fallbackConfig.headers || {}), Authorization: `Bearer ${newToken}` };
// //           return axios.request(fallbackConfig);
// //         } catch (finalErr) {
// //           console.error("[client] final retry failed", finalErr);
// //           return Promise.reject(finalErr);
// //         }
// //       }
// //     }

// //     // Otherwise just reject
// //     return Promise.reject(error);
// //   }
// // );
// axiosClient.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError) => {
//     const originalReq = (error.config as AxiosRequestConfig & { _retry?: boolean }) || {};

//     if (!error.response) {
//       console.warn("[client] network/no-response error", error.message);
//       return Promise.reject(error);
//     }

//     // Only handle 401 once per request
//     if (error.response.status === 401 && !originalReq._retry) {
//       originalReq._retry = true;
//       console.warn("[client] got 401 for", originalReq.url, " — attempting refresh");

//       // If refresh already in progress, subscribe and retry after refresh completes
//       if (isRefreshing) {
//         console.log("[client] refresh in progress - queuing request:", originalReq.url);
//         return new Promise((resolve, reject) => {
//           addSubscriber(async (token) => {
//             try {
//               if (!token) return reject(error); // refresh failed
//               // Build a fresh config clone and attach header
//               const retryCfg: any = {
//                 ...originalReq,
//                 headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${token}` },
//               };
//               // If originalReq.url is relative, compose full URL using baseURL to be safe
//               if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
//                 retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
//                 delete retryCfg.baseURL;
//               }
//               const resp = await axios.request(retryCfg);
//               resolve(resp);
//             } catch (e) {
//               reject(e);
//             }
//           });
//         });
//       }

//       // Not currently refreshing: perform refresh (single concurrency inside performRefresh())
//       try {
//         const newToken = await performRefresh();
//         if (!newToken) {
//           console.warn("[client] refresh failed -> rejecting original request");
//           return Promise.reject(error);
//         }

//         // Retry original request with new token.
//         try {
//           // Clone and attach header (avoid mutating original config object used elsewhere)
//           const retryCfg: any = {
//             ...originalReq,
//             headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${newToken}` },
//           };
//           if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
//             retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
//             delete retryCfg.baseURL;
//           }
//           const retryResp = await axios.request(retryCfg);
//           return retryResp;
//         } catch (retryErr) {
//           console.warn("[client] retry via axios.request failed after refresh:", retryErr);
//           return Promise.reject(retryErr);
//         }
//       } catch (e) {
//         console.error("[client] performRefresh error:", e);
//         return Promise.reject(e);
//       }
//     }

//     // Not-handled case: just propagate
//     return Promise.reject(error);
//   }
// );
// // expose cancel helpers
// axiosClient.CancelToken = axios.CancelToken;
// axiosClient.isCancel = axios.isCancel;

// // export default axiosClient;
// import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "@/api";

// const API_BASE_URL = BASE_URL;
// const ACCESS_TOKEN_KEY = "authToken";
// const REFRESH_TOKEN_KEY = "refreshToken";

// const axiosClient: AxiosInstance & { isCancel?: any; CancelToken?: any } = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
// });

// // In-memory tokens
// let inMemoryAccessToken: string | null = null;
// let inMemoryRefreshToken: string | null = null;

// // Refresh queue
// let isRefreshing = false;
// let refreshPromise: Promise<string | null> | null = null;
// let subscribers: Array<(token: string | null) => void> = [];

// // Auth-failure callbacks
// const authFailureCallbacks: Array<() => void> = [];
// export function registerOnAuthFailure(cb: () => void) {
//   authFailureCallbacks.push(cb);
// }
// function notifyAuthFailure() {
//   authFailureCallbacks.forEach((cb) => {
//     try { cb(); } catch (e) { console.warn("authFailure cb error", e); }
//   });
// }

// function addSubscriber(cb: (token: string | null) => void) {
//   subscribers.push(cb);
// }
// function onRefreshed(token: string | null) {
//   subscribers.forEach((cb) => cb(token));
//   subscribers = [];
// }

// /** Persist tokens and update default header */
// export async function setAuthTokens({
//   accessToken,
//   refreshToken,
// }: {
//   accessToken: string | null;
//   refreshToken: string | null;
// }) {
//   inMemoryAccessToken = accessToken;
//   inMemoryRefreshToken = refreshToken;

//   if (accessToken) {
//     axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//     await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
//     console.log("[client] ✅ setAuthTokens - accessToken stored");
//   } else {
//     delete axiosClient.defaults.headers.common["Authorization"];
//     await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
//     console.log("[client] ❌ setAuthTokens - accessToken removed");
//   }

//   if (refreshToken) {
//     await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
//     console.log("[client] ✅ setAuthTokens - refreshToken stored");
//   } else {
//     await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
//     console.log("[client] ❌ setAuthTokens - refreshToken removed");
//   }
// }

// /** Clear all tokens */
// export async function clearAuthTokens() {
//   inMemoryAccessToken = null;
//   inMemoryRefreshToken = null;
//   delete axiosClient.defaults.headers.common["Authorization"];
//   await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
//   await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
//   console.log("[client] 🧹 clearAuthTokens called");
// }

// /** Single concurrent refresh */
// async function performRefresh(): Promise<string | null> {
//   if (isRefreshing && refreshPromise) {
//     console.log("[client] ⏳ performRefresh: already refreshing - waiting");
//     return refreshPromise;
//   }

//   isRefreshing = true;
//   console.log("[client] 🔄 performRefresh: starting");

//   refreshPromise = (async () => {
//     try {
//       const token = inMemoryRefreshToken ?? (await AsyncStorage.getItem(REFRESH_TOKEN_KEY));
//       if (!token) {
//         console.warn("[client] ⚠️ performRefresh: no refreshToken available");
//         throw new Error("No refresh token");
//       }

//       console.log("[client] 🔄 performRefresh: calling /api/auth/refresh with refreshToken");
//       const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken: token }, { timeout: 15000 });

//       const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data ?? {};
//       console.log("[client] 🔄 performRefresh: server response", { hasAccess: !!newAccessToken, hasRefresh: !!newRefreshToken });

//       if (!newAccessToken || !newRefreshToken) {
//         console.warn("[client] ⚠️ performRefresh: invalid refresh response", res.data);
//         throw new Error("Invalid refresh response");
//       }

//       await setAuthTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

//       isRefreshing = false;
//       refreshPromise = null;
//       onRefreshed(newAccessToken);
//       console.log("[client] ✅ performRefresh: success, token updated");
//       return newAccessToken;
//     } catch (err: any) {
//       console.error("[client] ❌ performRefresh failed:", err?.response?.data ?? err.message ?? err);
//       await clearAuthTokens();
//       isRefreshing = false;
//       refreshPromise = null;
//       onRefreshed(null);
//       notifyAuthFailure();
//       return null;
//     }
//   })();

//   return refreshPromise;
// }

// /** Request interceptor: attach access token */
// axiosClient.interceptors.request.use(
//   async (cfg: AxiosRequestConfig) => {
//     const token = inMemoryAccessToken ?? (await AsyncStorage.getItem(ACCESS_TOKEN_KEY));
//     console.log("➡️ Request:", {
//       method: cfg.method,
//       url: `${cfg.baseURL}${cfg.url}`,
//       hasToken: !!token,
//     });

//     if (token) {
//       cfg.headers = cfg.headers ?? {};
//       (cfg.headers as any)["Authorization"] = `Bearer ${token}`;
//     }

//     if (cfg.data instanceof FormData) {
//       console.log("➡️ Request body is FormData with keys:", Array.from(cfg.data.keys()));
//     } else if (cfg.data) {
//       console.log("➡️ Request body:", cfg.data);
//     }

//     return cfg;
//   },
//   (error) => Promise.reject(error)
// );

// /** Response interceptor */
// axiosClient.interceptors.response.use(
//   (res) => {
//     console.log("✅ Response:", {
//       url: res.config.url,
//       status: res.status,
//       data: res.data,
//     });
//     return res;
//   },
//   async (error: AxiosError) => {
//     const originalReq = (error.config as AxiosRequestConfig & { _retry?: boolean }) || {};

//     if (!error.response) {
//       console.warn("❌ Network/no-response error:", error.message);
//       return Promise.reject(error);
//     }

//     console.log("❌ Response error:", {
//       url: originalReq.url,
//       status: error.response.status,
//       data: error.response.data,
//     });

//     if (error.response.status === 401 && !originalReq._retry) {
//       originalReq._retry = true;
//       console.warn("[client] ⚠️ got 401 for", originalReq.url, "— attempting refresh");

//       if (isRefreshing) {
//         console.log("[client] ⏳ refresh in progress - queuing request:", originalReq.url);
//         return new Promise((resolve, reject) => {
//           addSubscriber(async (token) => {
//             try {
//               if (!token) return reject(error);
//               const retryCfg: any = {
//                 ...originalReq,
//                 headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${token}` },
//               };
//               if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
//                 retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
//                 delete retryCfg.baseURL;
//               }
//               console.log("[client] 🔄 Retrying queued request:", retryCfg.url);
//               const resp = await axios.request(retryCfg);
//               resolve(resp);
//             } catch (e) {
//               reject(e);
//             }
//           });
//         });
//       }

//       try {
//         const newToken = await performRefresh();
//         if (!newToken) {
//           console.warn("[client] ❌ refresh failed -> rejecting original request");
//           return Promise.reject(error);
//         }

//         const retryCfg: any = {
//           ...originalReq,
//           headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${newToken}` },
//         };
//         if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
//           retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
//           delete retryCfg.baseURL;
//         }
//         console.log("[client] 🔄 Retrying original request after refresh:", retryCfg.url);
//         const retryResp = await axios.request(retryCfg);
//         return retryResp;
//       } catch (e) {
//         console.error("[client] ❌ performRefresh error:", e);
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // expose cancel helpers
// axiosClient.CancelToken = axios.CancelToken;
// axiosClient.isCancel = axios.isCancel;

// export default axiosClient; change on 23 september 11.41 am
// src/assets/api/client.ts (updated)
// import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "@/api";

// const API_BASE_URL = BASE_URL;
// const ACCESS_TOKEN_KEY = "authToken";
// const REFRESH_TOKEN_KEY = "refreshToken";

// const axiosClient: AxiosInstance & { isCancel?: any; CancelToken?: any } = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
// });

// // In-memory tokens
// let inMemoryAccessToken: string | null = null;
// let inMemoryRefreshToken: string | null = null;

// // Refresh queue
// let isRefreshing = false;
// let refreshPromise: Promise<string | null> | null = null;
// let subscribers: Array<(token: string | null) => void> = [];

// // Auth-failure callbacks
// const authFailureCallbacks: Array<() => void> = [];
// export function registerOnAuthFailure(cb: () => void) {
//   authFailureCallbacks.push(cb);
// }
// function notifyAuthFailure() {
//   authFailureCallbacks.forEach((cb) => {
//     try { cb(); } catch (e) { console.warn("authFailure cb error", e); }
//   });
// }

// function addSubscriber(cb: (token: string | null) => void) {
//   subscribers.push(cb);
// }
// function onRefreshed(token: string | null) {
//   subscribers.forEach((cb) => cb(token));
//   subscribers = [];
// }

// /** Persist tokens and update default header */
// export async function setAuthTokens({
//   accessToken,
//   refreshToken,
// }: {
//   accessToken: string | null;
//   refreshToken: string | null;
// }) {
//   inMemoryAccessToken = accessToken;
//   inMemoryRefreshToken = refreshToken;

//   if (accessToken) {
//     axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//     await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
//     console.log("[client] ✅ setAuthTokens - accessToken stored");
//   } else {
//     delete axiosClient.defaults.headers.common["Authorization"];
//     await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
//     console.log("[client] ❌ setAuthTokens - accessToken removed");
//   }

//   if (refreshToken) {
//     await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
//     console.log("[client] ✅ setAuthTokens - refreshToken stored");
//   } else {
//     await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
//     console.log("[client] ❌ setAuthTokens - refreshToken removed");
//   }
// }

// /** Clear all tokens */
// export async function clearAuthTokens() {
//   inMemoryAccessToken = null;
//   inMemoryRefreshToken = null;
//   delete axiosClient.defaults.headers.common["Authorization"];
//   await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
//   await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
//   console.log("[client] 🧹 clearAuthTokens called");
// }

// /** Initialize tokens from storage (call at app startup) */
// export async function initAuth() {
//   try {
//     const [storedAccess, storedRefresh] = await Promise.all([
//       AsyncStorage.getItem(ACCESS_TOKEN_KEY),
//       AsyncStorage.getItem(REFRESH_TOKEN_KEY),
//     ]);
//     if (storedAccess || storedRefresh) {
//       // set in-memory + axios default header
//       await setAuthTokens({ accessToken: storedAccess, refreshToken: storedRefresh });
//       console.log("[client] initAuth: tokens loaded from storage");
//     } else {
//       console.log("[client] initAuth: no tokens found");
//     }
//   } catch (e) {
//     console.warn("[client] initAuth error", e);
//   }
// }

// // Single concurrent refresh
// async function performRefresh(): Promise<string | null> {
//   if (isRefreshing && refreshPromise) {
//     console.log("[client] ⏳ performRefresh: already refreshing - waiting");
//     return refreshPromise;
//   }

//   isRefreshing = true;
//   console.log("[client] 🔄 performRefresh: starting");

//   refreshPromise = (async () => {
//     try {
//       const token = inMemoryRefreshToken ?? (await AsyncStorage.getItem(REFRESH_TOKEN_KEY));
//       if (!token) {
//         console.warn("[client] ⚠️ performRefresh: no refreshToken available");
//         throw new Error("No refresh token");
//       }

//       console.log("[client] 🔄 performRefresh: calling /api/auth/refresh with refreshToken");
//       const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken: token }, { timeout: 15000 });

//       const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data ?? {};
//       console.log("[client] 🔄 performRefresh: server response", { hasAccess: !!newAccessToken, hasRefresh: !!newRefreshToken });

//       if (!newAccessToken || !newRefreshToken) {
//         console.warn("[client] ⚠️ performRefresh: invalid refresh response", res.data);
//         throw new Error("Invalid refresh response");
//       }

//       await setAuthTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

//       isRefreshing = false;
//       refreshPromise = null;
//       onRefreshed(newAccessToken);
//       console.log("[client] ✅ performRefresh: success, token updated");
//       return newAccessToken;
//     } catch (err: any) {
//       console.error("[client] ❌ performRefresh failed:", err?.response?.data ?? err.message ?? err);
//       await clearAuthTokens();
//       isRefreshing = false;
//       refreshPromise = null;
//       onRefreshed(null);
//       notifyAuthFailure();
//       return null;
//     }
//   })();

//   return refreshPromise;
// }

// /** helper to build a safe full URL for logging/retries */
// function buildFullUrl(cfg: AxiosRequestConfig) {
//   if (!cfg) return "";
//   const url = cfg.url || "";
//   if (url.startsWith("http")) return url;
//   const base = cfg.baseURL ?? axiosClient.defaults.baseURL ?? "";
//   return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
// }

// /** Request interceptor: attach access token */
// axiosClient.interceptors.request.use(
//   async (cfg: AxiosRequestConfig) => {
//     const token = inMemoryAccessToken ?? (await AsyncStorage.getItem(ACCESS_TOKEN_KEY));
//     console.log("➡️ Request:", {
//       method: cfg.method,
//       url: buildFullUrl(cfg),
//       hasToken: !!token,
//     });

//     if (token) {
//       cfg.headers = cfg.headers ?? {};
//       (cfg.headers as any)["Authorization"] = `Bearer ${token}`;
//     }

//     if (cfg.data instanceof FormData) {
//       try {
//         console.log("➡️ Request body is FormData with keys:", Array.from((cfg.data as FormData).keys()));
//       } catch (e) {
//         console.log("➡️ Request body is FormData");
//       }
//     } else if (cfg.data) {
//       console.log("➡️ Request body:", cfg.data);
//     }

//     return cfg;
//   },
//   (error) => Promise.reject(error)
// );

// /** Response interceptor */
// axiosClient.interceptors.response.use(
//   // success handler
//   async (res) => {
//     // Auto-persist tokens when server returns them (e.g. createShop returns token)
//     try {
//       const tokenFromRes = res?.data?.token ?? res?.data?.accessToken ?? null;
//       const refreshFromRes = res?.data?.refreshToken ?? null;
//       if (tokenFromRes) {
//         // Wait for setAuthTokens to complete before returning response
//         await setAuthTokens({ accessToken: tokenFromRes, refreshToken: refreshFromRes ?? inMemoryRefreshToken });
//         console.log("[client] 🔐 response interceptor: stored token from response");
//       }
//     } catch (e) {
//       console.warn("[client] response interceptor token store failed", e);
//     }

//     console.log("✅ Response:", {
//       url: res.config?.url ? buildFullUrl(res.config) : res.config?.url,
//       status: res.status,
//       data: res.data,
//     });
//     return res;
//   },
//   // error handler
//   async (error: AxiosError) => {
//     const originalReq = (error.config as AxiosRequestConfig & { _retry?: boolean }) || {};

//     if (!error.response) {
//       console.warn("❌ Network/no-response error:", error.message);
//       return Promise.reject(error);
//     }

//     console.log("❌ Response error:", {
//       url: originalReq.url ? buildFullUrl(originalReq) : originalReq.url,
//       status: error.response.status,
//       data: error.response.data,
//     });

//     if (error.response.status === 401 && !originalReq._retry) {
//       originalReq._retry = true;
//       console.warn("[client] ⚠️ got 401 for", originalReq.url, "— attempting refresh");

//       if (isRefreshing) {
//         console.log("[client] ⏳ refresh in progress - queuing request:", originalReq.url);
//         return new Promise((resolve, reject) => {
//           addSubscriber(async (token) => {
//             try {
//               if (!token) return reject(error);
//               const retryCfg: any = {
//                 ...originalReq,
//                 headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${token}` },
//               };
//               if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
//                 retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
//                 delete retryCfg.baseURL;
//               }
//               console.log("[client] 🔄 Retrying queued request:", retryCfg.url);
//               const resp = await axios.request(retryCfg);
//               resolve(resp);
//             } catch (e) {
//               reject(e);
//             }
//           });
//         });
//       }

//       try {
//         const newToken = await performRefresh();
//         if (!newToken) {
//           console.warn("[client] ❌ refresh failed -> rejecting original request");
//           return Promise.reject(error);
//         }

//         const retryCfg: any = {
//           ...originalReq,
//           headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${newToken}` },
//         };
//         if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
//           retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
//           delete retryCfg.baseURL;
//         }
//         console.log("[client] 🔄 Retrying original request after refresh:", retryCfg.url);
//         const retryResp = await axios.request(retryCfg);
//         return retryResp;
//       } catch (e) {
//         console.error("[client] ❌ performRefresh error:", e);
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // expose cancel helpers
// axiosClient.CancelToken = axios.CancelToken;
// axiosClient.isCancel = axios.isCancel;

// export default axiosClient;


import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// keep this in sync with your environment config
import { BASE_URL } from "@/api";

const API_BASE_URL = BASE_URL;
const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production";

/**
 * axios client instance
 */
const axiosClient: AxiosInstance & { isCancel?: any; CancelToken?: any } = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ---------- in-memory token cache ----------
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

// ---------- refresh concurrency helpers ----------
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let subscribers: Array<(token: string | null) => void> = [];

const authFailureCallbacks: Array<() => void> = [];

export function registerOnAuthFailure(cb: () => void) {
  authFailureCallbacks.push(cb);
}
function notifyAuthFailure() {
  authFailureCallbacks.forEach((cb) => {
    try { cb(); } catch (e) { if (isDev) console.warn("authFailure cb error", e); }
  });
}

function addSubscriber(cb: (token: string | null) => void) {
  subscribers.push(cb);
}
function onRefreshed(token: string | null) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

// ---------- token persistence and header update ----------
export async function setAuthTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string | null;
  refreshToken: string | null;
}) {
  inMemoryAccessToken = accessToken;
  inMemoryRefreshToken = refreshToken;

  if (accessToken) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    try { await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken); } catch (e) { if (isDev) console.warn("store accessToken failed", e); }
    if (isDev) console.log("[client] accessToken set");
  } else {
    delete axiosClient.defaults.headers.common["Authorization"];
    try { await AsyncStorage.removeItem(ACCESS_TOKEN_KEY); } catch {}
    if (isDev) console.log("[client] accessToken removed");
  }

  if (refreshToken) {
    try { await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); } catch (e) { if (isDev) console.warn("store refreshToken failed", e); }
    if (isDev) console.log("[client] refreshToken set");
  } else {
    try { await AsyncStorage.removeItem(REFRESH_TOKEN_KEY); } catch {}
    if (isDev) console.log("[client] refreshToken removed");
  }
}

export async function clearAuthTokens() {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  delete axiosClient.defaults.headers.common["Authorization"];
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (e) { if (isDev) console.warn("clearAuthTokens storage error", e); }
  if (isDev) console.log("[client] cleared tokens");
}

// ---------- perform refresh with single-concurrency ----------
async function performRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    if (isDev) console.log("[client] refresh already in progress - awaiting");
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const token = inMemoryRefreshToken ?? (await AsyncStorage.getItem(REFRESH_TOKEN_KEY));
      if (!token) {
        if (isDev) console.warn("[client] performRefresh: no refreshToken");
        throw new Error("No refresh token");
      }

      if (isDev) console.log("[client] calling refresh endpoint");
      // use base axios to avoid this instance's interceptors
      const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken: token }, { timeout: 15_000 });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data ?? {};
      if (!newAccessToken || !newRefreshToken) {
        if (isDev) console.warn("[client] performRefresh: invalid payload", res.data);
        throw new Error("Invalid refresh response");
      }

      await setAuthTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

      isRefreshing = false;
      refreshPromise = null;
      onRefreshed(newAccessToken);
      return newAccessToken;
    } catch (err) {
      if (isDev) console.error("[client] performRefresh failed:", err?.response?.data ?? err?.message ?? err);
      await clearAuthTokens();
      isRefreshing = false;
      refreshPromise = null;
      onRefreshed(null);
      notifyAuthFailure();
      return null;
    }
  })();

  return refreshPromise;
}

// ---------- request interceptor: attach access token ----------
axiosClient.interceptors.request.use(
  async (cfg: AxiosRequestConfig) => {
    const token = inMemoryAccessToken ?? (await AsyncStorage.getItem(ACCESS_TOKEN_KEY));
    if (token) {
      cfg.headers = cfg.headers ?? {};
      (cfg.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return cfg;
  },
  (error) => Promise.reject(error)
);

// ---------- response interceptor: handle 401, queue concurrent requests ----------
axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalReq = (error.config as AxiosRequestConfig & { _retry?: boolean }) || {};

    if (!error.response) {
      // network or CORS
      if (isDev) console.warn("[client] network/no-response error", error.message);
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      if (isDev) console.warn("[client] 401 received for", originalReq.url, "- attempting refresh");

      // if refresh running -> queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addSubscriber(async (token) => {
            try {
              if (!token) return reject(error); // refresh failed
              const retryCfg: any = {
                ...originalReq,
                headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${token}` },
              };
              if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
                retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
                delete retryCfg.baseURL;
              }
              const resp = await axios.request(retryCfg);
              resolve(resp);
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      // otherwise, attempt refresh then retry
      try {
        const newToken = await performRefresh();
        if (!newToken) {
          if (isDev) console.warn("[client] refresh returned null - rejecting");
          return Promise.reject(error);
        }

        const retryCfg: any = {
          ...originalReq,
          headers: { ...(originalReq.headers || {}), Authorization: `Bearer ${newToken}` },
        };
        if (!retryCfg.url?.startsWith("http") && retryCfg.baseURL) {
          retryCfg.url = `${retryCfg.baseURL.replace(/\/$/, "")}${retryCfg.url}`;
          delete retryCfg.baseURL;
        }
        const retryResp = await axios.request(retryCfg);
        return retryResp;
      } catch (e) {
        if (isDev) console.error("[client] retry after refresh failed", e);
        return Promise.reject(e);
      }
    }

    // default: propagate
    return Promise.reject(error);
  }
);

// expose cancel helpers
axiosClient.CancelToken = axios.CancelToken;
axiosClient.isCancel = axios.isCancel;

/**
 * apiRequest helper - normalizes errors and returns typed data
 * Usage: const data = await apiRequest<MyType>(() => axiosClient.get('/my/endpoint'));
 */
export async function apiRequest<T>(fn: () => Promise<any>): Promise<T> {
  try {
    const resp = await fn();
    return resp.data as T;
  } catch (err: any) {
    // Normalize axios errors to a simple shape
    if (axios.isAxiosError(err)) {
      const serverMsg = err?.response?.data?.message ?? err?.response?.statusText ?? err.message;
      const normalized = {
        message: serverMsg,
        status: err?.response?.status ?? null,
        original: err,
      };
      throw normalized;
    }
    throw { message: err?.message ?? String(err), status: null, original: err };
  }
}

export default axiosClient;

