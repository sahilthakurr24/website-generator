import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import stripAnsi from "strip-ansi";
import React, { useEffect, useState, useRef } from "react";

interface PreviewFrameProps {
  webContainer: WebContainer | undefined;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const [url, setUrl] = useState("");

  const devProcessRef = useRef<WebContainerProcess | null>(null);
  const installedRef = useRef(false);

  // Listen for preview URL only once
  useEffect(() => {
    if (!webContainer) return;

    const off = webContainer.on("server-ready", (_, url) => {
      console.log("Server:", url);
      setUrl(url);
    });

    return () => {
      off?.();
    };
  }, [webContainer]);

  async function startDevServer() {
    if (!webContainer) return;

    try {
      // Install dependencies only once
      if (!installedRef.current) {
        const install = await webContainer.spawn("npm", ["install"]);

        install.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          }),
        );

        const code = await install.exit;

        if (code !== 0) {
          throw new Error("npm install failed");
        }

        installedRef.current = true;
      }

      // Kill previous dev server
      if (devProcessRef.current) {
        await devProcessRef.current.kill();
        devProcessRef.current = null;
      }

      // Start fresh server
      const dev = await webContainer.spawn("npm", ["run", "dev"]);

      devProcessRef.current = dev;

      dev.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        }),
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    startDevServer();

    return () => {
      if (devProcessRef.current) {
        devProcessRef.current.kill();
        devProcessRef.current = null;
      }
    };
  }, [webContainer]);
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
