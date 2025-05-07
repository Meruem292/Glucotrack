interface FoodRecommendationCardProps {
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

export default function FoodRecommendationCard({ name, description, icon, imageUrl }: FoodRecommendationCardProps) {
  return (
    <div className="flex items-center rounded-lg bg-secondary border border-slate-700 p-3">
      <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full rounded-lg object-cover" />
        ) : (
          <i className={`${icon} text-xl text-accent`}></i>
        )}
      </div>
      <div>
        <h5 className="font-medium text-foreground">{name}</h5>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
