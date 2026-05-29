import "./globals.css";

export const metadata = {
  title: "Milk Buyer App",
  description: "Milk Buyer Management System",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">

      <body>

        {children}

      </body>

    </html>
  );
}