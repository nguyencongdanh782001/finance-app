import { cn } from "@/lib/utils";
import {
  sanitizeCompactRichTextHtml,
  sanitizeRichTextHtml,
} from "@/lib/rich-text";

export default function RichTextRenderer({
  html,
  className,
  compact = false,
}: {
  html: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("rich-text-content", compact && "rich-text-content-compact", className)}
      dangerouslySetInnerHTML={{
        __html: compact
          ? sanitizeCompactRichTextHtml(html)
          : sanitizeRichTextHtml(html),
      }}
    />
  );
}
