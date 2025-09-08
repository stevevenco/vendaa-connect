import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-8xl md:text-9xl font-extrabold text-primary tracking-tighter">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-muted-foreground">
          Oops! Page Not Found
        </p>
        <p className="text-lg text-muted-foreground max-w-md">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Button asChild>
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </div>
      <div className="absolute bottom-8 text-sm text-muted-foreground">
        <p>Vendaa | Utility Platform</p>
      </div>
    </div>
  );
};

export default NotFound;
