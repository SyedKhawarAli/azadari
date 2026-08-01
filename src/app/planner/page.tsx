import { PlannerHome } from "@/components/planner/planner-home";

export const metadata = {
  title: "Majlis planner",
  description: "Build a drag-and-drop Majlis programme and share it with a link or QR code.",
};

export default function PlannerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-base font-semibold tracking-tight sm:text-xl">Majlis planner</h1>
        <p className="mt-0.5 text-[0.7rem] text-muted-foreground sm:mt-1 sm:text-sm">
          <span className="sm:hidden">Build and share a Majlis agenda.</span>
          <span className="hidden sm:inline">
            Arrange Nohay, Manqabat and programme segments into a shareable agenda.
          </span>
        </p>
      </div>
      <PlannerHome />
    </div>
  );
}
