// config/constants.js
module.exports = {
  GST_RATE: 0.05, // 5% - single source of truth for server
  CURRENCY_DECIMALS: 2,
  roundMoney: (v) => {
    const p = Math.pow(10, module.exports.CURRENCY_DECIMALS);
    return Math.round(Number(v || 0) * p) / p;
  },
};
