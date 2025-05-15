// src/pages/ProjectionForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccounts } from "../features/accounts/useAccounts";
import { useProjections } from "../features/projections/useProjections";
import { useProjection }   from "../features/projections/useProjection";

export default function ProjectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // hooks
  const { accounts, loading: acctLoading, error: acctError } = useAccounts();
  const { createProjection } = useProjections();
  const { projection, loading: detailLoading, error: detailError, updateProjection } = useProjection(id);

  // local state
  const [form, setForm] = useState({
    name: "",
    income: "",
    expenses: "",
    endDate: "",
    useNetWorth: false,
    allocations: [{ accountId: "", monthlyAmount: "" }]
  });

  // seed form when editing
  useEffect(() => {
    if (!id || detailLoading || detailError) return;
    if (projection) {
      setForm({
        name: projection.name || "",
        income: projection.income?.toString() || "",
        expenses: projection.expenses?.toString() || "",
        endDate: projection.endDate?.slice(0, 10) || "",
        useNetWorth: projection.useNetWorth,
        allocations: projection.allocations.map(a => ({
          accountId: a.accountId,
          monthlyAmount: a.monthlyAmount.toString(),
        }))
      });
    }
  }, [id, projection, detailLoading, detailError]);

  // field handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAllocChange = (idx, field, value) => {
    setForm(f => ({
      ...f,
      allocations: f.allocations.map((a, i) =>
        i === idx ? { ...a, [field]: value } : a
      )
    }));
  };

  const addAllocation = () => {
    setForm(f => ({
      ...f,
      allocations: [...f.allocations, { accountId: "", monthlyAmount: "" }]
    }));
  };

  const removeAllocation = idx => {
    setForm(f => ({
      ...f,
      allocations: f.allocations.filter((_, i) => i !== idx)
    }));
  };

  // submission
  const handleSubmit = async e => {
    e.preventDefault();
    // build payload
    const payload = {
      name: form.name || undefined,
      ...(form.income && { income: parseFloat(form.income) }),
      ...(form.expenses && { expenses: parseFloat(form.expenses) }),
      ...(form.endDate && { endDate: form.endDate }),
      useNetWorth: form.useNetWorth,
      allocations: form.allocations.map(a => ({
        accountId: a.accountId,
        monthlyAmount: parseFloat(a.monthlyAmount) || 0
      }))
    };

    try {
      if (id) {
        await updateProjection(payload);
      } else {
        await createProjection(payload);
      }
      navigate("/projections");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save projection. See console for details.");
    }
  };

  // loading / error
  if (acctLoading || (id && detailLoading)) return <div>Loading…</div>;
  if (acctError)    return <div className="text-red-500">Error loading accounts</div>;
  if (id && detailError) return <div className="text-red-500">Error loading projection</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        {id ? "Edit Projection" : "New Projection"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label"><span className="label-text">Name</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Plan Name"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label"><span className="label-text">Income / mo</span></label>
            <input
              name="income"
              type="number"
              value={form.income}
              onChange={handleChange}
              placeholder="Optional"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label"><span className="label-text">Expenses / mo</span></label>
            <input
              name="expenses"
              type="number"
              value={form.expenses}
              onChange={handleChange}
              placeholder="Optional"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label"><span className="label-text">End Date</span></label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <label className="flex items-center space-x-3">
          <input
            name="useNetWorth"
            type="checkbox"
            checked={form.useNetWorth}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />
          <span>Start from current net worth</span>
        </label>

        {/* Allocations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Monthly Contributions</h3>
          {form.allocations.map((alloc, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="label"><span className="label-text">Account</span></label>
                <select
                  value={alloc.accountId}
                  onChange={e => handleAllocChange(idx, "accountId", e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(a => (
                    <option key={a._id} value={a._id}>{a.name || a.institution } | Current Balance: ${a.balance}</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="label"><span className="label-text">Amount</span></label>
                <input
                  type="number"
                  value={alloc.monthlyAmount}
                  onChange={e => handleAllocChange(idx, "monthlyAmount", e.target.value)}
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => removeAllocation(idx)}
                className="btn btn-error btn-sm h-10"
              >
                &times;
              </button>
            </div>
          ))}
          <button type="button" onClick={addAllocation} className="btn btn-outline btn-sm">
            + Add Contribution
          </button>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          {id ? "Update Projection" : "Create Projection"}
        </button>
      </form>
    </div>
  );
}
