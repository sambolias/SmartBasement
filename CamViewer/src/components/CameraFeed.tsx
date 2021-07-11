import React, { useEffect, useRef } from 'react'
import { AppState, View, StyleSheet, AppStateStatus } from 'react-native'
import WebView from 'react-native-webview'
import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

import { CamFeedProps } from '../types/Common';

const CamFeed = ({host, creds, id, height, width, stream_type}: CamFeedProps) => {
  const webView = useRef<WebView>()
  const appState = useRef(AppState.currentState)

  // fix webview on resume
  useEffect(() => {
    AppState.addEventListener('change', onResume)

    return () => {
      AppState.removeEventListener('change', onResume)
    }
  }, [])

  const onResume = (nextAppState : AppStateStatus) => {
    if(appState.current.match('/inactive|background/') && nextAppState === 'active') {
      webView.current?.clearCache(true)
      webView.current?.clearHistory()
      webView.current?.reload()
    }
  }

  // set stream source based on props
  const isTyped = stream_type !== undefined
  const source = `http://${creds}@${host}/${id + (isTyped ? '/' + stream_type : '')}`

  const styles = StyleSheet.create({
    camView: {
      flex: 0,
      width: width,
      height: height
    }
  })
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
