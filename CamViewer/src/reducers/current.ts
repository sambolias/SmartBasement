import { Action, ActionType } from '../actions'

const reducer = (state: number = 0, action: Action) => {
  switch(action.type) {
    case ActionType.GetCurrent:
      return action.payload
    case ActionType.SetCurrent:
      return action.payload
    default:
      return state
  }
}

export default reducer
