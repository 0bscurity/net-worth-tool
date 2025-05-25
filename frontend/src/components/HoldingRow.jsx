// src/components/HoldingRow.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useQuote } from "../features/quotes/useQuote";

export default function HoldingRow({ accountId, holding }) {
  const {
    price,
    loading: priceLoading,
    error: priceError,
  } = useQuote(holding.ticker);

  // Calculate cost basis (virtual or computed)
  const costBasis =
    holding.totalCostBasis != null
      ? holding.totalCostBasis
      : holding.totalShares * holding.averageCostPerShare;

  // Format values
  const formattedCostBasis = `$${costBasis.toFixed(2)}`;
  const formattedMarketValue = priceLoading
    ? "…"
    : priceError
    ? "n/a"
    : `$${(price * holding.totalShares).toFixed(2)}`;

  return (
    <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
      <div>
        <p className="font-medium text-lg">{holding.ticker}</p>
        <div className="text-sm text-gray-500">
          <div>Shares: {holding.totalShares.toFixed(2)}</div>
          <div>Cost Basis: {formattedCostBasis}</div>
          <div>Market Value: {formattedMarketValue}</div>
        </div>
      </div>
      <Link
        to={`/accounts/${accountId}/holdings/${holding._id}`}
        className="btn btn-sm btn-outline"
      >
        Details
      </Link>
    </li>
  );
}
