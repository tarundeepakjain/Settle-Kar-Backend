import express from "express";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import User from "../models/user.js"; 

class Split{
async equally({groupid, payerid, amount, description}){
 const group = await Group.findById(groupid).select("members");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const members = group.members;
    if (members.length === 0) {
      return res.status(400).json({ message: "No members in group" });
    }
    const share = amount / members.length;

const splits = await Promise.all(
  members
    .filter((memberId) => memberId.toString() !== payerid.toString())
    .map(async (memberId) => {
      const user = await User.findById(memberId);
      
      user.amountowed = (user.amountowed || 0) + share;
      await user.save();
      return {
        user: memberId,
        amount: share
      };
    })
);

    const expense = await Expense.create({
      description,
      amount,
      paidBy: payerid,
      group: groupid,
      splits
    });
    return expense;
}
}
export default new Split();