'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    ReactFlowInstance,
    applyNodeChanges,
    applyEdgeChanges,
    Panel,
    MarkerType,
} from 'reactflow';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import Toolbar from './Toolbar';
import 'reactflow/dist/style.css';

interface Domain {
    id: string;
    nodes: Node[];
    edges: Edge[];
    parentNodeId: string | null;
}

const nodeTypes = {
    custom: CustomNode,
    code: CodeNode,
};

const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 z-50"
    >
        ← Back
    </button>
);

export default function Canvas() {
    const [domains, setDomains] = useState<Domain[]>([
        {
            id: 'root',
            nodes: [],
            edges: [],
            parentNodeId: null
        }
    ]);
    const [currentDomainId, setCurrentDomainId] = useState('root');
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    const currentDomain = useMemo(() =>
        domains.find(d => d.id === currentDomainId),
        [domains, currentDomainId]
    );

    const handleNodeDoubleClick = useCallback((nodeId: string) => {
        setDomains(current => {
            if (!current.find(d => d.parentNodeId === nodeId)) {
                return [...current, {
                    id: `domain-${nodeId}`,
                    nodes: [],
                    edges: [],
                    parentNodeId: nodeId
                }];
            }
            return current;
        });

        setCurrentDomainId(`domain-${nodeId}`);
    }, []);

    const handleBack = useCallback(() => {
        if (currentDomain?.parentNodeId) {
            const parentDomain = domains.find(d =>
                d.nodes.some(n => n.id === currentDomain.parentNodeId)
            );
            if (parentDomain) {
                setCurrentDomainId(parentDomain.id);
            }
        }
    }, [currentDomain, domains]);

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
                id: `node-${Date.now()}`,
                type,
                position,
                data: type === 'code'
                    ? {
                        label: 'Code',
                        code: 'def example():\n    print("Hello World")'
                    }
                    : {
                        label: `Node ${domains.find(d => d.id === currentDomainId)?.nodes.length || 0 + 1}`,
                        properties: []
                    },
            };

            setDomains(current => current.map(domain =>
                domain.id === currentDomainId
                    ? { ...domain, nodes: [...domain.nodes, newNode] }
                    : domain
            ));
        },
        [currentDomainId, domains, reactFlowInstance]
    );

    return (
        <div ref={reactFlowWrapper} style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
            <ReactFlow
                nodes={currentDomain?.nodes || []}
                edges={currentDomain?.edges || []}
                onNodesChange={(changes) => {
                    setDomains(current => current.map(domain =>
                        domain.id === currentDomainId
                            ? { ...domain, nodes: applyNodeChanges(changes, domain.nodes) }
                            : domain
                    ));
                }}
                onEdgesChange={(changes) => {
                    setDomains(current => current.map(domain =>
                        domain.id === currentDomainId
                            ? { ...domain, edges: applyEdgeChanges(changes, domain.edges) }
                            : domain
                    ));
                }}
                onNodeDoubleClick={(_, node) => handleNodeDoubleClick(node.id)}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                panOnDrag={[2]}
                draggable={true}
                deleteKeyCode={['Backspace', 'Delete']}
                fitView
            >
                <Background
                    color="#666"
                    style={{ background: 'black' }}
                    gap={20}
                    size={1}
                />
                <Controls />
                <Panel position="top-left">
                    <Toolbar />
                </Panel>
                {currentDomainId !== 'root' && (
                    <BackButton onClick={handleBack} />
                )}
            </ReactFlow>
        </div>
    );
}