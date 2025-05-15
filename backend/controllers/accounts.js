import Account from "../models/Account.js";

export const addAccount = async (req, res) => {
  console.log("🟢 [addAccount] called, body =", req.body);
  try {
    const { name, institution, type, balance, interest, subuserId } = req.body;
    const userId = req.auth.sub; // Auth0 user identifier
    const account = new Account({
      userId,
      subuserId,
      name,
      institution,
      type,
      balance,
      interest,
    });
    await account.save();
    console.log("🟢 [addAccount] initial save complete, seeding contribution…");

    // Seed the initial balance as a contribution
    account.contributions.push({
      amount: balance,
      type: "deposit",
      date: account.createdAt,
    });
    await account.save();
    console.log("✅ [addAccount] contribution seeded, sending response");

    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    console.error("🔴 [addAccount] ERROR", err);
    res.status(400).json({ message: err.message });
  }
};

export const getAccounts = async (req, res) => {
  const accounts = await Account.find({ userId: req.auth.sub });
  res.json(accounts);
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.sub;
    const { subuserId, ...updates } = req.body;

    // Find the account and ensure it belongs to this user
    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Apply updates
    Object.assign(account, { ...updates, subuserId });
    await account.save();

    res.json(account);
  } catch (err) {
    console.error("updateAccount error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.sub;
    const result = await Account.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAccountDetails = async (req, res) => {
  const { id } = req.params;
  const userId = req.auth.sub;
  const account = await Account.findOne({ _id: id, userId });
  if (!account) return res.status(404).json({ message: "Not found" });
  res.json(account);
};

// POST /api/accounts/:id/contributions
export const addContribution = async (req, res) => {
  const { id } = req.params;
  const userId = req.auth.sub;
  const { amount, type, date } = req.body;

  const account = await Account.findOne({ _id: id, userId });
  if (!account) return res.status(404).json({ message: "Not found" });

  account.contributions.push({
    amount,
    type,
    date: date ? new Date(date) : new Date(),
  });

  // recalc current balance:
  const balance = account.contributions.reduce(
    (sum, c) => (c.type === "withdrawal" ? sum - c.amount : sum + c.amount),
    0
  );
  // store the computed balance in a virtual or just recalc on the fly—here we save as a field:
  account.balance = balance;

  await account.save();
  res.status(201).json(account);
};
