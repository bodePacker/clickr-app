export type LLProfile = {
  profile_name: string;
  default_layer?: number; // optional because your code defaults to 0
  layers: LLLayer[];
};

export type LLLayer = {
  layer_name: string;
  remappings: LLRemapping[];
};

export type LLRemapping = (LLBasicRemapping | LLSequenceRemapping);

export type LLBasicRemapping = {
  trigger: LLBasicTrigger;
  binds: LLBind[];
};

export type LLBehavior = "capture" | "release" | "default";
export type LLSequenceRemapping = {
  triggers: LLAdvancedTrigger[];
  binds: LLBind[];
  behavior: LLBehavior;
};


export type LLBasicTrigger = LLKeyPress | LLKeyRelease;

export type LLAdvancedTrigger = LLKeyPress | LLKeyRelease | LLMinimumWait | LLMaximumWait;

export type LLKeyPress = {
  type: "key_press";
  value: string;
};

export type LLKeyRelease = {
  type: "key_release";
  value: string;
};

export type LLMinimumWait = {
  type: "minimum_wait";
  value: number;
};

export type LLMaximumWait = {
  type: "maximum_wait";
  value: number;
};

export type LLBind = LLPressKey | LLReleaseKey | LLSwapLayer | LLWait;

export type LLPressKey = {
  type: "press_key";
  value: string;
};

export type LLReleaseKey = {
  type: "release_key";
  value: string;
};

export type LLSwapLayer = {
  type: "switch_layer";
  value: number;
};

export type LLWait = {
  type: "wait";
  value: number;
};
