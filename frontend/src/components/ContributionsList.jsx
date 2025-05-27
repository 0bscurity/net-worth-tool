// src/components/ContributionsList.jsx
import React, { useMemo } from "react";

export default function ContributionsList({ contributions }) {
  const sortedContributions = useMemo(() => {
    return [...contributions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [contributions]);

  return (
    <>
      {sortedContributions.map((c) => (
        <div key={c._id} className="flex justify-between items-center">
          <div>
            <span className="font-medium capitalize">{c.type}</span>{" "}
            <span className="text-sm text-gray-500 ml-2">
              {new Date(c.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={
                c.type === "withdrawal" ? "text-red-500" : "text-green-500"
              }
            >
              {c.type === "withdrawal" ? "−" : "+"}$
              {c.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
