"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { SessionFormState } from "../actions";

type Option = { id: string; label: string };

/** Värdena i ett befintligt pass, när formuläret används för redigering. */
export type SessionInitial = {
  sessionId: string;
  teamId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  trainingArea: string;
  environment: string;
  targetOdor: string;
  disciplineId: string;
  hideCount: number;
  foundCount: number;
  comment: string;
};

/**
 * Snabbrapportering: så få fält som möjligt, med förifyllda listor för de
 * val som återkommer. Samma formulär används för nytt pass och för att rätta
 * ett befintligt – skillnaden är vilken action som tar emot det och om
 * `initial` är satt.
 */
export function SessionForm({
  action,
  initial,
  teams,
  disciplines,
  trainingAreas,
  environments,
  targetOdors,
  plannedExercises,
  defaults,
}: {
  action: (
    prev: SessionFormState,
    formData: FormData,
  ) => Promise<SessionFormState>;
  initial?: SessionInitial;
  teams: Option[];
  disciplines: Option[];
  trainingAreas: string[];
  environments: string[];
  targetOdors: string[];
  plannedExercises: {
    id: string;
    title: string;
    teamId: string;
    targetOdor: string | null;
    environment: string | null;
    disciplineId: string | null;
  }[];
  defaults: { date: string; startTime: string; endTime: string };
}) {
  const [state, formAction] = useActionState<SessionFormState, FormData>(
    action,
    {},
  );
  const [teamId, setTeamId] = useState(initial?.teamId ?? teams[0]?.id ?? "");
  const [exerciseId, setExerciseId] = useState("");
  const [environment, setEnvironment] = useState(
    initial?.environment ?? environments[0] ?? "",
  );
  const [targetOdor, setTargetOdor] = useState(
    initial?.targetOdor ?? targetOdors[0] ?? "",
  );
  const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? "");
  const [hideCount, setHideCount] = useState(initial?.hideCount ?? 5);
  const [foundCount, setFoundCount] = useState(initial?.foundCount ?? 5);

  const exercisesForTeam = plannedExercises.filter((e) => e.teamId === teamId);

  // Väljs en planerad övning fylls fälten i från den – föraren slipper
  // skriva om det instruktören redan bestämt.
  function applyExercise(id: string) {
    setExerciseId(id);
    const exercise = plannedExercises.find((e) => e.id === id);
    if (!exercise) return;
    if (exercise.environment) setEnvironment(exercise.environment);
    if (exercise.targetOdor) setTargetOdor(exercise.targetOdor);
    if (exercise.disciplineId) setDisciplineId(exercise.disciplineId);
  }

  return (
    <form action={formAction} className="space-y-5">
      {initial ? (
        <input type="hidden" name="sessionId" value={initial.sessionId} />
      ) : null}

      {/* Ekipage och planerad övning */}
      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Ekipage</legend>

        <div>
          <label className="field-label" htmlFor="teamId">
            Ekipage
          </label>
          <select
            id="teamId"
            name="teamId"
            required
            className="field"
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value);
              setExerciseId("");
            }}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {exercisesForTeam.length > 0 ? (
          <div>
            <label className="field-label" htmlFor="plannedExerciseId">
              Planerad övning (valfritt)
            </label>
            <select
              id="plannedExerciseId"
              name="plannedExerciseId"
              className="field"
              value={exerciseId}
              onChange={(e) => applyExercise(e.target.value)}
            >
              <option value="">Fristående pass</option>
              {exercisesForTeam.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </fieldset>

      {/* Tid och plats */}
      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Tid och plats</legend>

        <div>
          <label className="field-label" htmlFor="date">
            Datum
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={initial?.date ?? defaults.date}
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="startTime">
              Starttid
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue={initial?.startTime ?? defaults.startTime}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="endTime">
              Sluttid
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={initial?.endTime ?? defaults.endTime}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="location">
            Plats
          </label>
          <input
            id="location"
            name="location"
            required
            defaultValue={initial?.location ?? ""}
            placeholder="t.ex. Tyresta, Stockholm"
            className="field"
          />
        </div>
      </fieldset>

      {/* Sökets innehåll */}
      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Sök</legend>

        <div>
          <label className="field-label" htmlFor="trainingArea">
            Träningsområde
          </label>
          <input
            id="trainingArea"
            name="trainingArea"
            required
            list="trainingAreas"
            defaultValue={initial?.trainingArea ?? trainingAreas[0]}
            className="field"
          />
          <datalist id="trainingAreas">
            {trainingAreas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="environment">
              Sökmiljö
            </label>
            <input
              id="environment"
              name="environment"
              required
              list="environments"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="field"
            />
            <datalist id="environments">
              {environments.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="field-label" htmlFor="targetOdor">
              Måldoft
            </label>
            <input
              id="targetOdor"
              name="targetOdor"
              required
              list="targetOdors"
              value={targetOdor}
              onChange={(e) => setTargetOdor(e.target.value)}
              className="field"
            />
            <datalist id="targetOdors">
              {targetOdors.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="disciplineId">
            Sökinriktning
          </label>
          <select
            id="disciplineId"
            name="disciplineId"
            className="field"
            value={disciplineId}
            onChange={(e) => setDisciplineId(e.target.value)}
          >
            <option value="">Ej angiven</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Resultat */}
      <fieldset className="card space-y-3.5 p-4">
        <legend className="section-label px-1">Resultat</legend>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="hideCount">
              Antal gömmor
            </label>
            <input
              id="hideCount"
              name="hideCount"
              type="number"
              min={0}
              max={99}
              required
              value={hideCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                setHideCount(value);
                if (foundCount > value) setFoundCount(value);
              }}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="foundCount">
              Markeringar
            </label>
            <input
              id="foundCount"
              name="foundCount"
              type="number"
              min={0}
              max={hideCount}
              required
              value={foundCount}
              onChange={(e) => setFoundCount(Number(e.target.value))}
              className="field"
            />
          </div>
        </div>

        <p className="text-xs text-fg-dim">
          Resultat: {foundCount}/{hideCount} markeringar
        </p>

        <div>
          <label className="field-label" htmlFor="comment">
            Kommentar
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            defaultValue={initial?.comment ?? ""}
            placeholder="Hur gick passet? Vad ska följas upp?"
            className="field resize-y"
          />
        </div>
      </fieldset>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-2.5">
        <SubmitButton value="skicka" className="btn-primary flex-1">
          Skicka in
        </SubmitButton>
        <SubmitButton value="utkast" className="btn-secondary">
          Spara utkast
        </SubmitButton>
      </div>

      <p className="pb-2 text-center text-xs text-fg-dim">
        {initial
          ? "Bilder och filmer läggs till på passets sida."
          : "Bilder och filmer läggs till när passet är sparat."}
      </p>
    </form>
  );
}

function SubmitButton({
  value,
  className,
  children,
}: {
  value: string;
  className: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="submit"
      value={value}
      disabled={pending}
      className={`btn ${className}`}
    >
      {pending ? "Sparar …" : children}
    </button>
  );
}
