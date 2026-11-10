import {
  Geist,
  Geist_Mono,
  Bricolage_Grotesque,
  Caveat,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip"
import Nav from "@/components/Nav";

// Four faces, four jobs. All self-hosted by next/font at build time — nothing
// is fetched from Google at runtime.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headings. Chunky and a bit playful without giving up credibility.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Handwritten annotations only — the "someone scribbled on this" layer.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata = {
  title: "AEC Tech Starter",
  description: "A brick-based Next.js starter",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: next-themes sets the `class` on <html> before
    // React hydrates, so the server and client markup differ here by design.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Nav />
            {/* Plain block, not a flex column: `mx-auto` on a flex item would
                shrink each page's <main> to fit its content instead of letting
                it stretch to max-w-6xl. */}
            <div className="flex-1">{children}</div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
