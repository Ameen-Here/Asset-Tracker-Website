import express from "express";
import fetch from "node-fetch";
const app = express();

// Random datas for testing
const testStockPrice = 540.65;
const testCompanyName = "Nucleus software exports";

////////////////////////////////////////////

// Fetch price by accessing the API
const fetchCurPrice = async function (companyName) {
  const url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NSE&apikey=d8bf28c2dc51593dbdf880a34614b018`; // Get stocks symbol name used in stock exchange.
  const data = await fetch(url);
  const companyData = await data.json();
  const { symbol } = companyData[0];
  const companyDetails = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${
      symbol.split(".")[0]
    }.BSE&apikey=7EGYOYYJ63SX9WO9`
  ); // Getting company stock price and details.
  const companyDetailsFull = await companyDetails.json();
  return companyDetailsFull;
};

const findPercentage = function (companyDetailsFull) {
  let result;
  const currentPrice = companyDetailsFull["Global Quote"]["05. price"]; // Getting current price from the details
  if (currentPrice - testStockPrice < 0) {
    console.log("Loss right now");
    result = ((testStockPrice - currentPrice) / testStockPrice) * 100; // Loss percentage
  } else {
    console.log("Gain");
    result = ((currentPrice - testStockPrice) / testStockPrice) * 100; // Profit percentage
  }
  return result.toFixed(3); // Reducing to 3 decimal places
};

app.get("/", async (req, res) => {
  const companyName = testCompanyName;
  const companyDetailsFull = await fetchCurPrice(companyName);

  const result = findPercentage(companyDetailsFull);

  res.send(`<h1>${result}</h1>`);
});

app.listen(3000, console.log("Listening to port 3000"));
