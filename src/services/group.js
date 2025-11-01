import Group from "../tarun/group.js";

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
}

export default new GroupService();
