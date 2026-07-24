"use client";

import { trpc } from "~/trpc/client";

export function useChat() {
  const {
    mutateAsync: createChatAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.chat.createChat.useMutation();

  return {
    createChatAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}
