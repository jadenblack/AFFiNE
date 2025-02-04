import { assertExists } from '@blocksuite/global/utils';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import * as styles from './resize-panel.css';

export interface ResizeHandleProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  resizing: boolean;
  open: boolean;
  minWidth: number;
  maxWidth: number;
  resizeHandlePos: 'left' | 'right';
  resizeHandleOffset?: number;
  resizeHandleVerticalPadding?: number;
  onOpen: (open: boolean) => void;
  onResizing: (resizing: boolean) => void;
  onWidthChange: (width: number) => void;
}

export interface ResizePanelProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  resizing: boolean;
  open: boolean;
  floating?: boolean;
  minWidth: number;
  maxWidth: number;
  resizeHandlePos: 'left' | 'right';
  resizeHandleOffset?: number;
  resizeHandleVerticalPadding?: number;
  enableAnimation?: boolean;
  width: number;
  onOpen: (open: boolean) => void;
  onResizing: (resizing: boolean) => void;
  onWidthChange: (width: number) => void;
}

const ResizeHandle = ({
  className,
  resizing,
  minWidth,
  maxWidth,
  resizeHandlePos,
  resizeHandleOffset,
  resizeHandleVerticalPadding,
  open,
  onOpen,
  onResizing,
  onWidthChange,
  ...rest
}: ResizeHandleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const onResizeStart = useCallback(() => {
    let resized = false;
    const panelContainer = ref.current?.parentElement;
    assertExists(
      panelContainer,
      'parent element not found for resize indicator'
    );

    const { left: anchorLeft, right: anchorRight } =
      panelContainer.getBoundingClientRect();

    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      if (!panelContainer) return;
      const newWidth = Math.min(
        maxWidth,
        Math.max(
          resizeHandlePos === 'right'
            ? e.clientX - anchorLeft
            : anchorRight - e.clientX,
          minWidth
        )
      );
      onWidthChange(newWidth);
      onResizing(true);
      resized = true;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener(
      'mouseup',
      () => {
        // if not resized, toggle sidebar
        if (!resized) {
          onOpen(false);
        }
        onResizing(false);
        document.removeEventListener('mousemove', onMouseMove);
      },
      { once: true }
    );
  }, [maxWidth, resizeHandlePos, minWidth, onWidthChange, onResizing, onOpen]);

  return (
    <div
      {...rest}
      data-testid="resize-handle"
      ref={ref}
      style={assignInlineVars({
        [styles.resizeHandleOffsetVar]: `${resizeHandleOffset ?? 0}px`,
        [styles.resizeHandleVerticalPadding]: `${
          resizeHandleVerticalPadding ?? 0
        }px`,
      })}
      className={clsx(styles.resizeHandleContainer, className)}
      data-handle-position={resizeHandlePos}
      data-resizing={resizing}
      data-open={open}
      onMouseDown={onResizeStart}
    >
      <div className={styles.resizerInner} />
    </div>
  );
};

function useEnableAnimation() {
  const [enable, setEnable] = useState(false);
  useEffect(() => {
    window.setTimeout(() => {
      setEnable(true);
    }, 500);
  }, []);
  return enable;
}

export const ResizePanel = forwardRef<HTMLDivElement, ResizePanelProps>(
  function ResizePanel(
    {
      children,
      className,
      resizing,
      minWidth,
      maxWidth,
      width,
      floating,
      enableAnimation: _enableAnimation = true,
      open,
      onOpen,
      onResizing,
      onWidthChange,
      resizeHandlePos,
      resizeHandleOffset,
      resizeHandleVerticalPadding,
      ...rest
    },
    ref
  ) {
    const enableAnimation = useEnableAnimation() && _enableAnimation;
    const safeWidth = Math.min(maxWidth, Math.max(minWidth, width));
    return (
      <div
        {...rest}
        ref={ref}
        style={assignInlineVars({
          [styles.panelWidthVar]: `${safeWidth}px`,
        })}
        className={clsx(className, styles.root)}
        data-open={open}
        data-is-floating={floating}
        data-handle-position={resizeHandlePos}
        data-enable-animation={enableAnimation && !resizing}
      >
        {children}
        <ResizeHandle
          resizeHandlePos={resizeHandlePos}
          resizeHandleOffset={resizeHandleOffset}
          resizeHandleVerticalPadding={resizeHandleVerticalPadding}
          maxWidth={maxWidth}
          minWidth={minWidth}
          onOpen={onOpen}
          onResizing={onResizing}
          onWidthChange={onWidthChange}
          open={open}
          resizing={resizing}
        />
      </div>
    );
  }
);
