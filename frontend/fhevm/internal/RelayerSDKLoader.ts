import { SDK_CDN_URL } from "./constants";

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export class RelayerSDKLoader {
  private _trace?: TraceType;
  constructor(options: { trace?: TraceType }) {
    this._trace = options.trace;
  }

  public load(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("RelayerSDKLoader: browser only"));
    }
    if ("relayerSDK" in window) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
      if (existing) return resolve();
      const script = document.createElement("script");
      script.src = SDK_CDN_URL;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${SDK_CDN_URL}`));
      document.head.appendChild(script);
    });
  }
}

export type FhevmRelayerSDKType = {
  initSDK: (options?: unknown) => Promise<boolean>;
  createInstance: (config: any) => Promise<any>;
  SepoliaConfig: any;
  __initialized__?: boolean;
};

export type FhevmWindowType = Window & { relayerSDK: FhevmRelayerSDKType };

export function isFhevmWindow(win: unknown): win is FhevmWindowType {
  if (!win || typeof win !== "object") return false;
  return "relayerSDK" in (win as any);
}



