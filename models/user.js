const mongoose = require("mongoose");

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
const User = mongoose.model("User", userSchema);

//이 모델을 다른 파일에서도 사용할 수 있도록
module.exports = { User };
