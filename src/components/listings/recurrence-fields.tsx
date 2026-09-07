"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MONTHLY_NTH_OPTIONS,
  RECURRENCE_PRESETS,
  WEEKDAY_OPTIONS,
  parseRecurrenceRule,
  serializeRecurrenceRule,
  type ParsedRecurrence,
  type RecurrencePreset,
} from "@/lib/recurrence";

interface RecurrenceFieldsProps {
  value: string;
  onChange: (rule: string) => void;
  optional?: boolean;
}

export function RecurrenceFields({ value, onChange, optional = true }: RecurrenceFieldsProps) {
  const parsed = parseRecurrenceRule(value);

  function commit(next: ParsedRecurrence) {
    onChange(serializeRecurrenceRule(next));
  }

  const presets = optional
    ? RECURRENCE_PRESETS
    : RECURRENCE_PRESETS.filter((p) => p.value !== "none");

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-ink-muted">Repeats</p>
        <p className="text-xs text-ink-muted mt-0.5">
          Pick a cadence, or choose Other to describe it yourself.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => commit({ ...parsed, preset: preset.value as RecurrencePreset })}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              parsed.preset === preset.value
                ? "bg-sage text-white"
                : "bg-white border border-stone/60 text-ink-muted hover:text-ink hover:border-sage/40"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {parsed.preset === "daily" && (
        <TimeField
          label="Time"
          value={parsed.time}
          onChange={(time) => commit({ ...parsed, time })}
        />
      )}

      {parsed.preset === "weekly" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Day"
            value={parsed.weekday}
            onChange={(weekday) =>
              commit({ ...parsed, weekday: weekday as ParsedRecurrence["weekday"] })
            }
            options={WEEKDAY_OPTIONS}
          />
          <TimeField
            label="Time"
            value={parsed.time}
            onChange={(time) => commit({ ...parsed, time })}
          />
        </div>
      )}

      {parsed.preset === "monthly" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField
            label="Which"
            value={parsed.nth}
            onChange={(nth) => commit({ ...parsed, nth: nth as ParsedRecurrence["nth"] })}
            options={MONTHLY_NTH_OPTIONS}
          />
          <SelectField
            label="Day"
            value={parsed.weekday}
            onChange={(weekday) =>
              commit({ ...parsed, weekday: weekday as ParsedRecurrence["weekday"] })
            }
            options={WEEKDAY_OPTIONS}
          />
          <TimeField
            label="Time"
            value={parsed.time}
            onChange={(time) => commit({ ...parsed, time })}
          />
        </div>
      )}

      {parsed.preset === "custom" && (
        <div>
          <label className="text-sm text-ink-muted">Describe the schedule</label>
          <Input
            className="mt-1"
            value={parsed.custom}
            onChange={(e) => commit({ ...parsed, custom: e.target.value })}
            placeholder="Every other Friday after school"
          />
        </div>
      )}
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-ink-muted">{label}</label>
      <Input
        type="time"
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value || "09:00")}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm text-ink-muted">{label}</label>
      <select
        className="mt-1 w-full rounded-xl border border-stone bg-white px-4 py-2.5 text-ink"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
