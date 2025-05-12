// src/pages/EditAccountPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccounts } from "../features/accounts/useAccounts";

export default function EditAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, updateAccount, loading } = useAccounts();
  const account = accounts.find((a) => a._id === id) || {};

  const [institution, setInstitution] = useState(account.institution || "");
  const [type, setType] = useState(account.type || "Checking");
  const [balance, setBalance] = useState(account.balance || "");
  const [interest, setInterest] = useState(account.interest * 100 || "");

  useEffect(() => {
    if (account._id) {
      setInstitution(account.institution);
      setType(account.type);
      setBalance(account.balance);
      setInterest(account.interest * 100);
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAccount(id, {
      institution,
      type,
      balance: parseFloat(balance),
      interest: parseFloat(interest) / 100,
    });
    navigate("/dashboard");
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Edit Account</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Institution */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Institution</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />
        </div>
        {/* Type */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Account Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Checking</option>
            <option>Savings</option>
            <option>Investment</option>
            <option>Credit</option>
          </select>
        </div>
        {/* Balance */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Balance</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="input input-bordered w-full"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
        </div>
        {/* Interest */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Interest (%)</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="input input-bordered w-full"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Save Changes
        </button>
      </form>
    </div>
  );
}
