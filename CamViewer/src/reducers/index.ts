import { combineReducers } from "redux"

import camsReducer from './cams'

// TODO store current viewed cam

export const reducers = combineReducers ({
  cams: camsReducer
})
