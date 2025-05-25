import Holding from "../models/Holdings.js";

// Create a new holding under an account
export const addHolding = async (req, res) => {
  const { id: accountId } = req.params;
  const userId = req.auth.sub;
  const { ticker } = req.body;

  // Optionally verify account belongs to user (via Account model lookup)
  const holding = new Holding({ accountId, ticker });
  await holding.save();
  res.status(201).json(holding);
};

// List holdings for an account
export const getHoldings = async (req, res) => {
  const { id: accountId } = req.params;
  const holdings = await Holding.find({ accountId });
  res.json(holdings);
};

// Delete a holding and its lots
export const deleteHolding = async (req, res) => {
  const { id: accountId, holdingId } = req.params;
  const result = await Holding.findOneAndDelete({ _id: holdingId, accountId });
  if (!result) return res.status(404).json({ message: "Holding not found" });
  res.json({ success: true });
};

// Add a lot to a holding
export const addLot = async (req, res) => {
  const { holdingId } = req.params;
  const { date, shares, costPerShare } = req.body;
  const holding = await Holding.findById(holdingId);
  if (!holding) return res.status(404).json({ message: "Holding not found" });

  holding.lots.push({
    date: date ? new Date(date) : new Date(),
    shares,
    costPerShare,
  });
  await holding.save();
  res.status(201).json(holding);
};

// Update or delete lot controllers similar to previous
export const updateLot = async (req, res) => {
  const { holdingId, lotId } = req.params;
  const { date, shares, costPerShare } = req.body;
  const holding = await Holding.findById(holdingId);
  if (!holding) return res.status(404).json({ message: "Holding not found" });

  const lot = holding.lots.id(lotId);
  if (date) lot.date = new Date(date);
  if (shares != null) lot.shares = shares;
  if (costPerShare != null) lot.costPerShare = costPerShare;
  await holding.save();
  res.json(holding);
};

export const deleteLot = async (req, res) => {
  const { holdingId, lotId } = req.params;
  const holding = await Holding.findById(holdingId);
  if (!holding) return res.status(404).json({ message: "Holding not found" });

  holding.lots.id(lotId).remove();
  await holding.save();
  res.json(holding);
};
