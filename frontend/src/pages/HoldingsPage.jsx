// src/pages/HoldingsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

export default function HoldingsPage() {
  const { id: accountId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [holdings, setHoldings] = useState([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch holdings for this account
  const fetchHoldings = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(`/api/accounts/${accountId}/holdings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const handleAddHolding = async () => {
    if (!newTicker) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `/api/accounts/${accountId}/holdings`,
        { ticker: newTicker.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHoldings([...holdings, res.data]);
      setNewTicker("");
    } catch (err) {
      console.error(err);
      alert("Failed to add holding.");
    }
  };

  const handleDeleteHolding = async (holdingId) => {
    if (!window.confirm("Delete this holding?")) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(`/api/accounts/${accountId}/holdings/${holdingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(holdings.filter((h) => h._id !== holdingId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete holding.");
    }
  };

  const goToLots = (holdingId) => {
    navigate(`/accounts/${accountId}/holdings/${holdingId}/lots`);
  };

  if (loading) return <div>Loading holdings…</div>;
  if (error) return <div className="text-red-500">Error loading holdings.</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Holdings for Account</h2>
      <div className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Ticker (e.g. AAPL)"
          className="input input-bordered"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
        />
        <button onClick={handleAddHolding} className="btn btn-primary">
          Add Holding
        </button>
      </div>
      {holdings.length === 0 ? (
        <p className="text-gray-600">No holdings yet. Add one above.</p>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Shares</th>
              <th>Avg Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h._id}>
                <td>{h.ticker}</td>
                <td>{h.totalShares.toFixed(2)}</td>
                <td>${h.averageCostPerShare.toFixed(2)}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => goToLots(h._id)}
                    className="btn btn-sm"
                  >
                    Manage Lots
                  </button>
                  <button
                    onClick={() => handleDeleteHolding(h._id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
