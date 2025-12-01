import { useThree } from '@react-three/fiber';
import { GLTFExporter } from 'three-stdlib';
import { Html } from '@react-three/drei';

function saveString(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

export const ExporterUI = () => {
    const { scene } = useThree();

    const exportGLB = () => {
        const exporter = new GLTFExporter();
        exporter.parse(
            scene,
            (result) => {
                if (result instanceof ArrayBuffer) {
                    saveArrayBuffer(result, 'ludo_scene.glb');
                } else {
                    // Should not happen if binary: true
                    const output = JSON.stringify(result, null, 2);
                    saveString(output, 'ludo_scene.gltf');
                }
            },
            (err) => console.error(err),
            { binary: true }
        );
    };

    return (
        <Html position={[10, 10, 0]} style={{ pointerEvents: 'auto' }}>
            <button
                onClick={exportGLB}
                style={{
                    padding: '10px 20px',
                    background: 'white',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    fontWeight: 'bold'
                }}
            >
                Export GLB
            </button>
        </Html>
    );
};
