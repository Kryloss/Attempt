import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DateProvider } from '@/components/DateContext'
import { ModalProvider } from '@/components/ModalContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'GymNote - Your Personal Fitness Companion',
    description: 'GymNote workout tracker - Your ultimate fitness app for tracking workouts, nutrition, and progress. Start your fitness journey today!',
    keywords: 'GymNote, workout tracker, fitness app, exercise tracking, nutrition tracking, fitness companion',
    authors: [{ name: 'GymNote Team' }],
    openGraph: {
        title: 'GymNote - Your Personal Fitness Companion',
        description: 'Track your workouts, nutrition, and progress with GymNote fitness app',
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GymNote - Your Personal Fitness Companion',
        description: 'Track your workouts, nutrition, and progress with GymNote fitness app',
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
