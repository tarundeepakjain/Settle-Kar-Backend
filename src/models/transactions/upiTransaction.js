import Transaction from "./transaction";

class UPITransaction extends Transaction {
  #upiId;

  constructor({ amount, userId, groupId, description, upiId }) {
    super({ amount, userId, groupId, description });
    this.#upiId = upiId;
  }

  process() {
    return {
      ...this.getDetails(),
      method: "UPI",
      upiId: this.#upiId,
      status: "Processed via UPI ✅",
    };
  }

}

export default UPITransaction;
