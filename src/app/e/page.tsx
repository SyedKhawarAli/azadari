import { PublicEventView } from "@/components/planner/public-event-view";

export const metadata = {
  title: "Shared Majlis programme",
  description: "View a Majlis programme shared via link",
};

export default function SharedEventPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-5 sm:px-4 sm:py-8">
      <PublicEventView />
    </div>
  );
}
