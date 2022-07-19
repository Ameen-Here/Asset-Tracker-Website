const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Asset = require("../models/Asset");

const { MILLISECOND } = require("../Utility Functions/testData");

// TESTING DATAS

const getTestDatas = async () => {
  const testData = await User.findOne({ name: "Ameen Noushad" }).populate(
    "assets"
  );
  return testData.assets;
};

const setTestData = async (data) => {
  const testData = await User.findOne({ name: "Ameen Noushad" });
  console.log(testData);

  const datas = new Asset(data);
  testData.assets.push(datas);
  await testData.save();
  await datas.save();
};

/////////////////////////////////
const {
  fetchCurReport,
  fetchSymbol,
} = require("../Utility Functions/apiHelperFn");
const stockCalculation = require("../Utility Functions/stockCalc");

let tempState = {}; // For holding temporary value when adding a stock before confirmation

const dt = new Date(); // for checking last update

const updatePrice = async function (
  companyName,
  index,
  curTime,
  testDataAssets
) {
  const { currentPrice } = await getCurrentPrice(companyName);

  testDataAssets[index].currentPrice = currentPrice;
  testDataAssets[index].totalValue =
    currentPrice * testDataAssets[index].noOfStock;
  testDataAssets[index].updateTime = curTime;
  // Testing purpose: Adding stock and finding value

  const result = stockCalculation.findPercentage(
    testDataAssets,
    currentPrice,
    index
  );
  testDataAssets[index].pAndLossPerc = result;
  console.log(testDataAssets[index]);
  await setTestData(testDataAssets[index]);
};

async function getSymbol(companyName) {
  const companyDetailsFull = await fetchCurReport(companyName);
  if (!companyDetailsFull) return res.send("error");
}

async function getCurrentPrice(companyName) {
  const companyDetailsFull = await fetchCurReport(companyName);
  if (!companyDetailsFull) return res.send("error");
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
    symbol: companyDetailsFull["Global Quote"]["01. symbol"],
  };
}

router.route("/trial").get((req, res) => {
  res.render("trailAddStock", {
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "Portfolio",
  });
});

router
  .route("/portfolio")
  .get(async (req, res) => {
    const testDataAssets = await getTestDatas();
    const curTime = dt.getTime();

    for (let i = 0; i < testDataAssets.length; i++) {
      const timeDiff = curTime - testDataAssets[i].updateTime;
      console.log(testDataAssets[i]);
      console.log("here");
      if (testDataAssets[i].isCustomAsset || timeDiff < MILLISECOND) continue;

      await updatePrice(
        testDataAssets[i].stockName,
        i,
        curTime,
        testDataAssets
      );
    }

    let i = 0;
    let topGainers = [];
    console.log(testDataAssets);
    const datasPerformer = testDataAssets
      .map((company) => {
        return {
          value: company.pAndLossPerc,
          name: company.stockName,
        };
      })
      .sort((a, b) => b.value - a.value);

    for (let value of datasPerformer) {
      if (i === 3) break;
      topGainers.push({ ...value, i });
      i++;
    }

    console.log(topGainers);
    res.render("portfolio", {
      pageClass: "portfolioPage",
      showLogin: false,
      showReg: false,
      titleName: "Portfolio",
      testData: testDataAssets,
      stockLabel: testDataAssets.map((data) => data.stockName),
      stockValue: testDataAssets.map((data) => data.totalValue),
      topGainers,
    });
  })
  .post(async (req, res) => {
    if (req.body.action !== "cancel") {
      if (tempState.index === testDataAssets.length) {
        testDataAssets.push({
          ...tempState,
        });
      } else {
        const { index, noOfStock, stockName, currentPrice } = tempState;
        testDataAssets[index].noOfStock =
          +testDataAssets[index].noOfStock + +noOfStock;
        testDataAssets[index].investedAmount =
          testDataAssets[index].investedAmount + currentPrice * noOfStock;
        testDataAssets[index].totalValue =
          testDataAssets[index].totalValue + currentPrice * noOfStock;
      }

      const index = tempState.index;
      const curTime = dt.getTime();

      if (!testDataAssets[index].isCustomAsset)
        await updatePrice(testDataAssets[index].stockName, index, curTime);
    }

    testData.assets.push(testDataAssets);
    await testData.save();
    await testDataAssets.save();

    res.redirect("/portfolio");
  });

router.get("/fakeLogin", async (req, res) => {
  res.render("fakeChart", { testData: testDataAssets });
});

const buildTempState = function (
  noOfStock,
  stockPrice,
  companyName,
  symbol,
  isCustomAsset,
  index = -1
) {
  tempState = {};
  let updateTime = index === -1 ? 100 : dt.getTime();

  return {
    noOfStock,
    currentPrice: stockPrice,
    testStockPrice: stockPrice,
    stockName: companyName,
    totalValue: stockPrice * noOfStock,
    investedAmount: stockPrice * noOfStock,
    pAndLossPerc: 0,
    index: index === -1 ? testDataAssets.length : index,
    symbol,
    isCustomAsset,
    updateTime,
  };
};

const normalAssetBuilder = async function (company) {
  // The normal functions
  let symbol, stockPrice;
  const { companyName, quantity: noOfStock, isStockPrice } = company;
  const stockPriceGiven = isStockPrice == "true";
  if (!stockPriceGiven) {
    // Getting current updates of the particular stock
    ({ currentPrice: stockPrice, symbol } = await getCurrentPrice(companyName));
  } else {
    ({ stockPrice } = company);
    symbol = await fetchSymbol(companyName);
  }
  // If stock already exist, add new assets

  symbol = symbol.split(".")[0];

  const index = testDataAssets.findIndex((stock) => {
    return stock.symbol === symbol;
  });

  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    false,
    index
  );
};

const customAssetBuilder = async function (asset) {
  // assetFunctions
  const { companyName, quantity: noOfStock, stockPrice } = asset;
  stockPriceGiven = true;
  symbol = companyName;

  return buildTempState(noOfStock, stockPrice, companyName, symbol, true);
};

router.post("/addStock", async (req, res) => {
  const { format, company, asset } = req.body;
  console.log(req.body);
  console.log(asset);
  if (format === "NormalAsset") {
    tempState = await normalAssetBuilder(company);
  } else tempState = await customAssetBuilder(asset);

  res.render("addStock", {
    stockName: tempState.symbol,
    quantity: tempState.noOfStock,
    stockPrice: tempState.currentPrice,
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "CONFIRM!!!",
  });
});
module.exports = router;

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
