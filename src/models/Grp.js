class Group {
  constructor(groupId, members) {
    this.groupId = groupId;
    this.members = members;
    this.expenses = [];
  }

  addExpense(expense) {
    this.expenses.push(expense);
  }
  getBalances() {
    const balances = {};
    this.members.forEach(m => (balances[m] = 0));

    this.expenses.forEach(expense => {
      const shares = expense.calculateShares();
      shares.forEach(share => {
        balances[share.user] -= share.owes;
      });
      balances[expense.paidBy] += expense.amount - (this.amount / this.members.length);
    });
    return balances;
  }
}
module.exports = Group;
