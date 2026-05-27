import type React from "react";

declare global {
  namespace JSX {
    type Element = React.ReactElement;
    interface ElementClass extends React.Component<unknown> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: Record<string, unknown>;
    }
    interface ElementChildrenAttribute {
      children: Record<string, never>;
    }
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<
      C,
      P
    >;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> extends React.JSX
      .IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

export {};
