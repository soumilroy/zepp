import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
export declare function createQueryClient(): QueryClient;
export declare function createQueryWrapper(client: QueryClient): ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
