const User = require("./User");
const getTestDatas = async (email) => {
  const testData = await User.findOne({ email });
  return testData;
};
const getAsset = (data, index) => data.assets[index];

module.exports = {
  getTestDatas,
  getAsset,
};
