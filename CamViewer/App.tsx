import React from 'react'
import { Provider } from 'react-redux'
import _ from 'lodash'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import ExpoFileSystemStorage from "redux-persist-expo-filesystem"
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { reducers } from './src/reducers'

import CameraDrawer from './src/components/CameraDrawer'
import Layout from './src/Layout'

// main app
const App = () => {
  return (
    <CameraDrawer>
      <Layout />
    </CameraDrawer>
  );
}

// redux state type
export type RootState = ReturnType<typeof store.getState>

// set up persisted redux store
const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage
};
const persistedReducers = persistReducer(persistConfig, reducers);
const store = createStore(persistedReducers, applyMiddleware(thunk));
const persistor = persistStore(store);

// wrap app in redux provider and redux rehydrating persist gate
export default () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  )
}
