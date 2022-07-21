const User = require("../models/User");
const getTestDatas = async () => {
  const testData = await User.findOne({ name: "Ameen Noushad" });
  return testData;
};

const getAsset = (data, index) => data.assets[index];

const calcTestStockPrice = (investedAmount, noOfStock) =>
  investedAmount / noOfStock;

const calcTotalValue = (curPrice, noOfStock) => curPrice * noOfStock;

const getIndex = (datas, symbol) => {
  return datas.assets.findIndex((stock) => {
    console.log(stock.symbol);
    console.log(typeof stock.symbol);
    console.log(symbol);
    console.log(typeof symbol);
    stock.symbol === symbol;
  });
};

module.exports = {
  getTestDatas,
  getAsset,
  getIndex,
  calcTotalValue,
  calcTestStockPrice,
};
