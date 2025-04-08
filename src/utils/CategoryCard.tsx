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
  console.log("onCategoryClick type:", typeof onCategoryClick);

  return (
    <Card
      className="text-center hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        if (typeof onCategoryClick === "function") {
          onCategoryClick(title);
        } else {
          console.error("onCategoryClick is not a function:", onCategoryClick);
        }
      }}
    >
      <CardHeader>
        <div className="flex justify-center mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
    </Card>
  );
}
