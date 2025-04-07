
import React from "react";

interface WeekLabelsProps {
  weeks: number[];
}

const WeekLabels: React.FC<WeekLabelsProps> = ({ weeks }) => {
  return (
    <div className={`grid grid-cols-${weeks.length} gap-8 mb-4`}>
      {weeks.map((week, index) => (
        <div key={`week-${week}`} className="text-center font-semibold text-lg">
          Week {week}
        </div>
      ))}
    </div>
  );
};

export default WeekLabels;
