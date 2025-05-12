import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useAccounts() {
  const { getAccessTokenSilently, getAccessTokenWithPopup, isAuthenticated } =
    useAuth0();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Centralized token getter with consent fallback
  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: { audience: AUDIENCE },
      });
    } catch (e) {
      if (e.error === "consent_required") {
        // Prompt the user for consent
        return await getAccessTokenWithPopup({
          authorizationParams: { audience: AUDIENCE },
        });
      }
      throw e;
    }
  }, [getAccessTokenSilently, getAccessTokenWithPopup]);

  // Fetch all accounts
  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data);
    } catch (err) {
      console.error("fetchAccounts error:", err.response || err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, isAuthenticated]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Add a new account
  const addAccount = useCallback(
    async (acct) => {
      setLoading(true);
      try {
        const token = await getToken();
        const response = await axios.post(`${API_BASE}/accounts`, acct, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccounts((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        console.error("addAccount error:", err.response || err.message);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const updateAccount = useCallback(
    async (id, updates) => {
      setLoading(true);
      try {
        const token = await getToken();
        const { data } = await axios.put(
          `${API_BASE}/accounts/${id}`,
          updates,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAccounts((prev) => prev.map((acc) => (acc._id === id ? data : acc)));
        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const deleteAccount = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const token = await getToken();
        await axios.delete(`${API_BASE}/accounts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // remove from state
        setAccounts(prev => prev.filter(acc => acc._id !== id));
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return { accounts, loading, error, fetchAccounts, addAccount, updateAccount, deleteAccount };
}
