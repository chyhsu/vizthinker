# VizThink AI

A desktop app for visual thinkers, powered by LLMs, that swaps the linear chat format for a dynamic, node-based graph. Explore ideas the way your brain does—branching, connecting, and visualizing concepts in an interactive canvas.

## Are You a VizThinker?

A VizThinker is someone whose brain loves to map ideas like a web, not a straight line. You’re the type who doodles mind maps, sees connections everywhere, and gets frustrated scrolling through endless chat threads to find that *one* key point. VizThink AI is built for you—turning your chats with an AI into a visual graph where ideas flow, branch, and connect, just like your thoughts do.

## What's the Big Idea?

Traditional chatbots like ChatGPT are stuck in a top-down, scroll-heavy rut. That’s rough for VizThinkers who see ideas as a network of connections. VizThink AI lets you interact with an LLM through a node-based interface where every prompt, response, or follow-up becomes a node in a graph. Dig deeper into a topic (vertical nodes) or branch off to explore related ideas (horizontal nodes), all while seeing your thought process come to life as a visual map.

## Key Features

- **Node-Based Chats**: Start with a root prompt, then add follow-up or branching nodes to dive deep or explore tangents.
- **Dynamic Graph**: Watch your conversation grow into an interactive graph with clear vertical (deep dive) and horizontal (side quest) connections.
- **LLM Power**: Send node content to an LLM (like OpenAI) and get responses as new nodes.
- **Interactive Canvas**: Pan and zoom to navigate your idea graph.
- **Save & Load**: Store your sessions locally on your desktop and pick up where you left off.


## User Stories

- As a VizThinker, I want to see my chat as a graph to track how ideas connect.
- As a VizThinker, I want to branch off a specific point in an LLM response to dig into it without losing the main thread.
- As a VizThinker, I want to save my idea graph locally and revisit it later.

## Installation( Development Stage)
Dependencies:
- Node.js
- Python
- SQLite
- Modern web browser (Chrome, Firefox, Safari, Edge)

- **1. Clone the repository**
  ```bash
  git clone https://github.com/jasoncyhsu/vizthinker.git
  cd vizthinker
  ```

- **2. Install all dependencies**
  This single command will verify your setup, create a Python virtual environment, and install all required Node.js and Python packages.
  ```bash
  make install
  ```

- **3. Run the application**
  This command starts the backend server and frontend development server.
  ```bash
  make run
  ```

  Once the servers are running, open your browser and navigate to:
  ```
  http://localhost:5173
  ```

  For more control, you can also run the components separately:
  ```bash
  # Run just the backend server:
  make backend

  # Run just the frontend development server:
  make frontend
  ```


## Roadmap

- **Phase 1 (6 weeks)**: Build the core UI, node system, and LLM integration within Electron.
- **Phase 2 (4 weeks)**: Polish the graph layout and UI/UX for desktop.
- **Phase 3 (2 weeks)**: Test with VizThinkers and release the first version.

### Future Vibes
- Drag nodes around and try new graph layouts.
- Add images or links to nodes.
- Export graphs as PNG or JSON.
- Let multiple VizThinkers collaborate on the same graph.
- Search and navigate huge graphs easily.

## Why It Rocks

VizThink AI is built for folks who think in networks, not lists. It’s a game-changer for brainstorming, research, or just exploring big ideas on your desktop. We’re starting simple but aiming big—join us to make thinking with AI as visual as your imagination!

## Contributing

Got ideas? Found a bug? Open an issue or submit a PR! We’re all about feedback from VizThinkers to make this app shine.

## License

MIT License—feel free to fork and play around!