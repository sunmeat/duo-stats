import { forwardRef } from "react";
import CourseList from "./CourseList.jsx";

const COUNTRY_BY_LANG_CODE = {
    en: "gb", es: "es", fr: "fr", de: "de", it: "it", pt: "pt",
    ja: "jp", jp: "jp", ko: "kr", zs: "cn", zc: "cn", zh: "cn",
    ru: "ru", uk: "ua", pl: "pl", nl: "nl", dn: "nl", sv: "se",
    tr: "tr", ar: "sa", hi: "in", el: "gr", he: "il", id: "id",
    vi: "vn", ro: "ro", hu: "hu", cs: "cz", da: "dk", nb: "no",
    no: "no", fi: "fi", tl: "ph", sw: "ke", zu: "za", ht: "ht",
    ga: "ie", ka: "ge", gn: "py",
};

const COUNTRY_BY_LANG_NAME = {
    english: "gb", spanish: "es", french: "fr", german: "de",
    italian: "it", portuguese: "pt", japanese: "jp", korean: "kr",
    chinese: "cn", russian: "ru", ukrainian: "ua", polish: "pl",
    dutch: "nl", swedish: "se", turkish: "tr", arabic: "sa",
    hindi: "in", greek: "gr", hebrew: "il", indonesian: "id",
    vietnamese: "vn", romanian: "ro", hungarian: "hu", czech: "cz",
    danish: "dk", norwegian: "no", finnish: "fi", swahili: "ke",
    irish: "ie", georgian: "ge", haitian: "ht", tagalog: "ph",
    zulu: "za",
};

const ICON_BY_LANG_CODE = {
    eo: "⭐", la: "🏛️", tlh: "🖖", hv: "🐉", nv: "🏜️", hw: "🌺",
    cy: "🏴", gd: "🏴", yi: "🕎",
};

const SUBJECT_ICONS = [
    { match: /math/i, icon: "🧮" },
    { match: /chess|шахмат/i, icon: "♟️" },
    { match: /music|музык/i, icon: "🎵" },
];

function flagFor(lang, title) {
    const subject = SUBJECT_ICONS.find((s) => s.match.test(title || ""));
    if (subject) return subject.icon;

    const code = lang?.toLowerCase();
    if (code && ICON_BY_LANG_CODE[code]) return ICON_BY_LANG_CODE[code];

    const country =
        (code && COUNTRY_BY_LANG_CODE[code]) ||
        Object.entries(COUNTRY_BY_LANG_NAME).find(([name]) =>
            title?.toLowerCase().includes(name)
        )?.[1];

    if (country) {
        return (
            <img
                className="course__flag-img"
                src={`https://flagcdn.com/24x18/${country}.png`}
                alt=""
                crossOrigin="anonymous"
                width={24}
                height={18}
                onError={(e) => {
                    e.currentTarget.replaceWith(document.createTextNode("📘"));
                }}
            />
        );
    }

    return "📘";
}

const ProfileCard = forwardRef(function ProfileCard({ user }, ref) {
    const profileUrl = `https://www.duolingo.com/profile/${user.username}`;

    return (
        <div className="card" ref={ref}>
            <div className="card__header">
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                >
                    <img
                        className="card__avatar"
                        src={user.avatar || fallbackAvatar}
                        alt={`Аватар ${user.username}`}
                        onError={(e) => {
                            e.currentTarget.src = fallbackAvatarDataUri;
                        }}
                    />
                    <div className="card__id">
                        <h1>{user.name}</h1>
                        <p className="card__username">@{user.username}</p>
                        {user.hasPlus && <span className="badge badge--plus">Super</span>}
                    </div>
                </a>
            </div>

            <div className="stat-grid">
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stat stat--streak stat--clickable"
                >
                    <span className="stat__label">Страйк</span>
                    <span className="stat__value">{user.streak} 🔥</span>
                </a>

                {user.longestStreak != null && (
                    <Stat label="Лучший страйк" value={`${user.longestStreak} 🔥`} />
                )}
            </div>

            <CourseList courses={user.courses} flagFor={flagFor} />

            {user.joined && (
                <p className="card__footer">
                    На Duolingo с {user.joined.toLocaleDateString("ru-RU")}
                </p>
            )}
        </div>
    );
});

function Stat({ label, value, muted }) {
    return (
        <div className={`stat ${muted ? "stat--muted" : ""}`}>
            <span className="stat__label">{label}</span>
            <span className="stat__value">{value}</span>
        </div>
    );
}

const fallbackAvatarDataUri =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' rx='48' fill='%2358cc02'/%3E%3Ctext x='48' y='60' font-size='40' text-anchor='middle' fill='white'%3E%F0%9F%A6%89%3C/text%3E%3C/svg%3E";
const fallbackAvatar = fallbackAvatarDataUri;

export default ProfileCard;