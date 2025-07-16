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
  selectedNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  fetchInitialData: () => Promise<void>;
  sendMessage: (prompt: string, provider: string, parentId?: string, isBranch?: boolean) => Promise<void>;
}

const useStore = create<StoreState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    reactFlowInstance: null,
    selectedNodeId: null,

    setReactFlowInstance: (instance) => {
      set({ reactFlowInstance: instance });
    },

    setSelectedNodeId: (nodeId) => {
      set({ selectedNodeId: nodeId });
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
        const rows = res.data.data as Array<[number, string, string, any, number | null]>;

        const restoredNodes = rows.map(([id, prompt, resp, positions, parent]) => {
          let pos: { x: number; y: number } | undefined;
          if (Array.isArray(positions)) {
            pos = positions[positions.length - 1];
          } else if (positions && typeof positions === 'object') {
            pos = positions as { x: number; y: number };
          }
          return {
            id: id.toString(),
            type: 'chatNode',
            position: pos ?? { x: 250, y: (id - 1) * 400 + 50 },
            data: { prompt, response: resp },
          };
        });

        const restoredEdges = rows
          .filter(([id, prompt, resp, positions, parent]) => parent !== null)
          .map(([id, prompt, resp, positions, parent]) => ({
            id: `e${parent}-${id}`,
            source: parent!.toString(),
            target: id.toString(),
          }));

        set({ nodes: restoredNodes, edges: restoredEdges });
      } catch (err) {
        console.error('Error restoring chat:', err);
      }
    },

    sendMessage: async (prompt: string, provider: string, parentId?: string, isBranch: boolean = false) => {
      const { nodes, reactFlowInstance } = get();
      let lastNode: Node | undefined;
      let newNodePosition: { x: number; y: number };

      if (parentId) {
        lastNode = nodes.find((n) => n.id === parentId);
        if (!lastNode) {
          console.error('Parent node not found');
          return;
        }
      } else if (nodes.length > 0) {
        lastNode = nodes[nodes.length - 1];
      }

      if (lastNode) {
        let offsetX = 0;
        let offsetY = 250;
        if (isBranch) {
          offsetX = 300;
          offsetY = 0;
        }
        newNodePosition = {
          x: lastNode.position.x + offsetX,
          y: lastNode.position.y + offsetY,
        };
      } else {
        newNodePosition = { x: 250, y: 50 };
      }

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
        reactFlowInstance?.fitView({ nodes: [{ id: tempNewNodeId }], duration: 800, padding: 0.3 });
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
          }
          const edge = state.edges.find((e) => e.target === tempNewNodeId);
          if (edge) {
            edge.id = `e${edge.source}-${actualNewId}`;
            edge.target = actualNewId;
          }
        });
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
