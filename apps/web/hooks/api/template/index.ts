"use client";
import { trpc } from "~/trpc/client";

export const useTemplate = () => {
  const {
    mutateAsync: getTemplateAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.template.getTemplate.useMutation();

  return { getTemplateAsync, error, isError, isIdle, isPending, isSuccess, status };
};
