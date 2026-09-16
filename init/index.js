const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongoose_Url = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(mongoose_Url);
}

const initDB = async () => {
    await Listing.deleteMany({});
  initData.data = initData.data.map((obj)  => ({ ... obj, owner:"6a6caef9e7767ddcc5b63c21"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialzed");
};
initDB();
