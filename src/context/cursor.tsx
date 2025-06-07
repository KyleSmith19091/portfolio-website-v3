export type CursorVariant = 'default' | 'pointer' | 'clicked' | 'darkBg';
export interface ICursorContext {
  cursorVariant: CursorVariant;
  setCursorVariant: (variant: CursorVariant) => void;
}