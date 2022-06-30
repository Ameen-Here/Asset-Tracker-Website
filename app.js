const express = require("express");
const path = require("path");
const axios = require("axios"); // Fetch API call
const app = express();

// Custom Helper Functions And Datas
const { testData, curStock } = require("./Utility Functions/testData");
const fetchCurPrice = require("./Utility Functions/apiHelperFn");
const stockCalculation = require("./Utility Functions/stockCalc");

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); // Setting public directory for assets
app.set("public", path.join(__dirname, "/public"));

app.set("view engine", "ejs"); // Setting ejs engine and directory
app.set("views", path.join(__dirname, "/views"));

// Test Function (Currently on Testing)

const findPercentage = async function (companyName, add = false) {
  const companyDetailsFull = await fetchCurPrice(companyName);
  const currentPrice = companyDetailsFull["Global Quote"]["05. price"];
  if (add) {
    testData[curStock].testStockPrice = currentPrice;
    testData[curStock].totalValue = currentPrice * testData[curStock].noOfStock;
    testData[curStock].testStockPrice =
      testData[curStock].investedAmount / testData[curStock].noOfStock; // Testing purpose: Adding stock and finding value
  }

  const result = stockCalculation.findPercentage(currentPrice);

  if (add) stockCalculation.addStock(currentPrice, result);

  return result;
};

////////////////////////////////////////////////////////////////////
// Routing

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// ShowStock and addStock routings.

app.get("/showStock", async (req, res) => {
  const companyName = testData[curStock].stockName;

  const result = await findPercentage(companyName);

  testData[curStock].totalValue =
    testData[curStock].currentPrice * testData[curStock].noOfStock;

  res.send(
    `<h1>Company Name: ${testData[curStock].stockName}</h1><h2>Current Price: ${testData[curStock].currentPrice}</h2>
    <h2>Total:${testData[curStock].totalValue}     <i style="color:green;">P/L: ${testData[curStock].pAndLossPerc}% </i></h2>`
  );
});

app.get("/add", async (req, res) => {
  // Collect data from user
  console.log(testData[curStock]);
  const quantity = 3;
  const stockPrice = 204;
  console.log(quantity, stockPrice);

  // If stock already exist, add new assets
  testData[curStock].noOfStock += quantity;

  testData[curStock].investedAmount =
    testData[curStock].investedAmount + stockPrice * quantity;

  const companyName = testData[curStock].stockName;

  const result = await findPercentage(companyName, true);

  res.send(
    `<h1>Company Name: ${testData[curStock].stockName}</h1><h2>Current Price: ${testData[curStock].currentPrice}</h2>
    <h2>Total:${testData[curStock].totalValue}     <i style="color:green;">P/L: ${testData[curStock].pAndLossPerc}% </i></h2>`
  );
});

app.listen(3000, console.log("Listening to port 3000"));
