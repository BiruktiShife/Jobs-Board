import { CompactFooter } from "@/utils/footer";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">{children}</main>
      <CompactFooter />
    </div>
  );
}
