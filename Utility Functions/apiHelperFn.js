// Fetch price by accessing the API
const axios = require("axios"); // Fetch API call
const AppError = require("../AppError");

const getSymbol = async function (companyName, exchange) {
  let url = "";
  const apiKey = process.env.API_FINANCIAL;
  if (exchange === "nasdaq") {
    url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NASDAQ&apikey=${apiKey}`; // Get stocks symbol name used in stock exchange.
  } else {
    url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NSE&apikey=${apiKey}`; // Get stocks symbol name used in stock exchange.
  }

  const response = await axios.get(url);

  const companyData = response.data;
  if (!companyData.length) return "";
  const { symbol } = companyData[0];
  return { symbol };
};

const getCurPrice = async function (symbol, exchange) {
  let companyDetails;
  const apiKey = process.env.API_ALPHA;
  if (exchange === "nasdaq") {
    console.log("here");
    companyDetails = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
  } else {
    companyDetails = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${apiKey}`
    ); // Getting company stock price of Indian market
  }

  const companyDetailsFull = companyDetails.data;
  console.log(Object.keys(companyDetailsFull["Global Quote"]).length);
  if (Object.keys(companyDetailsFull["Global Quote"]).length === 0) {
    throw new AppError(
      "Cannot read properties of undefined (reading 'split')",
      404
    );
  }
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
  };
};

module.exports = {
  getCurPrice,
  getSymbol,
};
