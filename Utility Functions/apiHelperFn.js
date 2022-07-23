// Fetch price by accessing the API
const axios = require("axios"); // Fetch API call

const getSymbol = async function (companyName) {
  const url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NSE&apikey=d8bf28c2dc51593dbdf880a34614b018`; // Get stocks symbol name used in stock exchange.
  const response = await axios.get(url);

  const companyData = response.data;
  if (!companyData.length) return "";
  const { symbol } = companyData[0];
  return { symbol };
};

const getCurPrice = async function (symbol) {
  const companyDetails = await axios.get(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=7EGYOYYJ63SX9WO9`
  ); // Getting company stock price and details.
  const companyDetailsFull = companyDetails.data;
  if (!companyDetailsFull) return { currentPrice: null, symbol: null };
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
  };
};

module.exports = {
  getCurPrice,
  getSymbol,
};
