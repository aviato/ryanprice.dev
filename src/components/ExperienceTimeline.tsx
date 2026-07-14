import { useRef, useState } from "react";
import { JOBS } from "../content";

/** "Jul 2025 — Feb 2026" → "’25–’26"; single year → "’24". */
function shortPeriod(dates: string): string {
  const years = dates.match(/\d{4}/g);
  if (!years || !years.length) return "";
  const a = years[0].slice(2);
  const b = years[years.length - 1].slice(2);
  return a === b ? `’${a}` : `’${a}–’${b}`;
}

/**
 * Experience as an interactive timeline (newest → oldest). The job list is a
 * vertical tablist styled as connected timeline nodes; selecting one shows its
 * detail in the panel. Defaults to the latest role. Collapsing six stacked jobs
 * into one timeline + one detail keeps the section within a single viewport, so
 * the line engine can frame it cleanly (no more giant scroll region).
 */
export default function ExperienceTimeline() {
  const [sel, setSel] = useState(0); // 0 = latest (JOBS is newest → oldest)
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const job = JOBS[sel];

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = sel;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(JOBS.length - 1, sel + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, sel - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = JOBS.length - 1;
    else return;
    e.preventDefault();
    setSel(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="xp-timeline">
      <div
        className="tl-list"
        role="tablist"
        aria-label="Work history"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {JOBS.map((j, i) => (
          <button
            key={i}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`xp-tab-${i}`}
            aria-selected={i === sel}
            aria-controls="xp-panel"
            tabIndex={i === sel ? 0 : -1}
            className={`tl-node ${i === sel ? "active" : ""}`}
            onClick={() => setSel(i)}
          >
            <span className="tl-dot" aria-hidden="true" />
            <span className="tl-label">
              <span className="tl-co">{j.company}</span>
              {j.note && <span className="tl-note">{j.note}</span>}
            </span>
            <span className="tl-when">{shortPeriod(j.dates)}</span>
          </button>
        ))}
      </div>

      <div
        className="tl-detail"
        id="xp-panel"
        role="tabpanel"
        aria-labelledby={`xp-tab-${sel}`}
        tabIndex={0}
      >
        {/* key remounts the content so it fades in on each selection */}
        <div className="tl-detail-in" key={sel}>
          <h3 className="tl-title">{job.title}</h3>
          <p className="tl-dates">
            {job.company} · {job.dates}
          </p>
          <p className="tl-blurb">{job.blurb}</p>
        </div>
      </div>
    </div>
  );
}
