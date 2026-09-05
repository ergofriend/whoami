"use client";

import { useEffect, useState } from "react";

import { collectBrowserInspection } from "../features/browser/browser-inspection";
import type { BrowserGroup, BrowserInspection } from "../features/browser/types";
import { browserInspectionItems, browserSections } from "../features/browser/browser-presentation";
import { KeyValueSection } from "./KeyValueSection";

type BrowserDetailsProps = {
  collect?: () => BrowserInspection;
  groups?: readonly BrowserGroup[];
  headingVariant?: "display" | "technical";
};

const allBrowserGroups = browserSections.map(({ group }) => group);

export function BrowserDetails({
  collect = collectBrowserInspection,
  groups = allBrowserGroups,
  headingVariant = "display",
}: BrowserDetailsProps) {
  const [inspection, setInspection] = useState<BrowserInspection | null>(null);

  useEffect(() => {
    setInspection(collect());
  }, [collect]);

  return (
    <>
      {browserSections
        .filter(({ group }) => groups.includes(group))
        .map(({ group, title }) => (
          <KeyValueSection
            key={group}
            headingVariant={headingVariant}
            icon={group === "browser" && headingVariant === "display" ? "browser" : undefined}
            title={title}
            items={browserInspectionItems(group, inspection)}
          />
        ))}
    </>
  );
}
