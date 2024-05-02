import { produce } from 'immer';
import { ActionType } from '../action-types';
import { Action } from '../actions';

interface BundleState {
  [key: string]: {
    loading: boolean;
    code: string;
    err: string;
  };
}

const initialState: BundleState = {};

const reduer = produce(
  (state: BundleState = initialState, action: Action): BundleState => {
    switch (action.type) {
      case ActionType.BUNDLE_START:
        return state;
      case ActionType.BUNDLE_COMPLETE:
        return state;
      default:
        return state;
    }
  }
);

export default reduer;
