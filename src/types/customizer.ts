export interface TextState {
  text: string;
  color: string;
  font: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  size: number;
  curve: number;
  yOffset: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffset: number;
}

export interface ImageState {
  src: string | null;
  name: string;
  width: number;
  height: number;
  scale: number;
  x: number;
  y: number;
  rotation: number;
  dpiStatus: "idle" | "low" | "high";
}

export type DesignMode = "centered" | "duplicated" | "independent";
export type ViewMode = "catalog" | "customize";
