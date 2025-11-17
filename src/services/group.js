import Group from "../tarun/group.js";
import GroupModel from "../models/group.js";

class GroupService {

  async createGroup(data) {
    const group = new Group({
      ...data,
      userBal: data.members.map(id => ({ userId: id, balance: 0 }))
    });

    return await group.save();
  }

  async addMember({ groupId, userId }) {
    return await Group.addMember(groupId, userId);
  }

  async deleteMember({ groupId, userId }) {
    return await Group.removeMember(groupId, userId);
  }

  async addExpense({ groupId, expense }) {
    const doc = await GroupModel.findById(groupId);
    if (!doc) throw new Error("Group not found");

    // Create Class instance from DB document
    const group = new Group({
      gid: doc.gid,
      name: doc.name,
      members: doc.members,
      description: doc.description,
      createdBy: doc.createdBy,
      inviteid: doc.inviteid,
      balance: doc.balance,
      userBal: doc.userBal,
      expenses: doc.expenses,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });

    // Use class method (not service logic)
    group.addExpense(expense);

    // Save back to DB
    doc.userBal = group.userBal;
    doc.expenses = group.toDBObject().expenses;

    await doc.save();
    return doc;
  }
}

export default new GroupService();
