"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Add year/month dropdown for quick navigation
  const currentYear = new Date().getFullYear();
  const fromYear = props.fromYear ?? 1900;
  const toYear = props.toYear ?? currentYear;

  // State to control the displayed month
  const [month, setMonth] = React.useState<Date>(
    props.month ?? props.defaultMonth ?? new Date()
  );

  // State for custom year dropdown
  const [yearDropdownOpen, setYearDropdownOpen] = React.useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = React.useState(false);
  const yearDropdownRef = React.useRef<HTMLDivElement>(null);
  const monthDropdownRef = React.useRef<HTMLDivElement>(null);

  // Generate all years
  const allYears = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => toYear - i
  );

  // Sync internal month state with props
  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month);
    }
  }, [props.month]);

  // Close year dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setMonthDropdownOpen(false);
      }
    };

    if (yearDropdownOpen || monthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [yearDropdownOpen, monthDropdownOpen]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month}
      onMonthChange={(newMonth) => {
        setMonth(newMonth);
        props.onMonthChange?.(newMonth);
      }}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 relative",
        caption: "flex justify-center pt-1 relative items-center px-10 min-h-[32px]",
        caption_label: "text-sm font-medium z-10",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between pointer-events-none px-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto z-20"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-center",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2 justify-center",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
        CaptionLabel: () => {
          const monthNames = Array.from({ length: 12 }, (_, i) =>
            new Date(0, i).toLocaleString("default", { month: "long" })
          );
          
          return (
            <div className="flex items-center gap-2 justify-center">
              {/* Custom Month Dropdown */}
              <div className="relative" ref={monthDropdownRef}>
                <button
                  type="button"
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[110px] text-left flex items-center justify-between"
                  onClick={() => {
                    setMonthDropdownOpen(!monthDropdownOpen);
                    setYearDropdownOpen(false);
                  }}
                >
                  <span>{monthNames[month.getMonth()]}</span>
                  <ChevronDown className={`h-3 w-3 ml-2 transition-transform ${monthDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                
                {monthDropdownOpen && (
                  <div className="absolute z-50 mt-1 border border-gray-200 rounded-md bg-white shadow-lg max-h-[288px] overflow-y-auto w-full">
                    {monthNames.map((monthName, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          index === month.getMonth() ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          const newDate = new Date(month);
                          newDate.setMonth(index);
                          setMonth(newDate);
                          props.onMonthChange?.(newDate);
                          setMonthDropdownOpen(false);
                        }}
                      >
                        {monthName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Custom Year Dropdown */}
              <div className="relative" ref={yearDropdownRef}>
                <button
                  type="button"
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[70px] text-left flex items-center justify-between"
                  onClick={() => {
                    setYearDropdownOpen(!yearDropdownOpen);
                    setMonthDropdownOpen(false);
                  }}
                >
                  <span>{month.getFullYear()}</span>
                  <ChevronDown className={`h-3 w-3 ml-2 transition-transform ${yearDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                
                {yearDropdownOpen && (
                  <div className="absolute z-50 mt-1 border border-gray-200 rounded-md bg-white shadow-lg max-h-[288px] overflow-y-auto w-full">
                    {allYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          year === month.getFullYear() ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          const newDate = new Date(month);
                          newDate.setFullYear(year);
                          setMonth(newDate);
                          props.onMonthChange?.(newDate);
                          setYearDropdownOpen(false);
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
