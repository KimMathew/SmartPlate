"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Share, Printer } from "lucide-react";

export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date());

  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const mealTypes = ["breakfast", "lunch", "dinner"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meal Scheduling</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          Weekly View
        </Button>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const prevWeek = new Date(date);
              prevWeek.setDate(date.getDate() - 7);
              setDate(prevWeek);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const nextWeek = new Date(date);
              nextWeek.setDate(date.getDate() + 7);
              setDate(nextWeek);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r"></div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-4 text-center border-r last:border-r-0"
            >
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${day.toDateString() === new Date().toDateString() ? 'text-emerald-500' : ''
                }`}>
                {day.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          {mealTypes.map((mealType) => (
            <React.Fragment key={mealType}>
              <div className="p-4 border-r border-b flex items-center">
                <span className="capitalize text-sm text-gray-600">{mealType}</span>
              </div>
              {weekDays.map((_, dayIndex) => (
                <div
                  key={`${mealType}-${dayIndex}`}
                  className="p-4 border-r border-b last:border-r-0"
                >
                  <Button
                    variant="outline"
                    className="w-full h-full min-h-[60px] border-dashed"
                  >
                    + Add {mealType}
                  </Button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
