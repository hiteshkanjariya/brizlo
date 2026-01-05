import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      
      <h1 className="font-display text-7xl font-bold text-foreground mb-2">404</h1>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Button asChild>
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
