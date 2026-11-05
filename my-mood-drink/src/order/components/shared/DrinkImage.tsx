import { useState } from "react";
import { localMenuPhoto } from "../../utils/menu";

export function DrinkImage({ src, name, className = "", eager = false }: {
  src?: string;
  name: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const imageUrl = [src, localMenuPhoto(name)].find((url) => url && !failed.includes(url));

  return (
    <span className={`drink-photo ${className}`}>
      {imageUrl ? (
        <>
          {loaded !== imageUrl && <span className="drink-photo-loading" aria-hidden="true" />}
          <img key={imageUrl} src={imageUrl} alt={name} loading={eager ? "eager" : "lazy"}
            decoding="async" onLoad={() => setLoaded(imageUrl)}
            onError={() => setFailed((previous) => [...previous, imageUrl])} />
        </>
      ) : <span className="drink-photo-empty" role="img" aria-label={`ยังไม่มีรูป ${name}`}>ยังไม่มีรูป</span>}
    </span>
  );
}
