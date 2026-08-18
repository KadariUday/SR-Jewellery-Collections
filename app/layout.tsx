import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'SR Jewellery Collections | Royal Heritage & Fine Jewellery',
  description: 'Hand-crafted Kundan, Polki, Gold & Diamond Jewellery designed for modern royalty. Browse our exclusive collections with fast insured delivery.',
  keywords: ['SR Jewellery', 'Gold Jewellery', 'Kundan Choker', 'Polki Earrings', 'Jhumka', 'Bridal Jewellery', 'Temple Jewellery'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-gold-400 selection:text-white">
        <StoreProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
