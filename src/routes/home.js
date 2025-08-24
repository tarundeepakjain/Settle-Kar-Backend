import express from "express";
const router=express();

router.get('/',(req,res)=>{
    res.send("Hello from Avadhesh");
})

export default router;