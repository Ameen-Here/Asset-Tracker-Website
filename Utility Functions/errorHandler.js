const catchAsync = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

const isNormalAssetValid = (company) => {
  if (company.companyName && company.quantity) {
    if (company.isStockPrice === "true" && !company.stockPrice) return false;
  } else return false;

  return true;
};

const isCustomAssetValid = (asset) => {
  if (!(asset.companyName && asset.quantity && asset.stockPrice)) return false;
  return true;
};

module.exports = { catchAsync, isNormalAssetValid, isCustomAssetValid };
