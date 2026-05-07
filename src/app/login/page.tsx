import { Pizza, Lock } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Login — Pizza3.14" };

interface LoginPageProps {
  searchParams: { from?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const destination = searchParams.from ?? "/admin";
  const isKitchen = destination.startsWith("/kitchen");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <PageContainer width="narrow">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Pizza className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Pizza<span className="text-primary">3.14</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {isKitchen ? "Kitchen access" : "Admin access"} required
          </p>
        </div>

        <SectionCard
          title={isKitchen ? "Kitchen Login" : "Admin Login"}
          description="Enter the demo passphrase to continue."
          accented
        >
          {/* Form — wired to /api/auth/login in Milestone 3 */}
          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="from" value={destination} />
            <input
              type="hidden"
              name="role"
              value={isKitchen ? "kitchen" : "admin"}
            />

            <div className="space-y-1.5">
              <Label htmlFor="passphrase">
                <Lock className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                Passphrase
              </Label>
              <Input
                id="passphrase"
                name="passphrase"
                type="password"
                placeholder="Enter demo passphrase"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Continue to {isKitchen ? "Kitchen" : "Admin"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo credentials — not for production use.
          </p>
        </SectionCard>
      </PageContainer>
    </div>
  );
}
