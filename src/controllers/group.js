import GroupService from "../services/group.js";
import Group from "../models/group.js";
import User from "../models/user.js";
import { GroupExpense } from "../tarun/expense.js";
class GroupController {
  #groupId;

  generateId = async () => {
    let exists = true;
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    while (exists) {
      this.#groupId = Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      exists = await Group.findOne({ inviteid: this.#groupId });
    }
    return this.#groupId;
  };

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

      for (const memberId of allMembers) {
        const user = await User.findById(memberId);
        if (user && !user.groups.includes(group._id)) {
          user.groups.push(group._id);
          await user.save();
        }
      }

      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  Invite = async (req, res) => {
    try {
      const { userid, inviteid } = req.body;
      const user = await User.findById(userid);
      if (!user) return res.status(404).json({ message: "User not found" });

      const group = await Group.findOne({ inviteid });
      if (!group) return res.status(404).json({ message: "Invalid invite ID" });

      if (group.members.includes(userid))
        return res.status(400).json({ message: "User already in group" });

      group.members.push(userid);
      await group.save();

      if (!user.groups.includes(group._id)) {
        user.groups.push(group._id);
        await user.save();
      }

      res.status(200).json({ message: "User added to group successfully", group });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  /** ✅ Add member via service */
  addMember = async (req, res) => {
    try {
      const { groupId, userId } = req.body;
      const group = await GroupService.addMember({ groupId, userId });
      res.status(200).json({ message: "Member added successfully", group });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  /** ✅ Delete member via service */
  deleteMember = async (req, res) => {
    try {
      const { groupId, userId } = req.body;
      const group = await GroupService.deleteMember({ groupId, userId });
      res.status(200).json({ message: "Member removed successfully", group });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  addExpense = async (req, res) => {
    try {
     const { groupId } = req.params;
      const { desc, amount, paidby } = req.body;

      // Create Expense class object
      const expense = new GroupExpense(paidby, desc, amount);
      
      console.log("expense created");
      console.log(expense.toJSON());
      // Save inside group.expenses[]
      const updatedGroup = await GroupService.addExpense({ groupId, expense });
       
      res.status(200).json({
        message: "Expense added successfully",
        group: updatedGroup
      });
      console.log("done");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

}

export default new GroupController();
