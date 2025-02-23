export interface RuntimeMessage {
  action: string;
  data:
    | CloseTabData
    | OpenPopoutData
    | RotateVideoData
    | StoreDimensionsAndPositionData;
}

export interface CloseTabData {
  enforceDomainRestriction: boolean;
}

export interface OpenPopoutData {
  closeTab: boolean;
  enforceDomainRestriction: boolean;
}

export interface RotateVideoData {
  rotationAmount: number;
}

export interface StoreDimensionsAndPositionData {
  dimensions: Record<string, any>;
  position: Record<string, any>;
}
