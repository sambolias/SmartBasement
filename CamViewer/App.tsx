import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import NumberSlider from 'react-native-number-slider'

import CameraFeed from './src/components/CameraFeed'
import { CamFeedProps } from './src/types/Common'
import cams from './cams.json'

const genProps = (id: number) : CamFeedProps => {
  return cams[id]
}

export default function App() {
  const [cid, setCid] = useState(0)
  const [props, setProps] = useState(genProps(cid))

  return (
    <View style={styles.container}>
      <CameraFeed {...props} />
      <Text>Select Camera</Text>
      <NumberSlider
        onValueChange={(value: number) => {
            setCid(value)
            setProps(genProps(value))
          }
        }
        value={cid}
        width={300}
        displayValues={Array.from(cams.keys())}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
