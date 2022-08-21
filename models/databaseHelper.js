const { findPercentage } = require("../Utility Functions/stockCalc");

const { getCurPrice } = require("../Utility Functions/apiHelperFn");

const {
  calcTotalValue,
  calcTestStockPrice,
} = require("../Utility Functions/stockCalc");

const { getTestDatas, getAsset } = require("./userHandler");

const createNewAsset = function (currentPrice, tempState) {
  return { ...tempState, testStockPrice: currentPrice };
};

const updateAsset = async function (
  assetValues,
  noOfStock,
  currentPrice,
  tempState,
  symbol,
  assetValues,
  exchange
) {
  // updating invested amount and no of stocks
  investedAmount = assetValues.investedAmount + currentPrice * noOfStock;
  noOfStock += +assetValues.noOfStock;

  // update current stock price and user stock average price
  const testStockPrice = calcTestStockPrice(investedAmount, noOfStock);
  if (!assetValues.isCustomAsset) {
    ({ currentPrice } = await getCurPrice(symbol, exchange));
  }
  totalValue = calcTotalValue(noOfStock, currentPrice);

  const pAndLossPerc = findPercentage(testStockPrice, currentPrice);

  return {
    ...tempState,
    noOfStock,
    investedAmount,
    totalValue,
    testStockPrice,
    pAndLossPerc,
    currentPrice,
  };
};

const updatePrice = async function (
  companyName,
  index,
  curTime,
  symbol,
  testData,
  exchange
) {
  // Symbol we already have
  const { currentPrice } = await getCurPrice(symbol, exchange);
  const asset = getAsset(testData, index);

  // Updating Values
  asset.currentPrice = currentPrice;
  asset.totalValue = calcTotalValue(currentPrice, asset.noOfStock);
  asset.updateTime = curTime;
  asset.testStockPrice = calcTestStockPrice(
    asset.investedAmount,
    asset.noOfStock
  );
  // Getting P/L value
  asset.pAndLossPerc = findPercentage(asset.testStockPrice, currentPrice);

  // Updating the value into database
  testData.assets.splice(index, 1, asset);
  await testData.save();
};

module.exports = {
  createNewAsset,
  updateAsset,
  updatePrice,
};
