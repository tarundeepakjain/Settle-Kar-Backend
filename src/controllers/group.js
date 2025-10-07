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
      console.log(group._id);
      group.members.push(userid);
      await group.save();
      if (user.groups.includes(group._id)) {
        return res.status(400).json({ message: "User already in group" });
      }
     user.groups.push(group._id);
     await user.save();
     console.log("grp added in user");
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
        const {  members, createdBy } = req.body;
        
      const group = await GroupService.createGroup(req.body);
      await group.save();
       const all = new Set(members || []);
    all.add(createdBy); 
    for (const memberId of all) {
      const user = await User.findById(memberId);
      if (user) {
        if (!user.groups.includes(group._id)) {
          user.groups.push(group._id);
          await user.save();
        }
      } else {
        console.warn(`User ${memberId} not found, skipping`);
      }
      
    }
    console.log("grp created and valid users added");
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
