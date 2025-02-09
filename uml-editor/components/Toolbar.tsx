'use client';

export default function Toolbar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';

        // Create a transparent drag image
        const dragImage = document.createElement('div');
        dragImage.style.width = '1px';
        dragImage.style.height = '1px';
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1px';
        dragImage.style.left = '-1px';
        document.body.appendChild(dragImage);

        event.dataTransfer.setDragImage(dragImage, 0, 0);

        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-2">
            <div
                className="p-4 border-2 border-gray-300 rounded cursor-grab active:cursor-grabbing bg-white hover:bg-gray-50"
                onDragStart={(e) => onDragStart(e, 'custom')}
                draggable
            >
                Drag to add node
            </div>
            <div
                className="p-4 border-2 border-gray-300 rounded cursor-grab active:cursor-grabbing bg-white hover:bg-gray-50"
                onDragStart={(e) => onDragStart(e, 'code')}
                draggable
            >
                Drag to add code
            </div>
        </div>
    );
}