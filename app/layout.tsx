// Root layout - minimal, just sets up the basic HTML structure
// The actual app layout with header/footer is in [locale]/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
