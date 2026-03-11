import "./globals.css";

export const metadata = {
  title: "Slot Booking Web App",
  description: "Physics Wallah Slot Booking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
