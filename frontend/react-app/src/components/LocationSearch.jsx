import { useState, useRef } from "react";
import { Form, ListGroup, Spinner } from "react-bootstrap";

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) return setSuggestions([]);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    onSelect({ lat: parseFloat(place.lat).toFixed(5), lon: parseFloat(place.lon).toFixed(5), display_name: place.display_name });
  };

  return (
    <div style={{ position: "relative" }}>
      <Form.Label>🔍 Search Location</Form.Label>
      <div className="d-flex align-items-center gap-2">
        <Form.Control
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search city or address... e.g. Mumbai"
        />
        {searching && <Spinner animation="border" size="sm" />}
      </div>
      {suggestions.length > 0 && (
        <ListGroup style={{ position: "absolute", zIndex: 1000, width: "100%", maxHeight: 220, overflowY: "auto" }}>
          {suggestions.map((place) => (
            <ListGroup.Item
              key={place.place_id}
              action
              onClick={() => handleSelect(place)}
              style={{ fontSize: 13, cursor: "pointer" }}
            >
              📍 {place.display_name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
