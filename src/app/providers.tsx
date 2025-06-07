"use client"

import { CursorVariant } from "@/context/cursor";
import { createContext, useCallback, useEffect, useState } from "react";

export interface ICursorContext {
    cursorVariant: CursorVariant;
    setCursorVariant: (variant: CursorVariant) => void;
    hoveredElement: HTMLElement | null;
    setHoveredElement: (element: HTMLElement) => void;
    clearHoveredElement: () => void;
};

const defaultValues: ICursorContext = {
    cursorVariant: "default",
    setCursorVariant: (variant: CursorVariant) => {
        console.log("DEFAULT")
    },
    hoveredElement: null,
    setHoveredElement: (element: HTMLElement) => { },
    clearHoveredElement: () => { },
}

export const CursorContext = createContext(defaultValues);

const Providers = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default");
    const [hoveredElement, setHoveredElementState] = useState<HTMLElement | null>(null);

    const setHoveredElement = useCallback((element: HTMLElement) => {
        setHoveredElementState(element);
    }, []);

    const clearHoveredElement = useCallback(() => {
        setHoveredElementState(null);
    }, []);

    return(
        <CursorContext.Provider value={{ cursorVariant, setCursorVariant, hoveredElement, setHoveredElement, clearHoveredElement }}>
            {children}
        </CursorContext.Provider>        
    );
};

export default Providers;