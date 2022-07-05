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

let tempState = {}; // For holding temporary value when adding a stock before confirmation

async function getCurrentPrice(companyName) {
  const companyDetailsFull = await fetchCurReport(companyName);
  if (!companyDetailsFull) return res.send("error");
  console.log(companyDetailsFull);
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
    symbol: companyDetailsFull["Global Quote"]["01. symbol"],
  };
}

const updatePrice = async function (companyName, index) {
  const { currentPrice } = await getCurrentPrice(companyName);

  testData[index].currentPrice = currentPrice;
  testData[index].totalValue = currentPrice * testData[index].noOfStock;
  // Testing purpose: Adding stock and finding value

  const result = stockCalculation.findPercentage(currentPrice, index);
  testData[index].pAndLossPerc = result;
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
  console.log(testData);
  for (let i = 0; i < testData.length; i++) {
    await updatePrice(testData[i].stockName, i);
  }
  res.render("portfolio", {
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "Portfolio",
    testData,
    stockLabel: testData.map((data) => data.stockName),
    stockValue: testData.map((data) => data.totalValue),
  });
});

app.post("/portfolio", (req, res) => {
  if (req.body.action !== "cancel") {
    if (tempState.index === testData.length) {
      testData.push({
        ...tempState,
      });
    } else {
      const { index, noOfStock, stockName, currentPrice } = tempState;
      testData[index].noOfStock = +testData[index].noOfStock + +noOfStock;
      testData[index].investedAmount =
        testData[index].investedAmount + currentPrice * noOfStock;
      testData[index].totalValue =
        testData[index].totalValue + currentPrice * noOfStock;
    }

    // const result = await findPercentage(companyName, index, true);
    // console.log(testData[index]);
  }

  res.redirect("/portfolio");
});

app.post("/addStock", async (req, res) => {
  // Collect data from user
  const { companyName, quantity: noOfStock } = req.body["company"];

  // Getting current updates of the particular stock

  const { currentPrice: stockPrice, symbol } = await getCurrentPrice(
    companyName
  );
  // If stock already exist, add new assets
  const index = testData.findIndex((stock) => {
    return stock.symbol === symbol;
  });

  tempState = {
    noOfStock,
    currentPrice: stockPrice,
    testStockPrice: stockPrice,
    stockName: companyName,
    totalValue: stockPrice * noOfStock,
    investedAmount: stockPrice * noOfStock,
    pAndLossPerc: 0,
    index: index === -1 ? testData.length : index,
    symbol,
  };

  // if (tempState.index === -1) {
  //   tempState.index = testData.length;
  // }

  res.render("addStock", {
    stockName: symbol,
    quantity: noOfStock,
    stockPrice,
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "CONFIRM!!!",
  });
});

// Just to test out chart.js
// label country names

app.get("/chart", (req, res) => {
  res.render("chart", {
    stockLabel: testData.map((data) => data.stockName),
    stockValue: testData.map((data) => data.totalValue),
  });
});

app.listen(3000, console.log("Listening to port 3000"));

//////////////////////////////////////////////////
// ShowStock and addStock routings.

// app.get("/showStock", async (req, res) => {
//   const companyName = testData[curStock].stockName;

//   const result = await findPercentage(companyName);

//   testData[curStock].totalValue =
//     testData[curStock].currentPrice * testData[curStock].noOfStock;

//   res.send(
//     `<h1>Company Name: ${testData[curStock].stockName}</h1><h2>Current Price: ${testData[curStock].currentPrice}</h2>
//     <h2>Total:${testData[curStock].totalValue}     <i style="color:green;">P/L: ${testData[curStock].pAndLossPerc}% </i></h2>`
//   );
// });

// Delete Function
// app.get("/delete", async (req, res) => {
//   console.log(testData[curStock]);
//   const quantity = 3;

//   const companyName = testData[curStock].stockName;
//   const companyDetailsFull = await fetchCurReport(companyName);
//   console.log(companyDetailsFull);
//   const currentPrice = companyDetailsFull["Global Quote"]["05. price"];

//   const amountWithdraw = quantity * currentPrice;

//   testData[curStock].noOfStock -= quantity;

//   testData[curStock].totalValue =
//     testData[curStock].totalValue - currentPrice * quantity;

//   testData[curStock].investedAmount =
//     testData[curStock].investedAmount -
//     quantity * testData[curStock].testStockPrice;

//   const result = await findPercentage(companyName, true);
//   testData[curStock].pAndLossPerc = result;
//   console.log(testData[curStock]);
//   res.send("ok");
// });
