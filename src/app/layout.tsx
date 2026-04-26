import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marco Polo Aguirre | DIPUTADO",
  description:
    "Sitio oficial de Marco Polo Aguirre, diputado local en Morelia, Michoacán. Información, propuestas y trabajo legislativo.",
  keywords: [
    "Marco Polo Aguirre",
    "diputado Morelia",
    "política Michoacán",
    "Marco Polo Aguirre propuestas",
  ],
  authors: [{ name: "Marco Polo Aguirre" }],
  creator: "Marco Polo Aguirre",
  metadataBase: new URL("https://www.marcopoloaguirre.com"),
  openGraph: {
    title: "Marco Polo Aguirre | Diputado Local",
    description:
      "Conoce el trabajo legislativo y propuestas de Marco Polo Aguirre en Morelia.",
    url: "https://www.marcopoloaguirre.com",
    siteName: "Marco Polo Aguirre",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Marco Polo Aguirre",
              jobTitle: "Diputado local",
              worksFor: {
                "@type": "Organization",
                name: "Congreso del Estado de Michoacán",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Morelia",
                addressRegion: "Michoacán",
                addressCountry: "MX",
              },
              url: "https://www.marcopoloaguirre.com",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
