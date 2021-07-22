import React, { useEffect, useRef, useState } from 'react'
import { AppState, View, StyleSheet, AppStateStatus, ActivityIndicator } from 'react-native'
import WebView from 'react-native-webview'
import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

import _ from 'lodash'

import { CamFeedProps } from '../types/Common';

const CamFeed = ({host, creds, id, height, width, stream_type}: CamFeedProps) => {
  const webView = useRef<WebView>()
  // const appState = useRef(AppState.currentState)
  // const [failed, setFailed] = useState(false)
  // const [prevAppState, setPrevAppState] = useState("active")
    // TODO clean up
  // set stream source based on props
  const getSource = () => {
    const isTyped = stream_type !== undefined
    const source = `http://${creds}@${host}/${id + (isTyped ? '/' + stream_type : '')}`
    return source
  }
  const [source, setSource] = useState(getSource())

  // // fix failed webview on resume
  // useEffect(() => {
  //   AppState.addEventListener('change', onResume)

  //   return () => {
  //     AppState.removeEventListener('change', onResume)
  //   }
  // }, [])

  const reload = webView.current ? () => {
    // console.log("resetting now")
    webView.current?.reload()
    setSource("")
    const fn = () => setSource(getSource())
    setTimeout(fn, 150)
    }  : () => console.log("no function")
  // const reload = () => setSource(getSource())
  // const refresh = _.debounce(reload, 500)

  // const onResume = (nextAppState : AppStateStatus) => {
  //   // console.log(appState.current)
  //   // console.log(prevAppState)
  //   // console.log(nextAppState)
  //   // console.log(failed)
  //   // if(appState.current.match('/inactive|background/') && nextAppState === 'active') {
  //   if(prevAppState === 'active' && nextAppState === 'active') {
  //     // webView.current?.clearCache(true)
  //     // webView.current?.clearHistory()

  //     if(true) {
  //       refresh()
  //       // setFailed(false)
  //     }
  //   }
  //   setPrevAppState(nextAppState)
  // }

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
        renderError={() => <ActivityIndicator color="red" size="large" />}
        renderLoading={() => <ActivityIndicator color="red" size="large" />}
        startInLoadingState={true}
        source={{
            uri: source,
            // TODO consider moving auth to here (see how header is made is actions/cams)
            headers: {
              "Connection": "Keep-Alive"
            }
          }
        }
        incognito={true}
        onError={(err : WebViewErrorEvent) => {
          // console.log("error")
          // console.log(err.nativeEvent)
          if(err.nativeEvent.code === -6) {
            // reload webview to recover
            reload()
          }
        }}
      />
    </View>
  )
}

export default CamFeed
