# Neural Network Visualizer

This project is a simple neural network visualization tool built using Three.js. It allows users to visualize neural networks with adjustable layers and connections, providing an interactive way to understand the structure of neural networks.

## Features

- Visual representation of neural network layers as rectangles.
- Connections between layers displayed as lines.
- Dynamic adjustment of the number of layers in the visualization.
- User-friendly controls for interaction.

## Project Structure

```
neural-network-visualizer
├── src
│   ├── js
│   │   ├── main.js                # Entry point of the application
│   │   ├── NeuralNetworkVis.js    # Manages the neural network visualization
│   │   ├── components
│   │   │   ├── Layer.js           # Represents a single layer
│   │   │   ├── Connection.js       # Represents connections between layers
│   │   │   └── Controls.js         # Manages user input for layer adjustments
│   │   └── utils
│   │       ├── SceneSetup.js      # Initializes the Three.js scene
│   │       └── helpers.js         # Utility functions for common tasks
│   ├── styles
│   │   └── main.css               # Styles for the application
│   └── index.html                 # Main HTML file for the application
├── assets
│   └── textures                   # Directory for texture files
├── package.json                   # npm configuration file
└── README.md                      # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd neural-network-visualizer
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the application, use the following command:
```
npm start
```

Open your browser and navigate to `http://localhost:3000` to view the neural network visualization.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.