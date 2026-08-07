"use client";
import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";

export function useWebcontainer() {
  const [webContainer, setWebContainer] = useState<WebContainer>();
  let instance: WebContainer;
  async function boot() {
    instance = await WebContainer.boot();
    setWebContainer(instance);
  }

  useEffect(() => {
    boot();

    return () => {
      instance?.teardown();
    };
  }, []);

  return webContainer;
}
