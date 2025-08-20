import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DateProvider } from '@/components/DateContext'
import { ModalProvider } from '@/components/ModalContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'gymNote - Email Confirmation',
    description: 'Send confirmation emails using gymNote',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var stored = localStorage.getItem('theme');
                                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    var isDark = stored ? stored === 'dark' : prefersDark;
                                    var root = document.documentElement;
                                    if (isDark) {
                                        root.classList.add('dark');
                                    } else {
                                        root.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
                <ModalProvider>
                    <DateProvider>
                        {children}
                    </DateProvider>
                </ModalProvider>
            </body>
        </html>
    )
}
