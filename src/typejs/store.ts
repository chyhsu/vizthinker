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
  getNodesBounds,
  getViewportForBounds,
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
  Initialize: () => Promise<void>;
  sendMessage: (prompt: string, provider: string, parentId?: string, isbranch?: boolean, model?: string) => Promise<void>;
  savePositions: () => Promise<void>; // Add this
  createWelcome: () => Promise<void>; // Add this
  deleteNode: (nodeId: string) => Promise<void>; // Add this
  clearAllConversations: (provider?: string, model?: string) => Promise<void>; // Add this
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
      const chatrecord_id = localStorage.getItem('chatrecord_id');
      console.log('Saving positions for chatrecord %s : %s', chatrecord_id, JSON.stringify(positions));
      try {
        await axios.post('http://127.0.0.1:8000/chat/positions', { chatrecord_id, positions: JSON.stringify(positions) });
        console.log('Positions saved successfully');
      } catch (err) {
        console.error('Error saving positions:', err);
      }
    },

    createWelcome: async () => {
      const { nodes, reactFlowInstance } = get();
    
      const existingWelcome = nodes.length > 0;
      
      if (existingWelcome) {
        console.log('Welcome node already exists, skipping creation');
        return;
      }      
      const chatrecord_id = localStorage.getItem('chatrecord_id');
      let response = await axios.post('http://127.0.0.1:8000/welcome', { chatrecord_id });
      const node_id = response.data.message_id?.toString() ?? '0';
      const welcomePrompt = 'Hi there! What is VizThinker?';
      const welcomeResponse = response.data.response as string;
      
      // Create loading welcome node first - positioned in center
      set((state) => {
        const newNode = {
          id:   node_id.toString(),
          type: 'chatNode',
          position: { x: 0, y: 0 }, // Center position - will be adjusted by fitView
          data: { prompt: welcomePrompt, response: welcomeResponse, isLoading: false },
          style: { borderRadius: '1rem', padding: '1rem', width: '350px' },
          draggable: true, // Prevent dragging during loading
        };
        state.nodes.push(newNode);
        state.extendedNodeId = node_id.toString();
      });

      // Center the view on the welcome node
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ 
            padding: 0.1, 
            includeHiddenNodes: false,
            duration: 500,
            minZoom: 0.5,
            maxZoom: 1.5
          });
        }
      }, 100);

    },

    clearAllConversations: async (provider = 'ollama', model?: string) => {
      const { reactFlowInstance } = get();
      try {
        // Clear backend data
        const chatrecord_id= localStorage.getItem('chatrecord_id')
        await axios.delete(`http://127.0.0.1:8000/chat/records/${chatrecord_id}`);
        
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
        
        // Ensure the view is properly centered after clearing
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ 
              padding: 0.1, 
              includeHiddenNodes: false,
              duration: 800,
              minZoom: 0.5,
              maxZoom: 1.5
            });
          }
        }, 200);
        
        console.log('All conversations cleared successfully');
      } catch (error) {
        console.error('Error clearing conversations:', error);
        throw error; // Re-throw to allow UI to handle the error
      }
    },

    deleteNode: async (nodeId: string) => {
      try {
        // Call backend API to delete the node and its descendants
        const chatrecord_id= localStorage.getItem('chatrecord_id')
        const res = await axios.delete(`http://127.0.0.1:8000/chat/records/${chatrecord_id}/${nodeId}`);

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
  
        get().Initialize();
        console.log(`Node ${nodeId} and its descendants deleted successfully.`);
      } catch (error) {
        console.error('Error deleting node:', error);
        throw error;
      }
    },

    Initialize: async () => {
      try {
        // Fetch chat records from backend
        const chatrecord_id = localStorage.getItem('chatrecord_id');
        const response = await axios.get(`http://127.0.0.1:8000/chat/records/${chatrecord_id}`);
        const chatRecords = response.data.records; // Backend returns {records}
        console.log("chatrecord length: ", chatRecords.length);
        const { reactFlowInstance } = get();
        if (chatRecords && chatRecords.length > 0) {
          const restoredNodes: Node[] = [];
          const restoredEdges: Edge[] = [];
          
          chatRecords.forEach(([id, chatrecord_id, prompt, response, positions, parent_id, isbranch]: [number, number, string, string, any, number | null, boolean], index: number) => {
            const nodeId = id.toString();
            
            const node: Node = {
              id: nodeId,
              type: 'chatNode',
              position: positions,
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
                sourceHandle: isbranch ? 'right' : 'bottom',
                type: isbranch ? 'branch' : undefined,
              };
              restoredEdges.push(edge);
            }
          });
          console.log(restoredNodes);
          console.log(restoredEdges);
          // Update store with restored nodes and edges
          set((state) => {
            state.nodes = restoredNodes;
            state.edges = restoredEdges;
          });
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ 
                padding: 0.1, 
                includeHiddenNodes: false,
                duration: 800,
                minZoom: 0.5,
                maxZoom: 1.5
              });
            }
          }, 200);
          console.log(`Restored ${restoredNodes.length} nodes and ${restoredEdges.length} edges from backend`);
        } else {
          await get().createWelcome();
        }
      } catch (error) {
        console.error('Error initializing from backend:', error);
      }
    },

    sendMessage: async (prompt: string, provider: string, parentId?: string, isbranch: boolean = false, model?: string) => {
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

      const position = calculateOptimalPosition(
        nodes,
        get().edges,
        lastNode,
        isbranch,
        { prompt, response: 'Thinking...' }
      );

      const tempNewNodeId = `temp_${Date.now()}`;
      const newNode: Node = {
        id: tempNewNodeId,
        type: 'chatNode',
        position: position,
        data: { prompt, response: 'Thinking...', isLoading: true },
        style: { borderRadius: '1rem', padding: '1rem', width: '350px' },
        draggable: false,
      };

      set((state) => {
        state.nodes.push(newNode);
        if (lastNode) {
          const newEdge: Edge = {
            id: `e${lastNode.id}-${tempNewNodeId}`,
            source: lastNode.id,
            target: tempNewNodeId,
            sourceHandle: isbranch ? 'right' : 'bottom',
            type: isbranch ? 'branch' : undefined,
          };
          state.edges.push(newEdge);
        }
      });

      setTimeout(() => {
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
        const user_id = localStorage.getItem('user_id');
        const chatrecord_id = localStorage.getItem('chatrecord_id');
        const postData: any = { prompt, provider, isbranch, chatrecord_id, position: JSON.stringify(position), user_id};
        if (lastNode) {
          postData.parent_id = lastNode.id;
        }else{
          postData.parent_id = null;
        }
        if (model) {
          postData.model = model;
        }
        const response = await axios.post('http://127.0.0.1:8000/chat', postData);
        const aiResponse = response.data.response;
        const actualNewId = response.data.message_id.toString();

        set((state) => {
          const node = state.nodes.find((n) => n.id === tempNewNodeId);
          if (node) {
            node.id = actualNewId;
            node.data.response = aiResponse;
            node.data.isLoading = false;
            node.draggable = true;
          }
          const edge = state.edges.find((e) => e.target === tempNewNodeId);
          if (edge) {
            edge.id = `e${edge.source}-${actualNewId}`;
            edge.target = actualNewId;
          }
        });

      } catch (error: any) {
        console.error('Error fetching AI response:', error);
        let errorMessage = 'Sorry, an error occurred.';
        
        // Handle specific API key errors
        if (error.response?.status === 400 && error.response?.data?.detail?.includes('API key')) {
          errorMessage = `❗ ${error.response.data.detail}\n\nPlease configure your API key in Settings.`;
        } else if (error.response?.status === 500) {
          errorMessage = 'Sorry, the AI service is temporarily unavailable. Please try again later.';
        }
        
        set((state) => {
          const node = state.nodes.find((n) => n.id === tempNewNodeId);
          if (node) {
            node.data.response = errorMessage;
            node.data.isLoading = false; // Clear loading state on error
            node.draggable = true; // Re-enable dragging
          }
        });
      }
    },

  })),
);

export default useStore;
