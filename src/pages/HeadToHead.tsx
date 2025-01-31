import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Link } from "react-router-dom";

const HeadToHead = () => {
  const [selectedTeam, setSelectedTeam] = useState("1");

  // Mock data - replace with real data later
  const headToHeadRecords = {
    regularSeason: [
      { teamId: "2", team: "Team 2", wins: 8, losses: 4, ties: 0, pointsFor: 1245.6, pointsAgainst: 1198.2 },
      { teamId: "3", team: "Team 3", wins: 6, losses: 6, ties: 0, pointsFor: 1322.4, pointsAgainst: 1287.8 },
      // Add more teams...
    ],
    playoffs: [
      { teamId: "2", team: "Team 2", wins: 2, losses: 1, ties: 0, pointsFor: 428.6, pointsAgainst: 398.4 },
      { teamId: "3", team: "Team 3", wins: 1, losses: 2, ties: 0, pointsFor: 387.2, pointsAgainst: 412.6 },
      // Add more teams...
    ],
  };

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Head to Head Records</h1>
            <p className="text-muted-foreground">View historical matchup records between teams</p>
          </div>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Team 1</SelectItem>
              <SelectItem value="2">Team 2</SelectItem>
              <SelectItem value="3">Team 3</SelectItem>
              {/* Add more teams */}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Tabs defaultValue="regular" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regular">Regular Season</TabsTrigger>
          <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
          <TabsTrigger value="combined">Combined</TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Regular Season Records</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Win %</TableHead>
                  <TableHead>Points For</TableHead>
                  <TableHead>Points Against</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headToHeadRecords.regularSeason.map((record) => (
                  <TableRow key={record.teamId}>
                    <TableCell>
                      <Link to={`/team/${record.teamId}`} className="text-primary hover:underline">
                        {record.team}
                      </Link>
                    </TableCell>
                    <TableCell>{`${record.wins}-${record.losses}-${record.ties}`}</TableCell>
                    <TableCell>
                      {((record.wins / (record.wins + record.losses + record.ties)) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>{record.pointsFor.toFixed(1)}</TableCell>
                    <TableCell>{record.pointsAgainst.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="playoffs">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Playoff Records</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Win %</TableHead>
                  <TableHead>Points For</TableHead>
                  <TableHead>Points Against</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headToHeadRecords.playoffs.map((record) => (
                  <TableRow key={record.teamId}>
                    <TableCell>
                      <Link to={`/team/${record.teamId}`} className="text-primary hover:underline">
                        {record.team}
                      </Link>
                    </TableCell>
                    <TableCell>{`${record.wins}-${record.losses}-${record.ties}`}</TableCell>
                    <TableCell>
                      {((record.wins / (record.wins + record.losses + record.ties)) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>{record.pointsFor.toFixed(1)}</TableCell>
                    <TableCell>{record.pointsAgainst.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="combined">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Combined Records</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Win %</TableHead>
                  <TableHead>Points For</TableHead>
                  <TableHead>Points Against</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headToHeadRecords.regularSeason.map((record) => {
                  const playoffRecord = headToHeadRecords.playoffs.find(
                    (p) => p.teamId === record.teamId
                  );
                  const totalWins = record.wins + (playoffRecord?.wins || 0);
                  const totalLosses = record.losses + (playoffRecord?.losses || 0);
                  const totalTies = record.ties + (playoffRecord?.ties || 0);
                  const totalPointsFor = record.pointsFor + (playoffRecord?.pointsFor || 0);
                  const totalPointsAgainst = record.pointsAgainst + (playoffRecord?.pointsAgainst || 0);

                  return (
                    <TableRow key={record.teamId}>
                      <TableCell>
                        <Link to={`/team/${record.teamId}`} className="text-primary hover:underline">
                          {record.team}
                        </Link>
                      </TableCell>
                      <TableCell>{`${totalWins}-${totalLosses}-${totalTies}`}</TableCell>
                      <TableCell>
                        {((totalWins / (totalWins + totalLosses + totalTies)) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{totalPointsFor.toFixed(1)}</TableCell>
                      <TableCell>{totalPointsAgainst.toFixed(1)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeadToHead;