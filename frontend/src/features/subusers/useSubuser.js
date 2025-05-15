// src/features/subusers/useSubuser.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

export function useSubuser(subuserId) {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();

  const [subuser, setSubuser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const getToken = async () => {
    try {
      return await getAccessTokenSilently({ authorizationParams:{ audience: AUDIENCE }});
    } catch (e) {
      if (e.error === "consent_required") {
        return getAccessTokenWithPopup({ authorizationParams:{ audience: AUDIENCE }});
      }
      throw e;
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !subuserId) return;
    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res   = await axios.get(`${API_BASE}/subusers/${subuserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubuser(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated, subuserId]);

  return { subuser, loading: authLoading || loading, error };
}
