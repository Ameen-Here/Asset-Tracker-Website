// Fetch price by accessing the API
const axios = require("axios"); // Fetch API call

const fetchCurReport = async function (companyName) {
  const url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NSE&apikey=d8bf28c2dc51593dbdf880a34614b018`; // Get stocks symbol name used in stock exchange.
  const response = await axios.get(url);

  const companyData = response.data;
  if (!companyData.length) return "";
  const { symbol } = companyData[0];
  const companyDetails = await axios.get(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${
      symbol.split(".")[0]
    }.BSE&apikey=7EGYOYYJ63SX9WO9`
  ); // Getting company stock price and details.
  // console.log(companyDetails.data);
  const companyDetailsFull = companyDetails.data;
  return companyDetailsFull;
};

module.exports = fetchCurReport;
