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
  dimensions: {
    width?: number;
    height?: number;
  };
  position: {
    top?: number;
    left?: number;
  };
}
