import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const location = useLocation();

  return (
    <NavigationMenu className="mb-8">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Dashboard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/weekly-scores">
            <NavigationMenuLink 
              className={`${navigationMenuTriggerStyle()} ${
                location.pathname === "/weekly-scores" ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              Weekly Scores
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/records">
            <NavigationMenuLink 
              className={`${navigationMenuTriggerStyle()} ${
                location.pathname === "/records" ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              Records
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};