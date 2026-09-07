import type { Metadata } from 'next';
import { Archivo, Archivo_Black, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Navbar, Footer } from '@/components/layout';
import { ChatWidgetLoader } from '@/components/chat/chat-widget-loader';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const archivo = Archivo({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-body',
});

const archivoBlack = Archivo_Black({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Commons Marketplace',
  description: 'Tu marketplace de productos locales',
  icons: {
    icon: '/LogoCommons.png',
    apple: '/LogoCommons.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${archivo.variable} ${archivoBlack.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-body">
        <Navbar />
        <main className="flex-1 mesh-bg">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <ChatWidgetLoader />
        <Footer />
      </body>
    </html>
  );
}
