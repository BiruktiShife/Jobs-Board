"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryCard({
  icon,
  title,
  onCategoryClick,
}: {
  icon: React.ReactNode;
  title: string;
  onCategoryClick: (category: string) => void;
}) {
  return (
    <Card
      className="text-center hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onCategoryClick(title)}
    >
      <CardHeader>
        <div className="flex justify-center mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
    </Card>
  );
}
