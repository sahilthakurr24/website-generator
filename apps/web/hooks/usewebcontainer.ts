"use client";

import { useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export function useWebcontainer() {
  const [webContainer, setWebContainer] = useState<WebContainer>();
  const instanceRef = useRef<WebContainer | null>(null);

  async function boot(): Promise<WebContainer> {
    if (instanceRef.current) {
      return instanceRef.current;
    }

    const instance = await WebContainer.boot();
    instanceRef.current = instance;
    setWebContainer(instance);

    return instance;
  }

  useEffect(() => {
    boot();

    return () => {
      instanceRef.current?.teardown();
      instanceRef.current = null;
    };
  }, []);

  return { webContainer, boot };
}
