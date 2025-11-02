import userModel from "../models/user.js";

export default class User {
  #password;
  #balance;
  #transactions;
  #groups;

  constructor(name, email, password, balance = 0, transactions = [], groups = [], id = null) {
    this.name = name;
    this.email = email;
    this.#password = password;
    this.#balance = balance;
    this.#transactions = transactions;
    this.#groups = groups;
    this.id = id;     // ✅ store userid if passed
    this._id = id;    // ✅ mongoose uses _id
  }

  addBalance(amount) {
    this.#balance += amount;
  }

  deductBalance(amount) {
    this.#balance -= amount;
  }

  getBalance() {
    return this.#balance;
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
      password: this.#password,
      balance: this.#balance,
      groups: this.#groups,
      transactions: this.#transactions,
    };
  }

  async save() {
    const data = this.toJSON();
    const userDoc = new userModel(data);
    const saved = await userDoc.save();
    this.id = saved._id;
    this._id = saved._id;
    return saved;
  }

  // ✅ ✅ NEW: Add transaction to DB
  async addTransaction(type, data) {
    if (!["group", "personal"].includes(type)) {
      throw new Error("Invalid transaction type");
    }

    const userDoc = await userModel.findById(this._id || this.id);
    if (!userDoc) throw new Error("User not found");

    userDoc.transactions.push({
      type,
      data,
    });

    const saved = await userDoc.save();
    return saved;
  }

  static async findOne(filter) {
    return await userModel.findOne(filter);
  }

  static async findById(id) {
    return await userModel.findById(id);
  }

  static async findByIdAndUpdate(id, update) {
    return await userModel.findByIdAndUpdate(id, update, { new: true });
  }
}
