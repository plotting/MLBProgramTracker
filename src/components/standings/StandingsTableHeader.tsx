
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StandingsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px] text-center">#</TableHead>
        <TableHead className="w-[180px]">Team</TableHead>
        <TableHead className="text-center">Regular Season</TableHead>
        <TableHead className="text-center">Playoffs</TableHead>
        <TableHead className="text-center">PF</TableHead>
        <TableHead className="text-center">PA</TableHead>
        <TableHead className="text-center">Final</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default StandingsTableHeader;
