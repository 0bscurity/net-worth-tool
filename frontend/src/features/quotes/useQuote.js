// src/features/quotes/useQuote.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TWELVE_API_KEY;
const BASE_URL = "https://api.twelvedata.com/price";

export function useQuote(symbol) {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(!!symbol);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(BASE_URL, {
        params: {
          symbol,
          apikey: API_KEY,
        },
      })
      .then((res) => {
        if (cancelled) return;
        if (res.data && res.data.price) {
          setPrice(parseFloat(res.data.price));
        } else {
          setError(new Error("No price returned"));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { price, loading, error };
}
