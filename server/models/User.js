const mongoose = require("mongoose");
//bcrypt 가져오기
const bcrypt = require("bcrypt");
//salt를 이용해서 비밀번호를 암호화하니까 salt를 먼저 생성.
//saltRounds는 salt가 몇 글자인지를 나타냄.
const saltRounds = 10;
//jsonwebtoken 가져오기
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //john ahn@naver.com 이럴 때 스페이스를 없에주는 역할
    unique: 1, //똑같은 이메일은 작성할 수 없도록
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    //어떤 유저가 관리자 유저일수도 일반 유저일 수도 있으니까
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    //token을 통해 유효성 관리 가능
    type: String,
  },
  tokenExp: {
    //token 유효기간
    type: Number,
  },
});

//pre()는 mongoose의 메소드임.
//save로 하면 user 모델에 user 정보를 저장하기 전에 function에 적어 놓은 일을 수행 한다는 뜻.
//이 일을 수행하면 다시 저장하는 코드로 넘어감.
userSchema.pre("save", function (next) {
  var user = this; //userSchema를 가리킴.
  //비밀번호 암호화는 비밀번호를 바꿀 때만 바꿔야 하니, 조건을 달아줌.
  //비밀번호를 바꾸려고 할 때만 비밀번호를 바꾸어준다.
  if (user.isModified("password")) {
    //비밀번호를 암호화 시킨다.
    //salt를 만드는 부분(saltRounds가 필요)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        // Store hash in your password DB.
        user.password = hash; //user의 plain pwd가 담겨있던 곳에 hash된 pwd를 다시 저장
        next(); //원래 함수로 다시 돌아감.
      });
    });
  } else {
    //만약 비밀번호가 아니라 다른 것을 바꿀 때라면
    next(); //이 코드를 작성해주어야 이 부분에서 탈출하여 원래 코드로 돌아갈 수 있음.
  }
});

userSchema.methods.comparePassword = function (plainPassword, callback) {
  //plainPassword 1234567
  //암호화된 비밀번호가 같은지 확인을 해야 함.
  //암호화된 비밀번호를 복호화하여 같은지 확인할 수는 없기에
  //plain 비밀번호를 다시 암호화하여 암호화된 것과 같은지 확인을 해야 함.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generateToken = function (callback) {
  var user = this;
  //jsonwebtoken을 이용해서 token을 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken"); //user._id + 'secretToken' = token
  //나중에 secretToken을 넣으면 user._id를 도출할 수 있음.
  //즉, token을 가지고 이 사람이 누구인지를 알 수가 있는 것임.
  //userSchema의 token 필드에 넣어 줄 것.
  user.token = token;
  user.save(function (err, user) {
    if (err) return callback(err);
    callback(null, user); //err는 없고 user 정보를 전달
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  //토큰을 decode 한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    //user id를 이용하여 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 db에 보관된 token이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};
const User = mongoose.model("User", userSchema);
//이 모델을 다른 파일에서도 사용할 수 있도록
module.exports = { User };
