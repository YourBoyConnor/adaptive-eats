import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';

interface OptimizedImageProps {
  source: { uri: string };
  style?: any;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder = 'https://via.placeholder.com/300x200/667eea/ffffff?text=Loading...',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[styles.image, style]}
        placeholder={placeholder}
        contentFit="cover"
        transition={200}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
        recyclingKey={source.uri}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ff6b35" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
