import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff8f0_0%,#f3e8dc_46%,#cab8a6_100%)] px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}
