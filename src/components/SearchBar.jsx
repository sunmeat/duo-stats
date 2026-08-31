import { useState } from "react";

export default function SearchBar({ initialValue, onSearch, loading }) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <span className="search-bar__at">@</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="никнейм в Duolingo"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Ищем…" : "Показать"}
      </button>
    </form>
  );
}
