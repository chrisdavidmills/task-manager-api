const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function auth(req, res, next) {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if(!user) {
      throw new Error();
    }

    // add custom fields containing the user + token we fetched to the request object, so they are then available in the route handler
    req.user = user;
    req.token = token;
    next();
  } catch(e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
}

module.exports = auth;
