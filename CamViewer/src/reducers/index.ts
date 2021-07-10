import { combineReducers } from "redux"

import camsReducer from './cams'
import currentReducer from './current'

export const reducers = combineReducers ({
  cams: camsReducer,
  current: currentReducer
})
