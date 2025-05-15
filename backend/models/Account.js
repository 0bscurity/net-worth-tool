import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["deposit", "withdrawal"], default: "deposit" },
});

const accountSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Auth0 sub
    name: { type: String, required: false },
    institution: { type: String, required: true },
    type: { type: String, required: true },
    balance: { type: Number, required: true },
    interest: { type: Number, default: 0 },
    dividend: { type: Number, default: 0 },
    subuserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subuser",
      default: null,
    },
    contributions: [ContributionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
