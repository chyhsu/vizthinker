import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';
import {
  Connection,
  Edge,
  Node,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowInstance,
  Viewport, // Add this
} from 'reactflow';

// Helper function to estimate node height based on content
const estimateNodeHeight = (prompt: string, response: string): number => {
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
const calculateOptimalPosition = (
  nodes: Node[],
  edges: Edge[],
  parentNode: Node | undefined,
  isBranch: boolean,
  newNodeContent: { prompt: string; response: string }
): { x: number; y: number } => {
  const verticalSpacing = 250; // Reduced vertical spacing to bring nodes closer vertically
  const diagonalOffset = 200; // Increased horizontal offset for more spacing between diagonal nodes
  const branchOffset = 450; // Increased horizontal offset for more spacing between branches

  if (!parentNode) {
    // First node
    return { x: 400, y: 50 };
  }

  if (isBranch) {
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

export interface StoreState {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  selectedNodeId: string | null;
  viewport?: Viewport; // Add this
  extendedNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setViewport: (viewport: Viewport) => void; // Add this
  setExtendedNodeId: (id: string | null) => void;
  fetchInitialData: () => Promise<void>;
  sendMessage: (prompt: string, provider: string, parentId?: string, isBranch?: boolean) => Promise<void>;
  savePositions: () => Promise<void>; // Add this
  createWelcome: () => Promise<void>; // Add this
}

const useStore = create<StoreState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    reactFlowInstance: null,
    selectedNodeId: null,
    viewport: undefined, // Add this
    extendedNodeId: null,

    setReactFlowInstance: (instance) => {
      set({ reactFlowInstance: instance });
    },

    setSelectedNodeId: (nodeId) => {
      set({ selectedNodeId: nodeId });
    },

    setViewport: (viewport) => {
      set({ viewport });
    },

    setExtendedNodeId: (id) => {
      set({ extendedNodeId: id });
    },

    onNodesChange: (changes) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      });
      // Add debounced save if position change
      if (changes.some(c => c.type === 'position')) {
        if ((get() as any).saveTimeout) clearTimeout((get() as any).saveTimeout);
        (get() as any).saveTimeout = setTimeout(() => get().savePositions(), 1000);
      }
    },

    onEdgesChange: (changes) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      });
    },

    onConnect: (connection) => {
      set((state) => {
        state.edges = addEdge(connection, state.edges);
      });
    },

    setNodes: (nodes) => {
      set({ nodes });
    },

    setEdges: (edges) => {
      set({ edges });
    },

    savePositions: async () => {
      const { nodes } = get();
      const sortedNodes = [...nodes].sort((a, b) => parseInt(a.id) - parseInt(b.id));
      const positions = sortedNodes.map(n => n.position);
      try {
        await axios.post('http://127.0.0.1:8000/chat/positions', { positions });
      } catch (err) {
        console.error('Error saving positions:', err);
      }
    },

    createWelcome: async () => {
      const welcomePrompt = "Welcome to VizThink AI";
      const welcomeResponse = "Hello! I'm your AI assistant. Type a message below to start.";
      try {
        const response = await axios.post('http://127.0.0.1:8000/chat/welcome', {
          prompt: welcomePrompt,
          response: welcomeResponse
        });
        const newId = response.data.new_id.toString();
        set((state) => {
          const newNode = {
            id: newId,
            type: 'chatNode',
            position: { x: 0, y: 0 },
            data: { prompt: welcomePrompt, response: welcomeResponse }
          };
          state.nodes.push(newNode);
          state.extendedNodeId = newId;
        });
      } catch (error) {
        console.error('Error creating welcome node:', error);
      }
    },

    fetchInitialData: async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/chat/get');
        const rows = res.data.data as Array<[number, string, string, any, number | null]>;

        // Build nodes progressively to calculate proper positions
        const restoredNodes: Node[] = [];
        
        for (const [id, prompt, resp, positions, parent] of rows) {
          let pos: { x: number; y: number } | undefined;
          
          // Use saved positions if available
          if (Array.isArray(positions)) {
            pos = positions[positions.length - 1];
          } else if (positions && typeof positions === 'object') {
            pos = positions as { x: number; y: number };
          }
          
          // If no saved position, calculate optimal position
          if (!pos) {
            const parentNode = parent ? restoredNodes.find(n => n.id === parent.toString()) : undefined;
            const isBranch = parentNode ? restoredNodes.some(n => 
              n.id !== parentNode.id && 
              n.data?.parent_id === parentNode.id
            ) : false;
            
            pos = calculateOptimalPosition(
              restoredNodes,
              [], // Use empty array since edges are built after nodes in fetchInitialData
              parentNode,
              isBranch,
              { prompt, response: resp }
            );
          }
          
          const newNode: Node = {
            id: id.toString(),
            type: 'chatNode',
            position: pos,
            data: { prompt, response: resp, parent_id: parent?.toString() },
          };
          
          restoredNodes.push(newNode);
        }

        const restoredEdges = rows
          .filter(([id, prompt, resp, positions, parent]) => parent !== null)
          .map(([id, prompt, resp, positions, parent]) => ({
            id: `e${parent}-${id}`,
            source: parent!.toString(),
            target: id.toString(),
          }));

        set({ nodes: restoredNodes, edges: restoredEdges });
        if (restoredNodes.length === 0) {
          await get().createWelcome();
        }
      } catch (err) {
        console.error('Error restoring chat:', err);
      }
    },

    sendMessage: async (prompt: string, provider: string, parentId?: string, isBranch: boolean = false) => {
      const { nodes, reactFlowInstance } = get();
      let lastNode: Node | undefined;

      if (parentId) {
        lastNode = nodes.find((n) => n.id === parentId);
        if (!lastNode) {
          console.error('Parent node not found');
          return;
        }
      } else if (nodes.length > 0) {
        lastNode = nodes[nodes.length - 1];
      }

      // Calculate optimal position using the new algorithm
      const newNodePosition = calculateOptimalPosition(
        nodes,
        get().edges,
        lastNode,
        isBranch,
        { prompt, response: '...' }
      );

      const tempNewNodeId = `temp_${Date.now()}`;
      const newNode: Node = {
        id: tempNewNodeId,
        type: 'chatNode',
        position: newNodePosition,
        data: { prompt, response: '...' },
      };

      set((state) => {
        state.nodes.push(newNode);
        if (lastNode) {
          state.edges.push({
            id: `e${lastNode.id}-${tempNewNodeId}`,
            source: lastNode.id,
            target: tempNewNodeId,
          });
        }
      });

      setTimeout(() => {
        // Center the view on the new node with better padding and animation
        reactFlowInstance?.fitView({ 
          nodes: [{ id: tempNewNodeId }], 
          duration: 1000, 
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.2
        });
      }, 100);

      try {
        const postData: any = { prompt, provider };
        if (lastNode) {
          postData.parent_id = lastNode.id;
        }
        const response = await axios.post('http://127.0.0.1:8000/chat/new', postData);

        const aiResponse = response.data.response;
        const actualNewId = response.data.new_id.toString();

        set((state) => {
          const node = state.nodes.find((n) => n.id === tempNewNodeId);
          if (node) {
            node.id = actualNewId;
            node.data.response = aiResponse;
            
            // Recalculate position now that we have the actual response content
            const updatedPosition = calculateOptimalPosition(
              state.nodes.filter(n => n.id !== tempNewNodeId), // Exclude the current node
              state.edges,
              lastNode,
              isBranch,
              { prompt, response: aiResponse }
            );
            node.position = updatedPosition;
          }
          const edge = state.edges.find((e) => e.target === tempNewNodeId);
          if (edge) {
            edge.id = `e${edge.source}-${actualNewId}`;
            edge.target = actualNewId;
          }
        });

        // Center the view on the final position of the new node
        setTimeout(() => {
          reactFlowInstance?.fitView({ 
            nodes: [{ id: actualNewId }], 
            duration: 800, 
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.2
          });
        }, 200);
      } catch (error) {
        console.error('Error fetching AI response:', error);
        set((state) => {
          const node = state.nodes.find((n) => n.id === tempNewNodeId);
          if (node) {
            node.data.response = 'Sorry, an error occurred.';
          }
        });
      }
    },
  })),
);

export default useStore;
