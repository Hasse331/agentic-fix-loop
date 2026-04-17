import type { ReactNode } from "react";

import { AgenticFixLoop } from "@agentic-fix-loop/widget";

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AgenticFixLoop projectName="ExampleApp" />
      </body>
    </html>
  );
}
