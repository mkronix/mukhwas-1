import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { CaptionProps, DayPicker, useNavigation } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export type CalendarVariant = "single" | "double" | "multiple";

export type CalendarProps = {
  variant?: CalendarVariant;

  onSingleConfirm?: (date: Date | undefined) => void;
  onSingleCancel?: () => void;

  onDoubleConfirm?: (dates: [Date | undefined, Date | undefined]) => void;
  onDoubleCancel?: () => void;

  onMultipleConfirm?: (dates: Date[]) => void;
  onMultipleCancel?: () => void;

  disabledDate?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
};


function CalendarCaption({ displayMonth }: CaptionProps) {
  const { goToMonth } = useNavigation();

  const month = displayMonth.getMonth();
  const year = displayMonth.getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString("default", { month: "short" }),
  }));

  const years = Array.from({ length: 101 }, (_, i) => {
    const y = year - 50 + i;
    return { value: y.toString(), label: y.toString() };
  });

  return (
    <div className="flex items-center justify-between px-2 mb-2">
      <button
        type="button"
        onClick={() => goToMonth(new Date(year, month - 1))}
        className={cn(buttonVariants({ variant: "outline" }), "h-9 w-9 p-0")}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex gap-3">
        <Select
          value={month.toString()}
          onValueChange={(v) => goToMonth(new Date(year, Number(v)))}
        >
          <SelectTrigger className="h-9 w-[80px] text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(v) => goToMonth(new Date(Number(v), month))}
        >
          <SelectTrigger className="h-9 w-[100px] text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {years.map((y) => (
              <SelectItem key={y.value} value={y.value}>
                {y.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={() => goToMonth(new Date(year, month + 1))}
        className={cn(buttonVariants({ variant: "outline" }), "h-9 w-9 p-0")}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

const sharedClassNames = {
  months: "space-y-4",
  caption: "relative flex justify-center items-center",
  table: "w-full border-collapse",
  head_row: "flex",
  head_cell: "w-10 text-xs text-muted-foreground font-medium",
  row: "flex w-full mt-[2px]",
  cell: "relative h-10 w-10 p-0 text-center text-sm focus-within:z-20",
  day: cn(
    buttonVariants({ variant: "ghost" }),
    "h-10 w-10 p-0 font-normal aria-selected:opacity-100 text-sm",
  ),
  day_selected: "bg-primary text-primary-foreground hover:bg-primary",
  day_today: "bg-accent text-accent-foreground",
  day_outside: "text-muted-foreground opacity-50",
  day_disabled: "text-muted-foreground opacity-50",
};

function ActionButtons({
  onConfirm,
  onCancel,
  confirmLabel = "Done",
}: {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-3 border-t mt-2">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  );
}


function SingleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  onSingleConfirm,
  onSingleCancel,
  disabledDate,
  minDate,
  maxDate,
}: CalendarProps) {
  const [selected, setSelected] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(
    controlledMonth ?? defaultMonth,
  );

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDate?.(date) ?? false;
  };

  return (
    <div className={cn("p-4", className)}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => {
          setSelected(date);
          onSingleConfirm?.(date);
        }}
        showOutsideDays={showOutsideDays}
        month={controlledMonth ?? month}
        onMonthChange={(m) => {
          if (!controlledMonth) setMonth(m);
          onMonthChange?.(m);
        }}
        disabled={isDisabled}
        classNames={{ ...sharedClassNames, ...classNames }}
        components={{ Caption: CalendarCaption }}
      />
      <ActionButtons
        onConfirm={() => onSingleConfirm?.(selected)}
        onCancel={() => {
          setSelected(undefined);
          onSingleCancel?.();
        }}
      />
    </div>
  );
}


function DoubleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  onDoubleConfirm,
  onDoubleCancel,
  disabledDate,
  minDate,
  maxDate,
}: CalendarProps) {
  const [dates, setDates] = React.useState<[Date | undefined, Date | undefined]>(
    [undefined, undefined],
  );
  const [month, setMonth] = React.useState<Date | undefined>(
    controlledMonth ?? defaultMonth,
  );

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDate?.(date) ?? false;
  };

  const handleSelect = (date: Date | undefined) => {
    setDates((prev) => {
      if (!prev[0] && !prev[1]) return [date, undefined];
      if (prev[0] && !prev[1]) {
        if (date && prev[0] && date < prev[0]) return [date, prev[0]];
        return [prev[0], date];
      }
      return [date, undefined];
    });
  };

  const selectedDays = dates.filter(Boolean) as Date[];
  const modifiers =
    dates[0] && dates[1]
      ? {
        range_middle: {
          after: dates[0],
          before: dates[1],
        },
      }
      : {};

  return (
    <div className={cn("p-4", className)}>
      <DayPicker
        mode="single"
        selected={undefined}
        onSelect={handleSelect}
        showOutsideDays={showOutsideDays}
        month={controlledMonth ?? month}
        onMonthChange={(m) => {
          if (!controlledMonth) setMonth(m);
          onMonthChange?.(m);
        }}
        disabled={isDisabled}
        modifiers={{
          selected: selectedDays,
          ...modifiers,
        }}
        modifiersClassNames={{
          selected: "bg-primary text-primary-foreground hover:bg-primary",
          range_middle: "bg-primary/20 rounded-none",
        }}
        classNames={{ ...sharedClassNames, ...classNames }}
        components={{ Caption: CalendarCaption }}
      />
      <div className="text-xs text-muted-foreground px-1 pb-2">
        {!dates[0]
          ? "Pick first date"
          : !dates[1]
            ? "Pick second date"
            : `${dates[0].toLocaleDateString()} → ${dates[1].toLocaleDateString()}`}
      </div>
      <ActionButtons
        onConfirm={() => onDoubleConfirm?.(dates)}
        onCancel={() => {
          setDates([undefined, undefined]);
          onDoubleCancel?.();
        }}
      />
    </div>
  );
}

function MultipleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  onMultipleConfirm,
  onMultipleCancel,
  disabledDate,
  minDate,
  maxDate,
}: CalendarProps) {
  const [selected, setSelected] = React.useState<Date[]>([]);
  const [month, setMonth] = React.useState<Date | undefined>(
    controlledMonth ?? defaultMonth,
  );

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDate?.(date) ?? false;
  };

  return (
    <div className={cn("p-4", className)}>
      <DayPicker
        mode="multiple"
        selected={selected}
        onSelect={(days) => setSelected(days ?? [])}
        showOutsideDays={showOutsideDays}
        month={controlledMonth ?? month}
        onMonthChange={(m) => {
          if (!controlledMonth) setMonth(m);
          onMonthChange?.(m);
        }}
        disabled={isDisabled}
        classNames={{ ...sharedClassNames, ...classNames }}
        components={{ Caption: CalendarCaption }}
      />
      <div className="text-xs text-muted-foreground px-1 pb-2">
        {selected.length === 0
          ? "No dates selected"
          : `${selected.length} date${selected.length > 1 ? "s" : ""} selected`}
      </div>
      <ActionButtons
        onConfirm={() => onMultipleConfirm?.(selected)}
        onCancel={() => {
          setSelected([]);
          onMultipleCancel?.();
        }}
        confirmLabel={`Done${selected.length > 0 ? ` (${selected.length})` : ""}`}
      />
    </div>
  );
}

function Calendar({ variant = "single", ...props }: CalendarProps) {
  if (variant === "double") return <DoubleCalendar {...props} />;
  if (variant === "multiple") return <MultipleCalendar {...props} />;
  return <SingleCalendar {...props} />;
}

Calendar.displayName = "Calendar";
export { Calendar };