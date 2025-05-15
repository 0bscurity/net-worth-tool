import mongoose from "mongoose";

const AllocationSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
});

const StartingAllocationSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  startingBalance: {
    type: Number,
    required: true,
  },
});

const ProjectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: String,
      required: true,
    },
    income: {
      type: Number,
      required: false,
    },
    expenses: {
      type: Number,
      default: 0,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    useNetWorth: {
      type: Boolean,
      default: false,
    },
    allocations: [AllocationSchema],
    startingAllocations: {
      type: [StartingAllocationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Projection", ProjectionSchema);
