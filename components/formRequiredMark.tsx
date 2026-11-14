import type { ReactNode } from "react";

/** Ant Design required mark rendered after the label text. */
export function formRequiredMark(
  label: ReactNode,
  info: { required: boolean },
): ReactNode {
  return (
    <>
      {label}
      {info.required ? (
        <span className="form-required-mark" aria-hidden="true">
          *
        </span>
      ) : null}
    </>
  );
}
