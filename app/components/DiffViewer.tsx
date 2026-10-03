"use client";

import { type DiffLine } from "../data/demos";

interface Props {
  lines: DiffLine[];
  title: string;
  compact?: boolean;
}

export default function DiffViewer({ lines, title, compact = false }: Props) {
  const getLineStyle = (type: DiffLine["type"]) => {
    switch (type) {
        case "added":
        return {
          rowBg: "rgba(15,118,110,0.06)",
          borderLeft: "2px solid var(--sev-safe)",
          gutterBg: "rgba(15,118,110,0.04)",
          gutterColor: "var(--sev-safe)",
          sign: "+",
          textColor: "#0f766e",
        };
      case "removed":
        return {
          rowBg: "rgba(180,35,24,0.06)",
          borderLeft: "2px solid var(--sev-critical)",
          gutterBg: "rgba(180,35,24,0.04)",
          gutterColor: "var(--sev-critical)",
          sign: "-",
          textColor: "#b42318",
        };
      case "context":
      default:
        return {
          rowBg: "transparent",
          borderLeft: "2px solid transparent",
          gutterBg: "transparent",
          gutterColor: "var(--text-faint)",
          sign: " ",
          textColor: "var(--text-code)",
        };
    }
  };

  const added = lines.filter((l) => l.type === "added").length;
  const removed = lines.filter((l) => l.type === "removed").length;
  const unchanged = lines.filter((l) => l.type === "context" || l.type === "unchanged").length;
  const lineFont = compact ? 10 : 12;
  const rowMinH = compact ? 18 : 26;
  const previewNote = lines.find((l) => /chunk\(s\) differ/i.test(l.content));
  const displayLines = previewNote
    ? lines.filter((l) => l !== previewNote)
    : lines;

  return (
    <div className="byte-diff">
      <div className="byte-diff-head">
        <span className="byte-diff-title">{title}</span>
        <div className="byte-diff-counts report-mono">
          <span className="is-add">+{added}</span>
          <span className="is-remove">−{removed}</span>
          <span className="is-ctx">{unchanged} ctx</span>
        </div>
      </div>

      {previewNote && (
        <p className="byte-diff-limit">{previewNote.content}</p>
      )}

      <div className="byte-diff-frame code-block">
        <div className="byte-diff-scroll">
          <div className="byte-diff-header-row">
            <div className="byte-diff-gutter-head" style={{ width: compact ? 36 : 44 }}>
              Old
            </div>
            <div className="byte-diff-gutter-head" style={{ width: compact ? 36 : 44 }}>
              New
            </div>
            <div className="byte-diff-sign-head" style={{ width: compact ? 18 : 24 }} />
            <div className="byte-diff-content-head">Content</div>
          </div>

          {displayLines.map((line, i) => {
            const s = getLineStyle(line.type);
            return (
              <div
                key={i}
                className="byte-diff-row"
                style={{
                  background: s.rowBg,
                  borderLeft: s.borderLeft,
                  minHeight: rowMinH,
                }}
              >
                <div
                  className="byte-diff-gutter"
                  style={{
                    width: compact ? 36 : 44,
                    background: s.gutterBg,
                    fontSize: compact ? 9 : 11,
                  }}
                >
                  {line.type === "added" ? "" : line.lineA ?? ""}
                </div>
                <div
                  className="byte-diff-gutter"
                  style={{
                    width: compact ? 36 : 44,
                    background: s.gutterBg,
                    fontSize: compact ? 9 : 11,
                  }}
                >
                  {line.type === "removed" ? "" : line.lineB ?? ""}
                </div>
                <div
                  className="byte-diff-sign"
                  style={{
                    width: compact ? 18 : 24,
                    background: s.gutterBg,
                    color: s.gutterColor,
                    fontSize: compact ? 10 : 12.5,
                  }}
                >
                  {s.sign}
                </div>
                <div
                  className="byte-diff-content"
                  style={{
                    fontSize: lineFont,
                    color: s.textColor,
                  }}
                >
                  {line.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
