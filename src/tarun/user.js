import userModel from "../models/user.js";

export default class User {
  #balance;
  #password;

  constructor(name, email, password, balance = 0) {
    this.name = name;
    this.email = email;
    this.#password = password;
    this.#balance = balance;
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
    return { name: this.name, email: this.email, balance: this.#balance };
  }

  async save() {
    const data = { name: this.name, email: this.email, password: this.#password, balance: this.#balance };
    const userDoc = new userModel(data);
    return await userDoc.save();
  }

  static async findOne(filter) {
    return await userModel.findOne(filter);
  }

  static async findById(id) {
    return await userModel.findById(id);
  }
}
