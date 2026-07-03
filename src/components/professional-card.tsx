import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfessionalAvatar } from "@/components/professional-avatar";
import {
  AvailableNowBadge,
  CategoryChip,
  EmergencyBadge,
  PremiumBadge,
  RatingStars,
  VerifiedBadge,
} from "@/components/badges";
import { cn } from "@/lib/utils";
import { isCategorySlug } from "@/lib/categories";
import type { ProfessionalResult } from "@/lib/types";

export function ProfessionalCard({ pro }: { pro: ProfessionalResult }) {
  return (
    <Link href={`/pro/${pro.id}`} className="group block">
      <Card
        className={cn(
          "h-full gap-0 overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md",
          pro.is_premium && "ring-1 ring-amber-300",
        )}
      >
        <div className="relative">
          <ProfessionalAvatar
            name={pro.name}
            imageUrl={pro.image_url}
            category={pro.category}
            className="h-40 w-full rounded-none text-5xl"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {pro.is_verified && <VerifiedBadge />}
            {pro.is_emergency && <EmergencyBadge />}
          </div>
          {pro.is_premium && (
            <div className="absolute right-2 top-2">
              <PremiumBadge />
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <div className="flex flex-wrap gap-1">
            <CategoryChip category={pro.category} />
            {pro.extra_categories?.slice(0, 2).map(
              (slug) => isCategorySlug(slug) && <CategoryChip key={slug} category={slug} />,
            )}
          </div>
          <h3 className="font-semibold leading-tight transition group-hover:text-primary">
            {pro.name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{pro.location}</span>
            {pro.distancia_km !== undefined && (
              <span className="shrink-0 font-medium text-primary">
                {pro.distancia_km} km
              </span>
            )}
          </p>
          {pro.is_available_now && <AvailableNowBadge className="w-fit" />}
          {pro.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {pro.description}
            </p>
          )}
          <div className="pt-1">
            <RatingStars rating={pro.rating} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
