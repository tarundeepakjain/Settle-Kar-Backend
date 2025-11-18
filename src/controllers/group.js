// controllers/group.js — FINAL FIXED VERSION
import GroupService from "../services/group.js";
import { GroupExpense } from "../tarun/expense.js";
import userModel from "../models/user.js";
import UserClass from "../tarun/user.js";
import GroupModel from "../models/group.js";

class GroupController {
  #groupId;

  /** -----------------------------------------
   * Generate Unique Invite ID
   ----------------------------------------- */
  generateId = async () => {
    let exists = true;
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    while (exists) {
      this.#groupId = Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");

      exists = await GroupModel.findOne({ inviteid: this.#groupId });
    }

    return this.#groupId;
  };

  /** -----------------------------------------
   * CREATE GROUP
   ----------------------------------------- */
  createGroup = async (req, res) => {
    try {
      const { name, description, members, createdBy } = req.body;
      const gid = await this.generateId();

      const allMembers = new Set([...members, createdBy]);

      const group = await GroupService.createGroup({
        name,
        description,
        members: Array.from(allMembers),
        createdBy,
        inviteid: gid,
      });

      // add group ref to all users
      for (const memberId of allMembers) {
        const userDoc = await userModel.findById(memberId);
        if (userDoc && !userDoc.groups.includes(group._id)) {
          userDoc.groups.push(group._id);
          await userDoc.save();
        }
      }

      res.status(201).json(group);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  /** -----------------------------------------
   * JOIN GROUP (Invite ID)
   ----------------------------------------- */
  Invite = async (req, res) => {
    try {
      const { userid, inviteid } = req.body;

      const userDoc = await userModel.findById(userid);
      if (!userDoc) return res.status(404).json({ message: "User not found" });

      const group = await GroupModel.findOne({ inviteid });
      if (!group) return res.status(404).json({ message: "Invalid invite ID" });

      if (group.members.includes(userid))
        return res.status(400).json({ message: "Already a member" });

      // Add user
      group.members.push(userid);
      group.userBal.push({ userId: userid, balance: 0 });   // FIXED ✔
      await group.save();

      if (!userDoc.groups.includes(group._id)) {
        userDoc.groups.push(group._id);
        await userDoc.save();
      }

      res.status(200).json({ message: "Joined group", group });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  /** -----------------------------------------
   * ADD MEMBER
   ----------------------------------------- */
  addMember = async (req, res) => {
    try {
      const { groupId, userId } = req.body;
      const group = await GroupService.addMember({ groupId, userId });
      res.status(200).json({ message: "Member added", group });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  /** -----------------------------------------
   * REMOVE MEMBER
   ----------------------------------------- */
  deleteMember = async (req, res) => {
    try {
      const { groupId, userId } = req.body;
      const group = await GroupService.deleteMember({ groupId, userId });
      res.status(200).json({ message: "Member removed", group });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  /** -----------------------------------------
   * ADD EXPENSE
   ----------------------------------------- */
  addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { desc, amount, paidby, splitAmong } = req.body;

    // 1️⃣ Validate group
    const groupDoc = await GroupModel.findById(groupId);
    if (!groupDoc) return res.status(404).json({ message: "Group not found" });

    // 2️⃣ Validate payer
    if (!groupDoc.members.includes(paidby)) {
      return res.status(403).json({ message: "Payer not in group" });
    }

    // 3️⃣ Validate all split users
    for (const uid of splitAmong) {
      if (!groupDoc.members.includes(uid)) {
        return res.status(400).json({ message: `User ${uid} not member` });
      }
    }

    // 4️⃣ Build expense object EXACTLY matching your schema
    const expenseObj = {
      paidby,
      description: desc,
      amount: Number(amount),
      time: new Date(),
      splitAmong,
    };

    // 5️⃣ Save inside group
    groupDoc.expenses.push(expenseObj);
    await groupDoc.save();

    // 6️⃣ Add separate user transaction record
    const userDoc = await userModel.findById(paidby);
    const userInstance = new UserClass(
      userDoc.name,
      userDoc.email,
      userDoc.password,
      userDoc.balance,
      userDoc.transactions,
      userDoc.groups,
      userDoc._id
    );

    await userInstance.addTransaction("group", expenseObj);

    // 7️⃣ Respond properly
    res.status(200).json({
      message: "Expense added",
      expense: expenseObj,
      groupId,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
}
export default new GroupController();
