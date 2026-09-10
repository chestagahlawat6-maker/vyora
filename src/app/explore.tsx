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
  type: string;
  temperature: string;
  description: string;
  facts: string[];
  orbitIndex: number;
  orbitAngle: number;
  hasRings?: boolean;
};

const planets: Planet[] = [
  {
    name: 'MERCURY',
    subtitle: 'THE SWIFT WORLD',
    distance: '57.9M KM',
    size: 17,
    color: '#81786f',
    type: 'ROCKY PLANET',
    temperature: '−180°C TO 430°C',
    description:
      'The smallest planet in the solar system and the closest world to the Sun.',
    facts: [
      'Smallest planet in the solar system',
      'Fastest orbit around the Sun',
      'Almost no atmosphere',
    ],
    orbitIndex: 0,
    orbitAngle: -72,
  },
  {
    name: 'VENUS',
    subtitle: 'THE HOT WORLD',
    distance: '108.2M KM',
    size: 25,
    color: '#c58b50',
    type: 'ROCKY PLANET',
    temperature: '≈ 465°C',
    description:
      'A world hidden beneath thick clouds, with the hottest surface of any planet.',
    facts: [
      'Hottest planet in the solar system',
      'Covered by thick clouds',
      'Rotates very slowly',
    ],
    orbitIndex: 1,
    orbitAngle: -35,
  },
  {
    name: 'EARTH',
    subtitle: 'OUR BLUE HOME',
    distance: '149.6M KM',
    size: 31,
    color: '#2877ce',
    type: 'ROCKY PLANET',
    temperature: '≈ 15°C AVERAGE',
    description:
      'A dynamic world of oceans, continents and life — the only world currently known to support life.',
    facts: [
      'Liquid water covers most of its surface',
      'Has one natural satellite: the Moon',
      'Our home in the cosmos',
    ],
    orbitIndex: 2,
    orbitAngle: -5,
  },
  {
    name: 'MARS',
    subtitle: 'THE RED PLANET',
    distance: '227.9M KM',
    size: 23,
    color: '#b6543d',
    type: 'ROCKY PLANET',
    temperature: '≈ −63°C AVERAGE',
    description:
      'A cold desert world marked by giant volcanoes, valleys and evidence of ancient water.',
    facts: [
      'Home to Olympus Mons',
      'Has two small moons',
      'Shows evidence of ancient water',
    ],
    orbitIndex: 3,
    orbitAngle: 35,
  },
  {
    name: 'JUPITER',
    subtitle: 'THE GAS GIANT',
    distance: '778.5M KM',
    size: 48,
    color: '#b77c5b',
    type: 'GAS GIANT',
    temperature: '≈ −110°C CLOUD TOPS',
    description:
      'A colossal world of swirling clouds, powerful storms and an enormous magnetic field.',
    facts: [
      'Largest planet in the solar system',
      'Has the Great Red Spot',
      'Has dozens of known moons',
    ],
    orbitIndex: 4,
    orbitAngle: 70,
    hasRings: true,
  },
  {
    name: 'SATURN',
    subtitle: 'THE RINGED WORLD',
    distance: '1.43B KM',
    size: 43,
    color: '#c8aa77',
    type: 'GAS GIANT',
    temperature: '≈ −140°C CLOUD TOPS',
    description:
      'A giant planet surrounded by a spectacular system of icy rings.',
    facts: [
      'Famous for its extensive ring system',
      'Less dense than water',
      'Has many known moons',
    ],
    orbitIndex: 5,
    orbitAngle: 125,
    hasRings: true,
  },
  {
    name: 'URANUS',
    subtitle: 'THE ICE GIANT',
    distance: '2.87B KM',
    size: 34,
    color: '#76b8c8',
    type: 'ICE GIANT',
    temperature: '≈ −195°C',
    description:
      'A pale blue ice giant rotating on its side with a faint system of rings.',
    facts: [
      'Rotates with an extreme axial tilt',
      'Has a faint ring system',
      'An ice giant rich in water, methane and ammonia',
    ],
    orbitIndex: 6,
    orbitAngle: 175,
    hasRings: true,
  },
  {
    name: 'NEPTUNE',
    subtitle: 'THE WINDY WORLD',
    distance: '4.50B KM',
    size: 33,
    color: '#4169c1',
    type: 'ICE GIANT',
    temperature: '≈ −200°C',
    description:
      'The most distant major planet, famous for its deep blue color and extremely fast winds.',
    facts: [
      'Farthest planet from the Sun',
      'Has the fastest planetary winds',
      'An ice giant with a dark, dynamic atmosphere',
    ],
    orbitIndex: 7,
    orbitAngle: 220,
    hasRings: true,
  },
];

