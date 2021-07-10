import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { StyleSheet, Text, View, DrawerLayoutAndroid, FlatList, Image, Pressable } from 'react-native'
import { connect, Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import ExpoFileSystemStorage from "redux-persist-expo-filesystem"
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import _ from 'lodash'

import CameraFeed from './src/components/CameraFeed'
import { CamFeedProps } from './src/types/Common'
import camsConf from './cams.json'

import { setCurrent, updateCams } from './src/actions'
import { reducers } from './src/reducers'
import { useEffect } from 'react'
import { useRef } from 'react'

const genProps = (id: number) : CamFeedProps => {
  return camsConf[id]
}

// TODO organize, split into component and helper files

interface AppProps {
  updateCams: Function,
  setCurrent: Function
  cams: string[],
  current: number

}

const App = ({ updateCams, setCurrent, cams, current }: AppProps) => {
  // TODO add drawer button to open
  const drawer = useRef<DrawerLayoutAndroid>(null)
  const [cid, setCid] = useState(current)
  const [props, setProps] = useState(genProps(cid))
  // max update 5 seconds
  const update = _.debounce(() => {
          updateCams(camsConf)
        }, 5000)
  // set persisted current and page current
  // TODO state variable no longer needed, just use persisted
  const setCurrentCid = (id: number) => {
    setCurrent(id)
    setCid(id)
  }

  useEffect(() => {
    updateCams(camsConf)
  }, [])

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition="left"
      onDrawerOpen={() => {
        update()
      }}
      renderNavigationView={() => (
        <View style={[styles.container, styles.navContainer]}>
          <FlatList
            horizontal={false}
            data={cams}
            keyExtractor={(_r, index) => index.toString()}
            renderItem={({item, index}) =>
              <Pressable
                style={[styles.container, {margin: 20, width: 168, height: 168, backgroundColor: '#252227', borderRadius: 25}]}
                onPress={() => {
                  if(index !== cid) {
                    setCurrentCid(index)
                    setProps(genProps(index))
                  }
                  drawer.current?.closeDrawer()
                }}
              >
                { item !== "" &&
                  <Image style={{width: 128, height: 128}} source={{uri: item}} />
                }
              </Pressable>
            }
          />
        </View>
        )
      }
    >
      <View style={styles.container}>
        <CameraFeed {...props} />
        <StatusBar style="auto" />
      </View>
    </DrawerLayoutAndroid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#110f12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navContainer: {
    backgroundColor: '#1f1c20',
    padding: 16
  }
});

// TODO put this in reducer code (store.ts maybe) https://react-redux.js.org/using-react-redux/usage-with-typescript

type RootState = ReturnType<typeof store.getState>

const mapStateToProps = ({ cams, current }: RootState) => {
  return { cams, current }
}

const AppWrapper = connect(mapStateToProps, { updateCams, setCurrent })(App)
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
