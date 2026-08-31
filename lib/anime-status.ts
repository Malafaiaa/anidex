export const ANIME_STATUS_OPTIONS = [
  { value: "WANT_TO_WATCH", label: "Quero assistir" },
  { value: "WATCHING", label: "Assistindo" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "PAUSED", label: "Pausado" },
  { value: "DROPPED", label: "Abandonei" },
] as const;
export type AnimeStatus = (typeof ANIME_STATUS_OPTIONS)[number]["value"];
const ANIME_STATUS_SET = new Set<string>(ANIME_STATUS_OPTIONS.map((option) => option.value));
export function isAnimeStatus(value: string): value is AnimeStatus {
  return ANIME_STATUS_SET.has(value);
}
export function getAnimeStatusLabel(status: string) {
  return ANIME_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}
export function getAnimeStatusClasses(status: string) {
  switch (status) {
    case "WATCHING":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "COMPLETED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "PAUSED":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "DROPPED":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
  }
}
