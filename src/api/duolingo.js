const FIELDS =
    "username,name,streak,totalXp,picture,currentCourseId,creationDate," +
    "hasPlus,courses";

export async function fetchDuolingoUser(username) {
  const clean = username.trim();
  if (!clean) throw new Error("Введите никнейм");

  let user = await tryFetch(clean, FIELDS);

  if (!user) {
    user = await tryFetch(clean, null);
  }

  if (!user) {
    throw new Error(
        `Пользователь "${clean}" не найден (или у него скрыт публичный профиль)`
    );
  }

  return normalizeUser(user);
}

async function tryFetch(username, fields) {
  const params = new URLSearchParams({ username });
  if (fields) params.set("fields", fields);

  const res = await fetch(`/duoapi/2017-06-30/users?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Duolingo API ответил ошибкой: ${res.status}`);
  }

  const data = await res.json();
  return data?.users?.[0] || null;
}

function normalizeUser(raw) {
  const avatar = raw.picture
      ? `https:${raw.picture}`.replace(/\/$/, "") + "/xxlarge"
      : null;

  const streak = Math.max(
      raw.streak ?? 0,
      raw.streakData?.currentStreak?.length ?? 0
  );

  const longestStreak = raw.streakData?.longestStreak?.length ?? null;

  console.debug("[duolingo] raw courses:", raw.courses);

  // Сначала все курсы
  const allCourses = (raw.courses ?? [])
      .map((c, i) => ({
        id: c.id || `${c.learningLanguage || "?"}-${c.title || "?"}-${i}`,
        title: c.title,
        language: c.learningLanguage,
        xp: c.xp ?? 0,
      }))
      .sort((a, b) => b.xp - a.xp);

  const coursesXpSum = allCourses.reduce((sum, c) => sum + c.xp, 0);
  const totalXp = Math.max(raw.totalXp ?? 0, coursesXpSum);

  const courses = allCourses.slice(0, 5);

  const joined = raw.creationDate
      ? new Date(
          raw.creationDate < 1e12
              ? raw.creationDate * 1000
              : raw.creationDate
      )
      : null;

  return {
    username: raw.username,
    name: raw.name || raw.username,
    avatar,
    streak,
    longestStreak,
    totalXp,
    hasPlus: !!raw.hasPlus,
    joined,
    courses,
  };
}