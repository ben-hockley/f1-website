'use client';

import { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Mesh, MeshStandardMaterial, Object3D, PCFShadowMap, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { getConstructorCarModelConfig } from '@/lib/constructorCarModels';

interface ConstructorCarModelViewerProps {
  constructorId: string;
  constructorName: string;
  className?: string;
}

interface ConstructorModelProps {
  modelPath: string;
  color: string;
}

const NORMALIZED_MODEL_SIZE = 6.1;
const NORMALIZED_MODEL_FLOOR_Y = -0.45;

function applyMeshShadowSettings(model: Object3D) {
  model.traverse((child: Object3D) => {
    const meshChild = child as Mesh;

    if (!meshChild.isMesh) {
      return;
    }

    meshChild.castShadow = true;
    meshChild.receiveShadow = true;
  });
}

function normalizeModelTransform(model: Object3D): Object3D {
  const bounds = new Box3().setFromObject(model);
  const size = new Vector3();
  const center = new Vector3();

  bounds.getSize(size);
  bounds.getCenter(center);

  const maxDimension = Math.max(size.x, size.y, size.z);

  if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
    return model;
  }

  const scaleFactor = NORMALIZED_MODEL_SIZE / maxDimension;

  model.position.sub(center);
  model.scale.multiplyScalar(scaleFactor);
  model.updateMatrixWorld(true);

  const fittedBounds = new Box3().setFromObject(model);
  const minY = fittedBounds.min.y;
  model.position.y += NORMALIZED_MODEL_FLOOR_Y - minY;

  return model;
}

function ConstructorObjModel({ modelPath, color }: ConstructorModelProps) {
  const model = useLoader(OBJLoader, modelPath);

  const styledModel = useMemo(() => {
    const clonedModel = model.clone();

    clonedModel.traverse((child: Object3D) => {
      const meshChild = child as Mesh;

      if (!meshChild.isMesh) {
        return;
      }

      meshChild.material = new MeshStandardMaterial({
        color,
        metalness: 0.35,
        roughness: 0.45,
      });
    });

    applyMeshShadowSettings(clonedModel);

    return clonedModel;
  }, [model, color]);

  return <primitive object={styledModel} position={[0, -0.15, 0]} scale={1.3} />;
}

function ConstructorGlbModel({ modelPath }: Pick<ConstructorModelProps, 'modelPath'>) {
  const gltf = useGLTF(modelPath);

  const model = useMemo(() => {
    const clonedModel = gltf.scene.clone(true);
    applyMeshShadowSettings(clonedModel);
    return normalizeModelTransform(clonedModel);
  }, [gltf.scene]);

  return <primitive object={model} />;
}

function ConstructorModel({ modelPath, color }: ConstructorModelProps) {
  const normalizedPath = modelPath.trim().toLowerCase();
  const isGlbModel = normalizedPath.endsWith('.glb') || normalizedPath.endsWith('.gltf');

  if (isGlbModel) {
    return <ConstructorGlbModel modelPath={modelPath} />;
  }

  return <ConstructorObjModel modelPath={modelPath} color={color} />;
}

export default function ConstructorCarModelViewer({ constructorId, className }: ConstructorCarModelViewerProps) {
  const { modelPath, accentColor } = getConstructorCarModelConfig(constructorId);

  if (!modelPath) {
    return null;
  }

  const containerClassName = className ?? 'h-[350px] w-full bg-transparent md:h-[420px]';

  return (
    <div className={containerClassName}>
      <Canvas camera={{ position: [4.6, 1.1, 4.4], fov: 34 }} shadows={{ type: PCFShadowMap }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.85} />
        <hemisphereLight color="#e2e8f0" groundColor="#0f172a" intensity={0.8} />
        <directionalLight position={[6, 8, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 4, -6]} intensity={0.8} />
        <pointLight position={[0, 3, 6]} intensity={0.6} />

        <Suspense fallback={null}>
          <ConstructorModel modelPath={modelPath} color={accentColor} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={8}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate
          autoRotateSpeed={0.9}
        />
      </Canvas>
    </div>
  );
}
