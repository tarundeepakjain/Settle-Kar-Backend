import GroupService from "../services/group.js";
import Group from "../models/group.js";
import User from "../models/user.js";
class GroupController {
 async Invite(req, res) {
    try {
      const { userid, inviteid } = req.body;
      const user = await User.findById(userid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const group = await Group.findOne({ inviteid });
      if (!group) {
        return res.status(404).json({ message: "Invalid invite ID" });
      }
      if (group.members.includes(userid)) {
        return res.status(400).json({ message: "User already in group" });
      }
      group.members.push(userid);
      await group.save();

      res.status(200).json({
        message: "User added to group successfully",
        group,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async createGroup(req, res) {
    try {
       console.log(req.body);
      const group = await GroupService.createGroup(req.body);
      await group.save();
      res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async addMember(req, res) {
    try {
      await GroupService.addMember(req.body);
      res.status(200).json({ message: "Member added" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async deleteMember(req, res) {
    try {
      await GroupService.deleteMember(req.body);
      res.status(200).json({ message: "Member deleted" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async deleteGroup(req, res) {
    try {
      const grp = await GroupService.deleteGroup(req.body);
      if (!grp) return res.status(401).json({ message: "Unauthorized" });
      res.status(200).json({ message: "Group deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new GroupController();
