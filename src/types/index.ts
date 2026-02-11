// Type definitions for Three.js components
import { Object3D, Material, Mesh } from "three";

export interface ThreeObject extends Object3D {
  material?: Material | Material[];
  geometry?: Mesh["geometry"];
}

// Animation types
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string | ((t: number) => number);
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Canvas/3D component props
export interface CanvasComponentProps extends BaseComponentProps {
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

// Section props
export interface SectionProps extends BaseComponentProps {
  id?: string;
  fullHeight?: boolean;
}
