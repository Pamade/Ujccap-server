const jwt = require("jsonwebtoken");
const { INVALID_TOKEN } = require("../utils/errors");
const userAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).json({ err: INVALID_TOKEN });

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: INVALID_TOKEN });
  }
};

module.exports = userAuth;
