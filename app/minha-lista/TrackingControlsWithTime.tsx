"use client";
import { ANIME_STATUS_OPTIONS } from "../../lib/anime-status";
import { ChevronDown, ChevronUp, Clock3, Save } from "lucide-react";
import { useState } from "react";
import { saveTracking } from "./actions";
type TrackingControlsWithTimeProps = {
  itemId: number;
  currentProgress: number;
  currentProgressSeconds: number;
  totalEpisodes: number | null;
  currentStatus: string;
};
type StepperProps = {
  value: number;
  onChange: (value: string) => void;
  onIncrease: () => void;
  onDecrease: () => void;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
};
function Stepper({ value, onChange, onIncrease, onDecrease, increaseDisabled = false, decreaseDisabled = false }: StepperProps) {
  return (<div className="relative">
    <input type="text" inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-[#111113] px-3 pr-11 text-sm font-semibold text-white outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
    <div className="absolute inset-y-1 right-1 flex w-8 flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
      <button type="button" onClick={onIncrease} disabled={increaseDisabled} className="flex flex-1 items-center justify-center border-b border-white/10 text-zinc-500 transition hover:bg-violet-500/15 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-25" aria-label="Aumentar">
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onDecrease} disabled={decreaseDisabled} className="flex flex-1 items-center justify-center text-zinc-500 transition hover:bg-violet-500/15 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-25" aria-label="Diminuir">
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>);
}
export default function TrackingControlsWithTime({ itemId, currentProgress, currentProgressSeconds, totalEpisodes, currentStatus }: TrackingControlsWithTimeProps) {
  const [progress, setProgress,] = useState(currentProgress);
  const [minutes, setMinutes,] = useState(Math.floor(currentProgressSeconds /
    60));
  const [seconds, setSeconds,] = useState(currentProgressSeconds %
    60);
  const [status, setStatus,] = useState(currentStatus);
  const progressSeconds = minutes * 60 +
    seconds;
  const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  function onlyNumbers(value: string) {
    return value.replace(/\D/g, "");
  }
  function resetTime() {
    setMinutes(0);
    setSeconds(0);
  }
  function changeEpisode(value: string) {
    const clean = onlyNumbers(value);
    if (!clean) {
      if (progress !== 0) {
        resetTime();
      }
      setProgress(0);
      return;
    }
    let next = Math.max(0, Number(clean));
    if (totalEpisodes !== null) {
      next =
        Math.min(totalEpisodes, next);
    }
    if (next !== progress) {
      resetTime();
    }
    setProgress(next);
  }
  function increaseEpisode() {
    setProgress((current) => {
      let next = current + 1;
      if (totalEpisodes !== null) {
        next =
          Math.min(totalEpisodes, next);
      }
      if (next !== current) {
        resetTime();
      }
      return next;
    });
  }
  function decreaseEpisode() {
    setProgress((current) => {
      const next = Math.max(0, current - 1);
      if (next !== current) {
        resetTime();
      }
      return next;
    });
  }
  function changeMinutes(value: string) {
    const clean = onlyNumbers(value);
    setMinutes(clean
      ? Math.max(0, Number(clean))
      : 0);
  }
  function increaseMinutes() {
    setMinutes((current) => current + 1);
  }
  function decreaseMinutes() {
    setMinutes((current) => Math.max(0, current - 1));
  }
  function changeSeconds(value: string) {
    const clean = onlyNumbers(value);
    setSeconds(clean
      ? Math.min(59, Math.max(0, Number(clean)))
      : 0);
  }
  function increaseSeconds() {
    setSeconds((current) => {
      if (current >= 59) {
        setMinutes((minute) => minute + 1);
        return 0;
      }
      return current + 1;
    });
  }
  function decreaseSeconds() {
    setSeconds((current) => {
      if (current <= 0 &&
        minutes > 0) {
        setMinutes((minute) => Math.max(0, minute - 1));
        return 59;
      }
      return Math.max(0, current - 1);
    });
  }
  return (<form action={saveTracking}>
    <input type="hidden" name="itemId" value={itemId} />
    <input type="hidden" name="progress" value={progress} />
    <input type="hidden" name="progressSeconds" value={progressSeconds} />
    <input type="hidden" name="status" value={status} />
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-600">
        Episódio atual
      </label>
      <Stepper value={progress} onChange={changeEpisode} onIncrease={increaseEpisode} onDecrease={decreaseEpisode} decreaseDisabled={progress <= 0} increaseDisabled={totalEpisodes !== null &&
        progress >= totalEpisodes} />
      {totalEpisodes !== null &&
        totalEpisodes > 0 && (<p className="mt-1.5 text-right text-[11px] text-zinc-600">
          Máx. {totalEpisodes}
        </p>)}
    </div>
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-violet-400" />
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Onde você parou
          </p>
        </div>
        <span className="text-xs font-medium text-violet-400">
          {timeLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <p className="mb-1.5 text-[11px] text-zinc-600">
            Minutos
          </p>
          <Stepper value={minutes} onChange={changeMinutes} onIncrease={increaseMinutes} onDecrease={decreaseMinutes} decreaseDisabled={minutes <= 0} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] text-zinc-600">
            Segundos
          </p>
          <Stepper value={seconds} onChange={changeSeconds} onIncrease={increaseSeconds} onDecrease={decreaseSeconds} decreaseDisabled={minutes === 0 &&
            seconds === 0} />
        </div>
      </div>
    </div>
    <div className="mt-3 border-t border-white/10 pt-3">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-600">
        Alterar status
      </label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/50">
        {ANIME_STATUS_OPTIONS.map((option) => (<option key={option.value} value={option.value}>
          {option.label}
        </option>))}
      </select>
    </div>
    <button type="submit" className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500">
      <Save className="h-4 w-4" />
      Salvar alterações
    </button>
  </form>);
}
