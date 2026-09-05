import { useAudioPlayer } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const musicSource = require('../../assets/audio/cinematic-space-atmosphere.mp3');

type Planet = {
  name: string;
  subtitle: string;
  distance: string;
  size: number;
  color: string;
  x: number;
  y: number;
  type: string;
  temperature: string;
  description: string;
  facts: string[];
};

const planets: Planet[] = [
  {
    name: 'MERCURY',
    subtitle: 'THE SWIFT WORLD',
    distance: '57.9M KM',
    size: 17,
    color: '#81786f',
    x: 0.15,
    y: 0.30,
    type: 'ROCKY PLANET',
    temperature: '−180°C TO 430°C',
    description:
      'The smallest planet in the solar system and the closest world to the Sun.',
    facts: [
      'Smallest planet in the solar system',
      'Fastest orbit around the Sun',
      'Almost no atmosphere',
    ],
  },
  {
    name: 'VENUS',
    subtitle: 'THE HOT WORLD',
    distance: '108.2M KM',
    size: 25,
    color: '#c58b50',
    x: 0.32,
    y: 0.58,
    type: 'ROCKY PLANET',
    temperature: '≈ 465°C',
    description:
      'A world hidden beneath thick clouds, with the hottest surface of any planet.',
    facts: [
      'Hottest planet in the solar system',
      'Covered by thick clouds',
      'Rotates very slowly',
    ],
  },
  {
    name: 'EARTH',
    subtitle: 'OUR BLUE HOME',
    distance: '149.6M KM',
    size: 31,
    color: '#2877ce',
    x: 0.52,
    y: 0.34,
    type: 'ROCKY PLANET',
    temperature: '≈ 15°C AVERAGE',
    description:
      'A dynamic world of oceans, continents and life — the only world currently known to support life.',
    facts: [
      'Liquid water covers most of its surface',
      'Has one natural satellite: the Moon',
      'Our home in the cosmos',
    ],
  },
  {
    name: 'MARS',
    subtitle: 'THE RED PLANET',
    distance: '227.9M KM',
    size: 23,
    color: '#b6543d',
    x: 0.70,
    y: 0.59,
    type: 'ROCKY PLANET',
    temperature: '≈ −63°C AVERAGE',
    description:
      'A cold desert world marked by giant volcanoes, valleys and evidence of ancient water.',
    facts: [
      'Home to Olympus Mons',
      'Has two small moons',
      'Shows evidence of ancient water',
    ],
  },
  {
    name: 'JUPITER',
    subtitle: 'THE GAS GIANT',
    distance: '778.5M KM',
    size: 48,
    color: '#b77c5b',
    x: 0.27,
    y: 0.82,
    type: 'GAS GIANT',
    temperature: '≈ −110°C CLOUD TOPS',
    description:
      'A colossal world of swirling clouds, powerful storms and an enormous magnetic field.',
    facts: [
      'Largest planet in the solar system',
      'Has the Great Red Spot',
      'Has dozens of known moons',
    ],
  },
  {
    name: 'SATURN',
    subtitle: 'THE RINGED WORLD',
    distance: '1.43B KM',
    size: 43,
    color: '#c8aa77',
    x: 0.70,
    y: 0.84,
    type: 'GAS GIANT',
    temperature: '≈ −140°C CLOUD TOPS',
    description:
      'A giant planet surrounded by a spectacular system of icy rings.',
    facts: [
      'Famous for its extensive ring system',
      'Less dense than water',
      'Has many known moons',
    ],
  },
];

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.65 + 0.1,
      })),
    []
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

