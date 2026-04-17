export interface ClientMetadata {
  pageUrl: string;
  browserName: string | null;
  browserVersion: string | null;
  operatingSystem: string | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  reportedAtClient: string;
}

function detectBrowser(userAgent: string): {
  browserName: string | null;
  browserVersion: string | null;
} {
  const browserMatchers = [
    { name: "Edge", pattern: /Edg\/([\d.]+)/ },
    { name: "Chrome", pattern: /Chrome\/([\d.]+)/ },
    { name: "Firefox", pattern: /Firefox\/([\d.]+)/ },
    { name: "Safari", pattern: /Version\/([\d.]+).*Safari/ }
  ];

  for (const matcher of browserMatchers) {
    const match = userAgent.match(matcher.pattern);

    if (match) {
      return {
        browserName: matcher.name,
        browserVersion: match[1] ?? null
      };
    }
  }

  return {
    browserName: null,
    browserVersion: null
  };
}

function detectOperatingSystem(userAgent: string): string | null {
  if (userAgent.includes("Windows")) {
    return "Windows";
  }

  if (userAgent.includes("Mac OS X")) {
    return "macOS";
  }

  if (userAgent.includes("Android")) {
    return "Android";
  }

  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    return "iOS";
  }

  if (userAgent.includes("Linux")) {
    return "Linux";
  }

  return null;
}

export function collectClientMetadata(): ClientMetadata {
  const userAgent =
    typeof navigator === "undefined" ? "" : navigator.userAgent;
  const browser = detectBrowser(userAgent);

  return {
    pageUrl:
      typeof window === "undefined" ? "" : window.location.href,
    browserName: browser.browserName,
    browserVersion: browser.browserVersion,
    operatingSystem: detectOperatingSystem(userAgent),
    viewportWidth:
      typeof window === "undefined" ? null : window.innerWidth,
    viewportHeight:
      typeof window === "undefined" ? null : window.innerHeight,
    reportedAtClient: new Date().toISOString()
  };
}
