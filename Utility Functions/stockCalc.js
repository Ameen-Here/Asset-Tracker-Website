const findPercentage = function (stockPrice, currentPrice) {
  let result; // Getting current price from the details
  if (currentPrice - stockPrice < 0) {
    result = -((stockPrice - currentPrice) / stockPrice) * 100; // Loss percentage
  } else {
    result = ((currentPrice - stockPrice) / stockPrice) * 100; // Profit percentage
  }
  return result.toFixed(3); // Reducing to 3 decimal places
};

const calcTestStockPrice = (investedAmount, noOfStock) =>
  investedAmount / noOfStock;

const calcTotalValue = (curPrice, noOfStock) => curPrice * noOfStock;

const getIndex = (datas, symbol) => {
  return datas.assets.findIndex((stock) => {
    return stock.symbol === symbol;
  });
};

module.exports = {
  findPercentage,
  calcTestStockPrice,
  getIndex,
  calcTotalValue,
};
