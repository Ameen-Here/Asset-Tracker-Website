const User = require("../models/User");
const { getIndex } = require("./userData");
const { fetchCurPriceSymbol } = require("../Utility Functions/apiHelperFn");
const {
  getTestDatas,
  getAsset,
  calcTotalValue,
  calcTestStockPrice,
} = require("./userData");

const { findPercentage } = require("../Utility Functions/stockCalc");

const updatePrice = async function (companyName, index, curTime) {
  console.log(companyName);
  const { currentPrice } = await fetchCurPriceSymbol(companyName);
  const testData = await getTestDatas();
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
  testData.save();
};

async function updateAsset(
  assetValues,
  noOfStock,
  currentPrice,
  companyName,
  tempState
) {
  investedAmount = assetValues.investedAmount + currentPrice * noOfStock;
  noOfStock += +assetValues.noOfStock;

  const testStockPrice = calcTestStockPrice(investedAmount, noOfStock);
  ({ currentPrice } = await fetchCurPriceSymbol(companyName));

  totalValue = calcTotalValue(noOfStock, currentPrice);

  const pAndLossPerc = findPercentage(testStockPrice, currentPrice);

  console.log(tempState);
  return {
    ...tempState,
    noOfStock,
    investedAmount,
    totalValue,
    testStockPrice,
    pAndLossPerc,
    currentPrice,
  };
} //done

async function createNewAsset(currentPrice, tempState) {
  return { ...tempState, testStockPrice: currentPrice };
} // done

async function updateDataBase(
  name,
  symbol,
  noOfStock,
  currentPrice,
  companyName,
  tempState
) {
  console.log(tempState);
  const user = await User.findOne({ name });

  // Getting value of assets if it exists
  const assetValues = user.assets.filter((asset) => {
    return asset.symbol === symbol;
  })[0];

  // To store the final data to store into db
  let data = {};

  if (!assetValues) data = await createNewAsset(currentPrice, tempState);
  else
    data = await updateAsset(
      assetValues,
      noOfStock,
      currentPrice,
      companyName,
      tempState
    );

  console.log(data);

  // Searching for the index
  const updatingIndex = getIndex(user, symbol);
  console.log("///////////");
  console.log(symbol);
  console.log(updatingIndex);

  // Updating asset or adding new asset
  if (updatingIndex === -1) user.assets.push(data);
  else user.assets.splice(updatingIndex, 1, data);

  await user.save();
} //done

module.exports = {
  calcTestStockPrice,
  calcTotalValue,
  updatePrice,
  updateDataBase,
};
