import { useState, useRef, Suspense, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Mail, Heart, CheckCircle,  } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

interface LoginFormProps {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  error: string;
}

interface CheckEmailCardProps {
  email: string;
  setOtpSent: React.Dispatch<React.SetStateAction<boolean>>;
}

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

export default function Login() {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;
    setIsLoading(true); setError('');
    const { error } = await signInWithOtp(email);
    if (error) { setError(error.message); } 
    else { setOtpSent(true); }
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col p-4 text-white sm:p-6 lg:p-8">
      <InteractiveBackground />
      <header className="z-10 p-2">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-bold text-slate-200 transition-colors hover:text-white">
            <Heart className="h-6 w-6 text-purple-400" />
            <span className="font-semibold">Spillmate</span>
          </Link>
      </header>
      <main className="z-10 flex w-full flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {!otpSent ? (
            <LoginForm key="form" handleSubmit={handleSubmit} email={email} setEmail={setEmail} isLoading={isLoading} error={error} />
          ) : (
            <CheckEmailCard key="card" email={email} setOtpSent={setOtpSent} />
          )}
        </AnimatePresence>
      </main>
      <footer className="z-10 w-full py-4 text-center">
        <div className="mx-auto flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
            <p className="text-slate-400">&copy; 2025 Spillmate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] } },
};

function LoginForm({ handleSubmit, email, setEmail, isLoading, error }: LoginFormProps) {
    return (
        <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-sm">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-8 shadow-2xl backdrop-blur-lg">
              <div className="mb-8 text-center">
                <Heart className="mx-auto h-10 w-10 text-purple-300" />
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Sign In Securely</h1>
                <p className="mt-2 text-base text-slate-300">Sign in to continue your journey.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.name@example.com" className="w-full rounded-lg border border-slate-700 bg-slate-800/60 py-3 pl-11 pr-4 text-white transition-colors placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20" required disabled={isLoading} />
                  </div>
                  {error && <p className="text-center text-sm font-medium text-red-400">{error}</p>}
                  <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 py-3 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
                      {isLoading ? 'Sending...' : 'Send Magic Link'}
                  </button>
              </form>
              <div className="mt-8 flex items-center justify-center gap-x-8 text-sm">
                  <Link to="/" className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-white">
                      <span>Return to Homepage</span>
                  </Link>
                  <Link to="/terms" className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-white">
                      <span>Terms of Service</span>
                  </Link>
              </div>
          </div>
        </motion.div>
    );
}

function CheckEmailCard({ email, setOtpSent }: CheckEmailCardProps) {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center backdrop-blur-lg">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500">
            <CheckCircle className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="mt-6 text-3xl font-bold text-white">Check Your Inbox</h1>
        <p className="mt-2 text-slate-300">
          A secure magic link was sent to <br />
          <span className="font-semibold text-white">{email}</span>.
        </p>
        <button onClick={() => setOtpSent(false)} className="mt-8 w-full rounded-lg bg-slate-700/50 py-3 font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
          Use a Different Email
        </button>
      </div>
    </motion.div>
  );
}