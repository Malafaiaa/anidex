"use client";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { deleteAccount } from "./actions";
export default function DeleteAccountForm() {
  const [password, setPassword,] = useState("");
  const [confirmation, setConfirmation,] = useState("");
  const [error, setError,] = useState("");
  const [isPending, startTransition,] = useTransition();
  const canDelete = password.length > 0 &&
    confirmation
      .trim()
      .toUpperCase() ===
    "EXCLUIR";
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canDelete) {
      return;
    }
    const confirmed = window.confirm("Esta ação é permanente. Sua lista, progresso e avaliações serão apagados. Deseja continuar?");
    if (!confirmed) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await deleteAccount(formData);
        if (!result?.success) {
          setError(result?.message ||
            "Não foi possível excluir a conta.");
          return;
        }
        window.location.replace("/");
      }
      catch (error) {
        console.error(error);
        setError("Não foi possível excluir a conta.");
      }
    });
  }
  return (<div className="rounded-3xl border border-red-500/20 bg-red-500/[0.035] p-6 md:p-7">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">
          Excluir conta
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Esta ação é permanente e não pode ser desfeita.
        </p>
      </div>
    </div>
    <div className="mt-6 rounded-2xl border border-red-500/15 bg-black/20 p-4">
      <p className="text-sm font-medium text-red-200">
        Ao excluir sua conta serão removidos:
      </p>
      <ul className="mt-3 space-y-2 text-sm text-zinc-500">
        <li>• sua conta de acesso;</li>
        <li>• todos os animes da sua lista;</li>
        <li>• todo o progresso e minutagem;</li>
        <li>• todas as avaliações e comentários.</li>
      </ul>
    </div>
    {error && (<div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {error}
    </div>)}
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="delete-password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Sua senha
        </label>
        <input id="delete-password" name="password" type="password" autoComplete="current-password" value={password} disabled={isPending} onChange={(event) => setPassword(event.target.value)} placeholder="Confirme sua senha" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 disabled:opacity-60" />
      </div>
      <div>
        <label htmlFor="delete-confirmation" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Confirmação
        </label>
        <input id="delete-confirmation" name="confirmation" type="text" autoComplete="off" value={confirmation} disabled={isPending} onChange={(event) => setConfirmation(event.target.value)} placeholder='Digite "EXCLUIR"' className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 disabled:opacity-60" />
      </div>
      <button type="submit" disabled={!canDelete ||
        isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">
        {isPending ? (<>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Excluindo conta...
        </>) : (<>
          <Trash2 className="h-4 w-4" />
          Excluir minha conta
        </>)}
      </button>
    </form>
  </div>);
}
