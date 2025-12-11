export type Viewport = {
  label: string;
  width: number;
  height: number;
};

export type ViewportList = Viewport[];

export const DEFAULT_VIEWPORTS: ViewportList = [
  { label: 'mobile', width: 375, height: 812 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
];
