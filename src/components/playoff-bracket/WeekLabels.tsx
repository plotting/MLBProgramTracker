
import React from "react";

interface WeekLabelsProps {
  weeks: (string | number)[];
}

const WeekLabels = ({ weeks }: WeekLabelsProps) => (
  <div className="flex items-start pt-4 mb-6">
    {weeks.map((week, index) => (
      <div 
        key={index} 
        className="flex-1 text-center"
      >
        <span className="px-4 py-1.5 bg-primary/10 text-primary font-medium rounded-md inline-block">
          Week {week}
        </span>
      </div>
    ))}
  </div>
);

export default WeekLabels;
