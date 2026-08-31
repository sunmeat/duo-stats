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
    const dataUrl = await toPng(cardRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    });
    const link = document.createElement("a");
    link.download = `duolingo-${username}.png`;
    link.href = dataUrl;
    link.click();
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
