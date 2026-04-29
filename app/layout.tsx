import type { Metadata } from 'next';
import { Archivo, Archivo_Black, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout';
import { ChatWidgetLoader } from '@/components/chat/chat-widget-loader';

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
        <main className="flex-1 mesh-bg">{children}</main>
        <ChatWidgetLoader />
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 bg-surface py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-mono uppercase tracking-wider">
            © 2026 Commons Marketplace
          </p>
          <p className="text-xs text-gray-400 font-mono">
            Built with raw intention
          </p>
        </div>
      </div>
    </footer>
  );
}
