"use client";

import { useEffect } from "react";

export function CodeCopyHandler() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const button = (event.target as HTMLElement)?.closest?.(
        ".code-copy-btn"
      );
      if (!(button instanceof HTMLElement)) return;

      const command = button.getAttribute("data-copy");
      if (command === null) return;

      navigator.clipboard.writeText(command).then(() => {
        button.setAttribute("data-copied", "true");
        window.setTimeout(() => button.removeAttribute("data-copied"), 1500);
      });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
