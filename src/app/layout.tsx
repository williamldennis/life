import { Inter } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/components/ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Life Coach App',
  description: 'Track and improve your life balance across health, work, play, and love',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
