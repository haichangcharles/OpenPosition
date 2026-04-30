import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function buildGoogleOAuthUrl(clientId: string, origin: string) {
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not configured");
  }
  const redirectUri = `${origin}/api/oauth/google/callback`;
  const state = btoa(redirectUri);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
}

export default function Login() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(clientId);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome to OpenPosition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            disabled={!isGoogleConfigured}
            onClick={() => {
              window.location.href = buildGoogleOAuthUrl(clientId, window.location.origin);
            }}
          >
            Sign in with Google
          </Button>
          {!isGoogleConfigured && (
            <p className="text-xs text-center text-[#781914]">
              Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in your local environment.
            </p>
          )}
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
