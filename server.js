import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";
import home from "./src/routes/home.js";
import mongo from "./src/db/mongo.js";
import auth from "./src/routes/auth.js";
import Group from "./src/routes/group.js";
import split from "./src/routes/split.js";
const app=express();
app.use(express.json());
const PORT=process.env.PORT || 5001;

const allowedOrigin = 'http://localhost:8081';

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
mongo();
app.use('/',home);
app.use('/auth',auth);
app.use('/group',Group);
app.use('/split',split);
// app.use("/api", expenseRoutes);


app.listen(PORT,'0.0.0.0',()=>{
    console.log("server running on:",PORT);
});