export default async function handler(req, res) {
  const username = req.query.u || req.query.username || "taemnus";

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  try {
    const duoRes = await fetch(
      `https://www.duolingo.com/2017-06-30/users?username=${username}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!duoRes.ok) {
      return res.status(404).send(getErrorSvg("User not found"));
    }

    const duoData = await duoRes.json();
    const user = duoData?.users?.[0];

    if (!user) {
      return res.status(404).send(getErrorSvg("User not found"));
    }

    const name = escapeXml(user.name || user.username);
    const cleanUsername = escapeXml(user.username);
    const streak = Math.max(
      user.streak ?? 0,
      user.streakData?.currentStreak?.length ?? 0
    );

    // 1. Формирование корректной ссылки на аватар и конвертация в Base64
    let avatarBase64 = "";
    let rawPicture = user.picture || user.avatarUrl || "";

    if (rawPicture) {
      if (rawPicture.startsWith("//")) {
        rawPicture = `https:${rawPicture}`;
      } else if (!rawPicture.startsWith("http")) {
        rawPicture = `https://${rawPicture}`;
      }
      // Добавляем размер /medium или /large, если это CDN Duolingo
      avatarBase64 = await fetchAsBase64(rawPicture);
    }

    // 2. Дата регистрации
    let creationDateStr = "";
    if (user.creationDate) {
      const date = new Date(user.creationDate * 1000);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      creationDateStr = `${day}.${month}.${year}`;
    }

    // 3. Топ курсов и флаги
    const courses = (user.courses || [])
      .map((c) => ({
        title: c.title,
        xp: c.xp || 0,
        lang: c.learningLanguage || "",
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);

    const maxXp = courses[0]?.xp || 1;

    const coursesWithFlags = await Promise.all(
      courses.map(async (c) => {
        const countryCode = getCountryCode(c.lang);
        const flagBase64 = await fetchAsBase64(
          `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${countryCode}.svg`
        );
        return { ...c, flagBase64 };
      })
    );

    const coursesSvg = coursesWithFlags
      .map((c, index) => {
        const y = index * 44;
        const progressWidth = Math.max(12, Math.round((c.xp / maxXp) * 160));
        const formattedXp = c.xp.toLocaleString("en-US") + " XP";

        return `
        <g transform="translate(0, ${y})">
          <rect width="280" height="38" rx="12" fill="#202f36" />
          
          <g transform="translate(10, 9)">
            <clipPath id="flag-clip-${index}">
              <rect width="24" height="20" rx="4" />
            </clipPath>
            ${
              c.flagBase64
                ? `<image href="${c.flagBase64}" width="24" height="20" clip-path="url(#flag-clip-${index})" preserveAspectRatio="xMidYMid slice" />`
                : `<rect width="24" height="20" rx="4" fill="#37464f" />`
            }
          </g>

          <text x="42" y="22" class="lang-title">${escapeXml(c.title)}</text>
          <text x="268" y="22" text-anchor="end" class="lang-xp">${formattedXp}</text>
          
          <rect x="42" y="28" width="226" height="5" rx="2.5" fill="#131f24" />
          <rect x="42" y="28" width="${progressWidth}" height="5" rx="2.5" fill="#ffc800" />
        </g>
      `;
      })
      .join("");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="280" viewBox="0 0 600 280" fill="none">
        <style>
          .bg { fill: #131f24; rx: 20px; }
          .border { stroke: #202f36; stroke-width: 2px; }
          .name { font: bold 22px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .username { font: bold 14px 'Segoe UI', Ubuntu, sans-serif; fill: #52656d; }
          .streak-card { fill: #202f36; stroke: #ff9600; stroke-width: 2px; rx: 14px; }
          .streak-label { font: bold 11px 'Segoe UI', Ubuntu, sans-serif; fill: #ff9600; letter-spacing: 1px; text-transform: uppercase; }
          .streak-val { font: bold 26px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .section-title { font: bold 16px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .lang-title { font: bold 13px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .lang-xp { font: bold 12px 'Segoe UI', Ubuntu, sans-serif; fill: #8496a0; }
          .footer-text { font: bold 12px 'Segoe UI', Ubuntu, sans-serif; fill: #52656d; }
        </style>

        <rect width="600" height="280" class="bg border" />

        <!-- ЛЕВАЯ КОЛОНКА -->
        <g transform="translate(30, 25)">
          <!-- Аватар -->
          <g transform="translate(72, 0)">
            <circle cx="38" cy="38" r="41" fill="#58cc02" />
            <clipPath id="avatar-clip">
              <circle cx="38" cy="38" r="38" />
            </clipPath>
            ${
              avatarBase64
                ? `<image href="${avatarBase64}" x="0" y="0" height="76" width="76" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice" />`
                : `<circle cx="38" cy="38" r="38" fill="#37464f" /><text x="38" y="48" font-size="30" text-anchor="middle" fill="white">🦉</text>`
            }
          </g>

          <text x="110" y="102" text-anchor="middle" class="name">${name}</text>
          <text x="110" y="122" text-anchor="middle" class="username">@${cleanUsername}</text>

          <g transform="translate(0, 136)">
            <rect width="220" height="62" class="streak-card" />
            <text x="110" y="22" text-anchor="middle" class="streak-label">STREAK</text>
            <text x="110" y="49" text-anchor="middle" class="streak-val">${streak} 🔥</text>
          </g>

          ${
            creationDateStr
              ? `<text x="110" y="228" text-anchor="middle" class="footer-text">Joined Duolingo ${creationDateStr}</text>`
              : ""
          }
        </g>

        <line x1="280" y1="30" x2="280" y2="250" stroke="#202f36" stroke-width="2" stroke-dasharray="4 4" />

        <!-- ПРАВАЯ КОЛОНКА -->
        <g transform="translate(300, 25)">
          <text x="0" y="15" class="section-title">Top Courses (${courses.length})</text>
          <g transform="translate(0, 28)">
            ${coursesSvg}
          </g>
        </g>
      </svg>
    `;

    return res.status(200).send(svg);
  } catch (err) {
    return res.status(500).send(getErrorSvg("Server Error"));
  }
}

// Загрузка изображений с заголовками и преобразование в Data URI
async function fetchAsBase64(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return "";
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return "";
  }
}

function getCountryCode(lang) {
  const map = {
    en: "gb",
    fr: "fr",
    ar: "sa",
    es: "es",
    cs: "cz",
    de: "de",
    it: "it",
    uk: "ua",
    ru: "ru",
    ja: "jp",
    zh: "cn",
    ko: "kr",
    pt: "pt",
  };
  return map[lang] || lang;
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
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="280" viewBox="0 0 600 280" fill="none">
      <rect width="600" height="280" rx="20" fill="#131f24" stroke="#ea2b2b" stroke-width="2"/>
      <text x="300" y="145" font-size="18" fill="#ff4b4b" font-family="sans-serif" text-anchor="middle">${msg}</text>
    </svg>
  `;
}
