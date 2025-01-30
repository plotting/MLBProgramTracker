import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Seasons from "./pages/Seasons";
import WeeklyScores from "./pages/WeeklyScores";
import Records from "./pages/Records";
import TeamPage from "./pages/TeamPage";
import Trades from "./pages/Trades";
import Draft from "./pages/Draft";
import HeadToHead from "./pages/HeadToHead";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen p-6">
          <Navigation />
          <Routes>
            <Route path="/" element={<Seasons />} />
            <Route path="/weekly-scores" element={<WeeklyScores />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/head-to-head" element={<HeadToHead />} />
            <Route path="/records" element={<Records />} />
            <Route path="/team/:teamId" element={<TeamPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;