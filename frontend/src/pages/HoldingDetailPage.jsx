// src/pages/HoldingDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuote } from '../features/quotes/useQuote';

export default function HoldingDetailPage() {
  const { accountId, holdingId } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const [holding, setHolding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0,10));
  const [isSell, setIsSell] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch holding detail
  useEffect(() => {
    if (!holdingId) return;
    setLoading(true);
    getAccessTokenSilently()
      .then(token =>
        axios.get(
          `/api/accounts/${accountId}/holdings/${holdingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      )
      .then(res => {
        setHolding(res.data);
        setError(null);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [accountId, holdingId]);

  const lots = useMemo(() => holding?.lots || [], [holding]);

  const costBasis = useMemo(() => {
    return lots.reduce((sum, l) => sum + l.shares * l.costPerShare, 0);
  }, [lots]);

  const totalShares = useMemo(() => {
    return lots.reduce((sum, l) => sum + l.shares, 0);
  }, [lots]);

  const { price: currentPrice, loading: priceLoading, error: priceError } = useQuote(
    holding?.ticker
  );

  const marketValue = currentPrice != null ? totalShares * currentPrice : null;

  const handleAddLot = async () => {
    setSubmitting(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `/api/accounts/${accountId}/holdings/${holdingId}/lots`,
        {
          shares: isSell ? -Number(newShares) : Number(newShares),
          costPerShare: parseFloat(newPrice),
          date: newDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHolding(res.data);
      setNewShares('');
      setNewPrice('');
      setIsSell(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-500">Error loading holding</div>;
  if (!holding) return <div className="text-gray-500">Holding not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{holding.ticker}</h2>
      <div className="space-y-1">
        <div>
          Shares: <strong>{totalShares.toFixed(2)}</strong>
        </div>
        <div>
          Cost Basis: <strong>${costBasis.toFixed(2)}</strong>
        </div>
        <div>
          Current Price: {' '}
          {priceLoading
            ? '…'
            : priceError
            ? 'n/a'
            : `$${currentPrice.toFixed(2)}`}
        </div>
        <div>
          Market Value: {' '}
          {marketValue != null
            ? `$${marketValue.toFixed(2)}`
            : 'n/a'}
        </div>
      </div>

      <hr />
      <div className="space-y-2">
        <h3 className="text-xl">Transactions</h3>
        <ul className="space-y-2">
          {lots.map(lot => (
            <li key={lot._id} className="flex justify-between">
              <span>
                {lot.shares >= 0 ? 'Buy' : 'Sell'} {Math.abs(lot.shares)} @ ${lot.costPerShare.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(lot.date).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <hr />
      <div className="space-y-2">
        <h3 className="text-xl">Add Transaction</h3>
        <div className="flex items-center space-x-2">
          <select
            className="select select-bordered w-24"
            value={isSell ? 'sell' : 'buy'}
            onChange={e => setIsSell(e.target.value === 'sell')}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <input
            type="number"
            placeholder="Shares"
            className="input input-bordered w-full"
            value={newShares}
            onChange={e => setNewShares(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            className="input input-bordered w-24"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
          />
          <input
            type="date"
            className="input input-bordered w-36"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <button
            className={`btn btn-primary ${submitting ? 'loading' : ''}`}
            onClick={handleAddLot}
            disabled={submitting}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}