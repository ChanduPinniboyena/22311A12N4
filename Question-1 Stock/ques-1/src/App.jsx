import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://20.244.56.144/evaluation-service/stocks';
const AUTH_HEADER = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzI5MDQ4LCJpYXQiOjE3NDgzMjg3NDgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA3Njc2MzdlLWY4YjItNDNiYy1hM2U3LTI1NTI2MjljNzljYSIsInN1YiI6IjIyMzExYTEybjRAaXQuc3JlZW5pZGhpLmVkdS5pbiJ9LCJlbWFpbCI6IjIyMzExYTEybjRAaXQuc3JlZW5pZGhpLmVkdS5pbiIsIm5hbWUiOiJwaW5uaWJveWVuYSBqYXlhIG5hZ2EgY2hhbmR1Iiwicm9sbE5vIjoiMjIzMTFhMTJuNCIsImFjY2Vzc0NvZGUiOiJQQ3FBVUsiLCJjbGllbnRJRCI6IjA3Njc2MzdlLWY4YjItNDNiYy1hM2U3LTI1NTI2MjljNzljYSIsImNsaWVudFNlY3JldCI6Ind0bkpNRnFFUXdNUFJDZ1AifQ.MaKp_fRomLkqIaLVDf--gIYnf4HR7nYoyhZRHZ-ScvE';

function App() {
  const [stocks, setStocks] = useState({});
  const [selectedTicker, setSelectedTicker] = useState('');
  const [latestPrice, setLatestPrice] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_BASE, {
          headers: { Authorization: AUTH_HEADER },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setStocks(data.stocks || {});
      } catch (err) {
        setError('Failed to fetch stocks: ' + err.message);
      }
      setLoading(false);
    };
    fetchStocks();
  }, []);

  const fetchLatestPrice = async (ticker) => {
    setLoading(true);
    setError('');
    setLatestPrice(null);
    setHistory([]);
    try {
      const res = await fetch(`${API_BASE}/${ticker}`, {
        headers: { Authorization: AUTH_HEADER },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLatestPrice(data.stock);
    } catch (err) {
      setError('Failed to fetch price: ' + err.message);
    }
    setLoading(false);
  };

  const fetchHistory = async (ticker) => {
    setLoading(true);
    setError('');
    setHistory([]);
    try {
      const res = await fetch(`${API_BASE}/${ticker}?minutes=50`, {
        headers: { Authorization: AUTH_HEADER },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch history: ' + err.message);
    }
    setLoading(false);
  };

  const handleSelect = (e) => {
    const ticker = e.target.value;
    setSelectedTicker(ticker);
    if (ticker) {
      fetchLatestPrice(ticker);
      fetchHistory(ticker);
    } else {
      setLatestPrice(null);
      setHistory([]);
    }
  };

  return (
    <div className="container">
      <h1>Stock Price Aggregator</h1>
      {error && <p className="error">{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="stock-select">Select a stock: </label>
        <select id="stock-select" value={selectedTicker} onChange={handleSelect}>
          <option value="">-- Choose a stock --</option>
          {Object.entries(stocks).map(([name, ticker]) => (
            <option key={ticker} value={ticker}>{name} ({ticker})</option>
          ))}
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {latestPrice && (
        <div className="chart-section">
          <h2>Latest Price</h2>
          <p>Price: <b>${latestPrice.price}</b></p>
          <p>Last Updated: {latestPrice.lastUpdatedAt}</p>
        </div>
      )}
      {history.length > 0 && (
        <div className="chart-section">
          <h2>Price History (Last 50 min)</h2>
          <ul className="price-list">
            {history.map((h, i) => (
              <li key={i}>${h.price} at {h.lastUpdatedAt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
