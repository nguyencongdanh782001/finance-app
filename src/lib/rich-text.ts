import sanitizeHtml from "sanitize-html";

export type RichTextDocument = {
  type: "doc";
  content?: Array<Record<string, unknown>>;
};

const allowedTags = [
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "u",
  "s",
  "span",
  "mark",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "br",
  "code",
  "pre",
];

const compactAllowedTags = ["p", "strong", "em", "u", "s", "ul", "ol", "li", "a", "br"];

export function sanitizeRichTextHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "data-align"],
      span: ["style"],
      mark: ["style", "data-color"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (_tag, attrs) => ({
        tagName: "a",
        attribs: { ...attrs, rel: "noopener noreferrer", target: "_blank" },
      }),
    },
    disallowedTagsMode: "discard",
  });
}

export function sanitizeCompactRichTextHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: compactAllowedTags,
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tag, attrs) => ({
        tagName: "a",
        attribs: { ...attrs, rel: "noopener noreferrer", target: "_blank" },
      }),
    },
    disallowedTagsMode: "discard",
  });
}

export function meaningfulText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasMissingImageAlt(value: string) {
  return [...value.matchAll(/<img\b[^>]*>/gi)].some((match) => {
    const alt = match[0].match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2];
    return !alt?.trim();
  });
}
