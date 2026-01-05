import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from './components/ClientProviders'
import ClientLayoutFrame from './components/ClientLayoutFrame'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Connection Key',
  description: 'Die energetische Signatur zwischen zwei Menschen',
  icons: {
    icon: [
      { url: '/images/connection-key-optimized.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/connection-key-optimized.png', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <ClientLayoutFrame>
            {children}
          </ClientLayoutFrame>
        </ClientProviders>
      </body>
    </html>
  )
}
