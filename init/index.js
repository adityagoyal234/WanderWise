const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

const initDB = async () => {
  try {
    const sanitizedData = initData.data.map((item) => ({
      ...item,
      image: typeof item.image === "object" ? item.image.url : item.image,
      //  owner: "678966311dd0571b42901675"
    }));

    await Listing.deleteMany({});
    // const ownerId = "678966311dd0571b42901675"; 
    // initData.data = initData.data.map((obj) => ({ ...obj, owner: ownerId }));
    await Listing.insertMany(sanitizedData);
    console.log("Database initialized with sanitized data.");
  } catch (err) {
    console.error("Insert Error:", err);
  }
};
main();



