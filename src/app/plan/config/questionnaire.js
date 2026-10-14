export const INITIAL_TRIP_PREFERENCES = {
  destination: "",
  durationDays: "",
  startDate: "",
  endDate: "",
  travelerType: "",
  travelerCount: "2",
  budgetInr: "",
  interests: [],
  pace: "",
  mustSee: "",
  constraints: "",
};

export const CURATED_STEPS = [
  { id: "dates", title: "Travel dates", optional: true },
  { id: "travelers", title: "Travelers" },
  { id: "budget", title: "Budget" },
  { id: "interests", title: "Interests & pace" },
  { id: "extras", title: "Must-sees & notes", optional: true },
  { id: "review", title: "Review" },
];

export const NEW_TRIP_STEPS = [
  { id: "destination", title: "Destination" },
  { id: "duration-travelers", title: "Duration & travelers" },
  { id: "budget", title: "Budget" },
  { id: "interests", title: "Interests & pace" },
  { id: "extras", title: "Must-sees & notes", optional: true },
  { id: "review", title: "Review" },
];

export const TRAVELER_TYPES = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "group", label: "Group" },
];

export const INTEREST_OPTIONS = [
  { value: "culture", label: "Culture & heritage" },
  { value: "nature", label: "Nature & outdoors" },
  { value: "food", label: "Food & local cuisine" },
  { value: "adventure", label: "Adventure" },
  { value: "relaxation", label: "Relaxation" },
  { value: "shopping", label: "Shopping" },
  { value: "nightlife", label: "Nightlife" },
];

export const PACE_OPTIONS = [
  { value: "relaxed", label: "Relaxed", description: "Fewer stops, more downtime" },
  { value: "balanced", label: "Balanced", description: "Mix of sights and rest" },
  { value: "packed", label: "Packed", description: "See as much as possible" },
];
