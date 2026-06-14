"use client";

import { useEffect, useRef, useState } from "react";
import { DeliveryStreamEvent } from "@/lib/types";

const MAX_EVENTS = 50;

/**
 * Connects to an SSE endpoint and accumulates events into a list.
 * Automatically closes the connection when the component unmounts
 * or when a "stream_end" event is received.
 */
export function useSSE(url: string | null) {
  const [events, setEvents] = useState<DeliveryStreamEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (e) => {
      try {
        const data: DeliveryStreamEvent = JSON.parse(e.data);

        if (data.event_type === "heartbeat") return;

        if (data.event_type === "stream_end") {
          source.close();
          setConnected(false);
          return;
        }

        if (data.event_type === "error") {
          source.close();
          setConnected(false);
          return;
        }

        setEvents((prev) => {
          const next = [data, ...prev];
          return next.slice(0, MAX_EVENTS);
        });
      } catch {
        // Ignore malformed events
      }
    };

    source.onerror = () => {
      setConnected(false);
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [url]);

  return { events, connected };
}
