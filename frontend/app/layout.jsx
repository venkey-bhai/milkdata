import "./globals.css";

export const metadata = {
  title: "Milk Buyer App",
  description: "Milk Buyer Management System"
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">

      <body className="min-h-screen">

      <div className="flex">

          {/* Main Content */}
          <main className="ml-0 md:ml-64 flex-1 min-h-screen overflow-y-auto bg-gray-100 p-4">
            {children}
          </main>

        </div>
        </body>

    </html>
  );
}