import GroupService from "../services/group.js";
class GroupController {
  async createGroup(req, res) {
    try {
      const group = await GroupService.createGroup(req.body);
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
