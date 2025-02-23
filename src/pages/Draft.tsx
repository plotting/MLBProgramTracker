
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Draft = () => {
  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Draft Central</h1>
            <p className="text-muted-foreground">View draft picks across all seasons</p>
          </div>
        </div>
      </header>

      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">View Draft History</h2>
          <p className="text-muted-foreground mb-6">
            Track all draft picks across seasons with our comprehensive draft history view
          </p>
          <Link to="/draft-history">
            <Button size="lg">
              View Draft History
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Draft;
