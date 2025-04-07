
import React from "react";

interface WeekLabelsProps {
  weeks: number[];
}

const WeekLabels: React.FC<WeekLabelsProps> = ({ weeks }) => {
  return (
    <div className="flex justify-between mb-4">
      {weeks.map((week, index) => (
        <div key={`week-${week}`} className="text-center font-semibold text-lg flex-1">
          Week {week}
        </div>
      ))}
    </div>
  );
};

export default WeekLabels;
