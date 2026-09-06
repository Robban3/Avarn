import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Avarn Hundtjänst",
    template: "%s · Avarn Hundtjänst",
  },
  description:
    "Operativt stöd för Avarn Securitys hundförare, instruktörer och ledning.",
  manifest: "/manifest.webmanifest",
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
    title: "Avarn Hundtjänst",
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
