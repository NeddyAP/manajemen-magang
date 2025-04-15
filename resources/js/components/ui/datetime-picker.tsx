import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type Locale, id } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Clock } from 'lucide-react';
import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DayPicker, useDayPicker, useNavigation } from 'react-day-picker';
import { Label } from '@/components/ui/label';

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(value: string, { max, min = 0, loop = false }: GetValidNumberConfig) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, '0');
  }

  return '00';
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
  let numericValue = parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return '00';
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

type Period = 'AM' | 'PM';

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours';

function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value);
    case 'seconds':
      return setSeconds(date, value);
    case 'hours':
      return setHours(date, value);
    case '12hours': {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return '00';
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case 'hours':
      return getValidHour(String(date.getHours()));
    case '12hours':
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return '00';
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step);
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step);
    case 'hours':
      return getValidArrowHour(value, step);
    case '12hours':
      return getValidArrow12Hour(value, step);
    default:
      return '00';
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === 'PM') {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === 'AM') {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return '12';
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

function genMonths(locale: Pick<Locale, 'options' | 'localize' | 'formatLong'>) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), 'MMMM', { locale }),
  }));
}

function genYears(yearRange = 50) {
  const today = new Date();
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: today.getFullYear() - yearRange + i,
    label: (today.getFullYear() - yearRange + i).toString(),
  }));
}

// ---------- utils end ----------

// ---------- Calendar Start ----------
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  yearRange?: number;
  locale?: Locale;
};

function Calendar({ className, classNames, showOutsideDays = true, yearRange = 50, locale = id, ...props }: CalendarProps) {
  const MONTHS = React.useMemo(() => genMonths(locale), [locale]);
  const YEARS = React.useMemo(() => genYears(yearRange), [yearRange]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption:
          'flex relative items-center justify-center pt-1 text-sm font-medium',
        caption_label:
          'flex items-center gap-1 text-sm font-medium [&>div]:flex [&>div]:items-center',
        caption_dropdowns: 'flex gap-1',
        nav: 'flex items-center gap-1',
        nav_button:
          cn(
            buttonVariants({ variant: 'outline' }),
            'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          ),
        nav_button_previous:'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground',
        row: 'mt-2 flex w-full',
        cell: 'relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-9 p-0 font-normal aria-selected:opacity-100',
        ),
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:'text-muted-foreground opacity-50',
        day_disabled:
          'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="size-4" />,
        IconRight: () => <ChevronRight className="size-4" />,
        Dropdown: () => {
          const { month } = useDayPicker();
          const { goToMonth } = useNavigation();

          if (!month) {
            return null;
          }

          return (
            <div className="flex gap-1">
              <Select
                value={month.getMonth().toString()}
                onValueChange={(value) => {
                  goToMonth(new Date(month.getFullYear(), parseInt(value), 1));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={month.getFullYear().toString()}
                onValueChange={(value) => {
                  goToMonth(new Date(parseInt(value), month.getMonth(), 1));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value.toString()}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      }}
      {...props}
      locale={locale}
    />
  );
}

Calendar.displayName = 'Calendar';
// ---------- Calendar End ----------

// ---------- TimePickerInput Start-----------
interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  period?: Period;
  date: Date | null;
  setDate: (date: Date | null | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ className, type = 'text', value, id, name, picker, date, setDate, onChange, onKeyDown, onRightFocus, onLeftFocus, period, ...props }, ref) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, [flag]);

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker);
    }, [date, picker]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        return;
      }
      e.preventDefault();
      if (e.key === 'ArrowRight') {
        onRightFocus?.();
      }
      if (e.key === 'ArrowLeft') {
        onLeftFocus?.();
      }
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = e.key === 'ArrowUp' ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) inputRef.current!.value = newValue;
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        setDate(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= '0' && e.key <= '9') {
        const newValue = calculatedValue === '00' ? e.key : calculatedValue + e.key;
        if (flag) inputRef.current!.value = newValue;
        const tempDate = date ? new Date(date) : new Date();
        setDate(setDateByType(tempDate, newValue, picker, period));
        setFlag((prev) => !prev);
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        setDate(undefined);
      }
      onKeyDown?.(e);
    };

    return (
      <Input
        ref={inputRef}
        id={id || picker}
        name={name || picker}
        className={cn(
          'w-[48px] text-center text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          className,
        )}
        value={value ?? calculatedValue}
        onChange={(e) => {
          e.preventDefault();
          const newValue = e.target.value;
          if (flag) inputRef.current!.value = newValue;
          const tempDate = date ? new Date(date) : new Date();
          setDate(setDateByType(tempDate, newValue, picker, period));
          setFlag((prev) => !prev);
          onChange?.(e);
        }}
        type={type}
        inputMode="numeric"
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        {...props}
      />
    );
  },
);

