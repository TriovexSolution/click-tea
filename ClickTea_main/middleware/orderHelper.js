// utils/orderHelper.js
const round2 = (v) => Number(Number(v).toFixed(2));

/**
 * sanitizeCartItems(items)
 * - ensures numeric types, validates required fields
 * - returns array [{ menuId, variantId, quantity, unitPrice, addons }]
 */
function sanitizeCartItems(items) {
  if (!Array.isArray(items)) throw new Error("sanitizeCartItems expects array");
  return items.map((it) => {
    const menuId = Number(it.menuId);
    const variantId = it.variantId ?? null;
    const quantity = Math.max(0, Number(it.quantity || 0));
    const unitPrice = Number(it.unitPrice ?? it.price ?? it.snapshotPrice ?? 0);
    const addons = Array.isArray(it.addons) ? it.addons.map(a => ({
      id: a.id ?? a.addonId ?? null,
      name: a.name ?? a.title ?? null,
      qty: Number(a.qty ?? 1),
      price: Number(a.price ?? 0)
    })) : [];

    if (!menuId || !Number.isFinite(menuId)) throw new Error("Invalid menuId in cart item");
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Invalid quantity in cart item");

    return { menuId, variantId, quantity, unitPrice: round2(unitPrice), addons };
  });
}

/**
 * computeOrderTotals(conn, sanitizedItems, shopId)
 * - returns { prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount }
 * - prepared: enriched items for order_items insertion:
 *   { menuId, variantId, quantity, unitPrice, addons, lineSubtotal, snapshotName, snapshot }
 */
async function computeOrderTotals(conn, sanitizedItems, shopId = null) {
  // fetch shop config (gst_percent, delivery_fee, free_delivery_above) if shopId provided
  let gstPercent = 0;
  let deliveryFee = 0;
  let freeAbove = null;
  if (shopId) {
    try {
      const [[shopRow]] = await conn.query("SELECT gst_percent, delivery_fee, free_delivery_above FROM shops WHERE id = ? LIMIT 1", [shopId]);
      if (shopRow) {
        gstPercent = Number(shopRow.gst_percent || 0);
        deliveryFee = Number(shopRow.delivery_fee || 0);
        freeAbove = shopRow.free_delivery_above == null ? null : Number(shopRow.free_delivery_above);
      }
    } catch (e) {
      // ignore and use defaults
    }
  }

  let subtotal = 0;
  const prepared = sanitizedItems.map((it) => {
    const addonsTotal = (it.addons || []).reduce((s, a) => s + (Number(a.price || 0) * (Number(a.qty || 1))), 0);
    const lineSubtotal = round2((it.unitPrice * it.quantity) + addonsTotal);
    subtotal += lineSubtotal;
    return {
      menuId: it.menuId,
      variantId: it.variantId ?? null,
      quantity: it.quantity,
      unitPrice: round2(it.unitPrice),
      addons: it.addons || [],
      lineSubtotal,
      snapshotName: it.snapshotName || null,
      snapshot: { menuId: it.menuId, unitPrice: round2(it.unitPrice), addons: it.addons || [] }
    };
  });

  subtotal = round2(subtotal);
  const gstAmount = round2((subtotal * (gstPercent / 100)));
  // deliveryFee logic (free above threshold)
  let computedDeliveryFee = round2(deliveryFee || 0);
  if (freeAbove != null && subtotal >= Number(freeAbove)) computedDeliveryFee = 0;

  const discount = 0; // adjust if you have coupons / offers
  const totalAmount = round2(subtotal + gstAmount + computedDeliveryFee - discount);

  return {
    prepared,
    subtotal,
    gstAmount,
    deliveryFee: computedDeliveryFee,
    discount,
    totalAmount
  };
}

module.exports = { sanitizeCartItems, computeOrderTotals };
