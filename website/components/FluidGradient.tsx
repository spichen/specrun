"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave1 = sin(pos.x * uFrequency + uTime * 0.4) * uAmplitude;
    float wave2 = sin(pos.y * uFrequency * 0.8 + uTime * 0.3) * uAmplitude * 0.6;
    float wave3 = sin((pos.x + pos.y) * uFrequency * 0.5 + uTime * 0.2) * uAmplitude * 0.4;

    pos.z += wave1 + wave2 + wave3;
    vElevation = wave1 + wave2 + wave3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uBaseColor;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float blend1 = sin(vUv.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
    float blend2 = sin(vUv.y * 2.5 + uTime * 0.3 + 1.0) * 0.5 + 0.5;

    vec3 gradientColor = mix(uColor1, uColor2, blend1);
    gradientColor = mix(gradientColor, uColor3, blend2 * 0.6);

    float intensity = smoothstep(-0.5, 0.5, vElevation) * 0.7 + 0.3;

    float verticalFade = smoothstep(1.0, 0.3, vUv.y);
    vec3 finalColor = mix(uBaseColor, gradientColor * intensity, verticalFade * 0.8);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function GradientMesh() {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrequency: { value: 2.0 },
      uAmplitude: { value: 0.15 },
      uColor1: { value: new Color(0xfa93fa) },
      uColor2: { value: new Color(0xc967e8) },
      uColor3: { value: new Color(0x983ad6) },
      uBaseColor: { value: new Color(0x010101) },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function FluidGradient() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0, 2], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false }}
    >
      <GradientMesh />
    </Canvas>
  );
}
