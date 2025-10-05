import split from "../services/split.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import User from "../models/user.js";

class Split{
async equally(req,res){
 try {
      const expense = await split.equally(req.body);
      res.status(201).json({
      message: "Expense added & split equally ✅",
      expense
    });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}
}
export default new Split();