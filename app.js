const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const axios = require("axios"); // Fetch API call
const app = express();

// Custom Helper Functions And Datas
const { testData, curStock } = require("./Utility Functions/testData");
const fetchCurReport = require("./Utility Functions/apiHelperFn");
const stockCalculation = require("./Utility Functions/stockCalc");

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); // Setting public directory for assets
app.set("public", path.join(__dirname, "/public"));

app.set("view engine", "ejs"); // Setting ejs engine and directory
app.set("views", path.join(__dirname, "/views"));

app.engine("ejs", ejsMate);

// Test Function (Currently on Testing)

let tempState = {};

const findPercentage = async function (companyName, index, add = false) {
  const companyDetailsFull = await fetchCurReport(companyName);
  const currentPrice = companyDetailsFull["Global Quote"]["05. price"];
  if (add) {
    testData[index].currentPrice = currentPrice;
    testData[index].totalValue = currentPrice * testData[curStock].noOfStock;
    testData[index].testStockPrice =
      testData[index].investedAmount / testData[index].noOfStock; // Testing purpose: Adding stock and finding value
  }

  const result = stockCalculation.findPercentage(currentPrice);

  if (add) stockCalculation.addStock(currentPrice, result);

  return result;
};

////////////////////////////////////////////////////////////////////
// Routing

app.get("/", (req, res) => {
  res.render("index", {
    pageClass: "homepage",
    showLogin: true,
    showReg: true,
    titleName: "Home Page",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    pageClass: "loginPage",
    showLogin: false,
    showReg: true,
    titleName: "Login",
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    pageClass: "registerPage",
    showLogin: true,
    showReg: false,
    titleName: "Register",
  });
});

app.get("/portfolio", async (req, res) => {
  if (Object.keys(tempState).length) {
    const { index, quantity, stockName, stockPrice } = tempState;
    testData[index].noOfStock += +quantity;
    testData[index].investedAmount =
      testData[index].investedAmount + stockPrice * quantity;
    // const result = await findPercentage(companyName, index, true);
    console.log(testData[index]);
  }
  console.log(req.body);
  res.render("portfolio", {
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "Portfolio",
  });
});

app.post("/portfolio", (req, res) => {
  if (req.body.action === "cancel") tempState = {};
  res.redirect("/portfolio");
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

app.post("/addStock", async (req, res) => {
  // Collect data from user
  const { companyName, quantity } = req.body["company"];

  // Getting current updates of the particular stock
  const companyDetails = await fetchCurReport(companyName);
  if (!companyDetails) return res.send("error");
  const { "05. price": stockPrice, "01. symbol": stockName } =
    companyDetails["Global Quote"];
  // If stock already exist, add new assets
  const index = testData.findIndex((stock) => {
    return stock.stockName === stockName;
  });

  tempState = {
    quantity,
    stockPrice,
    companyName,
    quantity,
    index,
  };

  if (index === -1) return;

  console.log(testData[index]);
  res.render("addStock", {
    stockName,
    quantity,
    stockPrice,
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "CONFIRM!!!",
  });
  // console.log("//////////////////");

  // testData[index].noOfStock += +quantity;
  // testData[index].investedAmount =
  //   testData[index].investedAmount + stockPrice * quantity;
  // const result = await findPercentage(companyName, index, true);
  // console.log(testData[index]);
  // return res.send("ok");
  // res.send(
  //   `<h1>Company Name: ${testData[curStock].stockName}</h1><h2>Current Price: ${testData[curStock].currentPrice}</h2>
  //   <h2>Total:${testData[curStock].totalValue}     <i style="color:green;">P/L: ${testData[curStock].pAndLossPerc}% </i></h2>`
  // );
});

app.get("/delete", async (req, res) => {
  console.log(testData[curStock]);
  const quantity = 3;

  const companyName = testData[curStock].stockName;
  const companyDetailsFull = await fetchCurReport(companyName);
  console.log(companyDetailsFull);
  const currentPrice = companyDetailsFull["Global Quote"]["05. price"];

  const amountWithdraw = quantity * currentPrice;

  testData[curStock].noOfStock -= quantity;

  testData[curStock].totalValue =
    testData[curStock].totalValue - currentPrice * quantity;

  testData[curStock].investedAmount =
    testData[curStock].investedAmount -
    quantity * testData[curStock].testStockPrice;

  const result = await findPercentage(companyName, true);
  testData[curStock].pAndLossPerc = result;
  console.log(testData[curStock]);
  res.send("ok");
});

app.listen(3000, console.log("Listening to port 3000"));
