const { User } = require("../models/User");

let auth = (req, res, next) => {
  //인증 처리를 하는 곳
  //클라이언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;
  //토큰을 복호화한 후, user를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
    //token과 user를 넣어줌으로써 index.js에서 token과 user 정보를 가질 수 있음.(사용할 수 있음.)
  });
  //유저가 있으면 인증 Okay
  //유저가 없으면 인증 No
};

module.exports = { auth };
