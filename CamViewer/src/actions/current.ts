import { Dispatch } from "redux";

import { ActionType } from "./types";


export interface GetCurrentAction {
  type: ActionType.GetCurrent,
  payload: number[]
}

export interface SetCurrentAction {
  type: ActionType.SetCurrent,
  payload: number[]
}

export const getCurrent = () => {
  return async(dispatch: Dispatch, getState: () => number[]) => {
    const cam = getState()
    dispatch({
      type: ActionType.GetCurrent,
      payload: cam
    })
  }
}

export const setCurrent = (indexes: number[]) => {
  return async(dispatch: Dispatch) => {
    dispatch({
      type: ActionType.GetCurrent,
      payload: indexes
    })
  }
}