TimePickerInput.displayName = 'TimePickerInput';
// ---------- TimePickerInput End-----------

// ---------- TimePicker Start -----------
interface TimePickerProps {
  date: Date | null;
  onChange: (date: Date | null | undefined) => void;
  hourCycle?: 12 | 24;
  granularity?: 'hour' | 'minute' | 'second';
}

// Helper to generate number options padded with zero
const genTimeOptions = (max: number, step = 1) => {
    return Array.from({ length: Math.ceil(max / step) }, (_, i) => i * step)
        .map(v => ({
            value: v.toString(),
            label: v.toString().padStart(2, '0'),
        }));
};

const HOURS24 = genTimeOptions(24);
const HOURS12 = genTimeOptions(13, 1).slice(1); // 1-12
const MINUTES = genTimeOptions(60);
const SECONDS = genTimeOptions(60);

function TimePicker({ date, onChange, hourCycle = 24, granularity = 'second' }: TimePickerProps) {
  const [period, setPeriod] = React.useState<Period>(date ? (date.getHours() >= 12 ? 'PM' : 'AM') : 'AM');

  const handleHourChange = (value: string) => {
    const newDate = date ? new Date(date) : new Date();
    const hour = parseInt(value, 10);
    if (hourCycle === 12) {
        const adjustedHour = convert12HourTo24Hour(hour, period);
        newDate.setHours(adjustedHour);
    } else {
        newDate.setHours(hour);
    }
    onChange(newDate);
  };

  const handleMinuteChange = (value: string) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setMinutes(parseInt(value, 10));
    onChange(newDate);
  };

  const handleSecondChange = (value: string) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setSeconds(parseInt(value, 10));
    onChange(newDate);
  };

  const handlePeriodChange = () => {
      const newPeriod = period === 'AM' ? 'PM' : 'AM';
      setPeriod(newPeriod);
      const tempDate = date ? new Date(date) : new Date();
      const hours = tempDate.getHours();
      const newHours = convert12HourTo24Hour(hours % 12 === 0 ? 12 : hours % 12, newPeriod);
      tempDate.setHours(newHours);
      onChange?.(tempDate);
  };

  React.useEffect(() => {
    if (date) {
      const newPeriod = date.getHours() >= 12 ? 'PM' : 'AM';
      if (period !== newPeriod)
        setPeriod(newPeriod);
    }
     
  }, [date, period]);

  const currentHour = date ? date.getHours() : 0;
  const currentMinute = date ? date.getMinutes() : 0;
  const currentSecond = date ? date.getSeconds() : 0;

  const selectedHour12 = display12HourValue(currentHour);

  return (
    <div className="flex items-center gap-2">
        {/* Hour Select */}
        <div className="grid gap-1 text-center">
            <Label htmlFor="hours" className="text-xs">
                Jam
            </Label>
            <Select
                value={hourCycle === 12 ? selectedHour12 : currentHour.toString()}
                onValueChange={handleHourChange}
            >
                <SelectTrigger className="w-[60px]">
                    <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {(hourCycle === 12 ? HOURS12 : HOURS24).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Minute Select */}
        {(granularity === 'minute' || granularity === 'second') && (
            <div className="grid gap-1 text-center">
                <Label htmlFor="minutes" className="text-xs">
                    Menit
                </Label>
                <Select
                    value={currentMinute.toString()}
                    onValueChange={handleMinuteChange}
                >
                    <SelectTrigger className="w-[60px]">
                        <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {MINUTES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}

        {/* Second Select */}
        {granularity === 'second' && (
            <div className="grid gap-1 text-center">
                <Label htmlFor="seconds" className="text-xs">
                    Detik
                </Label>
                <Select
                    value={currentSecond.toString()}
                    onValueChange={handleSecondChange}
                >
                    <SelectTrigger className="w-[60px]">
                        <SelectValue placeholder="SS" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {SECONDS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}

        {/* AM/PM Toggle */}
        {hourCycle === 12 && (
            <div className="grid gap-1 text-center">
                <Label className="text-xs">&nbsp;</Label> {/* Spacer */}
                <Button
                    variant="outline"
                    className="w-12"
                    onClick={handlePeriodChange}
                >
                    {period}
                </Button>
            </div>
        )}
      <Clock className="ml-auto h-4 w-4" />
    </div>
  );
}
// ---------- TimePicker End -----------

type DateTimePickerProps = {
  value?: Date;
  defaultPopupValue?: Date;
  onChange?: (value: Date | undefined) => void;
  onMonthChange?: (value: Date) => void;
  hourCycle?: 12 | 24;
  granularity?: 'day' | 'hour' | 'minute' | 'second';
  yearRange?: number;
  displayFormat?: { hour24?: string; hour12?: string };
  placeholder?: string;
  locale?: Locale;
  className?: string;
  disabled?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof DayPicker>, 'onChange' | 'value' | 'locale' | 'selected' | 'month' | 'disabled' | 'mode'>;

export interface DateTimePickerRef {
  value?: Date;
}

const DateTimePicker = React.forwardRef<Partial<DateTimePickerRef>, DateTimePickerProps>(
  (
    {
      locale = id,
      defaultPopupValue = new Date(new Date().setHours(0, 0, 0, 0)),
      value,
      onChange,
      onMonthChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = 'second',
      placeholder = 'Pilih tanggal',
      className,
      ...dayPickerProps
    },
    ref,
  ) => {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(value ?? defaultPopupValue);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [displayDate, setDisplayDate] = React.useState<Date | undefined>(value ?? undefined);
    onMonthChange ||= onChange;

    React.useEffect(() => {
      setCurrentMonth(dayPickerProps?.defaultMonth ?? value ?? new Date());
      setDisplayDate(value);
    }, [value, dayPickerProps?.defaultMonth]);

    const handleMonthChange = (newMonth: Date) => {
      setCurrentMonth(newMonth);
    };

    const handleSelect = (day: Date | undefined) => {
      if (!day) {
        onChange?.(undefined);
        setDisplayDate(undefined);
        return;
      }

      const newSelectedDate = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        currentMonth.getHours(),
        currentMonth.getMinutes(),
        currentMonth.getSeconds()
      );

      onChange?.(newSelectedDate);
      setDisplayDate(newSelectedDate);
      setCurrentMonth(newSelectedDate);
    };

    useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value: displayDate,
      }),
      [displayDate],
    );

    const initHourFormat = {
      hour24:
        displayFormat?.hour24 ?? `PPP HH:mm${!granularity || granularity === 'second' ? ':ss' : ''}`,
      hour12:
        displayFormat?.hour12 ?? `PP hh:mm${!granularity || granularity === 'second' ? ':ss' : ''} b`,
    };

    const currentLocale = locale && typeof locale === 'object' && locale.code ? locale : id;

    return (
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !displayDate && 'text-muted-foreground',
              className,
            )}
            ref={buttonRef}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate ? (
              format(
                displayDate,
                hourCycle === 24 ? initHourFormat.hour24 : initHourFormat.hour12,
                {
                  locale: currentLocale,
                },
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={displayDate}
            month={currentMonth}
            onSelect={handleSelect}
            onMonthChange={handleMonthChange}
            yearRange={yearRange}
            locale={currentLocale}
            disabled={disabled}
            showOutsideDays
            {...dayPickerProps}
          />
          {granularity !== 'day' && (
            <div className="border-border border-t p-3">
              <TimePicker
                onChange={(timeValue) => {
                  const newDateTime = timeValue ?? displayDate ?? new Date();
                  if (timeValue) {
                    onChange?.(newDateTime);
                    setDisplayDate(newDateTime);
                    setCurrentMonth(newDateTime);
                  }
                }}
                date={currentMonth}
                hourCycle={hourCycle}
                granularity={granularity}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

DateTimePicker.displayName = 'DateTimePicker';

export { DateTimePicker, TimePickerInput, TimePicker };
export type { TimePickerType, DateTimePickerProps }; 