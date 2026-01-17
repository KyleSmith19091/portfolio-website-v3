import { JSX, PropsWithChildren, ReactNode } from "react";

type CodeProps = PropsWithChildren<{
    language: string,
}>;

const Code = ({ children, language }: CodeProps) => {
    return <code>{children}</code>;
};

export default Code;