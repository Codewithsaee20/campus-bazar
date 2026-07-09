// Flat resale price: buyer pays 75% of MRP, seller receives the full 75% (no platform commission).
const getSuggestedPrice = (mrp) => {
  const normalizedMrp = Number(mrp);
  return Math.round(normalizedMrp * 0.75);
};

export { getSuggestedPrice };
