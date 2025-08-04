import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

export function Timer({duration}) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [start, setStart] = React.useState(true);
  const [resume, setResume] = React.useState(false);

  return (
    <View style={styles.container}>
        
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={duration * 60 || 0}
        colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
        colorsTime={[10, 6, 3, 0]}
        onComplete={() => ({ shouldRepeat: false})}
        updateInterval={1}
      >

      {({remainingTime, color}) => {
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        const newTime = `${minutes}:${seconds}`

        return (
          <Text style={{ color, fontSize: 40 }}>
            {newTime}
          </Text>
        )
      }}
      </CountdownCircleTimer>

    {start &&
        <Button title="Start Session" onPress={() => {
            setIsPlaying(prev => !prev);
            setStart(false);
            setResume(true);
        }} />
    }

    {resume &&
        <Button title="Pause" onPress={() => {
            setIsPlaying(prev => !prev);
            setResume(false);
        }} />
    }

    {!resume && !start && 
        <Button title="Resume" onPress={() => {
            setIsPlaying(prev => !prev);
            setResume(true);
        }} />
    }
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#ecf0f1',
    padding: 8,
  }
});