// utils/orderHelpers.js
const { GST_RATE, roundMoney } = require("../config/constant");

/**
 * sanitizeCartItems - remove extra fields and coerce types
 * Expected input item keys (we accept menuId, variantId, quantity, addons)
 */
function sanitizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) return [];
  return cartItems.map((it) => ({
    menuId: Number(it.menuId),
    variantId: it.variantId ? Number(it.variantId) : null,
    quantity: Math.max(1, Number(it.quantity) || 1),
    addons: Array.isArray(it.addons) ? it.addons : [],
  }));
}

/**
 * computeOrderTotals(conn, sanitizedCartItems)
 * - looks up authoritative prices (variant -> menu)
 * - validates existence & availability
 * - returns { prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount }
 *
 * prepared items contain: menuId, variantId, quantity, unitPrice, subtotal, addons, snapshotName, variantSnapshot
 */
async function computeOrderTotals(conn, cartItemsSanitized) {
  let subtotal = 0;
  const prepared = [];

  for (const item of cartItemsSanitized) {
    const menuId = item.menuId;
    const qty = Number(item.quantity) || 1;

    if (!menuId || qty <= 0) {
      throw new Error("Invalid cart item: missing menuId or quantity");
    }

    let unitPrice = 0;
    let snapshotName = null;
    let variantSnapshot = null;

    if (item.variantId) {
      const [vrows] = await conn.query(
        "SELECT mv.variantId, mv.variantName, mv.price, mv.isAvailable, m.menuName FROM menu_variants mv JOIN menus m ON m.menuId = mv.menuId WHERE mv.variantId = ? AND mv.menuId = ? LIMIT 1",
        [item.variantId, menuId]
      );
      if (!vrows || !vrows.length) {
        throw new Error(`Variant not found for menu ${menuId}, variant ${item.variantId}`);
      }
      const v = vrows[0];
      if (v.isAvailable == 0) {
        throw new Error(`Variant not available for menu ${menuId}`);
      }
      unitPrice = Number(v.price || 0);
      snapshotName = v.variantName || v.menuName || null;
      variantSnapshot = { variantId: v.variantId, variantName: v.variantName, price: Number(v.price) };
    } else {
      const [mrows] = await conn.query("SELECT menuName, price FROM menus WHERE menuId = ? LIMIT 1", [menuId]);
      if (!mrows || !mrows.length) {
        throw new Error(`Menu not found: ${menuId}`);
      }
      unitPrice = Number(mrows[0].price || 0);
      snapshotName = mrows[0].menuName || null;
      variantSnapshot = null;
    }

    const subtotalItem = roundMoney(unitPrice * qty);
    subtotal += subtotalItem;

    prepared.push({
      menuId,
      variantId: item.variantId ?? null,
      quantity: qty,
      unitPrice: roundMoney(unitPrice),
      subtotal: roundMoney(subtotalItem),
      addons: item.addons || [],
      snapshotName,
      variantSnapshot,
    });
  }

  subtotal = roundMoney(subtotal);
  const gstAmount = roundMoney(subtotal * GST_RATE);
  const deliveryFee = 0; // change if needed
  const discount = 0; // change if needed
  const totalAmount = roundMoney(subtotal + gstAmount + deliveryFee - discount);

  return { prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount };
}

module.exports = {
  sanitizeCartItems,
  computeOrderTotals,
};
