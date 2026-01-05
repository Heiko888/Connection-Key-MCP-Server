export type CenterId =
  | "HEAD" | "AJNA" | "THROAT" | "G" | "HEART" | "SACRAL"
  | "SPLEEN" | "SOLAR" | "ROOT";  // 9 Zentren

export type GateId = number; // 1..64

export interface CenterDef {
  id: CenterId;
  label: string;
  shape: "triangle" | "square" | "diamond";
  // Mittelpunkt + Größe in SVG-Koordinaten (viewBox 0..1000)
  x: number; y: number; w: number; h: number; rotation?: number;
  gates: GateId[]; // zugeordnete Tore des Zentrums
}

export interface ChannelDef {
  id: string; // "34-20" etc.
  a: GateId;  // Gate an Ende A
  b: GateId;  // Gate an Ende B
  // optionale Stützpunkte für schöne Kurven
  path?: string; // eigene SVG-Path-Definition (überschreibt auto-layout)
}

export interface GateDef {
  id: GateId;
  label: string;
  // feste Position eines Gates im Graph (auf der Kante des Zentrums)
  x: number; y: number;
  center: CenterId;
}

export interface DefinedState {
  centers?: Partial<Record<CenterId, boolean>>;
  channels?: Partial<Record<string, boolean>>;
  gates?: Partial<Record<GateId, boolean>>;
}

export interface BodygraphProps {
  defined?: DefinedState;
  width?: number;
  height?: number;
  showLabels?: boolean;
  showGateNumbers?: boolean;
  theme?: import('./themes').ChartTheme;
  onElementHover?: (type: 'center' | 'channel' | 'gate', id: string, info: string) => void;
  onElementLeave?: () => void;
  showDefinedOnly?: boolean;
  showChannels?: boolean;
}
