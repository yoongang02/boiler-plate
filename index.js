const express = require("express");
const app = express();
const port = 3000;
//mongoose를 이용하여 애플리케이션과 Mongo DB를 연결할 것
const mongoose = require("mongoose");
//MongoDB와 연결하기, 연결되었는지 콘솔로 확인
mongoose
  .connect(
    "mongodb+srv://KyoungminYoon:rudals00@boilerplate.dexfzxi.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB Connected...");
  })
  .catch((err) => console.log(err));
// "/" 루트 디렉토리에 오면 Hello World을 출력
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
