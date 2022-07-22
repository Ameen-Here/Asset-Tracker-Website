// Template Builder
const { getTestDatas } = require("../models/userHandler");
// To get current price & symbol of the company: Indian stocks
const { fetchCurPriceSymbol } = require("../Utility Functions/apiHelperFn");

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
  };
};

const normalAssetBuilder = async function (company, tempState) {
  const testData = await getTestDatas();
  let symbol, stockPrice;
  const { companyName, quantity: noOfStock, isStockPrice } = company;
  const stockPriceGiven = isStockPrice == "true";
  if (!stockPriceGiven) {
    // Getting current updates of the particular stock
    ({ currentPrice: stockPrice, symbol } = await fetchCurPriceSymbol(
      companyName
    ));
  } else {
    // Adding given stock price
    ({ stockPrice } = company);
    ({ symbol } = await fetchCurPriceSymbol(companyName));
  }
  // If stock already exist, add new assets

  symbol = symbol.split(".")[0];
  const index = getIndex(testData, symbol);

  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    false,
    testData.assets,
    tempState,
    index
  );
};

const customAssetBuilder = async function (asset, tempState) {
  const testData = await getTestDatas();
  // assetFunctions
  const { companyName, quantity: noOfStock, stockPrice } = asset;
  stockPriceGiven = true;
  symbol = companyName;

  const index = getIndex(testData, symbol);
  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    true,
    testData.assets,
    tempState,
    index
  );
};

module.exports = {
  normalAssetBuilder,
  customAssetBuilder,
};
