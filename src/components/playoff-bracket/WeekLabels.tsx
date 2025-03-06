
import React from "react";

interface WeekLabelsProps {
  weeks: (string | number)[];
}

const WeekLabels = ({ weeks }: WeekLabelsProps) => (
  <div className="flex items-start pt-10">
    {weeks.map((week, index) => (
      <div 
        key={index} 
        className="w-[240px] flex justify-center"
      >
        <span className="text-sm font-medium px-3 py-1 bg-muted rounded-md">
          Week {week}
        </span>
      </div>
    ))}
  </div>
);

export default WeekLabels;
