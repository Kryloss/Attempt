import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DateProvider } from '@/components/DateContext'
import { ModalProvider } from '@/components/ModalContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'gymNote - Your Fitness Companion',
    description: 'Track workouts, monitor nutrition, and achieve your fitness goals with gymNote. Your comprehensive tool for hard work and progress tracking.',
    keywords: 'fitness, workout tracker, nutrition tracker, progress tracking, gym, exercise',
    authors: [{ name: 'gymNote Team' }],
    creator: 'gymNote',
    openGraph: {
        title: 'gymNote - Your Fitness Companion',
        description: 'Track workouts, monitor nutrition, and achieve your fitness goals with gymNote.',
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'gymNote - Your Fitness Companion',
        description: 'Track workouts, monitor nutrition, and achieve your fitness goals with gymNote.',
    },
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
    verification: {
        google: 'Ho3GkE1-ntcv9iTz4yNlC2Pe9wQYYVr_6pMql-G_WSM',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
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
