import express from "express";
import GroupController from "../controllers/group.js";

const router = express.Router();

router.post("/new", GroupController.createGroup);
router.post("/invite", GroupController.Invite);
router.post("/add-member", GroupController.addMember);
router.delete("/delete-member", GroupController.deleteMember);
// router.delete("/delete", GroupController.deleteGroup);
// router.post("/invite",async(req,res)=>{
    
// })
export default router;
