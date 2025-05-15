// src/features/projections/useProjections.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useProjections() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
    getAccessTokenWithPopup
  } = useAuth0();

  const [projections, setProjections] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const getToken = async () => {
    try {
      return await getAccessTokenSilently({ authorizationParams: { audience: AUDIENCE } });
    } catch (e) {
      if (e.error === "consent_required") {
        return getAccessTokenWithPopup({ authorizationParams: { audience: AUDIENCE } });
      }
      throw e;
    }
  };

  // load list
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res   = await axios.get(`${API_BASE}/projections`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjections(Array.isArray(res.data) ? res.data : res.data.projections ?? []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated]);

  // create new
  const createProjection = async (payload) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res   = await axios.post(
        `${API_BASE}/projections`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjections(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // delete one
  const deleteProjection = async (id) => {
    const token = await getToken();
    await axios.delete(`${API_BASE}/projections/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProjections(prev => prev.filter(p => p._id !== id));
  };

  return {
    projections,
    loading: authLoading || loading,
    error,
    createProjection,
    deleteProjection,
  };
}
