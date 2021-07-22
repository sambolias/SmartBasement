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
  current: number[]
}

const Layout = ({ updateCams, current }: LayoutProps) => {
  const genProps = (id: number) : CamFeedProps => {
    return {...camsConf[id], height: height, width: width}
  }
  // similar props, but divided by total number of cams
  const genThumbProps = (id: number) : CamFeedProps => {
    // TODO scale this correctly for landscape view
    const scale = camsConf.length ? 1/camsConf.length*2 : 1
    return {...camsConf[id], height: height*scale, width: width*scale}
  }
  // TODO add drawer button to open
  // const [props, setProps] = useState(genProps(current))
  const [width, setWidth] = useState(camsConf[current.length?current[0]:0].width)
  const [height, setHeight] = useState(camsConf[current.length?current[0]:0].height)
  // TODO name props better
  const [props, setProps] = useState<CamFeedProps[]>()

  // update camera props on id or size change
  useEffect(()=> {
    if(current.length == 1) {
        setProps([genProps(current[0])])
    } else {
      setProps(current.map((cid) => genThumbProps(cid)))
    }
  }, [current, height, width])

  // set orientation and update cams on start
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


  // set cam view orientation to maintain 640x480 aspect ratio
  const orientStyles = () => {
    // get image size if something is selected
    // selected size only matters for individual selection so 0 index is always right here
    if(current.length) {
      const w = Dimensions.get("screen").width
      const h = Dimensions.get("screen").height
      const cw = camsConf[current[0]].width
      const ch = camsConf[current[0]].height

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
  }

  return (
    <View style={styles.container}>
      { props &&
        props.map((prop) => <CameraFeed key={prop.id} {...prop} />)
      }
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
