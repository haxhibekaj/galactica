import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Planet, TradeRoute } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Billboard, OrbitControls, Stars, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import * as THREE from 'three';

interface Props {
    planets: Planet[];
    tradeRoutes: TradeRoute[];
}

function PlanetMesh({
    planet,
    onHover,
}: {
    planet: Planet;
    onHover: (planet: Planet | null) => void;
}) {
    return (
        <group
            position={[
                planet.coordinates.x / 10,
                planet.coordinates.y / 10,
                planet.coordinates.z / 10,
            ]}
        >
            <mesh
                onPointerOver={() => onHover(planet)}
                onPointerOut={() => onHover(null)}
            >
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial
                    color={planet.color || '#1a73e8'}
                    roughness={0.7}
                    metalness={0.3}
                />
            </mesh>
            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <Text
                    position={[0, -3, 0]}
                    fontSize={1.5}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="#000000"
                >
                    {planet.name}
                </Text>
            </Billboard>
        </group>
    );
}

function TradeRouteLine({
    start,
    end,
    status,
    route,
    onHover,
}: {
    start: THREE.Vector3;
    end: THREE.Vector3;
    status: string;
    route: TradeRoute;
    onHover: (route: TradeRoute | null) => void;
}) {
    const curve = new THREE.LineCurve3(start, end);
    return (
        <mesh
            onPointerOver={(e) => {
                e.stopPropagation();
                onHover(route);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                onHover(null);
            }}
            onPointerMissed={() => onHover(null)}
        >
            <tubeGeometry args={[curve, 20, 0.1, 8, false]} />
            <meshStandardMaterial
                color={
                    status === 'active'
                        ? 'white'
                        : status === 'delayed'
                          ? 'orange'
                          : 'red'
                }
                transparent
                opacity={0.8}
                roughness={0.3}
                metalness={0.3}
            />
        </mesh>
    );
}

function Scene({
    planets,
    tradeRoutes,
    onHover,
}: Props & { onHover: (route: TradeRoute | null) => void }) {
    const [hoveredRoute, setHoveredRoute] = useState<TradeRoute | null>(null);
    const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);

    // Calculate the center and bounds of all planets
    const bounds = planets.reduce(
        (acc, planet) => {
            acc.minX = Math.min(acc.minX, planet.coordinates.x / 10);
            acc.maxX = Math.max(acc.maxX, planet.coordinates.x / 10);
            acc.minY = Math.min(acc.minY, planet.coordinates.y / 10);
            acc.maxY = Math.max(acc.maxY, planet.coordinates.y / 10);
            acc.minZ = Math.min(acc.minZ, planet.coordinates.z / 10);
            acc.maxZ = Math.max(acc.maxZ, planet.coordinates.z / 10);
            return acc;
        },
        {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
            minZ: Infinity,
            maxZ: -Infinity,
        },
    );

    const center = {
        x: (bounds.minX + bounds.maxX) / 2,
        y: (bounds.minY + bounds.maxY) / 2,
        z: (bounds.minZ + bounds.maxZ) / 2,
    };

    // Calculate camera distance based on scene size
    const maxDimension = Math.max(
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
        bounds.maxZ - bounds.minZ,
    );
    const cameraDistance = maxDimension * 1.5; // Adjust multiplier as needed

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} />

            {/* Center the scene */}
            <group position={[-center.x, -center.y, -center.z]}>
                {/* Render Planets */}
                {planets.map((planet) => (
                    <PlanetMesh
                        key={planet.id}
                        planet={planet}
                        onHover={setHoveredPlanet}
                    />
                ))}

                {/* Render Trade Routes */}
                {tradeRoutes.map((route) => {
                    const startPlanet = planets.find(
                        (p) => p.id === route.starting_planet_id,
                    );
                    const endPlanet = planets.find(
                        (p) => p.id === route.destination_planet_id,
                    );

                    if (!startPlanet || !endPlanet) return null;

                    const start = new THREE.Vector3(
                        startPlanet.coordinates.x / 10,
                        startPlanet.coordinates.y / 10,
                        startPlanet.coordinates.z / 10,
                    );
                    const end = new THREE.Vector3(
                        endPlanet.coordinates.x / 10,
                        endPlanet.coordinates.y / 10,
                        endPlanet.coordinates.z / 10,
                    );

                    return (
                        <TradeRouteLine
                            key={route.id}
                            start={start}
                            end={end}
                            status={route.status}
                            route={route}
                            onHover={onHover}
                        />
                    );
                })}
            </group>

            <OrbitControls
                enableZoom={true}
                minDistance={cameraDistance * 0.5} // Minimum zoom
                maxDistance={cameraDistance * 2} // Maximum zoom
                enablePan={false} // Disable panning
                enableDamping={true} // Smooth camera movement
                dampingFactor={0.05}
                rotateSpeed={0.5} // Slower rotation
            />

            {/* Add ambient occlusion and other effects */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        </>
    );
}

export default function Index({ planets, tradeRoutes }: Props) {
    const [hoveredRoute, setHoveredRoute] = useState<TradeRoute | null>(null);

    return (
        <>
            <Head title="Space Map" />

            <div className="relative h-[calc(100vh-80px)]">
                <Canvas
                    style={{
                        position: 'absolute',
                        zIndex: 0,
                        borderRadius: '16px',
                    }}
                    camera={{
                        position: [0, 0, 50],
                        fov: 60,
                        near: 1,
                        far: 1000,
                    }}
                >
                    <Scene
                        planets={planets}
                        tradeRoutes={tradeRoutes}
                        onHover={setHoveredRoute}
                    />
                </Canvas>
                <AnimatePresence>
                    {hoveredRoute && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-4"
                        >
                            <Card className="p-4">
                                <h3>{hoveredRoute.name}</h3>
                                <p>Status: {hoveredRoute.status}</p>
                                <p>Travel Time: {hoveredRoute.travel_time}h</p>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex w-full items-center justify-center h-20 gap-4">
                <Button variant="outline" asChild>
                    <Link href={route('dashboard')}>Dashboard</Link>
                </Button>
                <h1 className="text-2xl font-bold">GALACTICA</h1>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">Info</Button>
                    </PopoverTrigger>
                    <PopoverContent side="top">
                        <p>
                            This is an interactable 3D map of the planets and
                            their trade routes. Hover over any of the routes to
                            see their status. Proceed to the dashboard to manage
                            your planets and trade routes.
                        </p>
                    </PopoverContent>
                </Popover>
            </div>
        </>
    );
}
