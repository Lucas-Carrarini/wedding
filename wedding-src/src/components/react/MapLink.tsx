import { useState, useEffect } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function MapLink({ href, children, className }: Props) {
  const [mapUrl, setMapUrl] = useState(href);

  useEffect(() => {
    // Detectar se é iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Para iOS, usar Apple Maps ou Google Maps com formato compatível
      const query = encodeURIComponent("Vale dos Sonhos Estr. da Batalha, 52 - Campo Grande, Rio de Janeiro - RJ, 23017-390");
      
      // Tentar abrir com Apple Maps primeiro, fallback para Google Maps
      const appleMapsUrl = `maps://?q=${query}`;
      const googleMapsUrl = `https://maps.google.com/?q=${query}`;
      
      // Usar Google Maps com formato mais simples para iOS
      setMapUrl(googleMapsUrl);
    } else {
      // Para outros dispositivos, manter a URL original
      setMapUrl(href);
    }
  }, [href]);

  return (
    <a
      href={mapUrl}
      className={className}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
