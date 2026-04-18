const getSuggestedPrice = (mrp, resaleCount) => {
  const normalizedMrp = Number(mrp);
  const normalizedResaleCount = Number.isFinite(resaleCount)
    ? Math.max(0, Math.floor(resaleCount))
    : 0;

  const floor = normalizedMrp * 0.5;
  let price = normalizedMrp * 0.8;

  for (let i = 0; i < normalizedResaleCount; i += 1) {
    price *= 0.95;
  }

  if (price < floor) {
    return floor;
  }

  return Math.round(price);
};

export { getSuggestedPrice };
