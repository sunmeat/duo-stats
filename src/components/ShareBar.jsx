import { useState } from "react";
import html2canvas from "html2canvas";

export default function ShareBar({ cardRef, username }) {
  const [copied, setCopied] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);

  async function copyLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("u", username);
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadImage() {
    if (!cardRef.current || loadingImg) return;

    try {
      setLoadingImg(true);

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#202f36",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.querySelector(".card");
          if (clonedCard) {
            clonedCard.style.transform = "none";
          }
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `duolingo-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Ошибка сохранения картинки:", err);
      alert("Не удалось сохранить картинку. Попробуйте ещё раз.");
    } finally {
      setLoadingImg(false);
    }
  }

  return (
      <div className="share-bar">
        <button type="button" onClick={copyLink}>
          {copied ? "Ссылка скопирована ✓" : "🔗 Скопировать ссылку"}
        </button>
        <button type="button" onClick={downloadImage} disabled={loadingImg}>
          {loadingImg ? "Сохраняем…" : "🖼️ Сохранить как картинку"}
        </button>
      </div>
  );
}