import React, { useEffect, useState, useRef } from 'react'
import { AppState, View, Dimensions, StyleSheet, AppStateStatus, Button } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation';
import WebView from 'react-native-webview'
import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

import { CamFeedProps } from '../types/Common';

const CamFeed = ({host, creds, id, stream_type}: CamFeedProps) => {
  const webView = useRef<WebView>()
  const appState = useRef(AppState.currentState)
  const [styles, setStyles] = useState(StyleSheet.create({camView:{}}))
  const [source, setSource] = useState('')

  // set source on start or change (also onResume below)
  useEffect(()=> {
    setSource(getSource())
  }, [host, id])

  // set orientation on start
  useEffect(() => {
    // setSource(getSource())
    orientStyles()
    AppState.addEventListener('change', onResume)

    return () => {
      ScreenOrientation.removeOrientationChangeListeners()
      AppState.removeEventListener('change', onResume)
    }
  }, [])
  // and on change
  ScreenOrientation.addOrientationChangeListener(() => {
    orientStyles()
  })

  const onResume = (nextAppState : AppStateStatus) => {
    if(appState.current.match('/inactive|background/') && nextAppState === 'active') {
      // set source state to re-render WebView
      // setSource(getSource())
      webView.current?.clearCache(true)
      webView.current?.clearHistory()
      webView.current?.reload()
    }
  }

  const getSource = () => {
    let isTyped = stream_type !== undefined
    return `http://${creds}@${host}/${id + (isTyped ? '/' + stream_type : '')}`
  }

  // set cam view orientation to maintain 640x480 aspect ratio
  const orientStyles = () => {
    const w = Dimensions.get("screen").width
    const h = Dimensions.get("screen").height

    let iw, ih = 0
    if(w > h) { // landscape
      ih = h
      iw = h*640/480
    } else { // portrait
      iw = w
      ih = w*480/640
    }

    const s = StyleSheet.create({
      camView: {
        flex: 0,
        width: iw,
        height: ih
      }
    })
    setStyles(s)
  }

  return (
    /// TODO figure out how to get it to reload on error - how it is will cycle when it fails for reason
    // TODO on error it should try to reset maybe once, some kind of debounce needed
    <View>
      <WebView
        ref={(ref) => {if(ref) webView.current = ref}}
        style={styles.camView}
        containerStyle={styles.camView}
        source={{uri: source}}
        onError={(err : WebViewErrorEvent) => {
          console.log("error")
          console.log(err.nativeEvent)
          if(err.nativeEvent.code === -6) {
            webView.current?.clearCache(true)
            webView.current?.clearHistory()
            setTimeout(() => webView.current?.reload(), 500)
          }
        }}
        onHttpError={({nativeEvent}) => {
          console.log("http error")
          console.log(nativeEvent)
        }}
      />
    </View>
  )
}

export default CamFeed
