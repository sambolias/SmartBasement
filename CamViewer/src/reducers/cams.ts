import { Action, ActionType, UpdateCamsAction } from '../actions'

const reducer = (state: string[] = [], action: Action) => {
  switch(action.type) {
    case ActionType.GetCams:
      return action.payload
    case ActionType.UpdateCams:
      // TODO find better way to overwrite array elt with spread
      // TODO or use camera names as object properties and use object instead of array
      let r = [...state]
      r[(action as UpdateCamsAction).index] = action.payload
      return r
    default:
      return state
  }
}

export default reducer
