interface FoodRecommendationCardProps {
  name: string;
  description: string;
  icon: string;
}

export default function FoodRecommendationCard({ name, description, icon }: FoodRecommendationCardProps) {
  return (
    <div className="flex items-center rounded-lg bg-muted p-3">
      <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <i className={`${icon} text-xl text-accent`}></i>
      </div>
      <div>
        <h5 className="font-medium text-foreground">{name}</h5>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
