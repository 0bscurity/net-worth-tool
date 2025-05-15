import Projection from "../models/Projection.js";
import Account from "../models/Account.js";

// Helpers for date math:
function startOfMonth(dt) {
  // first day of that month
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

function endOfYear(dt) {
  // Dec 31 of that year
  return new Date(dt.getFullYear(), 11, 31);
}

// (keep your addMonths function as-is)
function addMonths(dt, n) {
  const d = new Date(dt);
  d.setMonth(d.getMonth() + n);
  return d;
}

export const listProjections = async (req, res, next) => {
  try {
    const list = await Projection.find({ userId: req.auth.sub }).sort({
      createdAt: -1,
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createProjection = async (req, res, next) => {
  try {
    const proj = new Projection({ userId: req.auth.sub, ...req.body });
    await proj.save();
    res.status(201).json(proj);
  } catch (err) {
    next(err);
  }
};

export const getProjectionDetail = async (req, res, next) => {
  try {
    const proj = await Projection.findOne({
      _id: req.params.id,
      userId: req.auth.sub,
    }).lean();
    if (!proj) return res.sendStatus(404);

    // build labels
    const today = startOfMonth(new Date());
    const start = today;
    const end = proj.endDate ? proj.endDate : endOfYear(today);
    const labels = [];
    for (let dt = start; dt <= end; dt = addMonths(dt, 1)) {
      labels.push(dt.toISOString().slice(0, 10));
    }

    // fetch accounts + simulate…
    const accounts = await Account.find({
      _id: { $in: proj.allocations.map((a) => a.accountId) },
    }).lean();
    const initBal = Object.fromEntries(
      accounts.map((a) => [a._id.toString(), a.balance])
    );

    const nwSeries = [];
    const acctSeries = {};
    proj.allocations.forEach((a) => (acctSeries[a.accountId] = []));
    labels.forEach((_, idx) => {
      let total = 0;
      proj.allocations.forEach((a) => {
        const key = a.accountId.toString();
        const prev = idx > 0 ? acctSeries[key][idx - 1] : initBal[key] || 0;
        const bal = prev + a.monthlyAmount;
        acctSeries[key].push(bal);
        total += bal;
      });
      nwSeries.push(total);
    });

    res.json({ proj, labels, nwSeries, acctSeries });
  } catch (err) {
    next(err);
  }
};

// TODO: updateProjection, deleteProjection...
