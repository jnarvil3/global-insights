import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'News Globe - Interactive World News Visualization',
  description:
    'Explore world news on an interactive 3D globe with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden">{children}</body>
    </html>
  );
}
