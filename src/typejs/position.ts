import { Node, Edge } from 'reactflow';
// Helper function to estimate node height based on content
export const estimateNodeHeight = (prompt: string, response: string): number => {
    // Base height for the node structure
    const baseHeight = 100;
    
    // Estimate height based on text length (assuming ~50 chars per line)
    const promptLines = Math.ceil(prompt.length / 50);
    const responseLines = Math.ceil(response.length / 50);
    
    // Each line is approximately 24px (with padding/margins)
    const lineHeight = 24;
    const estimatedHeight = baseHeight + (promptLines + responseLines) * lineHeight;
    
    // Add some padding for expanded content and UI elements
    return Math.max(estimatedHeight, 200); // Minimum height of 200px
  };
  
  // Helper function to calculate optimal position for new nodes
  export const calculateOptimalPosition = (
  nodes: Node[],
  edges: Edge[],
  parentNode: Node | undefined,
  isbranch: boolean,
  newNodeContent: { prompt: string; response: string }
): { x: number; y: number } => {
  if (!parentNode) {
    return { x: 0, y: 0 };
  }

  const parentHeight = estimateNodeHeight(
    parentNode.data?.prompt || '', 
    parentNode.data?.response || ''
  );
  
  const NODE_WIDTH = 350;
  const GAP = 50;
  const VERTICAL_GAP = 100;
  
  // Helper to check for overlaps
  const isColliding = (x: number, y: number, w: number, h: number): boolean => {
    return nodes.some(node => {
      // Skip the parent node itself (though it shouldn't overlap usually)
      if (node.id === parentNode.id) return false;
      
      const nodeW = node.width || NODE_WIDTH;
      const nodeH = node.height || estimateNodeHeight(node.data?.prompt || '', node.data?.response || '');
      
      // Check intersection
      return (
        x < node.position.x + nodeW + GAP &&
        x + w + GAP > node.position.x &&
        y < node.position.y + nodeH + GAP &&
        y + h + GAP > node.position.y
      );
    });
  };

  const newNodeHeight = estimateNodeHeight(newNodeContent.prompt, newNodeContent.response);
  
  let targetX = parentNode.position.x;
  let targetY = parentNode.position.y;

  if (isbranch) {
    // Horizontal placement: Same Y, shifted X
    targetY = parentNode.position.y;
    targetX = parentNode.position.x + NODE_WIDTH + GAP;

    // While colliding, keep moving right
    while (isColliding(targetX, targetY, NODE_WIDTH, newNodeHeight)) {
      targetX += NODE_WIDTH + GAP;
    }
    
  } else {
    // Vertical placement: Same X, shifted Y
    targetX = parentNode.position.x;
    targetY = parentNode.position.y + parentHeight + VERTICAL_GAP;

    // If strictly vertical spot is taken, shift RIGHT until free
    // This allows multiple children to stack horizontally if they would otherwise overlap
    while (isColliding(targetX, targetY, NODE_WIDTH, newNodeHeight)) {
      targetX += NODE_WIDTH + GAP;
    }
  }

  return { x: targetX, y: targetY };
};