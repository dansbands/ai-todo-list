import "../src/index.css";
import "../src/Reminders.css";
import Providers from "./providers";

export const metadata = {
  title: "AI Todo List",
  description: "Turn tasks into actionable plans with real next steps.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
