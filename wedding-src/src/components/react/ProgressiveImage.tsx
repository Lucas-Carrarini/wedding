import { useEffect, useState, type ImgHTMLAttributes } from 'react';

interface SourceDef {
  srcset: string;
  media: string;
}

interface ProgressiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Caminho da imagem em alta/boa qualidade (carregada em background). */
  src: string;
  /** Caminho da imagem leve/placeholder exibida imediatamente. */
  previewSrc?: string;
  /** Sources responsivos para a tag <picture>. */
  sources?: SourceDef[];
  /** Classe aplicada ao wrapper. */
  wrapperClassName?: string;
  /** Classe aplicada à imagem final. */
  className?: string;
  /** Classe aplicada ao placeholder enquanto a principal carrega. */
  previewClassName?: string;
}

export default function ProgressiveImage({
  src,
  previewSrc,
  sources,
  wrapperClassName = '',
  className = '',
  previewClassName = '',
  alt = '',
  ...imgProps
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasPreview, setHasPreview] = useState(!!previewSrc && previewSrc !== src);

  useEffect(() => {
    const willPreview = !!previewSrc && previewSrc !== src;
    setHasPreview(willPreview);
    setLoaded(!willPreview);

    if (!willPreview) return;

    // Escolhe a URL de alta qualidade ativa com base nos sources responsivos.
    let targetSrc = src;
    if (sources && sources.length > 0 && typeof window !== 'undefined') {
      const match = sources
        .slice()
        .reverse()
        .find((s) => window.matchMedia(s.media).matches);
      if (match) targetSrc = match.srcset;
    }

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
    img.src = targetSrc;
  }, [src, previewSrc, sources]);

  const image = (
    <>
      {hasPreview && (
        <img
          {...imgProps}
          src={previewSrc}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover object-center blur-md scale-105 ${previewClassName}`}
        />
      )}
      <img
        {...imgProps}
        src={src}
        alt={alt}
        className={`relative h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${className}`}
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </>
  );

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`} aria-hidden={imgProps['aria-hidden']}>
      {sources && sources.length > 0 ? (
        <picture className="contents">
          {sources.map((s, i) => (
            <source key={i} srcSet={s.srcset} media={s.media} />
          ))}
          {image}
        </picture>
      ) : (
        image
      )}
    </div>
  );
}
