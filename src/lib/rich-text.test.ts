import test from "node:test";
import assert from "node:assert/strict";
import {
  hasMissingImageAlt,
  meaningfulText,
  sanitizeRichTextHtml,
} from "./rich-text.ts";

test("rich text sanitizer removes executable markup and unsafe links", () => {
  const html = sanitizeRichTextHtml(
    '<p onclick="alert(1)">Hello<script>alert(1)</script></p><a href="javascript:alert(1)">bad</a>',
  );
  assert.equal(html.includes("script"), false);
  assert.equal(html.includes("onclick"), false);
  assert.equal(html.includes("javascript:"), false);
  assert.equal(html.includes("Hello"), true);
});

test("rich text validation ignores empty markup and requires image alt text", () => {
  assert.equal(meaningfulText("<p></p><p><br></p>"), "");
  assert.equal(
    hasMissingImageAlt('<p><img src="https://cdn.test/a.webp" alt="" /></p>'),
    true,
  );
  assert.equal(
    hasMissingImageAlt(
      '<p><img src="https://cdn.test/a.webp" alt="Áo cotton" /></p>',
    ),
    false,
  );
});
