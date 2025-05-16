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

// Delete a contribution
export const deleteContribution = async (req, res) => {
  try {
    const { id, contributionId } = req.params;
    const userId = req.auth.sub;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Find the contribution and calculate the balance adjustment
    const contribution = account.contributions.id(contributionId);
    if (!contribution)
      return res.status(404).json({ message: "Contribution not found" });

    const adjustment =
      contribution.type === "withdrawal"
        ? contribution.amount
        : -contribution.amount;

    // Adjust the balance and remove the contribution
    account.balance += adjustment;
    contribution.remove();
    await account.save();

    res.json(account);
  } catch (err) {
    console.error("deleteContribution error:", err);
    res.status(500).json({ message: err.message });
  }
};
// POST /api/accounts/:id/categories
export const addCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.auth.sub;
  const { name, amount } = req.body;

  const account = await Account.findOne({ _id: id, userId });
  if (!account) return res.status(404).json({ message: "Not found" });

  account.categories.push({ name, amount });
  await account.save();
  res.json(account);
};

// PUT /api/accounts/:id/categories/:categoryId
export const updateCategory = async (req, res) => {
  const { id, categoryId } = req.params;
  const userId = req.auth.sub;
  const { name, amount } = req.body;

  const account = await Account.findOne({ _id: id, userId });
  if (!account) return res.status(404).json({ message: "Not found" });

  const cat = account.categories.id(categoryId);
  if (!cat) return res.status(404).json({ message: "Not found" });

  cat.name = name;
  cat.amount = amount;
  await account.save();
  res.json(account);
};

// DELETE /api/accounts/:id/categories/:categoryId
export const deleteCategory = async (req, res) => {
  const { id, categoryId } = req.params;
  const userId = req.auth.sub;

  const account = await Account.findOne({ _id: id, userId });
  if (!account) return res.status(404).json({ message: "Not found" });

  account.categories = account.categories.filter(
    (c) => c._id.toString() !== categoryId
  );
  await account.save();
  res.json(account);
};
