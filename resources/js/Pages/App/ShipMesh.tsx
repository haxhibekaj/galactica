import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Starship } from '@/types';
import * as THREE from 'three';
import { useRef, useState } from 'react';

interface Props {
    ship: Starship;
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
}

export default function ShipMesh({ ship, startPosition, endPosition }: Props) {
    const [progress, setProgress] = useState(ship.progress || 0);
    const positionRef = useRef(new THREE.Vector3());

    useFrame(() => {
        if (typeof ship.progress === 'number') {
            positionRef.current.lerpVectors(startPosition, endPosition, ship.progress / 100);
        }
    });

    return (
        <group position={positionRef.current}>
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#ff0000" />
            </mesh>
            <Billboard follow={true}>
                <Text
                    position={[0, 1, 0]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="#000000"
                >
                    {`${ship.name} (${Math.round(ship.progress || 0)}%)`}
                </Text>
            </Billboard>
        </group>
    );
} 