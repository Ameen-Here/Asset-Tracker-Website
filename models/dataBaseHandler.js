const User = require("./User");

const { getIndex } = require("../Utility Functions/stockCalc");

const { getCurrentUser } = require("../config/currentUser");

const { createNewAsset, updateAsset } = require("./databaseHelper");

async function updateDataBase(
  name,
  symbol,
  noOfStock,
  currentPrice,
  companyName,
  tempState,
  currentUser,
  testData,
  exchange
) {
  const user = getCurrentUser(currentUser);

  // Getting value of assets if it exists

  const assetValues = user.assets.filter((asset) => {
    return asset.symbol === symbol;
  })[0];

  // To store the final data to store into db
  let data = {};

  if (!assetValues) data = createNewAsset(currentPrice, tempState);
  else
    data = await updateAsset(
      assetValues,
      noOfStock,
      currentPrice,
      tempState,
      symbol,
      assetValues,
      exchange
    );

  // Searching for the index
  const updatingIndex = getIndex(user, symbol);

  // Updating asset or adding new asset
  if (updatingIndex === -1) user.assets.push(data);
  else user.assets.splice(updatingIndex, 1, data);

  await user.save();
} //done

module.exports = {
  updateDataBase, // done
};
