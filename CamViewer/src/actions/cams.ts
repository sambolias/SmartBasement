import axios from "axios";
import { Dispatch } from "redux";
import base64 from 'react-native-base64';
import * as FileSystem from 'expo-file-system';

import { CamFeedProps } from "../types/Common";
import { ActionType } from "./types";


export interface GetCamsAction {
  type: ActionType.GetCams,
  payload: [string]
}

export interface UpdateCamsAction {
  type: ActionType.UpdateCams,
  index: number
  payload: string
}

// Actions

export const getCams = () => {
  return async(dispatch: Dispatch, getState: () => [string]) => {
    const cams = getState()
    dispatch({
      type: ActionType.GetCams,
      payload: cams
    })
  }
}

export const updateCams = (camCreds: [CamFeedProps]) => {
  return async(dispatch: Dispatch, getState: () => [string]) => {
    camCreds.map(async (cred: CamFeedProps, index: number) => {
      const uri = `http://${cred.host}/${cred.id}/current`
      const path = `${FileSystem.cacheDirectory}cam${index}.${Date.now()}.jpg`
      const encodedCred = base64.encode(cred.creds)
      FileSystem.downloadAsync(uri, path, {
        headers: {
          Authorization: `Basic ${encodedCred}`
        }
      }).then((result) => {
        dispatch({
          type: ActionType.UpdateCams,
          index: index,
          payload: result.uri
        })
      }).catch((e) => {
        console.log(e)
        // TODO fallback image or empty string?
        // for now just return nothing, state stays the same
        // return ""
      })
      // TODO download never catches, even when fails, find out why
      // TODO until it works this needs to be here
      // dispatch empty string if nothing is in state
      if(!(index in getState())) {
          dispatch({
            type: ActionType.UpdateCams,
            index: index,
            payload: ""
          })
        }
    })
  }
}
