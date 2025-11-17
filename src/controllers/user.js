import userModel from "../models/user.js";
import User from "../tarun/user.js";  // ✅ Your custom class
import Expense from "../tarun/expense.js";

class UserController {

  /** ✅ Create New User */
  createUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const exists = await userModel.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const userInstance = new User(name, email, password);
      const saved = await userInstance.save();

      res.status(201).json({
        message: "User created successfully",
        user: saved,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  /** ✅ Get logged-in user by token */
//   getMyProfile = async (req, res) => {
//     try {
//       const userId = req.user.id;

//       const user = await userModel.findById(userId);
//       if (!user)
//         return res.status(404).json({ message: "User not found" });

//       res.status(200).json(user);

//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };


  /** ✅ Add Personal Transaction */
  addPersonalTransaction = async (req, res) => {
    try {
      const userId = req.user.id;   // ✅ from JWT
      const { desc, amount, category } = req.body;
      const personalExpense = new Expense(desc,amount);

      console.log("expense created");
      console.log(personalExpense.toJSON());

      const userDoc = await userModel.findById(userId);
      if (!userDoc)
        return res.status(404).json({ message: "User not found" });

      const userInstance = new User(
        userDoc.name,
        userDoc.email,
        userDoc.password,
        userDoc.balance,
        userDoc.transactions,
        userDoc.groups,
        userDoc._id
      );


      const updated = await userInstance.addTransaction("personal", personalExpense.toJSON());

      res.status(200).json({
        message: "Personal transaction added",
        transaction: personalExpense.toJSON(),
        user: updated,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  /** ✅ Add balance */
  addBalance = async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      const user = await userModel.findById(userId);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      user.balance += Number(amount);
      await user.save();

      res.status(200).json({
        message: "Balance added",
        balance: user.balance,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  /** ✅ Deduct balance */
  deductBalance = async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      const user = await userModel.findById(userId);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      user.balance -= Number(amount);
      await user.save();

      res.status(200).json({
        message: "Balance deducted",
        balance: user.balance,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  editUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;

      const user = await userModel.findById(userId);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();

      res.status(200).json({
        message: "User updated successfully",
        user,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();
