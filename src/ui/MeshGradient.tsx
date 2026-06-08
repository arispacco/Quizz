import React from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '@/theme/tokens';

const BLOBS = [
  { color: palette.rainbow[0], top: -80, left: -60, size: 280, opacity: 0.22 },
  { color: palette.rainbow[1], top: 120, right: -90, size: 240, opacity: 0.18 },
  { color: palette.rainbow[2], bottom: 180, left: -40, size: 220, opacity: 0.16 },
  { color: palette.rainbow[3], bottom: -60, right: -30, size: 260, opacity: 0.2 },
] as const;

export function MeshGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BLOBS.map((blob, i) => (
        <View
          key={i}
          style={[
            styles.blob,
            {
              backgroundColor: blob.color,
              opacity: blob.opacity,
              width: blob.size,
              height: blob.size,
              borderRadius: blob.size / 2,
              top: 'top' in blob ? blob.top : undefined,
              left: 'left' in blob ? blob.left : undefined,
              right: 'right' in blob ? blob.right : undefined,
              bottom: 'bottom' in blob ? blob.bottom : undefined,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute' },
});
