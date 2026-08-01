import { FavoritesList } from "@/components/favorites/favorites-list";

export const metadata = {
  title: "Favourites",
  description: "Lyrics you have saved for later — stored on this device in guest mode.",
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-base font-semibold tracking-tight sm:text-xl">Favourites</h1>
        <p className="mt-0.5 text-[0.7rem] text-muted-foreground sm:mt-1 sm:text-sm">
          Saved on this device.
        </p>
      </div>
      <FavoritesList />
    </div>
  );
}
