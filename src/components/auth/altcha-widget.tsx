"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "altcha";
import type { WidgetMethods } from "altcha/types";

type AltchaStateDetail = {
  state: string;
  payload?: string | null;
  error?: string | null;
};

type Props = {
  onPayloadChange: (payload: string | null) => void;
  className?: string;
};

const CHALLENGE_URL = "/api/auth/altcha/challenge";

const widgetStyle = {
  "--altcha-border-radius": "0.75rem",
  "--altcha-color-base": "#ffffff",
  "--altcha-color-base-content": "#0a1628",
  "--altcha-color-primary": "#002868",
  "--altcha-color-primary-content": "#ffffff",
  "--altcha-color-success": "#002868",
  "--altcha-color-error": "#bf0a30",
  "--altcha-max-width": "100%",
} as CSSProperties;

/**
 * Self-hosted ALTCHA PoW widget. Auto-solves on load for normal browsers
 * (crew automation friendly). Emits the base64 payload when verified.
 */
export function AltchaWidget({ onPayloadChange, className }: Props) {
  const ref = useRef<(HTMLElement & WidgetMethods) | null>(null);
  const onPayloadChangeRef = useRef(onPayloadChange);

  useEffect(() => {
    onPayloadChangeRef.current = onPayloadChange;
  }, [onPayloadChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleStateChange = (ev: Event) => {
      const detail = (ev as CustomEvent<AltchaStateDetail>).detail;
      if (detail?.state === "verified" && detail.payload) {
        onPayloadChangeRef.current(detail.payload);
      } else {
        onPayloadChangeRef.current(null);
      }
    };

    el.addEventListener("statechange", handleStateChange);
    return () => {
      el.removeEventListener("statechange", handleStateChange);
      onPayloadChangeRef.current(null);
    };
  }, []);

  return (
    <div className={className}>
      <altcha-widget
        ref={ref}
        challenge={CHALLENGE_URL}
        auto="onload"
        name="altcha"
        style={widgetStyle}
      />
    </div>
  );
}
