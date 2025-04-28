import { FooterSection } from "@/utils/footer";
import { ReactNode } from "react";

interface FooterOnlyLayoutProps {
  children: ReactNode;
}

export default function FooterOnlyLayout({ children }: FooterOnlyLayoutProps) {
  return (
    <div className="bg-gray-100 text-gray-900 flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <FooterSection />
    </div>
  );
}
