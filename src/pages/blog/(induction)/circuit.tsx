import Magnetic from "@/components/magnetic";
import { Background, ReactFlow } from "@xyflow/react";

const initialNodes = [
    // bottom
    { id: 'Apple', position: { x: 0, y: 0 }, data: { label: 'Apple' }, width: 60 },
    { id: 'was', position: { x: 120, y: 0 }, data: { label: 'was' }, width: 60 },
    { id: '...', position: { x: 240, y: 0 }, data: { label: '...' }, width: 60 },
    { id: 'Steve', position: { x: 360, y: 0 }, data: { label: 'Steve' }, width: 60 },
    { id: 'Jobs', position: { x: 480, y: 0 }, data: { label: 'Jobs' }, width: 60 },

    // embedding

];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const proOptions = { hideAttribution: true };

const Circuit = () => {
    return (
        <Magnetic>
            <div className="w-full h-[400px] border-2">
                <ReactFlow
                    nodes={initialNodes}
                    edges={initialEdges}
                    fitView
                    proOptions={proOptions}
                >
                    <Background />
                </ReactFlow>
            </div>
        </Magnetic>
    )
};

export default Circuit;