const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  backendStatus: () => ipcRenderer.invoke('backend-status'),
});
