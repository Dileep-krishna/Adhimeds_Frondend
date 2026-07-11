import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import Providers from './providers';
import { SidebarProvider } from '@/context/SidebarContext';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "My App",
  description: "Clean Next.js App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <SidebarProvider>
          <Providers>{children}</Providers>
        </SidebarProvider>
      </body>
    </html>
  );
}