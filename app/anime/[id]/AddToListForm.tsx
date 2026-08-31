"use client";
import { ANIME_STATUS_OPTIONS } from "../../../lib/anime-status";
import { CheckCircle2, ListPlus, LoaderCircle } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { addAnimeToList } from "./actions";
type AddToListFormProps = {
  anilistId: number;
  title: string;
  imageUrl: string;
  totalEpisodes: number | null;
};
export default function AddToListForm({ anilistId, title, imageUrl, totalEpisodes }: AddToListFormProps) {
  const [saved, setSaved,] = useState(false);
  const [error, setError,] = useState("");
  const [isPending, startTransition,] = useTransition();
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError("");
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await addAnimeToList(formData);
        if (result?.success) {
          setSaved(true);
        }
      }
      catch (error) {
        console.error(error);
        setError("Não foi possível salvar na lista.");
      }
    });
  }
  return (<div>
    {saved && (<div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      Anime salvo na sua lista.
    </div>)}
    {error && (<div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
      {error}
    </div>)}
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="anilistId" value={anilistId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="totalEpisodes" value={totalEpisodes ??
        ""} />
      <div>
        <label htmlFor={`status-${anilistId}`} className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Status
        </label>
        <select id={`status-${anilistId}`} name="status" defaultValue="WANT_TO_WATCH" disabled={isPending} className="w-full rounded-xl border border-white/10 bg-[#111113] px-3 py-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/50 disabled:opacity-60">
          {ANIME_STATUS_OPTIONS.map((option) => (<option key={option.value} value={option.value}>
            {option.label}
          </option>))}
        </select>
      </div>
      <button type="submit" disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? (<>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Salvando...
        </>) : (<>
          <ListPlus className="h-4 w-4" />
          Adicionar à minha lista
        </>)}
      </button>
    </form>
  </div>);
}
