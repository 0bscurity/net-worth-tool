import Subuser from "../models/Subuser.js";

export const listSubusers = async (req, res, next) => {
  try {
    const subs = await Subuser.find({ userId: req.auth.sub });
    res.json(subs);
  } catch (err) {
    next(err);
  }
};

export const createSubuser = async (req, res, next) => {
  try {
    const { name, email, relationship } = req.body;
    const sub = new Subuser({
      userId: req.auth.sub,
      name,
    });
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
};

export const getSubuser = async (req, res, next) => {
  try {
    const sub = await Subuser.findOne({
      _id: req.params.id,
      userId: req.auth.sub,
    });
    if (!sub) return res.sendStatus(404);
    res.json(sub);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subusers/:id
export const deleteSubuser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth.sub;
    // Only delete if it belongs to this user
    const result = await Subuser.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).json({ message: "Sub-user not found" });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
