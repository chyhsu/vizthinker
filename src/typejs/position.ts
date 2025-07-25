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
    const verticalSpacing = 250; // Reduced vertical spacing to bring nodes closer vertically
    const diagonalOffset = 200; // Increased horizontal offset for more spacing between diagonal nodes
    const branchOffset = 450; // Increased horizontal offset for more spacing between branches
  
    if (!parentNode) {
      // First node - center it in the viewport
      return { x: 0, y: 0 }; // Center position - ReactFlow will handle the actual centering with fitView
    }
  
    if (isbranch) {
      // For branching, position horizontally with proper spacing, but also below the parent
      const parentHeight = estimateNodeHeight(
        parentNode.data?.prompt || '', 
        parentNode.data?.response || ''
      );
      
      // Calculate Y position below the parent (similar to non-branch positioning)
      const targetY = parentNode.position.y + parentHeight + verticalSpacing;
      
      // Find existing branches from the same parent by checking parent_id relationships
      const existingBranches = nodes.filter(node => {
        // Check if this node is a direct child of the current parent
        return node.data?.parent_id === parentNode.id || 
               // Also check edges as backup
               edges.some(edge => edge.source === parentNode.id && edge.target === node.id);
      });
  
      // Calculate horizontal offset based on number of existing branches
      const totalBranchOffset = existingBranches.length * branchOffset;
      
      return {
        x: parentNode.position.x + totalBranchOffset,
        y: targetY // Position below the parent instead of at same level
      };
    } else {
      // For vertical continuation, position diagonally below the parent
      const parentHeight = estimateNodeHeight(
        parentNode.data?.prompt || '', 
        parentNode.data?.response || ''
      );
      
      // Calculate target Y position below the parent
      const targetY = parentNode.position.y + parentHeight + verticalSpacing;
      
      // Count how many children this parent already has to determine direction
      const existingChildren = nodes.filter(node => {
        // Find nodes that are below this parent and connected to it
        return node.position.y > parentNode.position.y && 
               Math.abs(node.position.x - parentNode.position.x) <= diagonalOffset * 2;
      }).length;
      
      // Alternate between right and left diagonal positioning
      const isRightDirection = existingChildren % 2 === 0;
      const horizontalOffset = isRightDirection ? diagonalOffset : -diagonalOffset;
      
      // Check for conflicts and adjust position if needed
      let targetX = parentNode.position.x + horizontalOffset;
      let finalY = targetY;
      
      // Look for any nodes that might conflict with our target position
      const conflictingNodes = nodes.filter(node => {
        return Math.abs(node.position.x - targetX) < 150 && // Within horizontal range
               Math.abs(node.position.y - finalY) < 150;     // Within vertical range
      });
      
      // If there's a conflict, adjust the position
      if (conflictingNodes.length > 0) {
        // Find the lowest available position
        let maxConflictY = Math.max(...conflictingNodes.map(node => {
          const nodeHeight = estimateNodeHeight(
            node.data?.prompt || '',
            node.data?.response || ''
          );
          return node.position.y + nodeHeight;
        }));
        
        finalY = Math.max(finalY, maxConflictY + 60); // Small additional spacing
      }
      
      return {
        x: targetX,
        y: finalY
      };
    }
  };