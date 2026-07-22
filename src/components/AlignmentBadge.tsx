import { StarMark } from "./StarMark";
import { AlertTriangle, XCircle } from "lucide-react";

interface AlignmentBadgeProps {
  verdict: string;
  reason?: string;
  alternative?: string | null;
}

const CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  aligned: { label: "Aligned", color: "text-gold-400", bg: "bg-gold-400/10" },
  partially_aligned: { label: "Partially aligned", color: "text-warn", bg: "bg-warn/10" },
  misaligned: { label: "Misaligned", color: "text-danger", bg: "bg-danger/10" },
};

export function AlignmentBadge({ verdict, reason, alternative }: AlignmentBadgeProps) {
  const cfg = CONFIG[verdict] ?? CONFIG.aligned;

  return (
    <div className={`rounded-lg border border-border ${cfg.bg} px-4 py-3 mb-3`}>
      <div className={`flex items-center gap-2 text-sm font-medium ${cfg.color}`}>
        {verdict === "aligned" && <StarMark size={14} />}
        {verdict === "partially_aligned" && <AlertTriangle size={14} />}
        {verdict === "misaligned" && <XCircle size={14} />}
        {cfg.label}
      </div>
      {reason && <p className="text-sm text-ink-muted mt-1.5">{reason}</p>}
      {alternative && (
        <p className="text-sm text-ink mt-2">
          <span className="font-medium">Alternative: </span>
          {alternative}
        </p>
      )}
    </div>
  );
}
