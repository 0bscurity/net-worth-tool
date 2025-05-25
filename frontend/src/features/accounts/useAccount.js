import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useAccount() {
  const { id } = useParams();
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: { audience: AUDIENCE },
      });
    } catch (e) {
      if (e.error === "consent_required") {
        return getAccessTokenWithPopup({
          authorizationParams: { audience: AUDIENCE },
        });
      }
      throw e;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const { data } = await axios.get(`${API_BASE}/accounts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccount(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addContribution = async (amount, type, date) => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${API_BASE}/accounts/${id}/contributions`,
        { amount, type, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccount(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount, date) => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${API_BASE}/accounts/${id}/withdraw`,
        { amount, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccount(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContribution = async (contributionId) => {
    try {
      const token = await getToken();
      await axios.delete(
        `${API_BASE}/accounts/${id}/contributions/${contributionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update the account by filtering out the deleted contribution
      setAccount((prev) => ({
        ...prev,
        contributions: prev.contributions.filter(
          (c) => c._id !== contributionId
        ),
      }));
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const addCategory = async (name, amount) => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${API_BASE}/accounts/${id}/categories`,
        { name, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccount(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (categoryId, updates) => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${API_BASE}/accounts/${id}/categories/${categoryId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccount(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${API_BASE}/accounts/${id}/categories/${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccount(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    const token = await getToken();
    await axios.delete(`${API_BASE}/accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return {
    account,
    loading,
    error,
    addContribution,
    deleteContribution,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    withdraw,
  };
}
