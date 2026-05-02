import Link from "next/link";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <Card className="max-w-xl text-center">
        <div className="text-6xl font-black text-primary">404</div>
        <h1 className="mt-4 text-3xl font-black">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          The page you are looking for may have moved, or the route is still being connected to the backend workflow.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </Card>
    </div>
  );
}
