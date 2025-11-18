// services/group.js  (FINAL FIXED VERSION)
import Group from "../tarun/group.js";
import GroupModel from "../models/group.js";

class GroupService {

  /** --------------------------------------------------
   * CREATE GROUP
   * -------------------------------------------------- */
  async createGroup(data) {
    const group = new Group({
      ...data,
      userBal: (data.members || []).map(id => ({
        userId: id.toString(),
        balance: 0,
      })),
      expenses: []
    });

    return await group.save();
  }

  /** --------------------------------------------------
   * ADD MEMBER (DB LEVEL)
   * -------------------------------------------------- */
  async addMember({ groupId, userId }) {
    return await Group.addMember(groupId, userId);
  }

  /** --------------------------------------------------
   * DELETE MEMBER
   * -------------------------------------------------- */
  async deleteMember({ groupId, userId }) {
    return await Group.removeMember(groupId, userId);
  }

  /** --------------------------------------------------
   * ADD EXPENSE
   * -------------------------------------------------- */
  async addExpense({ groupId, expense }) {
    const doc = await GroupModel.findById(groupId);
    if (!doc) throw new Error("Group not found");

    // Convert doc to class instance
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

    // Run expense logic inside Group class
    group.addExpense(expense);

    // SAVE updated values back to Mongo
    const serialized = group.toDBObject();

    doc.userBal = serialized.userBal;
    doc.expenses = serialized.expenses;
    doc.balance = serialized.balance ?? doc.balance;

    await doc.save();
    return doc;
  }
}

export default new GroupService();
