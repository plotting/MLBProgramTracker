import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative mb-8">
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMenu}
        className="md:hidden p-2 text-white hover:bg-primary/20 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Menu */}
      <NavigationMenu className={`${isOpen ? 'block' : 'hidden'} md:block absolute md:relative top-full left-0 right-0 bg-background md:bg-transparent z-50`}>
        <NavigationMenuList className="flex-col md:flex-row w-full">
          <NavigationMenuItem className="w-full md:w-auto">
            <Link to="/" className="w-full">
              <NavigationMenuLink 
                className={`${navigationMenuTriggerStyle()} w-full justify-start ${
                  location.pathname === "/" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem className="w-full md:w-auto">
            <Link to="/weekly-scores" className="w-full">
              <NavigationMenuLink 
                className={`${navigationMenuTriggerStyle()} w-full justify-start ${
                  location.pathname === "/weekly-scores" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                Weekly Scores
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem className="w-full md:w-auto">
            <Link to="/records" className="w-full">
              <NavigationMenuLink 
                className={`${navigationMenuTriggerStyle()} w-full justify-start ${
                  location.pathname === "/records" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                Records
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};