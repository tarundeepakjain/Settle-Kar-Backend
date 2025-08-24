import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";
import home from "./src/routes/home.js";
const app=express();
app.use(express.json());
const PORT=process.env.PORT || 5001;

app.use('/',home);

app.listen(PORT,()=>{
    console.log("server running on:",PORT);
});