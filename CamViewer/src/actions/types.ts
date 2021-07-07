import { AnyAction } from "redux";
import { GetCamsAction, UpdateCamsAction } from "./cams";

export enum ActionType {
  GetCams,
  UpdateCams
}

export type Action = GetCamsAction | UpdateCamsAction | AnyAction
