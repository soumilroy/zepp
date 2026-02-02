import { useMemo } from "react";
import DOMPurify from "dompurify";

type SafeHtmlProps = {
  html: string;
  className?: string;
};

const looksLikeHtml = (value: string) => /<([a-z][\s\S]*?)>/i.test(value);

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  const sanitized = useMemo(() => {
    if (!html) return "";
    if (!looksLikeHtml(html)) return html;
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }, [html]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
