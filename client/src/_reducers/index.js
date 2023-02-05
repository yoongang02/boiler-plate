import { combineReducers } from "redux";
import user from "./user_reducer";

//여기서 여러 Reducer들을 하나로 합치는 역할을 함.
const rootReducer = combineReducers({
  //user,
});

export default rootReducer;
