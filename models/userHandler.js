const User = require("./User");
const getTestDatas = async () => {
  const testData = await User.findOne({ name: "Ameen Noushad" });
  return testData;
};
const getAsset = (data, index) => data.assets[index];

module.exports = {
  getTestDatas,
  getAsset,
};
