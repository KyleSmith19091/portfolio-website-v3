"use client";

import Magnetic from "./magnetic";
import React from "react";

interface MdxLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children?: React.ReactNode;
}

export default function MdxLink({ href, children, ...props }: MdxLinkProps) {
  return (
    <Magnetic>
      <a href={href} {...props}>
        {children}
      </a>
    </Magnetic>
  );
}
