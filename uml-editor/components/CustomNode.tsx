'use client';

import { useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeData {
    label: string;
    properties: string[];
}

export default function CustomNode({ data, id }: NodeProps<CustomNodeData>) {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [label, setLabel] = useState(data.label);
    const [properties, setProperties] = useState<string[]>(data.properties || []);
    const [size, setSize] = useState({ width: 200, height: 100 });
    const resizeRef = useRef<{ isResizing: boolean; startX: number; startY: number; startWidth: number; startHeight: number }>({
        isResizing: false,
        startX: 0,
        startY: 0,
        startWidth: 200,
        startHeight: 100
    });

    const startResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;

        resizeRef.current = {
            isResizing: true,
            startX,
            startY,
            startWidth: size.width,
            startHeight: size.height
        };

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    }, [size]);

    const handleResize = useCallback((e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!resizeRef.current.isResizing) return;

        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;

        setSize({
            width: Math.max(200, resizeRef.current.startWidth + deltaX),
            height: Math.max(100, resizeRef.current.startHeight + deltaY)
        });
    }, []);

    const stopResize = useCallback(() => {
        resizeRef.current.isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }, [handleResize]);

    const onLabelClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
    };

    const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        evt.stopPropagation();
        setLabel(evt.target.value);
        data.label = evt.target.value;
    };

    const onLabelBlur = () => {
        setIsEditing(false);
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const addProperty = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newProperties = [...properties, 'New Property'];
        setProperties(newProperties);
        data.properties = newProperties;
    };

    return (
        <div
            className="relative bg-white border-2 border-gray-300 rounded-lg p-3"
            style={{
                width: size.width,
                height: size.height,
                minWidth: 200,
                minHeight: 100
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-gray-300"
                onMouseDown={(e) => e.stopPropagation()}
            />

            <div className="flex justify-between items-center mb-2">
                {isEditing ? (
                    <input
                        value={label}
                        onChange={onLabelChange}
                        onBlur={onLabelBlur}
                        className="nodrag border p-1 rounded w-full text-black"
                        autoFocus
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    />
                ) : (
                    <div
                        onClick={onLabelClick}
                        className="font-bold cursor-text text-black nodrag"
                    >
                        {label}
                    </div>
                )}
                <button
                    onClick={toggleExpand}
                    className="ml-2 text-gray-500 hover:text-gray-700 nodrag"
                >
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && (
                <div className="border-t pt-2 nodrag">
                    {properties.map((prop, index) => (
                        <div key={index} className="flex items-center mb-1">
                            <input
                                value={prop}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    const newProperties = [...properties];
                                    newProperties[index] = e.target.value;
                                    setProperties(newProperties);
                                    data.properties = newProperties;
                                }}
                                className="nodrag border p-1 rounded w-full text-sm text-black"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            />
                        </div>
                    ))}
                    <button
                        onClick={addProperty}
                        className="text-sm text-blue-500 hover:text-blue-700 mt-2 nodrag"
                    >
                        + Add Property
                    </button>
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-gray-300"
                onMouseDown={(e) => e.stopPropagation()}
            />

            {/* Resize handle */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize nodrag"
                onMouseDown={startResize}
                style={{
                    background: 'linear-gradient(135deg, transparent 50%, #4F46E5 50%)',
                    borderBottomRightRadius: '0.375rem'
                }}
            />
        </div>
    );
}