export const THEME = {
  colors: {
    primary: "#1890ff",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    axes: {
      x: "#ff6b6b",
      y: "#4ecdc4",
      z: "#4dabf7",
    },
    joints: {
      base: "#ff6b6b",
      joint: "#4ecdc4",
    },
    background: {
      scene: "#1a1a1a",
      app: "#f5f5f5",
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    extraLarge: 32,
  },
  dimensions: {
    sceneHeight: 600,
    controlPanelMinHeight: "calc(100vh-200px)",
  },
} as const;