const orbitDurations = [
  5200,
  7200,
  9200,
  11500,
  15500,
  19000,
  23000,
  27000,
];

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: (i * 47.731) % 100,
        top: (i * 71.193 + 13) % 100,
        size: 0.5 + ((i * 17) % 18) / 10,
        opacity: Math.min(0.12 + ((i * 29) % 65) / 100, 0.78),
        twinkle: i % 5 === 0,
      })),
    []
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star) => (
        <TwinklingStar key={star.id} star={star} />
      ))}
    </View>
  );
}

function TwinklingStar({
  star,
}: {
  star: {
    id: number;
    left: number;
    top: number;
    size: number;
    opacity: number;
    twinkle: boolean;
  };
}) {
  const opacity = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    if (!star.twinkle) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: Math.max(star.opacity * 0.35, 0.08),
          duration: 1100 + star.id * 37,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: star.opacity,
          duration: 1300 + star.id * 41,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, star]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: star.size,
          height: star.size,
          opacity,
        },
      ]}
    />
  );
}

function Sun() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.sunSystem, { transform: [{ scale }] }]}
    >
      <View style={styles.sunOuterGlow} />
      <View style={styles.sunMiddleGlow} />
      <View style={styles.sunInnerGlow} />

      <View style={styles.sunCore}>
        <View style={styles.sunHighlight} />
      </View>
    </Animated.View>
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
  const selectedScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.055,
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
    Animated.spring(selectedScale, {
      toValue: selected ? 1.16 : 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [selected, selectedScale]);

  const isJupiter = planet.name === 'JUPITER';
  const isSaturn = planet.name === 'SATURN';
  const isUranus = planet.name === 'URANUS';
  const isNeptune = planet.name === 'NEPTUNE';

  return (
    <Animated.View
      style={[
        styles.planetNode,
        {
          transform: [
            { scale: pulse },
            { scale: selectedScale },
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
              width: planet.size + 24,
              height: planet.size + 24,
              borderRadius: (planet.size + 24) / 2,
            },
          ]}
        />
      )}

      {planet.hasRings && (
        <View
          pointerEvents="none"
          style={[
            styles.mapPlanetRing,
            {
              width: planet.size + (isSaturn ? 34 : 23),
              height: planet.size * 0.42,
              borderColor: isSaturn
                ? 'rgba(225,205,160,0.72)'
                : 'rgba(180,200,215,0.34)',
            },
          ]}
        >
          {isSaturn && <View style={styles.innerRing} />}
        </View>
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
              ? '#b5d5ff'
              : 'rgba(255,255,255,0.42)',
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.planetShade,
            {
              width: planet.size * 0.82,
              height: planet.size * 0.82,
              borderRadius: planet.size / 2,
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.planetHighlight,
            {
              width: Math.max(planet.size * 0.25, 4),
              height: Math.max(planet.size * 0.25, 4),
              left: planet.size * 0.2,
              top: planet.size * 0.17,
              backgroundColor: isUranus
                ? 'rgba(225,255,255,0.38)'
                : isNeptune
                  ? 'rgba(170,210,255,0.32)'
                  : isJupiter
                    ? 'rgba(255,240,210,0.30)'
                    : 'rgba(255,255,255,0.27)',
            },
          ]}
        />

        {isJupiter && <View style={styles.jupiterBand} />}
      </View>

      <Text style={styles.planetName}>{planet.name}</Text>
      <Text style={styles.planetSubtitle}>{planet.subtitle}</Text>
    </Animated.View>
  );
}

function Orbit({
  radius,
  centerX,
  centerY,
}: {
  radius: number;
  centerX: number;
  centerY: number;
}) {
  const height = radius * 1.15;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.orbit,
        {
          width: radius * 2,
          height,
          left: centerX - radius,
          top: centerY - height / 2,
        },
      ]}
    />
  );
}

