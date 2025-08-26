// const { Expo } = require("expo-server-sdk");
// const pool = require("../config/db");

// const expo = new Expo();

// // Emit real-time event with Socket.IO
// function emitInApp(io, userIds, event, payload) {
//   if (!Array.isArray(userIds)) userIds = [userIds];
//   userIds.forEach((id) => {
//     io.to(`user:${id}`).emit(event, payload);
//   });
// }

// // Fetch tokens from DB
// async function getTokens(userIds) {
//   if (!Array.isArray(userIds)) userIds = [userIds];
//   const [rows] = await pool.query(
//     `SELECT DISTINCT expo_push_token FROM device_push_tokens WHERE user_id IN (?)`,
//     [userIds]
//   );
//   return rows.map(r => r.expo_push_token);
// }

// // Send push notifications
// async function sendPushToUsers(userIds, title, body, data = {}) {
//   const tokens = await getTokens(userIds);

//   const messages = tokens
//     .filter((t) => Expo.isExpoPushToken(t))
//     .map((t) => ({
//       to: t,
//       sound: "default",
//       title,
//       body,
//       data,
//       priority: "high",
//     }));

//   const chunks = expo.chunkPushNotifications(messages);
//   const tickets = [];

//   for (const chunk of chunks) {
//     try {
//       const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       tickets.push(...ticketChunk);
//     } catch (err) {
//       console.error("Expo push error:", err);
//     }
//   }
//   return tickets;
// }

// module.exports = { emitInApp, sendPushToUsers };
// services/notificatonService.js
const { Expo } = require("expo-server-sdk");
const pool = require("../config/db");
const expo = new Expo();

function emitInApp(io, userIds, event, payload) {
  if (!Array.isArray(userIds)) userIds = [userIds];
  userIds.forEach((id) => {
    io.to(`user:${id}`).emit(event, payload);
  });
}

async function getTokens(userIds) {
  if (!Array.isArray(userIds)) userIds = [userIds];
  const [rows] = await pool.query(
    `SELECT DISTINCT expo_push_token FROM device_push_tokens WHERE user_id IN (?)`,
    [userIds]
  );
  return rows.map(r => r.expo_push_token);
}

// Save notification row for in-app history
async function createNotificationRow(userId, type, title, body, payload) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, payload) VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, body, JSON.stringify(payload || {})]
    );
  } catch (err) {
    console.warn("createNotificationRow error:", err);
  }
}

async function sendPushToUsers(userIds, title, body, data = {}) {
  const tokens = await getTokens(userIds);
  const messages = tokens
    .filter(t => Expo.isExpoPushToken(t))
    .map(t => ({
      to: t,
      sound: "default",
      title,
      body,
      data,
      priority: "high"
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error("Expo push error:", err);
    }
  }
  // (Optional) handle tickets -> receipts to track failures and cleanup tokens
  return tickets;
}

/**
 * Convenience: emit socket, persist DB notification, and send push.
 * userIds can be single id or array.
 */
async function notifyUsers({ io, userIds, event, title, body, payload }) {
  if (!Array.isArray(userIds)) userIds = [userIds];

  // 1) socket emit (non-blocking)
  try {
    if (io) emitInApp(io, userIds, event, payload);
  } catch (err) {
    console.warn("emitInApp failed:", err);
  }

  // 2) Persist notification for each user
  try {
    await Promise.all(userIds.map(uid => createNotificationRow(uid, payload.type || event, title, body, payload)));
  } catch (err) {
    console.warn("persist notifications failed:", err);
  }

  // 3) push (best-effort)
  try {
    await sendPushToUsers(userIds, title, body, payload);
  } catch (err) {
    console.warn("sendPushToUsers failed:", err);
  }
}

module.exports = {
  emitInApp,
  getTokens,
  sendPushToUsers,
  notifyUsers,
  createNotificationRow
};
