import { Suspense, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion'; 
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Interactive "Water Wave" 3D Scene ---
function InteractiveBackground() {
  const ShaderPlane = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (materialRef.current) {
                const x = (event.clientX / window.innerWidth) * 2 - 1;
                const y = -(event.clientY / window.innerHeight) * 2 + 1;
                materialRef.current.uniforms.uMouse.value.set(x, y);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((_, delta) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta;
      }
    });
    
    const vertexShader = ` varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `;
    const fragmentShader = `
      uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
      vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;} vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);} vec4 taylorInvSqrt(vec4 r){return 1.792842914-0.85373472095*r;}
      float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
      void main() {
        vec2 centeredUv = vUv * 2.0 - 1.0; float dist = distance(centeredUv, uMouse); float wave = sin(dist * 20.0 - uTime * 3.0) * 0.1; float noise = snoise(vec3(vUv * 4.0, uTime * 0.3)) * 0.1;
        float elevation = (wave * smoothstep(0.5, 0.0, dist)) + noise; vec3 colorA=vec3(.05,.0,.15);vec3 colorB=vec3(.3,.1,.6);vec3 colorC=vec3(.2,.7,.8);
        vec3 finalColor=mix(colorA,colorB,smoothstep(-.1,.1,elevation)); finalColor=mix(finalColor,colorC,smoothstep(.05,.2,elevation)); gl_FragColor=vec4(finalColor,1.);
      }`;
    return ( <mesh><planeGeometry args={[10, 10, 1, 1]}/><shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{ uTime: { value: 0.0 }, uMouse: { value: new THREE.Vector2(10, 10) } }}/></mesh> );
  };
  return ( <div className="fixed inset-0 -z-10 bg-slate-950"><Canvas camera={{ position: [0, 0, 2.5] }}><Suspense fallback={null}><ShaderPlane /></Suspense></Canvas></div> );
}

export default function Welcome() {
  // --- THIS IS THE FIX: We explicitly tell TypeScript the type of our animation objects ---
  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };
  // --------------------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-transparent text-white">
      <InteractiveBackground />
      <motion.header initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}} className="relative z-10 p-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Heart className="h-6 w-6 text-purple-400" /> <span className="text-xl font-bold">Spillmate</span></Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login" className="rounded-full bg-slate-800/60 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-slate-700/80">Get Started</Link>
          </motion.div>
        </nav>
      </motion.header>

      <main className="relative z-10 flex flex-1 items-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-4xl space-y-12 px-6 text-center">
          <motion.h1 variants={itemVariants} className="text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl"><span className="text-white">Your Safe Space to</span><br /><span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Reflect and Grow.</span></motion.h1>
          <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-lg text-slate-300 drop-shadow-md md:text-xl">AI-powered mental health support, available 24/7. Confidential and judgment-free conversations whenever you need them.</motion.p>
          <motion.div variants={itemVariants} className="flex justify-center"><Link to="/login"><motion.button whileHover={{ scale: 1.05, boxShadow: '0px 0px 30px rgba(168, 85, 247, 0.5)' }} whileTap={{ scale: 0.95 }} className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-teal-600 px-8 py-4 text-lg font-bold text-white shadow-lg"><span>Start Your Journey</span><ArrowRight className="transition-transform group-hover:translate-x-1" /></motion.button></Link></motion.div>
        </motion.div>
      </main>

      <motion.footer initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} className="relative z-10 w-full border-t border-white/10 py-6 px-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <p className="text-slate-400">&copy; 2024 Spillmate. Your mental health matters.</p>
          <div className="flex items-center space-x-6"><Link to="/terms" className="text-slate-400 transition-colors hover:text-white">Terms of Service</Link><Link to="/privacy" className="text-slate-400 transition-colors hover:text-white">Privacy Policy</Link></div>
        </div>
      </motion.footer>
    </div>
  );
}