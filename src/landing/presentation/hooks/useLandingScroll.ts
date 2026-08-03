import { useRef } from 'react';
import type { ScrollView } from 'react-native';

export function useLandingScroll() {
  const scrollRef = useRef<ScrollView>(null);

  const toFeatures = () => {
    scrollRef.current?.scrollTo({ y: 420, animated: true });
  };

  const toHowItWorks = () => {
    scrollRef.current?.scrollTo({ y: 760, animated: true });
  };

  const toDownload = () => {
    scrollRef.current?.scrollTo({ y: Number.MAX_SAFE_INTEGER, animated: true });
  };

  return { scrollRef, toFeatures, toHowItWorks, toDownload };
}
