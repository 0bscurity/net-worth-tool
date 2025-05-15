// src/pages/ProjectionsList.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useProjections } from "../features/projections/useProjections";

export default function ProjectionsList() {
  const { projections, loading, error } = useProjections();
  if (loading) return <div>Loading projections…</div>;
  if (error)
    return <div className="text-red-500">Error loading projections</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projections</h1>
        <Link to="/projections/new" className="btn btn-primary btn-sm">
          + New Projection
        </Link>
      </div>
      {projections.map((p) => (
        <Link
          key={p._id}
          to={`/projections/${p._id}`}
          className="card p-4 border-l-4 hover:bg-gray-50 shadow-sm"
        >
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{p.name || "Untitled"}</div>
              <div className="text-sm text-gray-600 mt-1">
                Ends: {p.endDate ? p.endDate.slice(0, 10) : "EoY"}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              ${p.allocations.reduce((sum, a) => sum + a.monthlyAmount, 0)}/mo
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
