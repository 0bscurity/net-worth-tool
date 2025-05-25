import mongoose from "mongoose";

const LotSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  shares: { type: Number, required: true },
  costPerShare: { type: Number, required: true },
});

const holdingSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    ticker: { type: String, required: true },
    lots: [LotSchema],
  },
  { timestamps: true }
);

// Virtuals for aggregated calculations
holdingSchema.virtual("totalShares").get(function () {
  return this.lots.reduce((sum, l) => sum + l.shares, 0);
});
holdingSchema.virtual("totalCostBasis").get(function () {
  return this.lots.reduce((sum, l) => sum + l.shares * l.costPerShare, 0);
});
holdingSchema.virtual("averageCostPerShare").get(function () {
  const ts = this.totalShares;
  return ts > 0 ? this.totalCostBasis / ts : 0;
});
holdingSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Holding", holdingSchema);
