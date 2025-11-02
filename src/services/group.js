import Group from "../tarun/group.js";
import GroupModel from "../models/group.js";
class GroupService {
  async createGroup(data) {
    console.log("GroupService.createGroup called");
    const group = new Group(data);
    return await group.save();
  }

  async addMember({ groupId, userId }) {
    return await Group.addMember(groupId, userId);
  }

  async deleteMember({ groupId, userId }) {
    return await Group.removeMember(groupId, userId);
  }

  async deleteGroup({ groupId, userId }) {
    // you can implement group delete with auth later if needed
    return await GroupModel.findOneAndDelete({ _id: groupId, createdBy: userId });
  }
  
  async addExpense({ groupId, expense }) {
    const group = await GroupModel.findById(groupId);
    if (!group) throw new Error("Group not found");

    // ✅ push entire JSON (this is what you want)
    group.expenses.push(expense.toJSON());

    await group.save();
    return group;
  }
}

export default new GroupService();
