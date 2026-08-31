import { Avatar } from "./ui";
import { formatShortDate } from "@/lib/format";
import { ROLE_LABELS, type Role } from "@/lib/domain";

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string; role: string };
};

/** Återkoppling under ett träningspass eller en rapport. */
export function CommentThread({ comments }: { comments: CommentItem[] }) {
  if (comments.length === 0) {
    return (
      <p className="card px-4 py-4 text-sm text-fg-muted">
        Ingen återkoppling ännu.
      </p>
    );
  }

  return (
    <div className="card divide-y divide-line-soft">
      {comments.map((comment) => (
        <article key={comment.id} className="flex gap-3 p-4">
          <Avatar name={comment.author.name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-semibold">
                {comment.author.name}
              </p>
              <p className="shrink-0 text-xs text-fg-dim">
                {formatShortDate(comment.createdAt)}
              </p>
            </div>
            <p className="text-xs text-fg-dim">
              {ROLE_LABELS[comment.author.role as Role] ?? comment.author.role}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-fg">
              {comment.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
