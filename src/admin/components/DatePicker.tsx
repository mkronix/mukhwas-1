import React from 'react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
}) => {
  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const valid = parsed && !isNaN(parsed.getTime()) ? parsed : undefined;

  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-9 text-[13px]',
            !valid && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {valid ? format(valid, 'dd MMM yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          variant="single"
          defaultMonth={valid}
          onSingleConfirm={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : '');
            setOpen(false);
          }}
          onSingleCancel={() => {
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};