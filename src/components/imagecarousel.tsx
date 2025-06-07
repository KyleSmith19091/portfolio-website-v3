import { useScroll, Image } from "@react-three/drei";
import { useFrame, Canvas, extend } from "@react-three/fiber";
import { JSX, useRef, useState } from "react";
import { Group, Mesh, Material, DoubleSide, PlaneGeometry, Vector2 } from "three";
import { easing } from "maath";

// Type for Rig props (extends standard group properties)
type RigProps = JSX.IntrinsicElements['group'];

const Rig = (props: RigProps) => {
  const ref = useRef<Group>(null!); // Type useRef for a Three.js Group
  const rotationSpeed = 0.2; 
  const scroll = useScroll();
  useFrame((state, delta) => {
    if (ref.current) { // Check if ref is initialized
      // Rotate contents based on scroll
      ref.current.rotation.y += rotationSpeed * delta;
    }
    if (!state.events.update) {
      return;
    }
    state.events.update(); // Raycasts every frame rather than on pointer-move
    // Move camera based on pointer and slightly up
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta);
    state.camera.lookAt(0, 0, 0); // Look at center
  });
  return <group ref={ref} {...props} />;
};

// Type for Card props (extends standard mesh properties and adds url)
type CardProps = JSX.IntrinsicElements['mesh'] & {
  url: string;
};

const Card = ({ url, ...props }: CardProps) => {
  const ref = useRef<Mesh>(null!); // Type useRef for a Three.js Mesh
  const [hovered, hover] = useState<boolean>(false); // Type useState for boolean
  const pointerOver = (e: Event) => (e.stopPropagation(), hover(true)); // Type pointer event
  const pointerOut = () => hover(false);
  useFrame((state, delta) => {
     if (ref.current) { // Check if ref is initialized
        // Type assertion needed for material properties added by extend
        const material = ref.current.material as (Material & { radius: number; zoom: number; });
        easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
        easing.damp(material, 'radius', hovered ? 0.2 : 0.1, 0.2, delta);
        easing.damp(material, 'zoom', hovered ? 1.2 : 1.0, 0.2, delta);
     }
  });
  return (
    <Image
      ref={ref}
      url={url}
      transparent
      side={DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      {...props}
    >
      {/* Using the custom bent geometry */}
      {/* TypeScript now understands <bentPlaneGeometry /> because of the .d.ts file */}
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  );
};

// Type for Carousel props
interface CarouselProps {
  imageUrls: string[];
  radius?: number;
}

const Carousel = ({ imageUrls, radius = 1.4 }: CarouselProps) => {
  const count = imageUrls.length;
  return (
    <> {/* Use fragment if you don't need a wrapper group */}
      {imageUrls.map((url, i) => (
        <Card
          key={url} // Using URL as key (assuming unique URLs)
          url={url}
          position={[
            Math.sin((i / count) * Math.PI * 2) * radius,
            0,
            Math.cos((i / count) * Math.PI * 2) * radius,
          ]}
          rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
        />
      ))}
    </>
  );
};

// Type for the main component props
interface ImageCarousel3DProps {
  imageUrls: string[];
}

const ImageCarousel3D = ({ imageUrls }: ImageCarousel3DProps) => (
  <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
    {/* Optional: Add fog for depth effect */}
    <fog attach="fog" args={['white', 0, 0]} />

      <Rig rotation={[0, 0, 0.15]}>
        {/* Pass the image URLs down to the Carousel */}
        <Carousel imageUrls={imageUrls} />
      </Rig>
      {/* Removed Banner component */}

    {/* ScrollControls links vertical scroll to the Rig's rotation */}
    {/* Adjust 'pages' based on how much scroll space you want the carousel to occupy */}
    {/* TypeScript checks prop types */}
  </Canvas>
);

class BentPlaneGeometry extends PlaneGeometry {
    constructor(radius, ...args) {
      super(...args)
      let p = this.parameters
      let hw = p.width * 0.5
      let a = new Vector2(-hw, 0)
      let b = new Vector2(0, radius)
      let c = new Vector2(hw, 0)
      let ab = new Vector2().subVectors(a, b)
      let bc = new Vector2().subVectors(b, c)
      let ac = new Vector2().subVectors(a, c)
      let r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)))
      let center = new Vector2(0, radius - r)
      let baseV = new Vector2().subVectors(a, center)
      let baseAngle = baseV.angle() - Math.PI * 0.5
      let arc = baseAngle * 2
      let uv = this.attributes.uv
      let pos = this.attributes.position
      let mainV = new Vector2()
      for (let i = 0; i < uv.count; i++) {
        let uvRatio = 1 - uv.getX(i)
        let y = pos.getY(i)
        mainV.copy(c).rotateAround(center, arc * uvRatio)
        pos.setXYZ(i, mainV.x, y, -mainV.y)
      }
      pos.needsUpdate = true
    }
  }
extend({ BentPlaneGeometry })

export default ImageCarousel3D;
