import { useEffect, useRef, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeToAmPm, convertTo24Hour, parse24HourTime } from '@/lib/timeUtils';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  /** Value in "HH:MM" 24-hour format */
  value: string;
  onChange: (time: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const ITEM_HEIGHT = 48;

const TimePicker = ({ value, onChange, className = '', disabled = false, placeholder = 'Select time' }: TimePickerProps) => {
  const { hours12, minutes, period } = parse24HourTime(value);
  const [selectedHour, setSelectedHour] = useState(hours12);
  const [selectedMinute, setSelectedMinute] = useState(minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(period);
  const [isOpen, setIsOpen] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hoursArray = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  const scrollToSelected = useCallback((ref: React.RefObject<HTMLDivElement | null>, index: number) => {
    if (ref.current) {
      const scrollPosition = index * ITEM_HEIGHT - ref.current.clientHeight / 2 + ITEM_HEIGHT / 2;
      ref.current.scrollTop = scrollPosition;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const hourIndex = selectedHour - 1;
      setTimeout(() => {
        scrollToSelected(hourRef, hourIndex);
        scrollToSelected(minuteRef, selectedMinute);
      }, 50);
    }
  }, [isOpen, scrollToSelected, selectedHour, selectedMinute]);

  useEffect(() => {
    const { hours12: h, minutes: m, period: p } = parse24HourTime(value);
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
  }, [value]);

  const handleScroll = useCallback((
    ref: React.RefObject<HTMLDivElement | null>,
    setter: (value: number) => void,
    items: number[]
  ) => {
    if (!ref.current) return;
    const container = ref.current;
    const scrollTop = container.scrollTop;
    const centerOffset = container.clientHeight / 2;
    const index = Math.round((scrollTop + centerOffset - ITEM_HEIGHT / 2) / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    setter(items[clampedIndex]);
  }, []);

  const handleDone = () => {
    onChange(convertTo24Hour(selectedHour, selectedMinute, selectedPeriod));
    setIsOpen(false);
  };

  const handleCancel = () => {
    const { hours12: h, minutes: m, period: p } = parse24HourTime(value);
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
    setIsOpen(false);
  };

  const renderColumn = (
    items: number[],
    selected: number,
    setter: (value: number) => void,
    ref: React.RefObject<HTMLDivElement | null>,
    label: string
  ) => (
    <div className="flex flex-col items-center flex-1">
      <span className="text-xs font-medium text-muted-foreground mb-1">{label}</span>
      <div className="relative h-[192px] w-full overflow-hidden">
        {/* Selection indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-primary/10 border-y border-primary/20 rounded-md z-0 pointer-events-none" />
        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        {/* Scrollable column */}
        <div
          ref={ref}
          onScroll={() => handleScroll(ref, setter, items)}
          className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          <div style={{ height: `${ITEM_HEIGHT * 2}px` }} />
          {items.map((item, index) => {
            const selectedIndex = items.indexOf(selected);
            const distance = Math.abs(index - selectedIndex);
            const opacity = Math.max(0.2, 1 - distance * 0.25);
            const scale = Math.max(0.75, 1 - distance * 0.08);

            return (
              <div
                key={item}
                className="h-12 flex items-center justify-center snap-center cursor-pointer"
                onClick={() => { setter(item); scrollToSelected(ref, index); }}
              >
                <span
                  className={cn(
                    'text-lg font-semibold transition-all duration-150',
                    item === selected ? 'text-primary' : 'text-muted-foreground'
                  )}
                  style={{ opacity, transform: `scale(${scale})` }}
                >
                  {String(item).padStart(2, '0')}
                </span>
              </div>
            );
          })}
          <div style={{ height: `${ITEM_HEIGHT * 2}px` }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('relative', className)}>
      {/* Input Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 bg-secondary border border-border rounded-lg transition-colors text-left',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/80 cursor-pointer'
        )}
      >
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className={cn('text-sm', value ? 'text-foreground' : 'text-muted-foreground')}>
          {value ? formatTimeToAmPm(value) : placeholder}
        </span>
      </button>

      {/* Picker Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleCancel} />

          {/* Picker Container */}
          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:w-full">
            <div className="bg-background border border-border rounded-t-2xl sm:rounded-2xl shadow-lg overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <h3 className="text-sm font-semibold text-foreground">Select Time</h3>
                <button
                  type="button"
                  onClick={handleDone}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Done
                </button>
              </div>

              {/* Picker */}
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-2">
                  {renderColumn(hoursArray, selectedHour, setSelectedHour, hourRef, 'Hour')}
                  <div className="text-2xl font-bold text-foreground mt-5">:</div>
                  {renderColumn(minutesArray, selectedMinute, setSelectedMinute, minuteRef, 'Minute')}

                  {/* AM/PM selector */}
                  <div className="flex flex-col gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('AM')}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                        selectedPeriod === 'AM'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      )}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('PM')}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                        selectedPeriod === 'PM'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      )}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Selected time display */}
                <div className="flex justify-center pt-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    Selected:
                    <span className="font-semibold text-foreground">
                      {selectedHour}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimePicker;
