const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const expressValidator = require("express-validator");

//Load Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const skillRoutes = require("./routes/skill");

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());


//routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", skillRoutes);

// db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"));

mongoose.set("useFindAndModify", false);

mongoose.connection.on("error", (err) => {
  console.log(`DB Connection eroor: ${err}`);
});

//Initiate App
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
