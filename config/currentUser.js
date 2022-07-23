let currentUser = undefined;

const setCurrentUser = function (testDatas) {
  currentUser = testDatas;
};

const removeCurrentUser = function () {
  currentUser = undefined;
};

const getCurrentUser = function (user) {
  if (user) return currentUser;
  return undefined;
};

module.exports = {
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
};
