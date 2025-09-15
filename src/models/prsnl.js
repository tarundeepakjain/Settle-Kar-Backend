import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
     uid:{
        type:String, required:true
     },
     expense:[{
        category:{type:String,requires:true},
        price:{type:Number,reuired:true}
     }]
  },
  { timestamps: true }
);

const Prsnl = mongoose.model("Prsnl", expenseSchema);
export default Prsnl;
