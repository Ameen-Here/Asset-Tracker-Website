// Fetch price by accessing the API
const axios = require("axios"); // Fetch API call
const AppError = require("../AppError");

const getSymbol = async function (companyName, exchange) {
  let url = "";
  if (exchange === "nasdaq") {
    url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NASDAQ&apikey=d8bf28c2dc51593dbdf880a34614b018`; // Get stocks symbol name used in stock exchange.
  } else {
    url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NSE&apikey=d8bf28c2dc51593dbdf880a34614b018`; // Get stocks symbol name used in stock exchange.
  }
  const response = await axios.get(url);

  const companyData = response.data;
  if (!companyData.length) return "";
  const { symbol } = companyData[0];
  return { symbol };
};

const getCurPrice = async function (symbol, exchange) {
  let companyDetails;
  if (exchange === "nasdaq") {
    console.log("here");
    companyDetails = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=7EGYOYYJ63SX9WO9`
    );
  } else {
    companyDetails = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=7EGYOYYJ63SX9WO9`
    ); // Getting company stock price of Indian market
  }

  const companyDetailsFull = companyDetails.data;
  console.log(".../////////////");
  console.log(companyDetailsFull);
  console.log(Object.keys(companyDetailsFull["Global Quote"]).length);
  if (Object.keys(companyDetailsFull["Global Quote"]).length === 0) {
    throw new AppError(
      "Cannot read properties of undefined (reading 'split')",
      404
    );
  }
  console.log(companyDetailsFull["Global Quote"]["05. price"]);
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
  };
};

const getSymbolUS = async function (companyName) {
  const url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NASDAQ&apikey=d8bf28c2dc51593dbdf880a34614b018`; // Get stocks symbol name used in stock exchange.
  const response = await axios.get(url);

  console.log(companyName);
  console.log(response);

  const companyData = response.data;
  console.log(companyData);
  if (!companyData.length) return "";
  const { symbol } = companyData[0];
  console.log("///////////");
  console.log(symbol);

  const companyDetails = await axios.get(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=7EGYOYYJ63SX9WO9`
  ); // Getting company stock price and details.
  console.log(companyDetails);
  const companyDetailsFull = companyDetails.data;
  console.log("........******");
  console.log(companyDetailsFull);
  if (!companyDetailsFull) return { currentPrice: null, symbol: null };
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
  };

  // return { symbol };
};

module.exports = {
  getCurPrice,
  getSymbol,
  getSymbolUS,
};
