import { create } from 'zustand';
import { Edge, Node } from 'reactflow';

interface GraphState {
  nodes: Node<ChatNodeData>[];
  edges: Edge[];
  addNode: (node: Node<ChatNodeData>) => void;
  addEdge: (edge: Edge) => void;
  setNodes: (nodes: Node<ChatNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));

interface ChatNodeData {
  sys_prompt?: string;
  user_prompt?: string;
  response?: string;
}