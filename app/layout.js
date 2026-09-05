import "./globals.css";

export const metadata = {
  title: "RoyalSync | Royal Square Financial",
  description: "Adviser and admin platform for Royal Square Financial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}