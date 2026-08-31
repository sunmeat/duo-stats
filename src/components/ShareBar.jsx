import { useState } from "react";
import { toPng } from "html-to-image";

export default function ShareBar({ cardRef, username }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("u", username);
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadImage() {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
        // если картинка не загрузится из-за CORS — подставится заглушка
        imagePlaceholder:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='36' fill='%2358cc02'/%3E%3Ctext x='36' y='46' font-size='32' text-anchor='middle' fill='white'%3E🦉%3C/text%3E%3C/svg%3E",
      });

      const link = document.createElement("a");
      link.download = `duolingo-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Ошибка сохранения картинки:", err);
      alert("Не удалось сохранить картинку. Попробуйте ещё раз.");
    }
  }

  return (
    <div className="share-bar">
      <button type="button" onClick={copyLink}>
        {copied ? "Ссылка скопирована ✓" : "🔗 Скопировать ссылку"}
      </button>
      <button type="button" onClick={downloadImage}>
        🖼️ Сохранить как картинку
      </button>
    </div>
  );
}
