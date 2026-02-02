import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import DOMPurify from "dompurify";
const looksLikeHtml = (value) => /<([a-z][\s\S]*?)>/i.test(value);
export default function SafeHtml({ html, className }) {
    const sanitized = useMemo(() => {
        if (!html)
            return "";
        if (!looksLikeHtml(html))
            return html;
        return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    }, [html]);
    return _jsx("span", { className: className, dangerouslySetInnerHTML: { __html: sanitized } });
}
