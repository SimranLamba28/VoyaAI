import { DestinationCard } from "@/components/destinations/destination-card";

export function DestinationGrid({ destinations }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      {destinations.map((destination, index) => (
        <DestinationCard key={destination.id} destination={destination} priority={index<3} />
      ))}
    </div>
  );
}
