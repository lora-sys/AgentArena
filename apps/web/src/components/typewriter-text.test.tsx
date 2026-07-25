import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TypewriterText } from "./typewriter-text";

describe("TypewriterText", () => {
  it("renders empty initially (cursor only) in SSR", () => {
    const html = renderToStaticMarkup(<TypewriterText text="hello" speedMs={18} />);
    expect(html).toContain("typewriter");
    // SSR has no timers running, so shown = 0 and only cursor shows
    expect(html).toContain("▌");
    expect(html).not.toContain("hello");
  });

  it("respects custom speedMs prop", () => {
    // Just verify the component accepts the prop without error
    const html = renderToStaticMarkup(<TypewriterText text="ok" speedMs={25} />);
    expect(html).toContain("typewriter");
  });
});
