import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export function useBottomSheetModal(visible: boolean, onClose: () => void) {
  const [rendered, setRendered] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      backdropOpacity.setValue(0);
      translateY.setValue(1);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    } else if (rendered) {
      setRendered(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start(() => {
      setRendered(false);
      onClose();
    });
  };

  return { backdropOpacity, translateY, rendered, close };
}
