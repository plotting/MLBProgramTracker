import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const isMobile = useIsMobile();

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
                <NavLinks />
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