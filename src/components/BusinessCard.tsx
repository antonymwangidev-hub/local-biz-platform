import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Business } from "@/data/sampleBusinesses";
import StarRating from "./StarRating";

const BusinessCard = ({ business }: { business: Business }) => (
  <Link
    to={`/business/${business.slug}`}
    className="group block overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
  >
    <div className="aspect-[16/10] overflow-hidden">
      <img
        src={business.image}
        alt={business.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div className="p-5">
      <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        {business.category}
      </span>
      <h3 className="font-display text-lg font-bold text-card-foreground mb-1">
        {business.name}
      </h3>
      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
        {business.shortDescription}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating rating={business.rating} size={14} />
          <span className="text-xs text-muted-foreground">
            ({business.reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} />
          {business.address.split(",")[0]}
        </div>
      </div>
    </div>
  </Link>
);

export default BusinessCard;
