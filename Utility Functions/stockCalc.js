// const { testData } = require("./testData");

const findPercentage = function (stockPrice, currentPrice) {
  let result; // Getting current price from the details
  if (currentPrice - stockPrice < 0) {
    result = -((stockPrice - currentPrice) / stockPrice) * 100; // Loss percentage
  } else {
    result = ((currentPrice - stockPrice) / stockPrice) * 100; // Profit percentage
  }
  return result.toFixed(3); // Reducing to 3 decimal places
};

module.exports = { findPercentage };
