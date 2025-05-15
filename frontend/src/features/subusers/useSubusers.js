// src/features/subusers/useSubusers.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useSubusers() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [subusers, setSubusers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: { audience: AUDIENCE },
      });
    } catch (e) {
      if (e.error === "consent_required") {
        return await getAccessTokenWithPopup({
          authorizationParams: { audience: AUDIENCE },
        });
      }
      throw e;
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await axios.get(`${API_BASE}/subusers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubusers(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated]);

  const createSubuser = async (data) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.post(`${API_BASE}/subusers`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubusers((s) => [...s, res.data]);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubuser = async (id) => {
    setLoading(true);
    try {
      const token = await getToken();
      await axios.delete(`${API_BASE}/subusers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubusers((s) => s.filter((u) => u._id !== id));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    subusers,
    loading: authLoading || loading,
    error,
    createSubuser,
    deleteSubuser,
  };
}
