
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/database";

const Navigation = () => {
  const isMobile = useIsMobile();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      console.log('Fetching teams...');
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      console.log('Teams loaded:', data);
      if (!data || data.length === 0) {
        console.log('No teams found in the database');
      }
      return data as Team[];
    },
  });

  const links = [
    { to: "/", label: "Seasons" },
    { to: "/weekly-scores", label: "Weekly Scores" },
    { to: "/weekly-records", label: "Weekly Records" },
    { to: "/draft", label: "Draft" },
    { to: "/trades", label: "Trades" },
    { to: "/head-to-head", label: "Head to Head" },
    { to: "/records", label: "Records" },
  ];

  const NavLinks = () => (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {link.label}
        </Link>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger className="text-muted-foreground hover:text-primary transition-colors">
          Teams
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isLoading ? (
            <DropdownMenuItem disabled>Loading teams...</DropdownMenuItem>
          ) : teams && teams.length > 0 ? (
            teams.map((team) => (
              <DropdownMenuItem key={team.id} asChild>
                <Link
                  to={`/team/${team.id}`}
                  className="w-full text-muted-foreground hover:text-primary"
                >
                  {team.name}
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No teams found</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const MobileNavLinks = () => (
    <>
      {links.map((link) => (
        <SheetClose asChild key={link.to}>
          <Link
            to={link.to}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {link.label}
          </Link>
        </SheetClose>
      ))}
      <div className="space-y-2">
        <div className="font-medium">Teams</div>
        {isLoading ? (
          <div className="text-muted-foreground">Loading teams...</div>
        ) : teams && teams.length > 0 ? (
          teams.map((team) => (
            <SheetClose asChild key={team.id}>
              <Link
                to={`/team/${team.id}`}
                className="block text-muted-foreground hover:text-primary"
              >
                {team.name}
              </Link>
            </SheetClose>
          ))
        ) : (
          <div className="text-muted-foreground">No teams found</div>
        )}
      </div>
    </>
  );

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Fantasy League
        </Link>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-4">
                <MobileNavLinks />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-6">
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
