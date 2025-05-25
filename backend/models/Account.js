import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["deposit", "withdrawal"], default: "deposit" },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
});

const accountSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: false },
    institution: { type: String, required: true },
    type: { type: String, required: true },
    balance: {
      type: Number,
      default: 0,
      required: function () {
        return this.type !== "Investment";
      },
    },
    interest: {
      type: Number,
      default: 0,
      required: function () {
        return this.type !== "Investment";
      },
    },
    dividend: { type: Number, default: 0 },
    subuserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subuser",
      default: null,
    },
    contributions: {
      type: [ContributionSchema],
      default: [], 
    },
    categories: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
