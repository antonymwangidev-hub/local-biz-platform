import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

const StarRating = ({ rating, size = 16 }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-secondary text-secondary"
              : "text-border"
          }
        />
      ))}
    </div>
  );
};

export default StarRating;
