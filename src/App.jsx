import { useEffect, useRef, useState } from "react";
import SearchBar from "./components/SearchBar.jsx";
import ProfileCard from "./components/ProfileCard.jsx";
import ShareBar from "./components/ShareBar.jsx";
import { fetchDuolingoUser } from "./api/duolingo.js";

const DEFAULT_USERNAME = "taemnus";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const initialUsername = params.get("u") || DEFAULT_USERNAME;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  async function load(username) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDuolingoUser(username);
      setUser(data);

      const url = new URL(window.location.href);
      url.searchParams.set("u", username);
      window.history.replaceState({}, "", url);
    } catch (err) {
      setError(err.message || "Не удалось загрузить профиль");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(initialUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h1>🦉 Duolingo Stats</h1>
        <p>Полная статистика профиля Duolingo по никнейму</p>
      </header>

      <SearchBar initialValue={initialUsername} onSearch={load} loading={loading} />

      {error && <p className="error">⚠️ {error}</p>}

      {loading && !user && <p className="loading">Загружаем профиль…</p>}

      {user && (
        <>
          <ProfileCard user={user} ref={cardRef} />
          <ShareBar cardRef={cardRef} username={user.username} />
        </>
      )}

      <footer className="app__footer">
        Данные берутся из публичного (неофициального) API Duolingo. Лига и
        количество алмазов/рубин не отдаются без личного токена — подробности
        в README.md.
      </footer>
    </div>
  );
}
