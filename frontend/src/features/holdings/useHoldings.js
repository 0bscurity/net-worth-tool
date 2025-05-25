// src/features/holdings/useHoldings.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useHoldings(accountId) {
  const { getAccessTokenSilently } = useAuth0();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHoldings = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(`${API_BASE}/accounts/${accountId}/holdings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accountId, getAccessTokenSilently]);

  useEffect(() => {
    if (accountId) fetchHoldings();
  }, [accountId, fetchHoldings]);

  const addHolding = async (ticker) => {
    const token = await getAccessTokenSilently();
    const res = await axios.post(
      `${API_BASE}/accounts/${accountId}/holdings`,
      { ticker },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setHoldings((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateHolding = async (holdingId, updates) => {
    const token = await getAccessTokenSilently();
    const res = await axios.put(
      `${API_BASE}/accounts/${accountId}/holdings/${holdingId}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setHoldings((prev) =>
      prev.map((h) => (h._id === holdingId ? res.data : h))
    );
    return res.data;
  };

  const deleteHolding = async (holdingId) => {
    const token = await getAccessTokenSilently();
    await axios.delete(`${API_BASE}/accounts/${accountId}/holdings/${holdingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHoldings((prev) => prev.filter((h) => h._id !== holdingId));
  };

  return {
    holdings,
    loading,
    error,
    fetchHoldings,
    addHolding,
    updateHolding,
    deleteHolding,
  };
}
