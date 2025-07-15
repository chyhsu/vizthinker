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
} from 'reactflow';

export interface StoreState {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
  fetchInitialData: () => Promise<void>;
  sendMessage: (prompt: string, provider: string) => Promise<void>;
}

const useStore = create<StoreState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    reactFlowInstance: null,

    setReactFlowInstance: (instance) => {
      set({ reactFlowInstance: instance });
    },

    onNodesChange: (changes) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      });
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

    fetchInitialData: async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/chat/get');
        const rows = res.data.data as Array<[string, string, any]>;

        const restoredNodes = rows.map(([prompt, resp, positions], idx) => {
          let pos: { x: number; y: number } | undefined;
          if (Array.isArray(positions)) {
            pos = positions[idx] || positions[positions.length - 1];
          } else if (positions && typeof positions === 'object') {
            pos = positions as { x: number; y: number };
          }
          return {
            id: (idx + 1).toString(),
            type: 'chatNode',
            position: pos ?? { x: 250, y: idx * 400 + 50 },
            data: { prompt, response: resp },
          };
        });

        const restoredEdges = restoredNodes.slice(1).map((node, idx) => ({
          id: `e${restoredNodes[idx].id}-${node.id}`,
          source: restoredNodes[idx].id,
          target: node.id,
        }));

        set({ nodes: restoredNodes, edges: restoredEdges });
      } catch (err) {
        console.error('Error restoring chat:', err);
      }
    },

    sendMessage: async (prompt, provider) => {
      const { nodes, reactFlowInstance } = get();
      const newNodeId = (nodes.length + 1).toString();
      const lastNode = nodes[nodes.length - 1];

      const newNode: Node = {
        id: newNodeId,
        type: 'chatNode',
        position: {
          x: lastNode ? lastNode.position.x : 250,
          y: lastNode ? lastNode.position.y + 250 : 50,
        },
        data: { prompt, response: '...' },
      };

      set((state) => {
        state.nodes.push(newNode);
        if (lastNode) {
          state.edges.push({
            id: `e${lastNode.id}-${newNodeId}`,
            source: lastNode.id,
            target: newNodeId,
          });
        }
      });

      setTimeout(() => {
        reactFlowInstance?.fitView({ nodes: [{ id: newNodeId }], duration: 800, padding: 0.3 });
      }, 100);

      try {
        const response = await axios.post('http://127.0.0.1:8000/chat/new', {
          prompt,
          provider,
        });

        const aiResponse = response.data.response;

        set((state) => {
          const node = state.nodes.find((n) => n.id === newNodeId);
          if (node) {
            node.data.response = aiResponse;
          }
        });
      } catch (error) {
        console.error('Error fetching AI response:', error);
        set((state) => {
          const node = state.nodes.find((n) => n.id === newNodeId);
          if (node) {
            node.data.response = 'Sorry, an error occurred.';
          }
        });
      }
    },
  })),
);

export default useStore;
