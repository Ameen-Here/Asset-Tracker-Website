const express = require("express");
const router = express.Router();

const User = require("../models/User");

const { MILLISECOND } = require("../Utility Functions/testData");

// TESTING DATAS

const getTestDatas = async () => {
  const testData = await User.findOne({ name: "Ameen Noushad" });
  return testData.assets;
};

const setTestData = async (data) => {
  const testData = await User.findOne({ name: "Ameen Noushad" });
  console.log(testData);

  testData.assets.push(data);
  await testData.save();
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

async function updateDatas(name, symbol, noOfStock, currentPrice) {
  const user = await User.findOne({ name });
  console.log(user);
  console.log("asdasdasd");
  const assetValues = user.assets.filter((asset) => {
    return asset.symbol === symbol;
  })[0];

  noOfStock += +assetValues.noOfStock;
  const investedAmount = assetValues.investedAmount + currentPrice * noOfStock;
  const totalValue = assetValues.totalValue + currentPrice * noOfStock;

  const testStockPrice = investedAmount / noOfStock;

  let pAndLossPerc;
  if (currentPrice - testStockPrice < 0) {
    pAndLossPerc = -((testStockPrice - currentPrice) / testStockPrice);
  } else {
    pAndLossPerc = (currentPrice - testStockPrice) / testStockPrice;
  }

  const data = {
    ...tempState,
    noOfStock,
    investedAmount,
    totalValue,
    testStockPrice,
    pAndLossPerc,
  };

  console.log("This One");
  console.log(data);

  const updatingIndex = user.assets.findIndex((asset) => {
    console.log(asset.symbol);
    console.log(symbol);
    return asset.symbol === symbol;
  });

  console.log(updatingIndex);

  user.assets.splice(updatingIndex, 1, data);

  console.log(user);

  await user.save();

  console.log(user);
  console.log(User);
}

router
  .route("/portfolio")
  .get(async (req, res) => {
    const userAssets = await getTestDatas();
    const curTime = dt.getTime();

    for (let i = 0; i < userAssets.length; i++) {
      const timeDiff = curTime - userAssets[i].updateTime;
      if (userAssets[i].isCustomAsset || timeDiff < MILLISECOND) continue;

      await updatePrice(userAssets[i].stockName, i, curTime, userAssets);
    }

    let i = 0;
    let topGainers = [];
    const datasPerformer = userAssets
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

    res.render("portfolio", {
      pageClass: "portfolioPage",
      showLogin: false,
      showReg: false,
      titleName: "Portfolio",
      testData: userAssets,
      stockLabel: userAssets.map((data) => data.stockName),
      stockValue: userAssets.map((data) => data.totalValue),
      topGainers,
    });
  })
  .post(async (req, res) => {
    const userAssets = await getTestDatas();
    console.log(userAssets);
    console.log("/////////////////");
    if (req.body.action !== "cancel") {
      const curTime = dt.getTime();

      const { index, noOfStock, symbol, currentPrice } = tempState;

      await updateDatas(
        "Ameen Noushad",
        symbol,
        +noOfStock,
        currentPrice,
        curTime
      );
    }

    //   if (!tempState.isCustomAsset)
    //     await updatePrice(testDataAssets[index].stockName, index, curTime);
    // }

    // testData.assets.push(testDataAssets);
    // await testData.save();
    // await testDataAssets.save();

    // res.redirect("/portfolio");
    res.send("ok");
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
  testDataAssets,
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
    index: index === -1 ? +testDataAssets.length : index,
    symbol,
    isCustomAsset,
    updateTime,
  };
};

const normalAssetBuilder = async function (company) {
  const userAssets = await getTestDatas();
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

  const index = userAssets.findIndex((stock) => {
    return stock.symbol === symbol;
  });

  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    false,
    userAssets,
    index
  );
};

const customAssetBuilder = async function (asset) {
  const testDataAssets = await getTestDatas();
  // assetFunctions
  const { companyName, quantity: noOfStock, stockPrice } = asset;
  stockPriceGiven = true;
  symbol = companyName;

  return buildTempState(
    noOfStock,
    stockPrice,
    companyName,
    symbol,
    testDataAssets,
    true
  );
};

router.post("/addStock", async (req, res) => {
  const { format, company, asset } = req.body;

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
