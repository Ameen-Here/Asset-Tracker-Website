// const { testData } = require("./testData");

const findPercentage = function (testData, currentPrice, curStock) {
  let result; // Getting current price from the details
  if (currentPrice - testData[curStock].testStockPrice < 0) {
    result =
      -(
        (testData[curStock].testStockPrice - currentPrice) /
        testData[curStock].testStockPrice
      ) * 100; // Loss percentage
  } else {
    result =
      ((currentPrice - testData[curStock].testStockPrice) /
        testData[curStock].testStockPrice) *
      100; // Profit percentage
  }
  return result.toFixed(3); // Reducing to 3 decimal places
};

function addStock(currentPrice, result) {
  testData[curStock].currentPrice = currentPrice;
  testData[curStock].pAndLossPerc = result;
}

module.exports = { findPercentage, addStock };
