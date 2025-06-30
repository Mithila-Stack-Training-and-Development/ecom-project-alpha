exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  const adminEmail = "sikhashri1@gmail.com";
  const adminPassword = "shree";

  if (email === adminEmail && password === adminPassword) {
    return res.status(200).json({
      admin: { email },
      token: "fake-jwt-token",
    });
  } else {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
};
