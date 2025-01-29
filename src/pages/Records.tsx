import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Records = () => {
  // Mock data - replace with real data later
  const seasonRecords = {
    highestScores: [
      { score: "198.5", owner: "John Doe", season: "13", week: "8" },
      { score: "195.2", owner: "Jane Smith", season: "12", week: "4" },
      // Add more...
    ],
    lowestScores: [
      { score: "45.2", owner: "Mike Johnson", season: "11", week: "3" },
      { score: "52.8", owner: "Sarah Wilson", season: "10", week: "7" },
      // Add more...
    ],
  };

  const careerRecords = {
    totalPoints: [
      { points: "15234.5", owner: "John Doe", seasons: "1-13" },
      { points: "14987.2", owner: "Jane Smith", seasons: "1-13" },
      // Add more...
    ],
    winningStreaks: [
      { streak: "12", owner: "Mike Johnson", seasons: "11-12" },
      { streak: "10", owner: "Sarah Wilson", seasons: "9-10" },
      // Add more...
    ],
  };

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">League Records</h1>
        <p className="text-muted-foreground">Historical achievements and statistics</p>
      </header>

      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scoring">Scoring Records</TabsTrigger>
          <TabsTrigger value="career">Career Records</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="trades">Trade Records</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Highest Weekly Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasonRecords.highestScores.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score}</TableCell>
                      <TableCell>{record.owner}</TableCell>
                      <TableCell>{record.season}</TableCell>
                      <TableCell>{record.week}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Lowest Weekly Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasonRecords.lowestScores.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score}</TableCell>
                      <TableCell>{record.owner}</TableCell>
                      <TableCell>{record.season}</TableCell>
                      <TableCell>{record.week}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="career">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Career Points</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Points</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Seasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {careerRecords.totalPoints.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.points}</TableCell>
                      <TableCell>{record.owner}</TableCell>
                      <TableCell>{record.seasons}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Winning Streaks</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Streak</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Seasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {careerRecords.winningStreaks.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.streak}</TableCell>
                      <TableCell>{record.owner}</TableCell>
                      <TableCell>{record.seasons}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs will be implemented in future updates */}
        <TabsContent value="streaks">
          <Card className="p-6">
            <p className="text-muted-foreground">Streak records coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card className="p-6">
            <p className="text-muted-foreground">Trade records coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;
