import React, { useRef } from 'react'
import { StyleSheet, View, DrawerLayoutAndroid, FlatList, Image, Pressable } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash'
import { connect } from 'react-redux'

import camsConf from '../../cams.json'

import { setCurrent, updateCams } from '../../src/actions'
import { RootState } from '../../App'


interface CameraDrawerProps {
  updateCams: Function,
  setCurrent: Function,
  cams: string[],
  current: number[],
  children: JSX.Element
}

const CameraDrawer = ({ updateCams, setCurrent, cams, current, children }: CameraDrawerProps) => {
  // TODO add drawer button to open
  const drawer = useRef<DrawerLayoutAndroid>(null)
  // max update 5 seconds
  const update = _.debounce(() => {
    updateCams(camsConf)
  }, 5000)

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition="left"
      onDrawerOpen={() => {
        // update cams on drawer open
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
                  // if multiple cams selected
                  // or if not currently selected
                  if(current.length > 1 || !current.includes(index)) {
                    setCurrent([index])
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
          <MaterialIcons.Button
            name="grid-view"
            size={100}
            backgroundColor="transparent"
            onPress={() => {
                setCurrent(camsConf.map(c => c.id))
                drawer.current?.closeDrawer()
              }
            }
          />
        </View>
        )
      }
    >
      {children}
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

const mapStateToProps = ({ cams, current }: RootState) => {
  return { cams, current }
}

export default connect(mapStateToProps, { updateCams, setCurrent })(CameraDrawer)
