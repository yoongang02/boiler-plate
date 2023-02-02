const express = require("express");
const app = express();
const port = 3000;
//mongoose를 이용하여 애플리케이션과 Mongo DB를 연결할 것
const mongoose = require("mongoose");
//auth.js에서 만든 auth 가져오기
const { auth } = require("./middleware/auth");
//user.js에서 만든 user 모델을 사용하기 위해 가져옴
const { User } = require("./models/User");
//body-parser 가져오기
const bodyParser = require("body-parser");
//cookie-parser 가져오기
const cookieParser = require("cookie-parser");
//body-parser 옵션 주기
//application/x-www-form0urlencoded 이렇게 된 데이터를 분석해서 가져올 수 있도록 하는 코드
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //application/json 타입으로 된 것을 분석해서 가져올 수 있도록 해주는 코드
//cookie-parser에 옵션 주기
app.use(cookieParser());

//config에서 mongoURI 가져오기
const config = require("./config/key");

//MongoDB와 연결하기, 연결되었는지 콘솔로 확인
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("MongoDB Connected...");
  })
  .catch((err) => console.log(err));
// "/" 루트 디렉토리에 오면 Hello World을 출력
app.get("/", (req, res) => {
  res.send("Hello World! 일타스캔들 빨리 봐야지");
});

//회원가입을 위한 라우트를 생성할 것
app.post("api/users/register", (req, res) => {
  //회원가입 시 필요한 정보들을 client에서 가져오면
  //그것들을 database에 넣어준다.
  //정보들을 데이터베이스에 넣기 위해선 req.body를 해 줌
  //req.body 안에는 josn 형식으로 {id:"hello", password:"123"} 이런식으로 들어있음.
  const user = new User(req.body); //user instance 생성

  //save를 하기 전 비밀번호를 암호화

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  }); //몽고디비의 메소드 -> 정보들이 user 모델에 저장.
});
//로그인 기능
app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 DB에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        messeage: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청한 이메일이 DB에 있다면 비밀번호가 맞는 비밀번호인지 확인한다.
    //comparePassword 메소드를 직접 만들어 줄 것임. User.js에
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          messeage: "비밀번호가 틀렸습니다.",
        });
      //비밀번호까지 맞다면 Token을 생성한다.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //token을 저장한다. 어디에? 쿠키에 보관하거나, 로컬 스토로지 등
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
        //어디에 저장하는지는 논란이 많음.(보안 때문에)
        //여기서는 쿠키에 저장을 해 볼 것
      });
    });
  });
});
//인증 라우트
//role 1이 admin이고 role 2이 특정 부서의 admin이라면 이런 식으로 정할 수 있음.
app.get("api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 이야기는 Authentication이 true라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//로그아웃 라우트
app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
