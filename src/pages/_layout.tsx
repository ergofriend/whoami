import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const getConfig = async () => ({ render: "dynamic" as const });
