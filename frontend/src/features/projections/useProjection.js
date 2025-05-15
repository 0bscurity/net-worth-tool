// src/features/projections/useProjection.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useProjection() {
  const { id } = useParams();
  const {
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [projection, setProjection] = useState(null);
  const [labels, setLabels] = useState([]);
  const [nwSeries, setNwSeries] = useState([]);
  const [acctSeries, setAcctSeries] = useState({});
  const [loading, setLoading] = useState(false);
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
    // 1) Wait until Auth0 is initialized
    if (authLoading) return;
    // 2) Must be logged in
    if (!isAuthenticated) return;
    // 3) Must have a real ID
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await axios.get(`${API_BASE}/projections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { proj, labels, netWorthSeries, acctSeries } = res.data;
        setProjection(proj);
        setLabels(labels);
        setNwSeries(netWorthSeries);
        setAcctSeries(acctSeries);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authLoading, isAuthenticated]);

  return { projection, labels, nwSeries, acctSeries, loading, error };
}
