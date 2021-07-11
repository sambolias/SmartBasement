import React from 'react'
import { connect, Provider } from 'react-redux'
import _ from 'lodash'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import ExpoFileSystemStorage from "redux-persist-expo-filesystem"
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { updateCams } from './src/actions'
import { reducers } from './src/reducers'

import CameraDrawer from './src/components/CameraDrawer'
import Layout from './src/Layout'

const App = () => {
  return (
    <CameraDrawer>
      <Layout />
    </CameraDrawer>
  );
}

export type RootState = ReturnType<typeof store.getState>

const mapStateToProps = ({ current }: RootState) => {
  return { current }
}

const AppWrapper = connect(mapStateToProps, { updateCams })(App)
const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage
};
const persistedReducers = persistReducer(persistConfig, reducers);
const store = createStore(persistedReducers, applyMiddleware(thunk));
const persistor = persistStore(store);

export default () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </Provider>
  )
}
