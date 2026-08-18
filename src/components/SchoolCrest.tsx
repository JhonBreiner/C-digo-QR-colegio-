import React, { useState, useEffect } from 'react';

interface SchoolCrestProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showGlow?: boolean;
}

const CUSTOM_CREST_KEY = 'IET_CALDAS_CUSTOM_CREST_URI';

export function getCustomCrestUri(): string | null {
  try {
    return localStorage.getItem(CUSTOM_CREST_KEY);
  } catch {
    return null;
  }
}

export function saveCustomCrestUri(dataUri: string) {
  try {
    localStorage.setItem(CUSTOM_CREST_KEY, dataUri);
  } catch (err) {
    console.error("Error saving custom crest:", err);
  }
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({ 
  className = "w-12 h-12", 
  size = 48,
  showText = false,
  showGlow = true,
}) => {
  const [customCrest, setCustomCrest] = useState<string | null>(getCustomCrestUri());

  useEffect(() => {
    const handleStorage = () => {
      setCustomCrest(getCustomCrestUri());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        saveCustomCrestUri(res);
        setCustomCrest(res);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {customCrest ? (
        <div className="relative group cursor-pointer" title="Escudo Institucional Personalizado (Haz clic para cambiar)">
          <img 
            src={customCrest} 
            alt="Escudo Institucional" 
            style={{ width: size, height: size }} 
            className={`object-contain ${showGlow ? 'drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]' : ''}`}
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 opacity-0 cursor-pointer text-[0px]"
          />
        </div>
      ) : (
        <div className="relative group cursor-pointer" title="Escudo Oficial I.E.T. Francisco José de Caldas (Haz clic para subir imagen)">
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 240 240" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]' : ''}`}
          >
            {/* Outer Red Triangle Frame */}
            <polygon points="120,8 232,212 8,212" fill="#d00000" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />

            {/* Inner Split Shield */}
            {/* Inner Green Left Half */}
            <polygon points="120,40 120,188 38,188" fill="#008822" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />

            {/* Inner White Right Half */}
            <polygon points="120,40 202,188 120,188" fill="#ffffff" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />

            {/* Open Book on Left Green Side */}
            <g transform="translate(50, 132)">
              <path d="M 5,28 Q 20,23 35,28 L 35,48 Q 20,43 5,48 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5"/>
              <path d="M 35,28 Q 50,23 65,28 L 65,48 Q 50,43 35,48 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5"/>
              <line x1="9" y1="34" x2="31" y2="34" stroke="#333333" strokeWidth="1"/>
              <line x1="9" y1="39" x2="31" y2="39" stroke="#333333" strokeWidth="1"/>
              <line x1="39" y1="34" x2="61" y2="34" stroke="#333333" strokeWidth="1"/>
              <line x1="39" y1="39" x2="61" y2="39" stroke="#333333" strokeWidth="1"/>
            </g>

            {/* Inkwell and Feather Pen on Right White Side */}
            <g transform="translate(130, 108)">
              <path d="M 12,50 L 28,50 L 32,60 Q 32,65 20,65 Q 8,65 8,60 Z" fill="#008822" stroke="#000000" strokeWidth="1.5"/>
              <path d="M 20,52 Q 35,25 45,5 Q 30,22 18,38 Z" fill="#e2e8f0" stroke="#000000" strokeWidth="1.5"/>
              <line x1="20" y1="52" x2="43" y2="7" stroke="#333333" strokeWidth="1.5"/>
            </g>

            {/* Text on Red Triangular Border */}
            {/* Left Side Text: INSTITUCION EDUCATIVA TECNICA */}
            <g transform="translate(68, 118) rotate(-60)">
              <text x="0" y="0" fill="#ffffff" fontSize="8.5" fontFamily="Arial, sans-serif" fontWeight="900" letterSpacing="0.4" textAnchor="middle">INSTITUCION EDUCATIVA TECNICA</text>
            </g>

            {/* Right Side Text: FRANCISCO JOSE DE CALDAS */}
            <g transform="translate(172, 118) rotate(60)">
              <text x="0" y="0" fill="#ffffff" fontSize="8.5" fontFamily="Arial, sans-serif" fontWeight="900" letterSpacing="0.4" textAnchor="middle">FRANCISCO JOSE DE CALDAS</text>
            </g>

            {/* Bottom Text: NATAGAIMA - TOLIMA */}
            <text x="120" y="204" fill="#ffffff" fontSize="10.5" fontFamily="Arial, sans-serif" fontWeight="900" letterSpacing="0.8" textAnchor="middle">NATAGAIMA - TOLIMA</text>
          </svg>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 opacity-0 cursor-pointer text-[0px]"
            title="Subir Escudo Institucional"
          />
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className="font-orbitron font-extrabold text-xs text-slate-100 tracking-wider">
            I.E.T. FRANCISCO JOSÉ DE CALDAS
          </span>
          <span className="text-[10px] font-mono text-[#00F0FF] font-bold">
            NATAGAIMA • TOLIMA
          </span>
        </div>
      )}
    </div>
  );
};

// Helper function to return SVG data URI for DOM/HTML elements
export function getSchoolCrestDataUri(): string {
  const custom = getCustomCrestUri();
  if (custom) return custom;

  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" fill="none">
    <polygon points="120,8 232,212 8,212" fill="#d00000" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="120,40 120,188 38,188" fill="#008822" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="120,40 202,188 120,188" fill="#ffffff" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
    <g transform="translate(50, 132)">
      <path d="M 5,28 Q 20,23 35,28 L 35,48 Q 20,43 5,48 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
      <path d="M 35,28 Q 50,23 65,28 L 65,48 Q 50,43 35,48 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
      <line x1="9" y1="34" x2="31" y2="34" stroke="#333333" stroke-width="1"/>
      <line x1="9" y1="39" x2="31" y2="39" stroke="#333333" stroke-width="1"/>
      <line x1="39" y1="34" x2="61" y2="34" stroke="#333333" stroke-width="1"/>
      <line x1="39" y1="39" x2="61" y2="39" stroke="#333333" stroke-width="1"/>
    </g>
    <g transform="translate(130, 108)">
      <path d="M 12,50 L 28,50 L 32,60 Q 32,65 20,65 Q 8,65 8,60 Z" fill="#008822" stroke="#000000" stroke-width="1.5"/>
      <path d="M 20,52 Q 35,25 45,5 Q 30,22 18,38 Z" fill="#e2e8f0" stroke="#000000" stroke-width="1.5"/>
      <line x1="20" y1="52" x2="43" y2="7" stroke="#333333" stroke-width="1.5"/>
    </g>
    <g transform="translate(68, 118) rotate(-60)">
      <text x="0" y="0" fill="#ffffff" font-size="8.5" font-family="Arial, sans-serif" font-weight="900" letter-spacing="0.4" text-anchor="middle">INSTITUCION EDUCATIVA TECNICA</text>
    </g>
    <g transform="translate(172, 118) rotate(60)">
      <text x="0" y="0" fill="#ffffff" font-size="8.5" font-family="Arial, sans-serif" font-weight="900" letter-spacing="0.4" text-anchor="middle">FRANCISCO JOSE DE CALDAS</text>
    </g>
    <text x="120" y="204" fill="#ffffff" font-size="10.5" font-family="Arial, sans-serif" font-weight="900" letter-spacing="0.8" text-anchor="middle">NATAGAIMA - TOLIMA</text>
  </svg>
  `.trim();
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
}

// Asynchronous helper to return a true PNG data URL for jsPDF embedding
export async function getSchoolCrestPngDataUrl(): Promise<string> {
  const custom = getCustomCrestUri();
  const uri = custom || getSchoolCrestDataUri();

  if (uri.startsWith('data:image/png') || uri.startsWith('data:image/jpeg')) {
    return uri;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 220;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 200, 220);
          const pngUrl = canvas.toDataURL('image/png');
          if (pngUrl && pngUrl.startsWith('data:image/png')) {
            resolve(pngUrl);
            return;
          }
        }
      } catch (err) {
        console.error("Canvas draw error:", err);
      }
      resolve('');
    };
    img.onerror = () => {
      resolve('');
    };
    img.src = uri;
  });
}
