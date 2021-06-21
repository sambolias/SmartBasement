import React, { useEffect, useState, useRef } from 'react'
import { AppState, View, Dimensions, StyleSheet, AppStateStatus } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation';
import WebView from 'react-native-webview'

import { CamFeedProps } from '../types/Common';

const CamFeed = ({host, creds, id, stream_type}: CamFeedProps) => {
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
      setSource(getSource())
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
    // first attempt, gives 401 but probably because image doesn't support mjpeg
    // <Image
    //   style={{width: 128, height: 128}}
    //   source={{
    //     headers: {
    //       Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    //       AcceptEncoding: "gzip, deflate",
    //       AcceptLanguage: "en-US,en;q=0.9",
    //       Authorization: "Basic c2VyaWU6dGVzdHB3",
    //       Connection: "keep-alive",
    //       Host: "206.174.116.174:8081"
    //     },
    //     uri: "http://206.174.116.174:8081/1/current",
    //     // uri: "http://serie:testpw@206.174.116.174:8081/1"
    //   }}
    //   onError={({nativeEvent}) => {
    //     console.log(nativeEvent.error)
    //   }}
    //   onLoad={(ImageLoadEvent) => {
    //     console.log(ImageLoadEvent.nativeEvent.uri)
    //   }}
    // />
    <View>
      <WebView
        style={styles.camView}
        containerStyle={styles.camView}
        source={{uri: source}}
      />
    </View>
  )
}

export default CamFeed
