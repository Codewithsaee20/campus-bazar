const getSuggestedPrice = (mrp, resaleCount) => {
  const normalizedMrp = Number(mrp);
  const normalizedResaleCount = Number.isFinite(resaleCount)
    ? Math.max(0, Math.floor(resaleCount))
    : 0;

  const floor = normalizedMrp * 0.5;

  // First listing starts at 20% below MRP. Each completed resale applies an additional 5% deduction.
  const price = normalizedMrp * 0.8 * (0.95 ** normalizedResaleCount);
  return Math.round(Math.max(price, floor));
};

export { getSuggestedPrice };
