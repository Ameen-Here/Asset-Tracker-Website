// Random datas for testing
const testData = [
  {
    stockName: "Nucleus software exports",
    testStockPrice: 540.65,
    noOfStock: 2,
    currentPrice: 540.65,
    totalValue: 1081.3,
    pAndLossPerc: 0,
    investedAmount: 1081.3,
    symbol: "NUCLEUS.BSE'",
    isCustomAsset: false,
    updateTime: 1658142229505,
  },
  {
    stockName: "SUNTV",
    testStockPrice: 205.31,
    noOfStock: 7,
    currentPrice: 205.31,
    totalValue: 1437.17,
    pAndLossPerc: 0,
    investedAmount: 1437.17,
    symbol: "SUNTV.BSE",
    isCustomAsset: false,
    updateTime: 1658142229505,
  },
];

const MILLISECOND = 86400000;

const curStock = 0; // For selecting stock from test data

module.exports = { testData, curStock, MILLISECOND };
