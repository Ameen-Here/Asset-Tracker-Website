// Template Builder
// To get current price & symbol of the company: Indian stocks
const { getCurPrice, getSymbol } = require("../Utility Functions/apiHelperFn");

const { getCurrentUser } = require("../config/currentUser");

const { getIndex } = require("../Utility Functions/stockCalc");
const dt = new Date();

const buildTempState = function (
  noOfStock,
  stockPrice,
  companyName,
  symbol,
  isCustomAsset,
  testDataAssets,
  tempState,
  exchange,
  index = -1
) {
  tempState = {};
  let updateTime = index === -1 ? 100 : dt.getTime();

  return {
    noOfStock,
    currentPrice: stockPrice,
    testStockPrice: stockPrice,
    stockName: companyName,
    totalValue: stockPrice * noOfStock,
    investedAmount: stockPrice * noOfStock,
    pAndLossPerc: 0,
    index: index === -1 ? +testDataAssets.length : index,
    symbol,
    isCustomAsset,
    updateTime,
    exchange,
  };
};

const normalAssetBuilder = async function (
  company,
  tempState,
  currentUser,
  exchange
) {
  const testData = getCurrentUser(currentUser);

  let symbol, stockPrice;

  const { companyName, quantity: noOfStock, isStockPrice } = company;
  const stockPriceGiven = isStockPrice == "true";
  if (!stockPriceGiven) {
    // Getting current updates of the particular stock
    ({ symbol } = await getSymbol(companyName, exchange));
    if (exchange !== "nasdaq") symbol = symbol.split(".")[0];
    ({ currentPrice: stockPrice } = await getCurPrice(symbol, exchange));
  } else {
    // Adding given stock price
    ({ stockPrice } = company);
    ({ symbol } = await getSymbol(companyName, exchange));
  }
  // If stock already exist, add new assets

  if (exchange !== "nasdaq") symbol = symbol.split(".")[0];

  const index = getIndex(testData, symbol);

  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    false,
    testData.assets,
    tempState,
    exchange,
    index
  );
};

const customAssetBuilder = async function (asset, tempState, currentUser) {
  const testData = getCurrentUser(currentUser);
  // assetFunctions
  let { companyName, quantity: noOfStock, stockPrice } = asset;
  stockPriceGiven = true;
  symbol = companyName;
  stockPrice = +stockPrice;

  const index = getIndex(testData, symbol);
  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    true,
    testData.assets,
    tempState,
    null,
    index
  );
};

module.exports = {
  normalAssetBuilder,
  customAssetBuilder,
};
