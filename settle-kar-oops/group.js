import { GroupExpense } from "./expense";
import User from "./user";

export default class Group{
  #balance;
  userBal;
  #gid;
  groupName;
  members;
  #expenses;
  constructor(gid,name,members=[],bal=0,exp=[],userBal=[]){
    this.#gid=gid;
    this.groupName=name;
    this.members=members;
    this.userBal=userBal;
    this.#balance=bal;
    this.#expenses=exp;
  }
  splitEqually(amount){
    n=this.members.length;
    increment=amount/n;
    this.userBal=this.userBal.map(value=>value+increment);
  }
  splitUnequally(amount,splitPrice){
    let sum = splitPrice.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    if(sum!==amount || splitPrice.length!=this.members.length) throw new TypeError('Insufficient Amount or Members.');
    for(let i=0;i<this.members.length;i++){
        this.userBal[i]+=splitPrice[i];
    }
  }
  addExpense(expense,splitPrice=[]){
    //Note that you have to pass object of GroupExpense i.e. expense as argument
    const amount=expense.getDetails().amount;
    if(amount===0) throw new TypeError('Expense must be positive.');
    this.#expenses.push(expense);
    if(splitPrice.length===0){
        this.splitEqually(amount);
    }else{
        this.splitUnequally(amount,splitPrice);
    }
  }
  addMember(user,split=false,splitPrice=[]){
    //Note that you have to pass object of User i.e. user as argument
    this.members.push(user);
    this.userBal.push(0);
  }
}
