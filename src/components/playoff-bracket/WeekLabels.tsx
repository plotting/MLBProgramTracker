
import React from "react";

interface WeekLabelsProps {
  weeks: (string | number)[];
}

const WeekLabels = ({ weeks }: WeekLabelsProps) => (
  <div className="flex gap-24 pr-24">
    {weeks.map((week, index) => (
      <span key={index} className="text-sm text-muted-foreground w-[240px] text-center">
        {week}
      </span>
    ))}
  </div>
);

export default WeekLabels;
