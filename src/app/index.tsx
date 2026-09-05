import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

type Phase = 'home' | 'journey';

const narrationSource = require('../../assets/audio/vyora-intro.mp3');
const musicSource = require('../../assets/audio/cinematic-space-atmosphere.mp3');

const JOURNEY_DURATION = 30000;;

function Stars() {
  const stars = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const data = new Float32Array(1800 * 3);

    for (let i = 0; i < 1800; i++) {
      const radius = 7 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      data[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);

      data[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);

      data[i * 3 + 2] =
        radius * Math.cos(phi);
    }

    return data;
  }, []);

  useFrame((_, delta) => {
    if (stars.current) {
      stars.current.rotation.y += delta * 0.004;
      stars.current.rotation.x += delta * 0.0005;
    }
  });

  return (
    <points ref={stars}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.9}
      />
    </points>
  );
}

function CinematicCamera({
  journeyStarted,
}: {
  journeyStarted: boolean;
}) {
  const { camera } = useThree();

  const journeyProgress = useRef(0);

  useFrame((_, delta) => {
    const target = journeyStarted ? 1 : 0;

    /*
     * Slow, time-based movement.
     *
     * The old version used damp(), which reached the
     * destination much too quickly.
     */
    const speed = journeyStarted ? 0.055 : 0.8;

    journeyProgress.current = THREE.MathUtils.damp(
      journeyProgress.current,
      target,
      speed,
      delta
    );

    const p = THREE.MathUtils.smoothstep(
      journeyProgress.current,
      0,
      1
    );

    /*
     * Dramatic zoom-out:
     *
     * Start: 6.5
     * End:   25
     */
    camera.position.z = 6.5 + p * 18.5;

    /*
     * Slight vertical movement makes the camera
     * feel like it is actually travelling through space.
     */
    camera.position.y = p * 1.5;

    /*
     * Wider field of view as we leave Earth.
     */
    camera.fov = 50 + p * 15;

    camera.updateProjectionMatrix();

    camera.lookAt(0, -0.15, 0);
  });

  return null;
}

