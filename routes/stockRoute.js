const express = require("express");
const router = express.Router();

const User = require("../models/User");

const { MILLISECOND } = require("../Utility Functions/testData");

const {
  fetchCurReport,
  fetchSymbol,
} = require("../Utility Functions/apiHelperFn");
const stockCalculation = require("../Utility Functions/stockCalc");

// TESTING DATAS

const getTestDatas = async () => {
  const testData = await User.findOne({ name: "Ameen Noushad" });
  return testData.assets;
};

const setTestData = async (data) => {
  const testData = await User.findOne({ name: "Ameen Noushad" });

  await testData.save();
};

/////////////////////////////////

let tempState = {}; // For holding temporary value when adding a stock before confirmation

const dt = new Date(); // for checking last update

const updatePrice = async function (
  companyName,
  index,
  curTime,
  testDataAssets
) {
  const { currentPrice } = await getCurrPriceAndSymbol(companyName);

  // Updating Values
  testDataAssets[index].currentPrice = currentPrice;
  testDataAssets[index].totalValue =
    currentPrice * testDataAssets[index].noOfStock;
  testDataAssets[index].updateTime = curTime;

  // Getting P/L value
  const result = stockCalculation.findPercentage(
    testDataAssets,
    currentPrice,
    index
  );
  testDataAssets[index].pAndLossPerc = result;
  await setTestData(testDataAssets[index]);
};

async function getCurrPriceAndSymbol(companyName) {
  const companyDetailsFull = await fetchCurReport(companyName);
  if (!companyDetailsFull) return res.send("error");
  return {
    currentPrice: companyDetailsFull["Global Quote"]["05. price"],
    symbol: companyDetailsFull["Global Quote"]["01. symbol"],
  };
}

async function updateAsset(assetValues, noOfStock, currentPrice, companyName) {
  noOfStock += +assetValues.noOfStock;
  investedAmount = assetValues.investedAmount + currentPrice * noOfStock;

  const testStockPrice = investedAmount / noOfStock;

  ({ currentPrice } = await getCurrPriceAndSymbol(companyName));

  totalValue = noOfStock * currentPrice;

  if (currentPrice - testStockPrice < 0) {
    pAndLossPerc = -((testStockPrice - currentPrice) / testStockPrice) * 100;
  } else {
    pAndLossPerc = ((currentPrice - testStockPrice) / testStockPrice) * 100;
  }

  return {
    ...tempState,
    noOfStock,
    investedAmount,
    totalValue,
    testStockPrice,
    pAndLossPerc,
    currentPrice,
  };
}

async function createNewAsset(currentPrice) {
  return { ...tempState, testStockPrice: currentPrice };
}

async function updateDataBase(
  name,
  symbol,
  noOfStock,
  currentPrice,
  companyName
) {
  const user = await User.findOne({ name });

  // Getting value of assets if it exists
  const assetValues = user.assets.filter((asset) => {
    return asset.symbol === symbol;
  })[0];

  // To store the final data to store into db
  let data = {};

  if (!assetValues) data = await createNewAsset(currentPrice);
  else
    data = await updateAsset(assetValues, noOfStock, currentPrice, companyName);

  // Searching for the index
  const updatingIndex = user.assets.findIndex((asset) => {
    return asset.symbol === symbol;
  });

  // Updating asset or adding new asset
  if (updatingIndex === -1) {
    user.assets.push(data);
  } else {
    user.assets.splice(updatingIndex, 1, data);
  }

  await user.save();
}

router
  .route("/portfolio")
  .get(async (req, res) => {
    const userAssets = await getTestDatas();
    const curTime = dt.getTime(); // Getting current time to determine whether to update or not

    for (let i = 0; i < userAssets.length; i++) {
      // Checking if assets need to be updated or not
      const timeDiff = curTime - userAssets[i].updateTime;
      if (userAssets[i].isCustomAsset || timeDiff < MILLISECOND) continue;

      await updatePrice(userAssets[i].stockName, i, curTime, userAssets);
    }

    // Values to render top gainers
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

    if (req.body.action !== "cancel") {
      const curTime = dt.getTime();

      const { noOfStock, symbol, currentPrice, stockName } = tempState;

      await updateDataBase(
        "Ameen Noushad",
        symbol,
        +noOfStock,
        currentPrice,
        stockName
      );
    }

    res.redirect("/portfolio");
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
    ({ currentPrice: stockPrice, symbol } = await getCurrPriceAndSymbol(
      companyName
    ));
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
