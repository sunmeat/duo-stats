export default async function handler(req, res) {
  const username = req.query.u || req.query.username || "taemnus";

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  try {
    const duoRes = await fetch(
      `https://www.duolingo.com/2017-06-30/users?username=${username}`
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

    // Загружаем аватар и конвертируем в Base64 для GitHub
    let avatarBase64 = "";
    if (user.picture) {
      const picUrl = user.picture.startsWith("http")
        ? user.picture
        : `https:${user.picture}`;
      try {
        const imgRes = await fetch(picUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get("content-type") || "image/png";
          avatarBase64 = `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
        }
      } catch (e) {
        // Игнорируем ошибку загрузки аватара
      }
    }

    // Дата регистрации
    let creationDateStr = "";
    if (user.creationDate) {
      const date = new Date(user.creationDate * 1000);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      creationDateStr = `${day}.${month}.${year}`;
    }

    // Курсы и иконки языков
    const courses = (user.courses || [])
      .map((c) => ({
        title: c.title,
        xp: c.xp || 0,
        lang: c.learningLanguage || "",
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);

    const maxXp = courses[0]?.xp || 1;

    // Загружаем флаговые иконки курсов в Base64
    const coursesSvgPromises = courses.map(async (c, index) => {
      const y = index * 42;
      const progressWidth = Math.max(10, Math.round((c.xp / maxXp) * 165));
      const formattedXp = c.xp.toLocaleString("en-US") + " XP";

      let flagBase64 = "";
      if (c.lang) {
        try {
          const flagUrl = `https://s2.duolingo.com/images/flag-sprites-svg.svg#${c.lang}`;
          // Альтернативный надежный CDN флаг:
          const cdnFlagUrl = `https://d3gq3s1iyyx31w.cloudfront.net/images/flag-sprites-svg.svg#${c.lang}`;
          flagBase64 = `https://s2.duolingo.com/images/flag-sprites-svg.svg#${c.lang}`;
        } catch (e) {}
      }

      return `
        <g transform="translate(0, ${y})">
          <rect width="280" height="36" rx="10" fill="#202f36" />
          
          <!-- Флаг / Иконка языка -->
          <g transform="translate(10, 8)">
            <svg width="24" height="20" viewBox="0 0 24 20">
              <image href="https://s2.duolingo.com/images/flag-sprites-svg.svg#${c.lang}" width="24" height="20" />
            </svg>
          </g>

          <!-- Название языка -->
          <text x="40" y="21" class="lang-title">${escapeXml(c.title)}</text>
          
          <!-- Значение XP -->
          <text x="266" y="21" text-anchor="end" class="lang-xp">${formattedXp}</text>
          
          <!-- Трек и Прогресс -->
          <rect x="40" y="27" width="226" height="4" rx="2" fill="#131f24" />
          <rect x="40" y="27" width="${progressWidth}" height="4" rx="2" fill="#ffc800" />
        </g>
      `;
    });

    const coursesSvg = (await Promise.all(coursesSvgPromises)).join("");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="280" viewBox="0 0 600 280" fill="none">
        <style>
          .bg { fill: #131f24; rx: 20px; }
          .border { stroke: #202f36; stroke-width: 2px; }
          .name { font: bold 22px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .username { font: 14px 'Segoe UI', Ubuntu, sans-serif; fill: #52656d; }
          .streak-label { font: bold 11px 'Segoe UI', Ubuntu, sans-serif; fill: #8496a0; letter-spacing: 1px; text-transform: uppercase; }
          .streak-val { font: bold 26px 'Segoe UI', Ubuntu, sans-serif; fill: #ff9600; }
          .section-title { font: bold 16px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .lang-title { font: bold 13px 'Segoe UI', Ubuntu, sans-serif; fill: #ffffff; }
          .lang-xp { font: bold 12px 'Segoe UI', Ubuntu, sans-serif; fill: #8496a0; }
          .footer-text { font: 12px 'Segoe UI', Ubuntu, sans-serif; fill: #52656d; }
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

          <g transform="translate(0, 138)">
            <rect width="220" height="60" rx="14" fill="#202f36" stroke="#ff9600" stroke-width="2" />
            <text x="110" y="22" text-anchor="middle" class="streak-label">STREAK</text>
            <text x="110" y="48" text-anchor="middle" class="streak-val">${streak} 🔥</text>
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
          <g transform="translate(0, 30)">
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
