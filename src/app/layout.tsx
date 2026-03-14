import { headers } from 'next/headers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localeHeader = headers().get('x-next-intl-locale') ?? 'en';

  return (
    <html lang={localeHeader}>
      <body className="bg-mc-bg text-mc-text min-h-screen">{children}</body>
    </html>
  );
}
