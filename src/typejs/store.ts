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
import { estimateNodeHeight, calculateOptimalPosition } from './position';

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
  Initailize: () => Promise<void>;
  sendMessage: (prompt: string, provider: string, parentId?: string, isBranch?: boolean) => Promise<void>;
  savePositions: () => Promise<void>; // Add this
  createWelcome: () => Promise<void>; // Add this
  deleteNode: (nodeId: string) => Promise<void>; // Add this
  clearAllConversations: () => Promise<void>; // Add this
  updateNodeStyle: (nodeId: string, style: React.CSSProperties) => void;
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

    updateNodeStyle: (nodeId, style) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.style = { ...node.style, ...style };
        }
      });
    },

    onNodesChange: (changes) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      });
      // Add debounced save if position change
      if (changes.some(c => c.type === 'position')) {
        if ((get() as any).saveTimeout) clearTimeout((get() as any).saveTimeout);
        (get() as any).saveTimeout = setTimeout(() => get().savePositions(), 500);
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
      const { nodes } = get();
      
      // Check if welcome node already exists to prevent duplicates
      const existingWelcome = nodes.find(node => 
        node.data?.prompt === "Welcome to VizThink AI" || 
        node.data?.response?.includes("Hello! I'm your AI assistant")
      );
      
      if (existingWelcome) {
        console.log('Welcome node already exists, skipping creation');
        return;
      }

      const welcomePrompt = "Welcome to VizThink AI";
      const welcomeResponse = "Hello! I'm your AI assistant. Type a message below to start.";
      try {
        const response = await axios.post('http://127.0.0.1:8000/chat/new', {
          prompt: welcomePrompt,
          response: welcomeResponse,
          provider: 'google',
          parent_id: null
        });
        const newId = response.data.new_id.toString();
        set((state) => {
          const newNode = {
            id: newId,
            type: 'chatNode',
            position: { x: 100, y: 100 }, // Default position
            data: { prompt: welcomePrompt, response: welcomeResponse },
            style: { borderRadius: '1rem', padding: '1rem', width: '350px' },
          };
          state.nodes.push(newNode);
          state.extendedNodeId = newId;
        });
      } catch (error) {
        console.error('Error creating welcome node:', error);
      }
    },

    clearAllConversations: async () => {
      try {
        // Clear backend data
        await axios.post('http://127.0.0.1:8000/chat/clear');
        
        // Clear frontend state
        set((state) => {
          state.nodes = [];
          state.edges = [];
          state.selectedNodeId = null;
          state.extendedNodeId = null;
          state.viewport = undefined;
        });

        // Create a fresh welcome node
        await get().createWelcome();
        
        console.log('All conversations cleared successfully');
      } catch (error) {
        console.error('Error clearing conversations:', error);
        throw error; // Re-throw to allow UI to handle the error
      }
    },

    deleteNode: async (nodeId: string) => {
      try {
        // Call backend API to delete the node and its descendants
        await axios.delete(`http://127.0.0.1:8000/chat/delete/${nodeId}`);
        
        // Get all descendant node IDs recursively
        const getAllDescendants = (parentId: string, nodes: Node[], edges: Edge[]): string[] => {
          const descendants: string[] = [];
          const directChildren = edges
            .filter(edge => edge.source === parentId)
            .map(edge => edge.target);
          
          for (const childId of directChildren) {
            descendants.push(childId);
            // Recursively get descendants of this child
            descendants.push(...getAllDescendants(childId, nodes, edges));
          }
          
          return descendants;
        };

        // Update frontend state
        set((state) => {
          const nodesToDelete = [nodeId, ...getAllDescendants(nodeId, state.nodes, state.edges)];
          
          // Remove nodes
          state.nodes = state.nodes.filter(node => !nodesToDelete.includes(node.id));
          
          // Remove edges connected to deleted nodes
          state.edges = state.edges.filter(edge => 
            !nodesToDelete.includes(edge.source) && !nodesToDelete.includes(edge.target)
          );
          
          // Clear selection if the selected node was deleted
          if (state.selectedNodeId && nodesToDelete.includes(state.selectedNodeId)) {
            state.selectedNodeId = null;
          }
          
          // Clear extended node if it was deleted
          if (state.extendedNodeId && nodesToDelete.includes(state.extendedNodeId)) {
            state.extendedNodeId = null;
          }
        });
        
        console.log(`Node ${nodeId} and its descendants deleted successfully.`);
      } catch (error) {
        console.error('Error deleting node:', error);
        throw error;
      }
    },

    Initailize: async () => {
      try {
        // Fetch chat records from backend
        const response = await axios.get('http://127.0.0.1:8000/chat/get');
        const chatRecords = response.data.data; // Backend returns {message, data}
        
        if (chatRecords && chatRecords.length > 0) {
          // Convert backend data to React Flow nodes
          const restoredNodes: Node[] = [];
          const restoredEdges: Edge[] = [];
          
          chatRecords.forEach(([id, prompt, response, positions, parent_id]: [number, string, string, any, number | null]) => {
            const nodeId = id.toString();
            
            // Create node with position from database or default
            const node: Node = {
              id: nodeId,
              type: 'chatNode',
              position: positions || { x: 0, y: 0 },
              data: { prompt, response },
              style: { borderRadius: '1rem', padding: '1rem', width: '350px' },
            };
            restoredNodes.push(node);
            
            // Create edge if this node has a parent
            if (parent_id !== null) {
              const edge: Edge = {
                id: `${parent_id}-${id}`,
                source: parent_id.toString(),
                target: nodeId,
                type: 'default'
              };
              restoredEdges.push(edge);
            }
          });
          
          // Update store with restored nodes and edges
          set((state) => {
            state.nodes = restoredNodes;
            state.edges = restoredEdges;
          });
          
          console.log(`Restored ${restoredNodes.length} nodes and ${restoredEdges.length} edges from backend`);
        } else {
          // No existing data, create welcome node
          await get().createWelcome();
        }
      } catch (error) {
        console.error('Error initializing from backend:', error);
        // Fallback to creating welcome node if backend fails
        await get().createWelcome();
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
        style: { borderRadius: '1rem', padding: '1rem', width: '350px' },
      };

      set((state) => {
        state.nodes.push(newNode);
        if (lastNode) {
          const newEdge: Edge = {
            id: `e${lastNode.id}-${tempNewNodeId}`,
            source: lastNode.id,
            target: tempNewNodeId,
            sourceHandle: isBranch ? 'right' : 'bottom',
            type: isBranch ? 'branch' : undefined,
          };
          state.edges.push(newEdge);
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
        }else{
          postData.parent_id = null;
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
