export default async function handler(req, res) {
  const { username = "taemnus" } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  try {
    const duoRes = await fetch(
      `https://www.duolingo.com/2017-06-30/users?username=${username}`
    );

    if (!duoRes.ok) {
      return res.status(404).send(getErrorSvg("Пользователь не найден"));
    }

    const duoData = await duoRes.json();
    const user = duoData?.users?.[0];

    if (!user) {
      return res.status(404).send(getErrorSvg("Пользователь не найден"));
    }

    const name = escapeXml(user.name || user.username);
    const cleanUsername = escapeXml(username);
    const streak = Math.max(
      user.streak ?? 0,
      user.streakData?.currentStreak?.length ?? 0
    );
    const xp = user.totalXp ?? 0;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="170" viewBox="0 0 500 170" fill="none">
        <style>
          .bg { fill: #202f36; rx: 16px; }
          .title { font: bold 18px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .subtitle { font: 14px 'Segoe UI', Ubuntu, sans-serif; fill: #afbbcf; }
          .stat-label { font: 12px 'Segoe UI', Ubuntu, sans-serif; fill: #8899a6; text-transform: uppercase; }
          .stat-value { font: bold 22px 'Segoe UI', Ubuntu, sans-serif; fill: #58cc02; }
          .border { stroke: #37464f; stroke-width: 2px; }
        </style>

        <rect width="500" height="170" class="bg border" />

        <g transform="translate(25, 25)">
          <circle cx="35" cy="35" r="35" fill="#58cc02" />
          <text x="35" y="47" font-size="38" text-anchor="middle" fill="white">🦉</text>
        </g>

        <g transform="translate(110, 45)">
          <text class="title" x="0" y="0">${name}</text>
          <text class="subtitle" x="0" y="22">@${cleanUsername}</text>
        </g>

        <g transform="translate(25, 115)">
          <rect width="215" height="40" rx="8" fill="#131f24" />
          <text class="stat-label" x="15" y="25">Страйк</text>
          <text class="stat-value" x="195" y="27" text-anchor="end">${streak} 🔥</text>
        </g>

        <g transform="translate(260, 115)">
          <rect width="215" height="40" rx="8" fill="#131f24" />
          <text class="stat-label" x="15" y="25">Общий XP</text>
          <text class="stat-value" x="195" y="27" text-anchor="end">${xp} ⚡</text>
        </g>
      </svg>
    `;

    return res.status(200).send(svg);
  } catch (err) {
    return res.status(500).send(getErrorSvg("Ошибка сервера"));
  }
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getErrorSvg(msg) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="170" viewBox="0 0 500 170" fill="none">
      <rect width="500" height="170" rx="16" fill="#202f36" stroke="#ea2b2b" stroke-width="2"/>
      <text x="250" y="90" font-size="18" fill="#ff4b4b" font-family="sans-serif" text-anchor="middle">${msg}</text>
    </svg>
  `;
}
