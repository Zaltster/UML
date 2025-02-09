'use client';

import { useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CodeNodeData {
    label: string;
    code: string;
}

export default function CodeNode({ data }: NodeProps<CodeNodeData>) {
    const [code, setCode] = useState(data.code || '');
    const [size, setSize] = useState({ width: 300, height: 200 });
    const resizeRef = useRef<{ isResizing: boolean; startX: number; startY: number; startWidth: number; startHeight: number }>({
        isResizing: false,
        startX: 0,
        startY: 0,
        startWidth: 300,
        startHeight: 200
    });

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCode = e.target.value;
        setCode(newCode);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart, selectionEnd } = e.currentTarget;
            const newCode = code.substring(0, selectionStart) + '    ' + code.substring(selectionEnd);
            setCode(newCode);
            // Set cursor position after the inserted tab
            setTimeout(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 4;
            }, 0);
        }
    };

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
            width: Math.max(300, resizeRef.current.startWidth + deltaX),
            height: Math.max(200, resizeRef.current.startHeight + deltaY)
        });
    }, []);

    const stopResize = useCallback(() => {
        resizeRef.current.isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }, [handleResize]);

    return (
        <div
            className="relative bg-[#1e1e1e] rounded-lg p-3"
            style={{
                width: size.width,
                height: size.height,
                minWidth: 300,
                minHeight: 200
            }}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-300" />

            <div className="relative flex h-full">
                {/* Line numbers */}
                <div className="absolute top-0 left-0 bottom-0 w-8 text-gray-500 select-none pt-2 text-right pr-2 font-mono">
                    {code.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>

                {/* Code input */}
                <textarea
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-transparent text-white font-mono pl-8 focus:outline-none resize-none"
                    style={{
                        whiteSpace: 'pre',
                        overflowX: 'auto'
                    }}
                    spellCheck="false"
                />
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-300" />

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