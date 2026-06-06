export const metadata = {
  title: "Happy Birthday P'Lita",
  description: "A classic iPod-style birthday music player for P'Lita",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
