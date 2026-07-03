import { Children, isValidElement } from "react";
import type { FC, ReactNode } from "react";
import { clsx } from "clsx";

interface StickySectionItemProps {
  title: ReactNode;
  id: string | number;
  children: ReactNode;
}

// Marker component - StickySectionTabs reads its props via Children.map
// rather than rendering it directly.
const StickySectionItem: FC<StickySectionItemProps> = () => null;

interface StickySectionTabsProps {
  children: ReactNode;
  /** Height of the sticky site nav each section header should pin below. */
  topOffset?: string;
  sectionClassName?: string;
  stickyHeaderClassName?: string;
  headerLayoutClassName?: string;
  contentLayoutClassName?: string;
}

const StickySectionTabsBase: FC<StickySectionTabsProps> & {
  Item: FC<StickySectionItemProps>;
} = ({
  children,
  topOffset = "4rem",
  sectionClassName = "border-t border-line first:border-t-0",
  stickyHeaderClassName = "border-b border-line bg-paper/95 backdrop-blur-sm",
  headerLayoutClassName = "py-3",
  contentLayoutClassName = "py-6",
}) => {
  return (
    <div>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || child.type !== StickySectionItem) {
          return null;
        }

        const { title, id, children: itemContent } =
          child.props as StickySectionItemProps;

        return (
          <section key={id} className={clsx("relative", sectionClassName)}>
            <div
              className={clsx("sticky z-10", stickyHeaderClassName)}
              style={{ top: `calc(${topOffset} - 1px)` }}
            >
              <div className={headerLayoutClassName}>{title}</div>
            </div>
            <div className={contentLayoutClassName}>{itemContent}</div>
          </section>
        );
      })}
    </div>
  );
};

StickySectionTabsBase.Item = StickySectionItem;

export const StickySectionTabs = StickySectionTabsBase;
