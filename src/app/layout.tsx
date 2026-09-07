import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Adressen appen svarar på, för de absoluta länkar delningskortet kräver.
 *
 * Open Graph tillåter inga relativa adresser: klienten som ritar kortet –
 * Meddelanden, Slack, Signal – hämtar bilden från sin egen sida av nätet
 * och har ingen aning om vilken sida den kom ifrån. Next gör om de
 * relativa adresserna nedan till absoluta med den här som bas.
 *
 * Läses vid bygget, inte vid förfrågan, eftersom metadata-objektet
 * utvärderas när modulen laddas. Sätt APP_URL som byggvariabel när
 * adressen ändras.
 */
const ADRESS = process.env.APP_URL ?? "https://avarn.robert-517.workers.dev";

const BESKRIVNING =
  "Operativt stöd för Avarn Securitys hundförare, instruktörer och ledning.";

export const metadata: Metadata = {
  metadataBase: new URL(ADRESS),
  title: {
    default: "Avarn Hundar",
    template: "%s · Avarn Hundar",
  },
  description: BESKRIVNING,
  manifest: "/manifest.webmanifest",

  /**
   * Kortet som visas när adressen klistras in i ett SMS eller en chatt.
   *
   * Titeln sätts här och ärvs av alla sidor, i stället för att följa
   * sidans egen. Utan den blev kortet döpt efter den undersida man råkade
   * stå på när länken kopierades – "Mer · Avarn Hundar" – vilket inte
   * säger mottagaren någonting.
   */
  openGraph: {
    type: "website",
    siteName: "Avarn Hundar",
    title: "Avarn Hundar",
    description: BESKRIVNING,
    locale: "sv_SE",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Avarn Hundar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avarn Hundar",
    description: BESKRIVNING,
    images: ["/og.png"],
  },
  // SVG duger i webbläsarfliken, men iOS läser bara PNG när appen läggs på
  // hemskärmen. Utan apple-touch-icon klipper Safari ut en miniatyr av
  // sidan i stället, och ikonen blir en suddig bild av sidhuvudet.
  icons: {
    icon: [
      { url: "/ikon.svg", type: "image/svg+xml" },
      { url: "/ikon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Avarn Hundar",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning gäller bara <html>-taggens egna attribut,
    // inte något inuti sidan. Webbläsartillägg – skärmklippare,
    // lösenordshanterare, översättare – hänger på egna attribut här innan
    // React hunnit hydrera, och React rapporterar det som en avvikelse
    // fast ingenting är fel i appen. Ett falsklarm i konsolen som kommer
    // vid varje sidladdning är värre än inget larm, eftersom man slutar
    // läsa dem. Avvikelser längre in i trädet rapporteras som förut.
    <html
      lang="sv"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
