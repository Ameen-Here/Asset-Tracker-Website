const dt = new Date(); // for checking last update
// MS val of a day to update values when last update exceeds a day
const { MILLISECOND } = require("../Utility Functions/testData");
const { getAsset } = require("../models/userHandler");
const { updatePrice } = require("../models/databaseHelper");
const { findPercentage } = require("../Utility Functions/stockCalc");

const updatePortfolioAssets = async (datas) => {
  const curTime = dt.getTime(); // Getting current time to determine whether to update or not
  const assets = datas.assets;
  for (let i = 0; i < assets.length; i++) {
    // Checking if assets need to be updated or not
    const asset = getAsset(datas, i);
    const timeDiff = curTime - asset.updateTime;
    if (asset.isCustomAsset || timeDiff < MILLISECOND) continue;
    await updatePrice(
      asset.stockName,
      i,
      curTime,
      asset.symbol,
      datas,
      asset.exchange
    ); // Updating current price and updated time
  }
};

const renderTopAsset = (assets) => {
  let i = 0;
  let topGainers = [];
  // Array of asset name and it's %value sorted descending
  const datasPerformer = assets
    .map((company) => ({
      value: company.pAndLossPerc,
      name: company.stockName,
    }))
    .sort((a, b) => b.value - a.value);

  // Getting utmost top 3 or available
  for (let value of datasPerformer) {
    if (i === 3) break;
    topGainers.push({ ...value, i });
    i++;
  }
  return topGainers;
};

const renderTotalValue = (assets) => {
  const totalInvestedAmount = assets
    .map((asset) => asset.investedAmount)
    .reduce((partialSum, asset) => partialSum + asset, 0);
  const totalValue = assets
    .map((asset) => asset.totalValue)
    .reduce((partialSum, asset) => partialSum + asset, 0);

  const finalProfitAndLoss = findPercentage(totalInvestedAmount, totalValue);
  return {
    totalInvestedAmount: totalInvestedAmount.toFixed(2),
    totalValue: totalValue.toFixed(2),
    finalProfitAndLoss,
  };
};

module.exports = {
  updatePortfolioAssets,
  renderTopAsset,
  renderTotalValue,
};
