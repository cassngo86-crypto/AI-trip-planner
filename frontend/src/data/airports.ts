export interface Airport {
  label: string;
  code: string;
}

export const AIRPORTS_BY_COUNTRY: Record<string, Airport[]> = {
  Malaysia: [
    { label: "Kuala Lumpur International (KUL)", code: "KUL" },
    { label: "Penang International (PEN)", code: "PEN" },
    { label: "Kota Kinabalu International (BKI)", code: "BKI" },
    { label: "Kuching International (KCH)", code: "KCH" },
  ],
  Japan: [
    { label: "Tokyo Narita (NRT)", code: "NRT" },
    { label: "Tokyo Haneda (HND)", code: "HND" },
    { label: "Kansai International (KIX)", code: "KIX" },
  ],
};