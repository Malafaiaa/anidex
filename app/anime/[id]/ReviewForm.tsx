"use client";
import { CheckCircle2, MessageSquareText, Save, Star, Trash2 } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { deleteReview, saveReview } from "./actions";
type ReviewFormProps = {
  anilistId: number;
  title: string;
  imageUrl: string;
  totalEpisodes: number | null;
  initialRating: number | null;
  initialComment: string;
  saved: boolean;
};
type PendingAction = "save" | "delete" | null;
export default function ReviewForm({ anilistId, title, imageUrl, totalEpisodes, initialRating, initialComment, saved }: ReviewFormProps) {
  const [rating, setRating,] = useState<number | null>(initialRating);
  const [comment, setComment,] = useState(initialComment);
  const [hasReview, setHasReview,] = useState(initialRating !== null);
  const [savedLocally, setSavedLocally,] = useState(saved);
  const [deletedLocally, setDeletedLocally,] = useState(false);
  const [error, setError,] = useState("");
  const [pendingAction, setPendingAction,] = useState<PendingAction>(null);
  const [isPending, startTransition,] = useTransition();
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setSavedLocally(false);
    setDeletedLocally(false);
    setPendingAction("save");
    startTransition(async () => {
      try {
        const result = await saveReview(formData);
        if (result?.success) {
          setHasReview(true);
          setSavedLocally(true);
        }
      }
      catch (error) {
        console.error(error);
        setError("Não foi possível salvar a avaliação.");
      }
      finally {
        setPendingAction(null);
      }
    });
  }
  function handleDelete() {
    if (!hasReview) {
      return;
    }
    const confirmed = window.confirm("Tem certeza que deseja excluir sua avaliação deste anime?");
    if (!confirmed) {
      return;
    }
    const formData = new FormData();
    formData.set("anilistId", String(anilistId));
    setError("");
    setSavedLocally(false);
    setDeletedLocally(false);
    setPendingAction("delete");
    startTransition(async () => {
      try {
        const result = await deleteReview(formData);
        if (result?.success) {
          setRating(null);
          setComment("");
          setHasReview(false);
          setDeletedLocally(true);
        }
      }
      catch (error) {
        console.error(error);
        setError("Não foi possível excluir a avaliação.");
      }
      finally {
        setPendingAction(null);
      }
    });
  }
  return (<div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-7">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
        <MessageSquareText className="h-5 w-5 text-violet-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold">
          Sua avaliação
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Dê uma nota e conte o que achou deste anime.
        </p>
      </div>
    </div>
    {savedLocally && (<div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      <CheckCircle2 className="h-4 w-4" />
      Avaliação salva com sucesso.
    </div>)}
    {deletedLocally && (<div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      <CheckCircle2 className="h-4 w-4" />
      Avaliação excluída com sucesso.
    </div>)}
    {error && (<div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {error}
    </div>)}
    <form onSubmit={handleSubmit} className="mt-6">
      <input type="hidden" name="anilistId" value={anilistId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="totalEpisodes" value={totalEpisodes ??
        ""} />
      <input type="hidden" name="rating" value={rating ??
        ""} />
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Sua nota
          </p>
          {rating !== null && (<div className="flex items-center gap-1.5 text-sm font-semibold text-violet-300">
            <Star className="h-4 w-4 fill-violet-400 text-violet-400" />
            {rating}/10
          </div>)}
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({
            length: 10
          }, (_, index) => index + 1).map((value) => {
            const active = rating ===
              value;
            return (<button key={value} type="button" disabled={isPending} onClick={() => setRating(value)} className={`h-11 rounded-xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${active
              ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-950/30"
              : "border-white/10 bg-white/[0.025] text-zinc-400 hover:border-violet-500/40 hover:text-white"}`}>
              {value}
            </button>);
          })}
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor={`review-comment-${anilistId}`} className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Comentário
          </label>
          <span className="text-xs text-zinc-700">
            {comment.length}/1000
          </span>
        </div>
        <textarea id={`review-comment-${anilistId}`} name="comment" value={comment} disabled={isPending} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={5} placeholder="Escreva sua opinião sobre o anime..." className="w-full resize-none rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60" />
      </div>
      <div className={`mt-4 grid gap-3 ${hasReview
        ? "sm:grid-cols-[1fr_auto]"
        : ""}`}>
        <button type="submit" disabled={rating === null ||
          isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">
          {pendingAction ===
            "save" ? (<>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Salvando...
            </>) : (<>
              <Save className="h-4 w-4" />
              {hasReview
                ? "Atualizar avaliação"
                : "Salvar avaliação"}
            </>)}
        </button>
        {hasReview && (<button type="button" disabled={isPending} onClick={handleDelete} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-5 text-sm font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40">
          {pendingAction ===
            "delete" ? (<>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300/30 border-t-red-300" />
              Excluindo...
            </>) : (<>
              <Trash2 className="h-4 w-4" />
              Excluir
            </>)}
        </button>)}
      </div>
    </form>
  </div>);
}
