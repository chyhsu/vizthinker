import html2canvas from 'html2canvas';
import { getNodesBounds } from 'reactflow';
import useStore from './store';
import axios from 'axios';

export const exportAsMarkdown = async () => {
    const { nodes, edges, reactFlowInstance } = useStore.getState();
    
    if (!nodes || nodes.length === 0) {
        console.error('No conversation data to export');
        throw new Error('No conversation data to export');
    }
    
    try {
        const user_id = localStorage.getItem('user_id');
        const chatrecord_id = localStorage.getItem('chatrecord_id');
        
        if (!user_id || !chatrecord_id) {
            throw new Error('User not authenticated or no conversation found');
        }
        
        // Get provider and model from settings
        const provider = localStorage.getItem('viz_provider') || 'google';
        let model: string | undefined;
        
        try {
            const providerModels = localStorage.getItem('viz_provider_models');
            if (providerModels) {
                const models = JSON.parse(providerModels);
                model = models[provider];
            }
        } catch (error) {
            console.warn('Failed to parse provider models from settings:', error);
        }
        
        const postData = {
            user_id: parseInt(user_id),
            chatrecord_id: parseInt(chatrecord_id),
            provider,
            model,
            parent_id: 0, // Use 0 as default parent_id for markdown export
            isbranch: false
        };
        
        const { API_ENDPOINTS } = await import('../config/api');
    const response = await axios.post(API_ENDPOINTS.MARKDOWN, postData);
        const markdown = response.data.response;
        
        // Create and download the markdown file
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conversation-${chatrecord_id}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return markdown;
    } catch (error) {
        console.error('Error exporting as markdown:', error);
        throw error;
    }
}
export const exportAsImage = async () => {
    const { nodes, edges, reactFlowInstance } = useStore.getState();
    
    if (!reactFlowInstance || nodes.length === 0) {
      console.error('No content to export or ReactFlow not initialized');
      throw new Error('No content to export or ReactFlow not initialized');
    }

    try {
      // Find the ReactFlow container element
      const reactFlowContainer = document.querySelector('.react-flow');
      
      if (!reactFlowContainer) {
        console.error('ReactFlow container element not found');
        throw new Error('ReactFlow container element not found');
      }

      // Get the bounds of all nodes
      const nodesBounds = getNodesBounds(nodes);
      
      // Calculate viewport to fit all nodes with generous padding
      const padding = 150;
      const minWidth = 1200;
      const minHeight = 800;
      
      const contentWidth = nodesBounds.width + padding * 2;
      const contentHeight = nodesBounds.height + padding * 2;
      const imageWidth = Math.max(contentWidth, minWidth);
      const imageHeight = Math.max(contentHeight, minHeight);
      
      // Store original viewport
      const originalViewport = reactFlowInstance.getViewport();
      
      // Fit view to show all nodes with padding
      await reactFlowInstance.fitView({ 
        padding: 0.2, 
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 1.5,
        duration: 0 
      });
      
      // Wait for viewport to update and render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the entire ReactFlow container
      const canvas = await html2canvas(reactFlowContainer as HTMLElement, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher quality
        logging: false,
        removeContainer: false,
        width: imageWidth,
        height: imageHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Restore original viewport
      await reactFlowInstance.setViewport(originalViewport, { duration: 300 });

      // Download the image
      const dataURL = canvas.toDataURL('image/png', 0.95);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `vizthinker-graph-${timestamp}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Graph exported as image successfully');
    } catch (error) {
      console.error('Error exporting image:', error);
      throw error;
    }
};

export const exportAsHTML = () => {
    const { nodes, edges } = useStore.getState();
    
    try {
      if (nodes.length === 0) {
        throw new Error('No conversation data to export');
      }

      // Sort nodes by ID to maintain conversation order
      const sortedNodes = [...nodes].sort((a, b) => parseInt(a.id) - parseInt(b.id));
      
      // Create a simplified graph structure for visualization
      const graphData = {
        nodes: nodes.map(node => ({
          id: node.id,
          label: `Node ${node.id}`,
          title: node.data.prompt && node.data.prompt !== "Welcome to VizThinker AI" 
            ? (node.data.prompt.length > 50 ? node.data.prompt.substring(0, 50) + '...' : node.data.prompt)
            : 'Welcome',
          x: node.position.x,
          y: node.position.y
        })),
        edges: edges.map(edge => ({
          from: edge.source,
          to: edge.target,
          type: edge.type || 'default'
        }))
      };

      // Generate HTML content
      let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VizThinker Conversation Export - ${new Date().toLocaleDateString()}</title>
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
      body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
      }
      .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.18);
      }
      .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
      }
      .title {
          color: #2d3748;
          font-size: 2.5em;
          margin: 0;
          font-weight: bold;
      }
      .subtitle {
          color: #718096;
          font-size: 1.1em;
          margin: 10px 0;
      }
      .stats {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          flex-wrap: wrap;
      }
      .stat {
          background: #f7fafc;
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
      }
      .graph-section {
          margin: 30px 0;
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          padding: 20px;
      }
      .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
      }
      .graph-title {
          font-size: 1.4em;
          font-weight: bold;
          color: #2d3748;
      }
      .graph-controls {
          display: flex;
          gap: 10px;
      }
      .graph-btn {
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.9em;
          transition: background 0.2s;
      }
      .graph-btn:hover {
          background: #3182ce;
      }
      .graph-btn:disabled {
          background: #a0aec0;
          cursor: not-allowed;
      }
      #graph-container {
          width: 100%;
          height: 500px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          position: relative;
      }
      .graph-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
          font-size: 0.9em;
          color: #718096;
      }
      .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
      }
      .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
      }
      .conversation {
          margin-top: 30px;
      }
      .node {
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: relative;
      }
      .node-header {
          background: #f7fafc;
          padding: 15px 20px;
          font-weight: bold;
          color: #4a5568;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
      .node-connections {
          font-size: 0.8em;
          color: #718096;
          font-weight: normal;
      }
      .human-section {
          padding: 20px;
          background: #edf2f7;
          border-left: 4px solid #4299e1;
      }
      .ai-section {
          padding: 20px;
          background: #f0fff4;
          border-left: 4px solid #48bb78;
      }
      .section-label {
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
      }
      .human-label {
          color: #4299e1;
      }
      .ai-label {
          color: #48bb78;
      }
      .content {
          white-space: pre-wrap;
          font-size: 1em;
          line-height: 1.6;
          word-wrap: break-word;
          overflow-wrap: break-word;
      }
      .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          color: #718096;
      }
      .toc {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
      }
      .toc h3 {
          margin-top: 0;
          color: #2d3748;
      }
      .toc ul {
          list-style-type: none;
          padding: 0;
      }
      .toc li {
          margin: 8px 0;
      }
      .toc a {
          color: #4299e1;
          text-decoration: none;
          font-weight: 500;
      }
      .toc a:hover {
          text-decoration: underline;
      }
      @media print {
          body {
              background: white;
          }
          .container {
              background: white;
              box-shadow: none;
              border: none;
          }
          .graph-section {
              page-break-inside: avoid;
          }
      }
      @media (max-width: 768px) {
          body {
              padding: 10px;
          }
          .container {
              padding: 20px;
          }
          .stats {
              flex-direction: column;
              align-items: center;
          }
          .graph-header {
              flex-direction: column;
              gap: 10px;
          }
          #graph-container {
              height: 400px;
          }
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="header">
          <h1 class="title">🧠 VizThinker Conversation</h1>
          <p class="subtitle">Exported on ${new Date().toLocaleString()}</p>
          <div class="stats">
              <div class="stat">
                  <strong>${nodes.length}</strong> Nodes
              </div>
              <div class="stat">
                  <strong>${edges.length}</strong> Connections
              </div>
              <div class="stat">
                  <strong>${sortedNodes.filter(n => n.data.prompt && n.data.prompt !== "Welcome to VizThinker AI").length}</strong> Exchanges
              </div>
          </div>
      </div>
      
      <div class="graph-section">
          <div class="graph-header">
              <div class="graph-title">📊 Interactive Graph Visualization</div>
              <div class="graph-controls">
                  <button class="graph-btn" onclick="fitGraph()">Fit View</button>
                  <button class="graph-btn" onclick="zoomIn()">Zoom In</button>
                  <button class="graph-btn" onclick="zoomOut()">Zoom Out</button>
              </div>
          </div>
          <div id="graph-container"></div>
          <div class="graph-legend">
              <div class="legend-item">
                  <div class="legend-color" style="background-color: #4299e1;"></div>
                  <span>Regular Connection</span>
              </div>
              <div class="legend-item">
                  <div class="legend-color" style="background-color: #ed8936;"></div>
                  <span>Branch Connection</span>
              </div>
              <div class="legend-item">
                  <div class="legend-color" style="background-color: #48bb78;"></div>
                  <span>Node</span>
              </div>
          </div>
      </div>`;

      // Table of Contents
      const conversationNodes = sortedNodes.filter(node => 
        node.data.prompt && node.data.prompt !== "Welcome to VizThinker AI"
      );
      
      if (conversationNodes.length > 3) {
        html += `
      <div class="toc">
          <h3>📋 Table of Contents</h3>
          <ul>`;
        
        conversationNodes.forEach((node) => {
          const { prompt } = node.data;
          const title = prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;
          html += `
              <li><a href="#node-${node.id}">Node ${node.id}: ${title}</a></li>`;
        });
        
        html += `
          </ul>
      </div>`;
      }

      // Conversation content
      html += `
      <div class="conversation">`;

      sortedNodes.forEach((node, index) => {
        const { prompt, response } = node.data;
        
        // Find connections for this node
        const incomingEdges = edges.filter(edge => edge.target === node.id);
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        
        let connectionInfo = '';
        if (incomingEdges.length > 0) {
          const parentNodes = incomingEdges.map(edge => `Node ${edge.source}`).join(', ');
          connectionInfo += `From: ${parentNodes}`;
        }
        if (outgoingEdges.length > 0) {
          const childNodes = outgoingEdges.map(edge => `Node ${edge.target}`).join(', ');
          connectionInfo += connectionInfo ? ` | To: ${childNodes}` : `To: ${childNodes}`;
        }
        if (!connectionInfo) {
          connectionInfo = incomingEdges.length === 0 ? 'Root Node' : 'End Node';
        }
        
        html += `
          <div class="node" id="node-${node.id}">
              <div class="node-header">
                  <div>Node ${node.id}</div>
                  <div class="node-connections">${connectionInfo}</div>
              </div>`;
        
        if (prompt && prompt !== "Welcome to VizThinker AI") {
          html += `
              <div class="human-section">
                  <div class="section-label human-label">
                      🤔 Human Question
                  </div>
                  <div class="content">${prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              </div>`;
        }
        
        if (response) {
          html += `
              <div class="ai-section">
                  <div class="section-label ai-label">
                      🤖 AI Response
                  </div>
                  <div class="content">${response.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              </div>`;
        }
        
        html += `
          </div>`;
      });

      html += `
      </div>
      
      <div class="footer">
          <p><strong>Generated by VizThinker AI</strong></p>
          <p>This conversation was exported as a complete, self-contained HTML document.</p>
          <p>You can print this page or save it as PDF using your browser's print function.</p>
      </div>
  </div>
  
  <script>
      // Graph data
      const graphData = ${JSON.stringify(graphData)};
      
      // Initialize the network
      let network;
      
      function initGraph() {
          const container = document.getElementById('graph-container');
          
          // Prepare nodes for vis.js
          const nodes = new vis.DataSet(graphData.nodes.map(node => ({
              id: node.id,
              label: node.label,
              title: node.title,
              color: {
                  background: '#48bb78',
                  border: '#38a169',
                  highlight: {
                      background: '#68d391',
                      border: '#38a169'
                  }
              },
              font: {
                  color: 'white',
                  size: 14,
                  face: 'Arial'
              },
              borderWidth: 2,
              borderWidthSelected: 3,
              shape: 'box',
              margin: 10,
              widthConstraint: {
                  minimum: 100,
                  maximum: 200
              }
          })));
          
          // Prepare edges for vis.js
          const edges = new vis.DataSet(graphData.edges.map(edge => ({
              from: edge.from,
              to: edge.to,
              color: {
                  color: edge.type === 'branch' ? '#ed8936' : '#4299e1',
                  highlight: edge.type === 'branch' ? '#dd6b20' : '#3182ce'
              },
              width: edge.type === 'branch' ? 3 : 2,
              arrows: {
                  to: {
                      enabled: true,
                      scaleFactor: 1.2
                  }
              },
              smooth: {
                  type: 'curvedCW',
                  roundness: edge.type === 'branch' ? 0.3 : 0.1
              },
              dashes: edge.type === 'branch' ? [10, 5] : false
          })));
          
          const data = { nodes: nodes, edges: edges };
          
          const options = {
              layout: {
                  improvedLayout: true,
                  hierarchical: {
                      enabled: false
                  }
              },
              physics: {
                  enabled: false
              },
              interaction: {
                  dragNodes: true,
                  dragView: true,
                  zoomView: true,
                  selectConnectedEdges: false
              },
              nodes: {
                  chosen: {
                      node: function(values, id, selected, hovering) {
                          values.borderColor = '#2d3748';
                          values.borderWidth = 3;
                      }
                  }
              },
              edges: {
                  chosen: {
                      edge: function(values, id, selected, hovering) {
                          values.width = values.width + 1;
                      }
                  }
              }
          };
          
          network = new vis.Network(container, data, options);
          
          // Handle node clicks
          network.on('click', function(params) {
              if (params.nodes.length > 0) {
                  const nodeId = params.nodes[0];
                  const nodeElement = document.getElementById('node-' + nodeId);
                  if (nodeElement) {
                      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      nodeElement.style.border = '3px solid #4299e1';
                      setTimeout(() => {
                          nodeElement.style.border = '1px solid #e2e8f0';
                      }, 2000);
                  }
              }
          });
      }
      
      // Control functions
      function fitGraph() {
          if (network) {
              network.fit({
                  animation: {
                      duration: 1000,
                      easingFunction: 'easeInOutQuart'
                  }
              });
          }
      }
      
      function zoomIn() {
          if (network) {
              const scale = network.getScale();
              network.moveTo({
                  scale: scale * 1.2,
                  animation: {
                      duration: 300,
                      easingFunction: 'easeInOutQuart'
                  }
              });
          }
      }
      
      function zoomOut() {
          if (network) {
              const scale = network.getScale();
              network.moveTo({
                  scale: scale * 0.8,
                  animation: {
                      duration: 300,
                      easingFunction: 'easeInOutQuart'
                  }
              });
          }
      }
      
      // Initialize graph when page loads
      document.addEventListener('DOMContentLoaded', function() {
          if (typeof vis !== 'undefined') {
              initGraph();
          } else {
              console.error('vis.js library not loaded');
          }
      });
  </script>
</body>
</html>`;

      // Create and download the HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `vizthinker-conversation-${timestamp}.html`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('Conversation exported as HTML successfully');
    } catch (error) {
      console.error('Error exporting HTML:', error);
      throw error;
    }
}; 