function Earth({
  journeyStarted,
}: {
  journeyStarted: boolean;
}) {
  const earth = useRef<THREE.Mesh>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);

  const texture = useLoader(
    THREE.TextureLoader,
    '/earth.jpg'
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame((_, delta) => {
    if (earth.current) {
      earth.current.rotation.y += delta * 0.18;
    }

    if (clouds.current) {
      clouds.current.rotation.y += delta * 0.21;
    }

    if (group.current && journeyStarted) {
      group.current.rotation.z += delta * 0.01;
    }
  });

  return (
    <group
      ref={group}
      position={[0, -0.35, 0]}
    >
      {/* ATMOSPHERE */}
      <mesh scale={0.42}>
        <sphereGeometry args={[1.7, 64, 64]} />

        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.14}
          side={THREE.BackSide}
        />
      </mesh>

      {/* EARTH */}
      <mesh
        ref={earth}
        scale={0.38}
      >
        <sphereGeometry args={[1.7, 64, 64]} />

        <meshBasicMaterial
          map={texture}
        />
      </mesh>

      {/* CLOUD LAYER */}
      <mesh
        ref={clouds}
        scale={0.383}
      >
        <sphereGeometry args={[1.7, 64, 64]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* ATMOSPHERIC RIM */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.385}
      >
        <torusGeometry
          args={[1.7, 0.025, 16, 100]}
        />

        <meshBasicMaterial
          color="#65b8ff"
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

export default function HomeScreen() {
  const [phase, setPhase] =
    useState<Phase>('home');

  const [journeyStarted, setJourneyStarted] =
    useState(false);

  const narrationPlayer =
    useAudioPlayer(narrationSource);

  const musicPlayer =
    useAudioPlayer(musicSource);

  const homeOpacity =
    useRef(new Animated.Value(1)).current;

  const journeyOpacity =
    useRef(new Animated.Value(0)).current;

  const scanLine =
    useRef(new Animated.Value(0)).current;

  const journeyTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    }).catch(() => {});

    return () => {
      if (journeyTimer.current) {
        clearTimeout(journeyTimer.current);
      }

      try {
        narrationPlayer.pause();
        musicPlayer.pause();
      } catch {
        // Audio cleanup can fail on some platforms.
      }
    };
  }, [musicPlayer, narrationPlayer]);

  /*
   * Moving scan line during the cinematic sequence.
   */
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scanLine, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    if (phase === 'journey') {
      animation.start();
    } else {
      animation.stop();
      scanLine.setValue(0);
    }

    return () => animation.stop();
  }, [phase, scanLine]);

  function beginExploration() {
    if (journeyStarted) return;

    setJourneyStarted(true);
    setPhase('journey');

    /*
     * MUSIC
     */
    try {
      musicPlayer.loop = true;
      musicPlayer.volume = 0.42;
      musicPlayer.seekTo(0);
      musicPlayer.play();
    } catch {
      // Continue even if audio isn't available.
    }

    /*
     * FULL 20-SECOND NARRATION
     */
    try {
      narrationPlayer.volume = 1;
      narrationPlayer.seekTo(0);
      narrationPlayer.play();
    } catch {
      // Continue even if audio isn't available.
    }

    /*
     * Fade Home UI away.
     */
    Animated.parallel([
      Animated.timing(homeOpacity, {
        toValue: 0,
        duration: 850,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(journeyOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /*
     * IMPORTANT:
     *
     * Wait the entire 20 seconds.
     * Do NOT reveal the map after 7 seconds.
     */
    journeyTimer.current = setTimeout(() => {
      try {
        narrationPlayer.pause();
      } catch {
        // Ignore.
      }

      /*
       * Lower the cinematic music before entering
       * the Universe Map.
       */
      try {
        musicPlayer.volume = 0.28;
      } catch {
        // Ignore.
      }

      /*
       * Explore owns the Universe Map.
       */
      router.replace('/explore');
    }, JOURNEY_DURATION);
  }

  const movingScan =
    scanLine.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, width],
    });

  return (
    <View style={styles.container}>
      {/* 3D SPACE */}
      <View style={styles.scene}>
        <Canvas
          style={{ flex: 1 }}
          camera={{
            position: [0, 0, 6.5],
            fov: 50,
            near: 0.1,
            far: 100,
          }}
        >
          <CinematicCamera
            journeyStarted={
              phase === 'journey'
            }
          />

          <Stars />

          <Earth
            journeyStarted={
              phase === 'journey'
            }
          />
        </Canvas>
      </View>

      {/* HOME */}
      {phase === 'home' && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: homeOpacity,
            },
          ]}
        >
          <View style={styles.top}>
            <Text style={styles.logo}>
              VYORA
            </Text>

            <Text style={styles.tagline}>
              THE UNIVERSE, EXPLORED.
            </Text>
          </View>

          <View style={styles.center}>
            <Text style={styles.eyebrow}>
              WELCOME, EXPLORER
            </Text>

            <Text style={styles.title}>
              DIVE INTO
            </Text>

            <Text style={styles.titleAccent}>
              SPACE
            </Text>

            <Text style={styles.description}>
              Explore planets, stars, black holes
              {'\n'}
              and the mysteries beyond Earth.
            </Text>

            <Pressable
              onPress={beginExploration}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                BEGIN EXPLORATION
              </Text>

              <Text style={styles.arrow}>
                →
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottom}>
            <Text style={styles.bottomText}>
              EXPLORE
            </Text>

            <Text style={styles.dot}>•</Text>

            <Text style={styles.bottomText}>
              DISCOVER
            </Text>

            <Text style={styles.dot}>•</Text>

            <Text style={styles.bottomText}>
              UNDERSTAND
            </Text>
          </View>
        </Animated.View>
      )}

      {/* CINEMATIC JOURNEY */}
      {phase === 'journey' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.journeyOverlay,
            {
              opacity: journeyOpacity,
            },
          ]}
        >
          <View style={styles.journeyTop}>
            <Text style={styles.journeyBrand}>
              VYORA
            </Text>

            <Text style={styles.journeySmall}>
              DEPARTURE SEQUENCE
            </Text>
          </View>

          <View style={styles.cinematicWords}>
            <Text style={styles.cinematicLabel}>
              LOOK CLOSER.
            </Text>

            <Text style={styles.cinematicText}>
              THIS IS HOME.
            </Text>
          </View>

          <View style={styles.journeyBottom}>
            <Text style={styles.journeyStatus}>
              LEAVING EARTH
            </Text>

            <View style={styles.lineContainer}>
              <Animated.View
                style={[
                  styles.travelGlow,
                  {
                    transform: [
                      {
                        translateX: movingScan,
                      },
                    ],
                  },
                ]}
              />
            </View>

            <Text style={styles.journeyDescription}>
              ZOOMING OUT INTO THE COSMOS
            </Text>

            <Text style={styles.journeyTime}>
              JOURNEY IN PROGRESS
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01030a',
    overflow: 'hidden',
  },

  scene: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },

  top: {
    alignItems: 'center',
    paddingTop: 65,
  },

  logo: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 10,
  },

  tagline: {
    color: '#8aa4c7',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4,
    marginTop: 7,
  },

  center: {
    alignItems: 'center',
    marginTop: -10,
  },

  eyebrow: {
    color: '#79aaff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
  },

  title: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 5,
    lineHeight: 44,
  },

  titleAccent: {
    color: '#6da8ff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 18,
  },

  description: {
    color: '#c3cfe2',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 28,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2467e8',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 30,
    minWidth: 235,
    shadowColor: '#2467e8',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },

  arrow: {
    color: '#ffffff',
    fontSize: 20,
    marginLeft: 12,
  },

  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },

  bottomText: {
    color: '#63748f',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },

  dot: {
    color: '#356bc4',
    marginHorizontal: 9,
  },

  journeyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 70,
    paddingBottom: 60,
  },

  journeyTop: {
    alignItems: 'center',
  },

  journeyBrand: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 7,
  },

  journeySmall: {
    color: '#6382a9',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 8,
  },

  cinematicWords: {
    alignItems: 'center',
  },

  cinematicLabel: {
    color: '#73a8ff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 14,
  },

  cinematicText: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },

  journeyBottom: {
    alignItems: 'center',
  },

  journeyStatus: {
    color: '#84b5ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 14,
  },

  lineContainer: {
    width: '100%',
    height: 2,
    backgroundColor: '#152943',
    overflow: 'hidden',
    borderRadius: 2,
  },

  travelGlow: {
    width: 100,
    height: 2,
    backgroundColor: '#64a6ff',
  },

  journeyDescription: {
    color: '#506985',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 13,
  },

  journeyTime: {
    color: '#314762',
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 7,
  },
});