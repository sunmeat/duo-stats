// Обёртка над неофициальным публичным API Duolingo.
//
// Эндпоинт https://www.duolingo.com/2017-06-30/users?username=... отдаёт
// публичный профиль без авторизации: имя, ник, аватар, страйк, список
// курсов с их XP и языком.
//
// Лига и алмазы/рубины публично не отдаются вообще (только по своему
// аккаунту с личным JWT-токеном) — эти поля из приложения убраны.
// Короны (crowns) Duolingo тоже больше не отдаёт честно: система корон
// заменена на другую механику, и поле возвращает один и тот же
// заглушечный номер (9999) для всех курсов — поэтому короны тоже убраны
// из вывода, показывать их бессмысленно.

// Внимание: если в fields запросить поле/подполе, которого у Duolingo
// больше нет (такое случалось со streakData{...} и healthbar), API не
// вернёт ошибку — он тихо отдаст users: [], что выглядит как "юзер не
// найден", хотя дело в самом запросе. Поэтому держим список полей
// по возможности простым и всегда есть план Б без fields вообще.
//
// Курсы (courses) запрашиваем БЕЗ ограничения по подполям — у Duolingo
// это не только языки, но и math/chess/music, и у каждого курса разный
// набор доступных полей. Ограничивать подполя рискованно, поэтому берём
// объект курса целиком и уже сами выбираем, что показывать.
const FIELDS =
    "username,name,streak,totalXp,picture,currentCourseId,creationDate," +
    "hasPlus,courses";

export async function fetchDuolingoUser(username) {
  const clean = username.trim();
  if (!clean) throw new Error("Введите никнейм");

  // Попытка №1: с ограниченным набором полей (быстрее и легче).
  let user = await tryFetch(clean, FIELDS);

  // Попытка №2: без fields вообще — Duolingo отдаёт полный профиль.
  // Спасает, если попытка №1 сломалась из-за несуществующего поля.
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

  // Отладочный вывод: если каких-то курсов не хватает (например, math/
  // chess/music), откройте консоль браузера (F12) и посмотрите, что
  // реально прислал Duolingo в raw.courses — так сразу видно, есть ли
  // курс в сырых данных под другим именем/языком, или его правда нет
  // в публичном ответе.
  console.debug("[duolingo] raw courses:", raw.courses);

  const courses = (raw.courses ?? [])
      .map((c, i) => ({
        // id — самое надёжное поле для React-ключа: у Duolingo он у каждого
        // курса свой (даже если название и язык совпадают, например при
        // повторном прохождении курса).
        id: c.id || `${c.learningLanguage || "?"}-${c.title || "?"}-${i}`,
        title: c.title,
        language: c.learningLanguage,
        xp: c.xp ?? 0,
      }))
      .sort((a, b) => b.xp - a.xp);

  // Поле totalXp у Duolingo нередко отражает опыт только по "текущему"
  // языку, а не по всему аккаунту (это давняя особенность их API).
  // Поэтому суммарный опыт считаем сами — как сумму по всем курсам,
  // это совпадает с тем, что показано ниже в разбивке по языкам.
  const coursesXpSum = courses.reduce((sum, c) => sum + c.xp, 0);
  const totalXp = Math.max(raw.totalXp ?? 0, coursesXpSum);

  return {
    username: raw.username,
    name: raw.name || raw.username,
    avatar,
    streak,
    longestStreak,
    totalXp,
    hasPlus: !!raw.hasPlus,
    joined: raw.creationDate ? new Date(raw.creationDate) : null,
    courses,
  };
}