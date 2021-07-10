import { AnyAction } from "redux";
import { GetCamsAction, UpdateCamsAction } from "./cams";

export enum ActionType {
  GetCams,
  UpdateCams,
  GetCurrent,
  SetCurrent
}

export type Action = GetCamsAction | UpdateCamsAction | AnyAction
