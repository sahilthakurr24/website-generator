"use server";
import { inngestClient } from "@repo/inngest";
import { getClientSubscriptionToken } from "@repo/inngest/react";

export async function getRealtimeToken(userId: string, generationId: string) {
  return await getClientSubscriptionToken(inngestClient, {
    channel: `user:${userId}:generation:${generationId}`,
    topics: ["agent_stream"],
  });
}
