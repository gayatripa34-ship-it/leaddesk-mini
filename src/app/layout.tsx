import './globals.css';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'LeadDesk Mini',
  description: 'Lead management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}