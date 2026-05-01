import { useEffect } from "react";
import { useLocation } from "react-router";
import { getOrCreateAnonymousId } from "@/lib/anonymous-id";
import { trpc } from "@/providers/trpc";

export default function PageViewTracker() {
  const location = useLocation();
  const trackEvent = trpc.posts.trackEvent.useMutation();

  useEffect(() => {
    const path = location.pathname;
    const search = location.search;
    const anonymousId = getOrCreateAnonymousId();

    trackEvent.mutate({
      anonymousId,
      eventType: "page_view",
      metadata: {
        path,
        search,
        referrer: document.referrer || undefined,
      },
    });
  }, [location.pathname, location.search, trackEvent]);

  return null;
}
