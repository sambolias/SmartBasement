import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation';

import CameraFeed from './components/CameraFeed'
import { CamFeedProps } from './types/Common'
import camsConf from '../cams.json'

import { updateCams } from './actions'

import { RootState } from '../App'

interface LayoutProps {
  updateCams: Function,
  current: number
}

const Layout = ({ updateCams, current }: LayoutProps) => {

  const genProps = (id: number) : CamFeedProps => {
    return {...camsConf[id], height: height, width: width}
  }
  // TODO add drawer button to open
  const [props, setProps] = useState(genProps(current))
  const [width, setWidth] = useState(camsConf[current].width)
  const [height, setHeight] = useState(camsConf[current].height)

  // set orientation on start
  useEffect(() => {
    updateCams(camsConf)
    orientStyles()
    return () => {
      ScreenOrientation.removeOrientationChangeListeners()
    }
  }, [])

  // and on change
  ScreenOrientation.addOrientationChangeListener(() => {
    orientStyles()
  })

  // update camera props on id or size change
  useEffect(() => {
    setProps(genProps(current))
  }, [current, height, width])

  // set cam view orientation to maintain 640x480 aspect ratio
  const orientStyles = () => {
    const w = Dimensions.get("screen").width
    const h = Dimensions.get("screen").height
    const cw = camsConf[current].width
    const ch = camsConf[current].height

    //maintain aspect ratio
    let iw, ih = 0
    if(w > h) { // landscape
      ih = h
      iw = h*cw/ch
    } else { // portrait
      iw = w
      ih = w*ch/cw
    }
    // update height and width of CamFeed
    setHeight(ih)
    setWidth(iw)
  }

  return (
    <View style={styles.container}>
      <CameraFeed {...props} />
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#110f12',
    alignItems: 'center',
    justifyContent: 'center',
  }
})

const mapStateToProps = ({ current }: RootState) => {
  return { current }
}

export default connect(mapStateToProps, { updateCams })(Layout)
