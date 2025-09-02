import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";
import home from "./src/routes/home.js";
import mongoose from "mongoose";
import auth from "./src/routes/auth.js";
import Group from "./src/routes/group.js";
import split from "./src/routes/split.js";
const app=express();
app.use(express.json());
const PORT=process.env.PORT || 5001;

mongoose.connect("mongodb://localhost:27017/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

app.use('/',home);
app.use('/auth',auth);
app.use('/group',Group);
app.use('/split',split);


app.listen(PORT,()=>{
    console.log("server running on:",PORT);
});