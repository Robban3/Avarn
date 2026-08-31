"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Skickar …" : "Skicka"}
    </button>
  );
}

/** Fält för att lämna återkoppling. */
export function CommentForm({
  action,
  idField,
  idValue,
  placeholder = "Skriv en kommentar …",
}: {
  action: (formData: FormData) => Promise<void>;
  idField: string;
  idValue: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await action(formData);
        ref.current?.reset();
      }}
      className="card p-3"
    >
      <input type="hidden" name={idField} value={idValue} />
      <label className="sr-only" htmlFor="comment-body">
        Kommentar
      </label>
      <textarea
        id="comment-body"
        name="body"
        rows={3}
        required
        placeholder={placeholder}
        className="field mb-2.5 resize-y"
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
