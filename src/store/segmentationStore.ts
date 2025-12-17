import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type PointType = "positive" | "negative";

export interface SelectedPoint {
  id: string;
  position: [number, number, number];
  type: PointType;
}

export interface PointCloudData {
  positions: Float32Array;
  colors: Float32Array;
}

interface SegmentationState {
  // 포인트 클라우드 데이터
  pointCloudData: PointCloudData | null;

  // 선택 모드
  selectionMode: PointType;

  // 선택된 포인트들
  selectedPoints: SelectedPoint[];

  // 세그멘테이션 결과
  segmentationMask: number[] | null;

  // 로딩 상태
  isLoading: boolean;
}

interface SegmentationActions {
  setPointCloudData: (data: PointCloudData) => void;
  setSelectionMode: (mode: PointType) => void;
  addSelectedPoint: (point: SelectedPoint) => void;
  removeSelectedPoint: (id: string) => void;
  clearSelectedPoints: () => void;
  setSegmentationMask: (mask: number[]) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

type SegmentationStore = SegmentationState & SegmentationActions;

const initialState: SegmentationState = {
  pointCloudData: null,
  selectionMode: "positive",
  selectedPoints: [],
  segmentationMask: null,
  isLoading: false,
};

export const useSegmentationStore = create<SegmentationStore>()(
  immer((set) => ({
    ...initialState,

    setPointCloudData: (data) =>
      set((state) => {
        state.pointCloudData = data;
      }),

    setSelectionMode: (mode) =>
      set((state) => {
        state.selectionMode = mode;
      }),

    addSelectedPoint: (point) =>
      set((state) => {
        state.selectedPoints.push(point);
      }),

    removeSelectedPoint: (id) =>
      set((state) => {
        state.selectedPoints = state.selectedPoints.filter(
          (p: { id: string }) => p.id !== id
        );
      }),

    clearSelectedPoints: () =>
      set((state) => {
        state.selectedPoints = [];
      }),

    setSegmentationMask: (mask) =>
      set((state) => {
        state.segmentationMask = mask;
      }),

    setIsLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    reset: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);