function AsteroidBelt({
  centerX,
  centerY,
  innerRadius,
  outerRadius,
}: {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
}) {
  const dots = useMemo(
    () =>
      Array.from({ length: 85 }, (_, i) => {
        const angle =
          (i * 137.5 + (i % 5) * 9) * (Math.PI / 180);

        const distance =
          innerRadius +
          ((outerRadius - innerRadius) * ((i * 17) % 100)) / 100;

        return {
          id: i,
          left: centerX + Math.cos(angle) * distance,
          top: centerY + Math.sin(angle) * distance * 0.575,
          size: 1 + (i % 3) * 0.55,
          opacity: 0.16 + (i % 5) * 0.065,
        };
      }),
    [centerX, centerY, innerRadius, outerRadius]
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((dot) => (
        <View
          key={dot.id}
          style={[
            styles.asteroid,
            {
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.asteroidOutline,
          {
            width: outerRadius * 2,
            height: outerRadius * 1.15,
            left: centerX - outerRadius,
            top: centerY - (outerRadius * 1.15) / 2,
          },
        ]}
      />

      <View
        style={[
          styles.asteroidOutline,
          {
            width: innerRadius * 2,
            height: innerRadius * 1.15,
            left: centerX - innerRadius,
            top: centerY - (innerRadius * 1.15) / 2,
          },
        ]}
      />
    </View>
  );
}

function MovingPlanet({
  planet,
  index,
  position,
  radius,
  selected,
  onPress,
}: {
  planet: Planet;
  index: number;
  position: { left: number; top: number };
  radius: number;
  selected: boolean;
  onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  const inputRange = useMemo(
    () => Array.from({ length: 25 }, (_, i) => i / 24),
    []
  );

  const angles = useMemo(
    () =>
      Array.from(
        { length: 25 },
        (_, i) => planet.orbitAngle + (360 * i) / 24
      ),
    [planet.orbitAngle]
  );

  const startAngle = planet.orbitAngle * (Math.PI / 180);

  const translateX = progress.interpolate({
    inputRange,
    outputRange: angles.map(
      (angle) =>
        Math.cos(angle * (Math.PI / 180)) * radius -
        Math.cos(startAngle) * radius
    ),
    extrapolate: 'clamp',
  });

  const translateY = progress.interpolate({
    inputRange,
    outputRange: angles.map(
      (angle) =>
        Math.sin(angle * (Math.PI / 180)) * radius * 0.575 -
        Math.sin(startAngle) * radius * 0.575
    ),
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: orbitDurations[index],
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [index, progress]);

  return (
    <Animated.View
      style={[
        styles.movingPlanet,
        {
          left: position.left,
          top: position.top,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Explore ${planet.name}`}
        style={({ pressed }) => [
          styles.planetButton,
          pressed && styles.planetPressed,
        ]}
      >
        <Planet planet={planet} index={index} selected={selected} />
      </Pressable>
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
  const panelOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslate = useRef(new Animated.Value(45)).current;

  useEffect(() => {
    music.volume = 0.28;
    music.loop = true;
    music.play();

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
      music.pause();
    };
  }, [music, opacity, translate]);

  function openPlanet(planet: Planet) {
    setSelectedPlanet(planet);
    panelOpacity.setValue(0);
    panelTranslate.setValue(45);

    Animated.parallel([
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(panelTranslate, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closePlanet() {
    Animated.parallel([
      Animated.timing(panelOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(panelTranslate, {
        toValue: 25,
        duration: 250,
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

    if (planetName === 'EARTH') {
      setTimeout(() => {
        router.push('/earth' as any);
      }, 300);
    }
  }

  const mapWidth = Math.max(width - 44, 280);
  const mapHeight = 500;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  const maxRadius = Math.min(mapWidth / 2 - 24, 228);
  const minRadius = 43;

  const orbitRadii = Array.from(
    { length: 8 },
    (_, i) =>
      minRadius + ((maxRadius - minRadius) / 7) * i
  );

  function getPlanetPosition(planet: Planet) {
    const radius = orbitRadii[planet.orbitIndex];
    const angle = planet.orbitAngle * (Math.PI / 180);

    return {
      left: centerX + Math.cos(angle) * radius - 40,
      top:
        centerY +
        Math.sin(angle) * radius * 0.575 -
        30,
    };
  }

  const asteroidInnerRadius =
    orbitRadii[3] +
    (orbitRadii[4] - orbitRadii[3]) * 0.18;

  const asteroidOuterRadius =
    orbitRadii[3] +
    (orbitRadii[4] - orbitRadii[3]) * 0.82;

  return (
    <View style={styles.container}>
      <StarField />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Animated.View style={[styles.header, { opacity }]}>
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
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
            Eight worlds mapped.{'\n'}
            Infinite questions waiting to be asked.
          </Text>
        </Animated.View>

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
              <Text style={styles.onlineText}>LIVE</Text>
            </View>
          </View>

          <View
            style={[
              styles.spaceMap,
              { width: mapWidth, height: mapHeight },
            ]}
          >
            {orbitRadii.map((radius, index) => (
              <Orbit
                key={index}
                radius={radius}
                centerX={centerX}
                centerY={centerY}
              />
            ))}

            <AsteroidBelt
              centerX={centerX}
              centerY={centerY}
              innerRadius={asteroidInnerRadius}
              outerRadius={asteroidOuterRadius}
            />

            <Text
              style={[
                styles.asteroidLabel,
                {
                  left: centerX + asteroidOuterRadius * 0.55,
                  top: centerY - asteroidOuterRadius * 0.32,
                },
              ]}
            >
              ASTEROID{'\n'}BELT
            </Text>

            <View
              pointerEvents="none"
              style={[
                styles.sunContainer,
                {
                  left: centerX - 50,
                  top: centerY - 50,
                },
              ]}
            >
              <Sun />
            </View>

            <Text
              style={[
                styles.sunLabel,
                {
                  left: centerX - 10,
                  top: centerY + 48,
                },
              ]}
            >
              SOL
            </Text>

            {planets.map((planet, index) => (
              <MovingPlanet
                key={planet.name}
                planet={planet}
                index={index}
                position={getPlanetPosition(planet)}
                radius={orbitRadii[planet.orbitIndex]}
                selected={selectedPlanet?.name === planet.name}
                onPress={() => openPlanet(planet)}
              />
            ))}

            <View
              pointerEvents="none"
              style={[
                styles.centerLabel,
                {
                  left: centerX - 52,
                  top: centerY - 8,
                },
              ]}
            >
              <Text style={styles.centerText}>SOLAR</Text>
              <Text style={styles.centerText}>SYSTEM</Text>
            </View>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapFooterText}>
              08 PLANETS MAPPED
            </Text>

            <View style={styles.footerLine} />

            <Text style={styles.mapFooterText}>
              ORBITS: ACTIVE
            </Text>
          </View>
        </Animated.View>

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
                pressed && styles.pressed,
                selectedPlanet?.name === planet.name &&
                  styles.destinationSelected,
              ]}
            >
              <Text style={styles.number}>
                {String(index + 1).padStart(2, '0')}
              </Text>

              <View
                style={[
                  styles.destinationPlanet,
                  { backgroundColor: planet.color },
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

        <Animated.View
          style={[styles.deepSpace, { opacity }]}
        >
          <Text style={styles.deepKicker}>
            BEYOND THE SOLAR SYSTEM
          </Text>

          <Text style={styles.deepTitle}>
            The universe{'\n'}gets stranger.
          </Text>

          <Text style={styles.deepDescription}>
            Black holes. Neutron stars. Galaxies.{'\n'}
            Mysteries we are still learning to understand.
          </Text>

          <View style={styles.comingSoon}>
            <View style={styles.lockDot} />

            <Text style={styles.comingText}>
              DEEP SPACE MISSIONS — COMING SOON
            </Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>VYORA</Text>

          <Text style={styles.footerText}>
            EXPLORE · DISCOVER · UNDERSTAND
          </Text>
        </View>
      </ScrollView>

      {selectedPlanet && (
        <Animated.View
          style={[
            styles.briefingOverlay,
            { opacity: panelOpacity },
          ]}
        >
          <Pressable
            style={styles.backdrop}
            onPress={closePlanet}
            accessibilityRole="button"
            accessibilityLabel="Close planet briefing"
          />

          <Animated.View
            style={[
              styles.briefingCard,
              {
                transform: [
                  { translateY: panelTranslate },
                ],
              },
            ]}
          >
            <View style={styles.briefingTop}>
              <View style={styles.briefingTitleArea}>
                <Text style={styles.briefingKicker}>
                  DESTINATION{' '}
                  {String(
                    planets.findIndex(
                      (planet) =>
                        planet.name === selectedPlanet.name
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
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.briefingPlanetArea}>
              <View
                style={[
                  styles.briefingGlow,
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
              >
                <View style={styles.briefingHighlight} />
              </View>

              <View style={styles.planetOrbitRing} />
            </View>

            <View style={styles.divider} />

            <View style={styles.briefingMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>TYPE</Text>
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
                <Text style={styles.metaLabel}>TEMP</Text>
                <Text style={styles.metaValue}>
                  {selectedPlanet.temperature}
                </Text>
              </View>
            </View>

            <Text style={styles.briefingDescription}>
              {selectedPlanet.description}
            </Text>

            <View style={styles.factList}>
              {selectedPlanet.facts.map((fact, index) => (
                <View key={fact} style={styles.factRow}>
                  <Text style={styles.factNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>

                  <Text style={styles.factText}>
                    {fact}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={exploreWorld}
              style={({ pressed }) => [
                styles.exploreButton,
                pressed && styles.explorePressed,
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
    backgroundColor: '#fff',
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

  pressed: {
    opacity: 0.55,
  },

  backArrow: {
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    borderWidth: 1,
    borderColor: '#10263c',
    backgroundColor: 'rgba(255,255,255,0.015)',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },

  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#122d46',
    borderRadius: 999,
  },

  asteroid: {
    position: 'absolute',
    backgroundColor: '#8b7b65',
    borderRadius: 999,
  },

  asteroidOutline: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(126,105,77,0.12)',
    borderRadius: 999,
  },

  asteroidLabel: {
    position: 'absolute',
    color: '#5e5447',
    fontSize: 5,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 8,
  },

  sunContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sunSystem: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sunOuterGlow: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: 'rgba(245,166,35,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.06)',
  },

  sunMiddleGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,166,35,0.10)',
  },

  sunInnerGlow: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(255,190,55,0.13)',
  },

  sunCore: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5a623',
    borderWidth: 1,
    borderColor: '#ffd36b',
    shadowColor: '#f5a623',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },

  sunHighlight: {
    width: 12,
    height: 9,
    borderRadius: 8,
    marginLeft: 7,
    marginTop: 6,
    backgroundColor: 'rgba(255,240,180,0.42)',
  },

  sunLabel: {
    position: 'absolute',
    color: '#c79d55',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 2,
  },

  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    opacity: 0.22,
  },

  centerText: {
    color: '#d6e5f8',
    fontSize: 4.5,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  movingPlanet: {
    position: 'absolute',
    width: 80,
    height: 70,
  },

  planetButton: {
    width: 80,
    alignItems: 'center',
  },

  planetNode: {
    width: 80,
    alignItems: 'center',
    position: 'relative',
  },

  planet: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },

  planetShade: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(0,0,0,0.17)',
  },

  planetHighlight: {
    position: 'absolute',
  },

  jupiterBand: {
    position: 'absolute',
    width: '76%',
    height: 2,
    left: '12%',
    top: '58%',
    backgroundColor: 'rgba(105,58,38,0.25)',
  },

  mapPlanetRing: {
    position: 'absolute',
    top: '28%',
    left: '50%',
    marginLeft: -12,
    borderWidth: 1,
    borderRadius: 999,
    transform: [{ rotate: '-15deg' }],
    zIndex: 1,
  },

  innerRing: {
    position: 'absolute',
    left: 5,
    right: 5,
    top: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(240,220,180,0.34)',
    borderRadius: 999,
  },

  selectedPlanetGlow: {
    position: 'absolute',
    top: -12,
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
    textAlign: 'center',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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

  briefingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    justifyContent: 'flex-end',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 20,
  },

  briefingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  briefingTitleArea: {
    flex: 1,
  },

  briefingKicker: {
    color: '#5f91c9',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 7,
  },

  briefingName: {
    color: '#fff',
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

  briefingGlow: {
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
    overflow: 'hidden',
  },

  briefingHighlight: {
    width: 20,
    height: 15,
    borderRadius: 12,
    marginLeft: 12,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
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

  divider: {
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

  explorePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },

  exploreButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  exploreButtonArrow: {
    color: '#fff',
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