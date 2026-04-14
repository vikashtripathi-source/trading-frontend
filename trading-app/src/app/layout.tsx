import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradePro - Professional Trading Platform",
  description: "Modern, intuitive trading platform with comprehensive portfolio management, real-time market data, and seamless trading capabilities.",
  keywords: ["trading", "stocks", "portfolio", "investing", "finance", "market data"],
  authors: [{ name: "TradePro Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1E40AF" },
    { media: "(prefers-color-scheme: dark)", color: "#3B82F6" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1E40AF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1E40AF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body 
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <div id="root" className="min-h-full">
          <Layout>
            {children}
          </Layout>
        </div>
        
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        {/* Loading indicator */}
        <div id="loading-indicator" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="text-gray-900 dark:text-white">Loading...</span>
          </div>
        </div>
        
        {/* Toast container */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2"></div>
        
        {/* Scripts for accessibility and performance */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Theme detection and application
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
              
              // Focus management for modals
              let focusableElements = [];
              let modalElement = null;
              
              function trapFocus(element) {
                focusableElements = element.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                modalElement = element;
                
                if (focusableElements.length > 0) {
                  focusableElements[0].focus();
                }
              }
              
              function removeFocusTrap() {
                modalElement = null;
                focusableElements = [];
              }
              
              // Keyboard navigation
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modalElement) {
                  const closeButton = modalElement.querySelector('[data-close-modal]');
                  if (closeButton) {
                    closeButton.click();
                  }
                }
                
                if (e.key === 'Tab' && modalElement) {
                  const firstElement = focusableElements[0];
                  const lastElement = focusableElements[focusableElements.length - 1];
                  
                  if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                      e.preventDefault();
                      lastElement.focus();
                    }
                  } else {
                    if (document.activeElement === lastElement) {
                      e.preventDefault();
                      firstElement.focus();
                    }
                  }
                }
              });
              
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', function() {
                  const perfData = performance.getEntriesByType('navigation')[0];
                  if (perfData && perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                    console.warn('Slow page load detected');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
