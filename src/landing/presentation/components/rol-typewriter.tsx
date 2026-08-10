import React, { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

// ============================================================
// RolTypewriter · Revela el texto carácter a carácter, como si
// la mascota lo estuviera escribiendo, y avisa cuando termina.
// ============================================================

export type RolTypewriterProps = {
  text: string;
  speed?: number;
  style?: TextStyle | TextStyle[];
  onDone?: () => void;
};

export function RolTypewriter({ text, speed = 18, style, onDone }: RolTypewriterProps) {
  const [shown, setShown] = useState('');
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setShown('');
    let index = 0;
    const id = setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(id);
        onDoneRef.current?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return <Text style={style}>{shown}</Text>;
}
