"use client";

import { useCallback, useRef, useState } from "react";

import { resolveTripDurationDays } from "../lib/planner-shared";

const NUMERIC_PREFERENCE_FIELDS = ["durationDays", "budgetInr", "travelerCount"];


export function normalizeTripPreferencesForApi(preferences, options = {}) {
  const normalized = { ...preferences };

  for (const field of NUMERIC_PREFERENCE_FIELDS) {
    const value = normalized[field];
    if (value === "" || value == null) {
      continue;
    }
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber)) {
      normalized[field] = asNumber;
    }
  }

  const resolvedDuration = resolveTripDurationDays(
    normalized,
    options.defaultDurationDays ?? null,
  );
  if (resolvedDuration != null) {
    normalized.durationDays = resolvedDuration;
  }

  return normalized;
}

/**
 * @param {unknown} body
 * @returns {string}
 */
function messageFromErrorBody(body) {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const message = body.message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }
  return "Itinerary generation failed. Please try again.";
}

/**
 * @param {Record<string, unknown>} preferences
 * @param {{ tripId?: string, curatedTripSlug?: string }} [options]
 */
function buildGenerateRequestBody(preferences, options = {}) {
  const normalized = normalizeTripPreferencesForApi(preferences);
  const body = { ...normalized };

  if (typeof options.tripId === "string" && options.tripId.trim()) {
    body.tripId = options.tripId.trim();
  }
  if (
    typeof options.curatedTripSlug === "string" &&
    options.curatedTripSlug.trim()
  ) {
    body.curatedTripSlug = options.curatedTripSlug.trim();
  }

  return body;
}

export function useItineraryGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [tripId, setTripId] = useState(null);
  const inFlightRef = useRef(false);

  const generate = useCallback(async (preferences, options = {}) => {
    if (inFlightRef.current) {
      return { ok: false, skipped: true, reason: "in_progress" };
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setNeedsSignIn(false);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGenerateRequestBody(preferences, options)),
      });

      let body;
      try {
        body = await response.json();
      } catch {
        const message =
          "The server returned a response that could not be read. Please try again.";
        setError(message);
        return { ok: false, reason: "invalid_response", message };
      }

      const code =
        body && typeof body === "object" && !Array.isArray(body)
          ? body.code
          : undefined;

      const responseTripId =
        body &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        typeof body.tripId === "string" &&
        body.tripId.trim()
          ? body.tripId.trim()
          : null;

      if (responseTripId) {
        setTripId(responseTripId);
      }

      if (response.status === 401 || code === "UNAUTHENTICATED") {
        const message = messageFromErrorBody(body);
        setNeedsSignIn(true);
        setError(message);
        return {
          ok: false,
          reason: "unauthenticated",
          message,
          code: "UNAUTHENTICATED",
          status: 401,
          tripId: responseTripId,
        };
      }

      if (!response.ok) {
        const message = messageFromErrorBody(body);
        setError(message);
        return {
          ok: false,
          reason: "http_error",
          message,
          code,
          status: response.status,
          tripId: responseTripId,
        };
      }

      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        body.ok !== true ||
        !responseTripId
      ) {
        const message =
          "The server returned an unexpected success response. Please try again.";
        setError(message);
        return { ok: false, reason: "unexpected_response", message };
      }

      return { ok: true, tripId: responseTripId };
    } catch {
      const message =
        "Could not reach the server. Check your connection and try again.";
      setError(message);
      return { ok: false, reason: "network_error", message };
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    needsSignIn,
    tripId,
    generate,
  };
}
