'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    Connection,
    addEdge,
    ReactFlowInstance,
    OnNodesChange,
    applyNodeChanges,
    OnEdgesChange,
    applyEdgeChanges,
    Panel,
} from 'reactflow';
import CustomNode from './CustomNode';
import Toolbar from './Toolbar';
import 'reactflow/dist/style.css';

const nodeTypes = {
    custom: CustomNode,
};

const initialNodes: Node[] = [];

export default function Canvas() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge(connection, eds));
        },
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (!type || !reactFlowInstance || !reactFlowWrapper.current) {
                return;
            }

            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = reactFlowInstance.project({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
            });

            const newNode = {
                id: `node-${nodes.length + 1}`,
                type: 'custom',
                position,
                data: {
                    label: `Node ${nodes.length + 1}`,
                    properties: []
                },
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [nodes, reactFlowInstance]
    );

    return (
        <div ref={reactFlowWrapper} style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                panOnDrag={[2]}
                draggable={true}
                deleteKeyCode={['Backspace', 'Delete']}
                fitView
            >
                <Background />
                <Controls />
                <Panel position="top-left">
                    <Toolbar />
                </Panel>
            </ReactFlow>
        </div>
    );
}