function Planet({
  planet,
  index,
  selected,
}: {
  planet: Planet;
  index: number;
  selected: boolean;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const selectionScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 1400 + index * 120,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400 + index * 120,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [index, pulse]);

  useEffect(() => {
    Animated.spring(selectionScale, {
      toValue: selected ? 1.16 : 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [selected, selectionScale]);

  return (
    <Animated.View
      style={[
        styles.planetNode,
        {
          transform: [
            { scale: pulse },
            { scale: selectionScale },
          ],
        },
      ]}
    >
      {selected && (
        <View
          pointerEvents="none"
          style={[
            styles.selectedPlanetGlow,
            {
              width: planet.size + 22,
              height: planet.size + 22,
              borderRadius: (planet.size + 22) / 2,
            },
          ]}
        />
      )}

      <View
        style={[
          styles.planet,
          {
            width: planet.size,
            height: planet.size,
            borderRadius: planet.size / 2,
            backgroundColor: planet.color,
            borderColor: selected
              ? '#9bc7ff'
              : 'rgba(255,255,255,0.5)',
          },
        ]}
      />

      <Text style={styles.planetName}>{planet.name}</Text>

      <Text style={styles.planetSubtitle}>{planet.subtitle}</Text>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const { width } = useWindowDimensions();

  const music = useAudioPlayer(musicSource);

  const [selectedPlanet, setSelectedPlanet] =
    useState<Planet | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(35)).current;

  const briefingOpacity =
    useRef(new Animated.Value(0)).current;

  const briefingTranslate =
    useRef(new Animated.Value(45)).current;

  useEffect(() => {
    try {
      music.volume = 0.28;
      music.loop = true;
      music.play();
    } catch {
      // Visual experience works without audio.
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      try {
        music.pause();
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, [music, opacity, translate]);

  function openPlanet(planet: Planet) {
    setSelectedPlanet(planet);

    briefingOpacity.setValue(0);
    briefingTranslate.setValue(45);

    Animated.parallel([
      Animated.timing(briefingOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(briefingTranslate, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closePlanet() {
    Animated.parallel([
      Animated.timing(briefingOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(briefingTranslate, {
        toValue: 25,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setSelectedPlanet(null);
      }
    });
  }

  function exploreWorld() {
    if (!selectedPlanet) return;

    const planetName = selectedPlanet.name;

    closePlanet();

    /*
     * STAGE 2
     *
     * Earth gets its first full exploration module.
     * Other worlds remain on the map until their
     * individual experiences are built.
     */
    if (planetName === 'EARTH') {
      setTimeout(() => {
        router.push('/earth');
      }, 320);
    }
  }

  const mapWidth = Math.max(width - 44, 280);
  const mapHeight = 420;

  return (
    <View style={styles.container}>
      <StarField />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            { opacity },
          ]}
        >
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backArrow}>←</Text>

            <Text style={styles.backText}>HOME</Text>
          </Pressable>

          <View style={styles.brand}>
            <Text style={styles.logo}>VYORA</Text>

            <Text style={styles.systemText}>
              EXPLORATION SYSTEM
            </Text>
          </View>
        </Animated.View>

        {/* INTRO */}
        <Animated.View
          style={[
            styles.intro,
            {
              opacity,
              transform: [{ translateY: translate }],
            },
          ]}
        >
          <Text style={styles.kicker}>
            YOUR JOURNEY BEGINS HERE
          </Text>

          <Text style={styles.title}>EXPLORE THE</Text>

          <Text style={styles.titleAccent}>UNIVERSE.</Text>

          <Text style={styles.description}>
            Six worlds mapped.
            {'\n'}
            Infinite questions waiting to be asked.
          </Text>
        </Animated.View>

        {/* MAP */}
        <Animated.View
          style={[
            styles.mapSection,
            {
              opacity,
              transform: [{ translateY: translate }],
            },
          ]}
        >
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapKicker}>
                DESTINATION NETWORK
              </Text>

              <Text style={styles.mapTitle}>
                SOLAR SYSTEM
              </Text>
            </View>

            <View style={styles.online}>
              <View style={styles.onlineDot} />

              <Text style={styles.onlineText}>
                ONLINE
              </Text>
            </View>
          </View>

          <View style={styles.spaceMap}>
            {/* ORBITS */}
            <View
              style={[
                styles.orbit,
                styles.orbitOne,
              ]}
            />

            <View
              style={[
                styles.orbit,
                styles.orbitTwo,
              ]}
            />

            <View
              style={[
                styles.orbit,
                styles.orbitThree,
              ]}
            />

            <View
              style={[
                styles.orbit,
                styles.orbitFour,
              ]}
            />

            {/* SUN */}
            <View style={styles.sunGlow}>
              <View style={styles.sunCore} />
            </View>

            <Text style={styles.sunLabel}>SOL</Text>

            {/* PLANETS */}
            {planets.map((planet, index) => (
              <Pressable
                key={planet.name}
                onPress={() => openPlanet(planet)}
                accessibilityRole="button"
                accessibilityLabel={`Explore ${planet.name}`}
                style={({ pressed }) => [
                  styles.planetPosition,
                  pressed &&
                    styles.planetPositionPressed,
                  {
                    left:
                      mapWidth * planet.x -
                      40,
                    top:
                      mapHeight * planet.y -
                      30,
                  },
                ]}
              >
                <Planet
                  planet={planet}
                  index={index}
                  selected={
                    selectedPlanet?.name ===
                    planet.name
                  }
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapFooterText}>
              06 DESTINATIONS MAPPED
            </Text>

            <View style={styles.footerLine} />

            <Text style={styles.mapFooterText}>
              SCALE: NOT TO SCALE
            </Text>
          </View>
        </Animated.View>

        {/* DESTINATIONS */}
        <Animated.View
          style={[
            styles.destinations,
            {
              opacity,
              transform: [{ translateY: translate }],
            },
          ]}
        >
          <Text style={styles.sectionKicker}>
            SELECT A WORLD
          </Text>

          <Text style={styles.sectionTitle}>
            Where will you go?
          </Text>

          {planets.map((planet, index) => (
            <Pressable
              key={planet.name}
              onPress={() => openPlanet(planet)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${planet.name} briefing`}
              style={({ pressed }) => [
                styles.destination,
                pressed && styles.destinationPressed,
                selectedPlanet?.name ===
                  planet.name &&
                  styles.destinationSelected,
              ]}
            >
              <Text style={styles.number}>
                0{index + 1}
              </Text>

              <View
                style={[
                  styles.destinationPlanet,
                  {
                    backgroundColor:
                      planet.color,
                  },
                ]}
              />

              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>
                  {planet.name}
                </Text>

                <Text style={styles.destinationSubtitle}>
                  {planet.subtitle}
                </Text>
              </View>

              <View style={styles.distance}>
                <Text style={styles.distanceLabel}>
                  DISTANCE
                </Text>

                <Text style={styles.distanceValue}>
                  {planet.distance}
                </Text>
              </View>

              <Text style={styles.destinationArrow}>
                →
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* DEEP SPACE */}
        <Animated.View
          style={[
            styles.deepSpace,
            { opacity },
          ]}
        >
          <Text style={styles.deepKicker}>
            BEYOND THE SOLAR SYSTEM
          </Text>

          <Text style={styles.deepTitle}>
            The universe
            {'\n'}
            gets stranger.
          </Text>

          <Text style={styles.deepDescription}>
            Black holes. Neutron stars. Galaxies.
            {'\n'}
            Mysteries we are still learning to understand.
          </Text>

          <View style={styles.comingSoon}>
            <View style={styles.lockDot} />

            <Text style={styles.comingText}>
              DEEP SPACE MISSIONS — COMING SOON
            </Text>
          </View>
        </Animated.View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>VYORA</Text>

          <Text style={styles.footerText}>
            EXPLORE · DISCOVER · UNDERSTAND
          </Text>
        </View>
      </ScrollView>

      {/* PLANET BRIEFING */}
      {selectedPlanet && (
        <Animated.View
          style={[
            styles.briefingOverlay,
            {
              opacity: briefingOpacity,
            },
          ]}
        >
          <Pressable
            style={styles.briefingBackdrop}
            onPress={closePlanet}
            accessibilityRole="button"
            accessibilityLabel="Close planet briefing"
          />

          <Animated.View
            style={[
              styles.briefingCard,
              {
                transform: [
                  {
                    translateY:
                      briefingTranslate,
                  },
                ],
              },
            ]}
          >
            <View style={styles.briefingTop}>
              <View>
                <Text style={styles.briefingKicker}>
                  DESTINATION{' '}
                  {String(
                    planets.findIndex(
                      (planet) =>
                        planet.name ===
                        selectedPlanet.name
                    ) + 1
                  ).padStart(2, '0')}
                </Text>

                <Text style={styles.briefingName}>
                  {selectedPlanet.name}
                </Text>

                <Text style={styles.briefingSubtitle}>
                  {selectedPlanet.subtitle}
                </Text>
              </View>

              <Pressable
                onPress={closePlanet}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed &&
                    styles.closeButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.briefingPlanetArea}>
              <View
                style={[
                  styles.briefingPlanetGlow,
                  {
                    backgroundColor:
                      selectedPlanet.color,
                  },
                ]}
              />

              <View
                style={[
                  styles.briefingPlanet,
                  {
                    backgroundColor:
                      selectedPlanet.color,
                  },
                ]}
              />

              <View style={styles.planetOrbitRing} />
            </View>

            <View style={styles.briefingDivider} />

            <View style={styles.briefingMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>
                  TYPE
                </Text>

                <Text style={styles.metaValue}>
                  {selectedPlanet.type}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>
                  DISTANCE
                </Text>

                <Text style={styles.metaValue}>
                  {selectedPlanet.distance}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>
                  TEMP
                </Text>

                <Text style={styles.metaValue}>
                  {selectedPlanet.temperature}
                </Text>
              </View>
            </View>

            <Text style={styles.briefingDescription}>
              {selectedPlanet.description}
            </Text>

            <View style={styles.factList}>
              {selectedPlanet.facts.map(
                (fact, index) => (
                  <View
                    key={fact}
                    style={styles.factRow}
                  >
                    <Text style={styles.factNumber}>
                      0{index + 1}
                    </Text>

                    <Text style={styles.factText}>
                      {fact}
                    </Text>
                  </View>
                )
              )}
            </View>

            <Pressable
              onPress={exploreWorld}
              style={({ pressed }) => [
                styles.exploreButton,
                pressed &&
                  styles.exploreButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Explore ${selectedPlanet.name}`}
            >
              <Text style={styles.exploreButtonText}>
                {selectedPlanet.name === 'EARTH'
                  ? 'ENTER EARTH'
                  : 'EXPLORE WORLD'}
              </Text>

              <Text style={styles.exploreButtonArrow}>
                →
              </Text>
            </Pressable>

            <Text style={styles.briefingHint}>
              {selectedPlanet.name === 'EARTH'
                ? 'EARTH EXPLORATION MODULE • STAGE 2'
                : '3D WORLD EXPERIENCE WILL UNLOCK NEXT'}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01030a',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 90,
  },

  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },

  header: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  backButtonPressed: {
    opacity: 0.55,
  },

  backArrow: {
    color: '#ffffff',
    fontSize: 20,
    marginRight: 8,
  },

  backText: {
    color: '#637895',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
  },

  brand: {
    alignItems: 'flex-end',
  },

  logo: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 7,
  },

  systemText: {
    color: '#3f536c',
    fontSize: 6,
    letterSpacing: 1.5,
    marginTop: 4,
  },

  intro: {
    marginTop: 55,
    marginBottom: 30,
  },

  kicker: {
    color: '#659fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 10,
  },

  title: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 3,
  },

  titleAccent: {
    color: '#73abff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 5,
  },

  description: {
    color: '#657995',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13,
  },

  mapSection: {
    marginBottom: 42,
  },

  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  mapKicker: {
    color: '#45627f',
    fontSize: 7,
    letterSpacing: 2,
    marginBottom: 4,
  },

  mapTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },

  online: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16324c',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#5ee6a8',
    marginRight: 6,
  },

  onlineText: {
    color: '#617b95',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  spaceMap: {
    height: 420,
    borderWidth: 1,
    borderColor: '#10263c',
    backgroundColor: 'rgba(255,255,255,0.015)',
    overflow: 'hidden',
    position: 'relative',
  },

  orbit: {
    position: 'absolute',
    left: '50%',
    top: 180,
    borderWidth: 1,
    borderColor: '#122d46',
    borderRadius: 999,
  },

  orbitOne: {
    width: 110,
    height: 70,
    marginLeft: -55,
    marginTop: -35,
    transform: [{ rotate: '-10deg' }],
  },

  orbitTwo: {
    width: 190,
    height: 130,
    marginLeft: -95,
    marginTop: -65,
    transform: [{ rotate: '8deg' }],
  },

  orbitThree: {
    width: 290,
    height: 210,
    marginLeft: -145,
    marginTop: -105,
    transform: [{ rotate: '-12deg' }],
  },

  orbitFour: {
    width: 390,
    height: 300,
    marginLeft: -195,
    marginTop: -150,
    transform: [{ rotate: '10deg' }],
  },

  sunGlow: {
    position: 'absolute',
    left: '50%',
    top: 160,
    marginLeft: -38,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(245,166,35,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sunCore: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5a623',
  },

  sunLabel: {
    position: 'absolute',
    left: '50%',
    top: 244,
    marginLeft: -10,
    color: '#c79d55',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 2,
  },

  planetPosition: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },

  planetPositionPressed: {
    opacity: 0.72,
  },

  planetNode: {
    alignItems: 'center',
    width: 80,
  },

  planet: {
    borderWidth: 1,
  },

  selectedPlanetGlow: {
    position: 'absolute',
    top: -11,
    backgroundColor: 'rgba(92,166,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(115,171,255,0.35)',
  },

  planetName: {
    color: '#dce7f7',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 6,
  },

  planetSubtitle: {
    color: '#506985',
    fontSize: 5,
    letterSpacing: 0.7,
    marginTop: 3,
    textAlign: 'center',
  },

  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
  },

  mapFooterText: {
    color: '#38516b',
    fontSize: 6,
    letterSpacing: 1,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#122c45',
    marginHorizontal: 10,
  },

  destinations: {
    marginBottom: 40,
  },

  sectionKicker: {
    color: '#659fff',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 2.5,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: 14,
  },

  destination: {
    minHeight: 74,
    borderTopWidth: 1,
    borderTopColor: '#102438',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  destinationPressed: {
    opacity: 0.55,
  },

  destinationSelected: {
    borderTopColor: '#24517e',
    backgroundColor: 'rgba(67,119,190,0.045)',
  },

  number: {
    color: '#314861',
    fontSize: 8,
    width: 30,
  },

  destinationPlanet: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 11,
  },

  destinationInfo: {
    flex: 1,
  },

  destinationName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  destinationSubtitle: {
    color: '#4d647c',
    fontSize: 6,
    letterSpacing: 1,
    marginTop: 4,
  },

  distance: {
    alignItems: 'flex-end',
    marginRight: 12,
  },

  distanceLabel: {
    color: '#344b63',
    fontSize: 5,
    letterSpacing: 1,
  },

  distanceValue: {
    color: '#70869d',
    fontSize: 7,
    marginTop: 4,
  },

  destinationArrow: {
    color: '#64809e',
    fontSize: 18,
  },

  deepSpace: {
    borderWidth: 1,
    borderColor: '#172c46',
    backgroundColor: 'rgba(65,85,150,0.035)',
    padding: 23,
    minHeight: 220,
    marginBottom: 45,
  },

  deepKicker: {
    color: '#6686b1',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 2,
  },

  deepTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    marginTop: 13,
  },

  deepDescription: {
    color: '#526981',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 13,
  },

  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 21,
  },

  lockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#607890',
    marginRight: 8,
  },

  comingText: {
    color: '#465c73',
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  footer: {
    alignItems: 'center',
  },

  footerLogo: {
    color: '#526a84',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 5,
  },

  footerText: {
    color: '#273d54',
    fontSize: 6,
    letterSpacing: 2,
    marginTop: 7,
  },

  /* PLANET BRIEFING */

  briefingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: 'flex-end',
  },

  briefingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,2,8,0.78)',
  },

  briefingCard: {
    backgroundColor: '#050a14',
    borderTopWidth: 1,
    borderTopColor: '#25425f',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '88%',
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 20,
  },

  briefingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  briefingKicker: {
    color: '#5f91c9',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 7,
  },

  briefingName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
  },

  briefingSubtitle: {
    color: '#6c88a7',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 5,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1b3854',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonPressed: {
    opacity: 0.5,
  },

  closeText: {
    color: '#9ab1c9',
    fontSize: 25,
    fontWeight: '300',
    lineHeight: 27,
  },

  briefingPlanetArea: {
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 5,
  },

  briefingPlanetGlow: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    opacity: 0.08,
  },

  briefingPlanet: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#6aaeff',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  planetOrbitRing: {
    position: 'absolute',
    width: 110,
    height: 35,
    borderWidth: 1,
    borderColor: 'rgba(83,145,210,0.28)',
    borderRadius: 60,
    transform: [{ rotate: '-12deg' }],
  },

  briefingDivider: {
    height: 1,
    backgroundColor: '#132a42',
    marginBottom: 14,
  },

  briefingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  metaItem: {
    flex: 1,
    paddingRight: 8,
  },

  metaLabel: {
    color: '#3f5871',
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  metaValue: {
    color: '#9cb2c9',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  briefingDescription: {
    color: '#7289a2',
    fontSize: 10,
    lineHeight: 17,
    marginBottom: 14,
  },

  factList: {
    borderTopWidth: 1,
    borderTopColor: '#11263c',
    marginBottom: 17,
  },

  factRow: {
    minHeight: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#0e2033',
    flexDirection: 'row',
    alignItems: 'center',
  },

  factNumber: {
    color: '#3f6d9d',
    fontSize: 7,
    fontWeight: '900',
    width: 30,
  },

  factText: {
    color: '#a0b2c6',
    fontSize: 8,
    flex: 1,
  },

  exploreButton: {
    height: 48,
    borderRadius: 25,
    backgroundColor: '#2467e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2467e8',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },

  exploreButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },

  exploreButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  exploreButtonArrow: {
    color: '#ffffff',
    fontSize: 19,
    marginLeft: 12,
  },

  briefingHint: {
    color: '#344b63',
    fontSize: 5.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 10,
  },
});