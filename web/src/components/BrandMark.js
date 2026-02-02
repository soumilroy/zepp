import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SnailIcon } from "lucide-react";
export default function BrandMark({ showTagline = true, className, Icon = SnailIcon, }) {
    return (_jsxs("div", { className: className, children: [_jsxs("div", { className: "flex items-center gap-2 text-xs font-light tracking-[0.25em] text-slate-300 uppercase", children: [_jsx(Icon, { className: "h-4 w-4 text-green-400" }), _jsx("span", { children: "Zepp.ai" })] }), showTagline ? (_jsx("p", { className: "mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500", children: "AI Powered resume builder" })) : null] }));
}
