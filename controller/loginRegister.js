const homepage = (req, res) => {
  res.render("index", {
    pageClass: "homepage",
    showLogin: true,
    showReg: true,
    titleName: "Home Page",
  });
};

const login = (req, res) => {
  res.render("login", {
    pageClass: "loginPage",
    showLogin: false,
    showReg: true,
    titleName: "Login",
  });
};

const register = (req, res) => {
  res.render("register", {
    pageClass: "registerPage",
    showLogin: true,
    showReg: false,
    titleName: "Register",
  });
};

module.exports = {
  homepage,
  login,
  register,
};
