import { GroupExpense } from "./expense.js";
import User from "./user.js";
import groupModel from "../models/group.js"; // import mongoose model

export default class Group {
  #balance;
  userBal;
  #gid;
  groupName;
  members;
  #expenses;
  description;
  createdBy;
  inviteid;
  createdAt;
  updatedAt;

  constructor(
    gid,
    name,
    members = [],
    bal = 0,
    exp = [],
    userBal = [],
    description = "",
    createdBy = null,
    inviteid = ""
  ) {
    this.#gid = gid;
    this.groupName = name;
    this.members = members;
    this.userBal = userBal;
    this.#balance = bal;
    this.#expenses = exp;
    this.description = description;
    this.createdBy = createdBy;
    this.inviteid = inviteid;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  splitEqually(amount) {
    const n = this.members.length;
    const increment = amount / n;
    this.userBal = this.userBal.map((value) => value + increment);
  }

  splitUnequally(amount, splitPrice) {
    const sum = splitPrice.reduce((a, b) => a + b, 0);
    if (sum !== amount || splitPrice.length !== this.members.length)
      throw new TypeError("Insufficient Amount or Members.");
    for (let i = 0; i < this.members.length; i++) {
      this.userBal[i] += splitPrice[i];
    }
  }

  addExpense(expense, splitPrice = []) {
    if (!(expense instanceof GroupExpense))
      throw new TypeError("Expense must be instance of GroupExpense");

    const amount = expense.getDetails().amount;
    if (amount <= 0) throw new TypeError("Expense must be positive.");
    this.#expenses.push(expense);

    if (splitPrice.length === 0) this.splitEqually(amount);
    else this.splitUnequally(amount, splitPrice);
  }

  addMember(user) {
    if (!(user instanceof User))
      throw new TypeError("Member must be instance of User");
    this.members.push(user);
    this.userBal.push(0);
  }

  getDetails() {
    return {
      gid: this.#gid,
      name: this.groupName,
      description: this.description,
      createdBy: this.createdBy,
      inviteid: this.inviteid,
      members: this.members,
      userBal: this.userBal,
      balance: this.#balance,
      expenses: this.#expenses,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Converts the class instance into an object suitable for MongoDB
   */
  toDBObject(data={
      gid: this.#gid,
      name: this.groupName,
      description: this.description,
      createdBy: this.createdBy,
      inviteid: this.inviteid,
      members: this.members,
      userBal: this.userBal,
      balance: this.#balance,
      expenses: this.#expenses.map((e) =>
        typeof e.toJSON === "function" ? e.toJSON() : e
      ),
  }) {
    return data;
  }

  /**
   * Saves the current group to MongoDB
   */
  async save() {
    const data = this.toDBObject();
    const groupDoc = new groupModel(data);
    return await groupDoc.save();
  }

  /**
   * Finds a single group matching the filter
   */
  static async findOne(filter) {
    return await groupModel.findOne(filter).populate("members createdBy");
  }

  /**
   * Finds a group by MongoDB ObjectId
   */
  static async findById(id) {
    return await groupModel.findById(id).populate("members createdBy");
  }
}
