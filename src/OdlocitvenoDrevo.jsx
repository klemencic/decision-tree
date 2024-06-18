import { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import { v4 as uuidv4 } from 'uuid';

const OdlocitvenoDrevo = () => {
  const [data, setData] = useState({
    id: uuidv4(),
    name: 'Root',
    shape: 'square',
    value: 0,
    percentage: '',
    active: false,
    isPath: false, 
    children: []
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('square');
  const [nodeValue, setNodeValue] = useState('');
  const [nodePercentage, setNodePercentage] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('treeData'); //ne dela????
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        calculateNodeValues(parsedData); 
        setData(parsedData);
      } catch (error) {
        console.error('localstorage error', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('treeData', JSON.stringify(data));
  }, [data]);

  function addChildNode(node, newChild) {
    if (node.id === newChild.parentId) {
      return {
        ...node,
        children: [...(node.children || []), {
          ...newChild,
          id: uuidv4(),
          children: []
        }]
      };
    } else if (node.children) {
      return {
        ...node,
        children: node.children.map(child => addChildNode(child, newChild))
      };
    }
    return node;
  }

  function handleDodajNode() {
    //check node a pravilnost
    if (nodeName && (nodeType === 'square' || (nodeValue && nodePercentage && (nodeType === 'circle' || nodeType === 'triangle')))) {
      const updatedData = addChildNode(data, {
        name: nodeName,
        parentId: selectedNode.id,
        shape: nodeType,
        value: nodeType === 'square' ? 0 : parseFloat(nodeValue),
        percentage: nodeType === 'square' ? '' : parseFloat(nodePercentage) / 100,
        active: false,
        isPath: false,
        id: uuidv4()
      });
      //resetData
      calculateNodeValues(updatedData); 
      setData(updatedData);
      setSelectedNode(null);
      setNodeName('');
      setNodeValue('');
      setNodePercentage('');
    } else {
      alert("Please enter valid node details.");
    }
  }

  function nodeClicked(nodeData) {
    setSelectedNode(nodeData);
  }

  function deleteNode() {
    if (selectedNode && selectedNode.id !== data.id) {
      const updatedData = removeNode({ ...data }, selectedNode.id);
      if (updatedData) {
        setData(updatedData);
        calculateNodeValues(updatedData);
        setSelectedNode(null);
      }
    } else {
      alert("Cannot delete root node or a node without a parent.");
    }
  }
  //brisi node glede id
  function removeNode(node, nodeId) {
    if (node.id === nodeId) {
      return null; 
    }

    if (node.children) {
      node.children = node.children
        .map(child => removeNode(child, nodeId))
        .filter(child => child !== null); 
    }

    return node;
  }

  //setaj path
  function setPathToRootActive() {
    if (selectedNode && selectedNode.shape === 'square') {
      const path = findRoot(data, selectedNode.id);
      const lastChildSquareValue = selectedNode.value;
      const updatedData = setActivePath(data, path, lastChildSquareValue);
      setData({ ...updatedData });
    }
  }

  //set aktiven path(obarvaj)
  function setActivePath(node, path, value) {
    if (path.length === 0) return node;

    node.isPath = path.includes(node.id);

    if (node.shape === 'square' && path.includes(node.id)) {
      node.active = true;
      node.value = value;
    } else {
      node.active = false;
    }

    if (node.children) {
      node.children = node.children.map(child => setActivePath(child, path, value));
    }

    return node;
  }

  function findRoot(node, targetId, path = []) {
    if (node.id === targetId) {
      return [...path, node.id];
      //najdi child ce ima
    } else if (node.children) {
      for (const child of node.children) {
        const newPath = findRoot(child, targetId, [...path, node.id]);
        if (newPath) {
          return newPath;
        }
      }
    }
    return null;
  }

  //izracun vrednosti ($) za vsak node
  function calculateNodeValues(node) {
    if (!node.children || node.children.length === 0) {
      return node.value;
    }

    let totalValue = 0;
    node.children.forEach(child => {
      totalValue += calculateNodeValues(child) * (child.percentage || 1);
    });

    node.value = totalValue;

    return totalValue;
  }

  const renderRectSvgNode = ({ nodeDatum }) => (
    <g>
      {nodeDatum.shape === 'circle' ? (
        <circle
          r="15"
          fill="yellow"
          stroke={nodeDatum.isPath ? 'blue' : 'none'}
          strokeWidth={nodeDatum.isPath ? '3' : '0'}
          onClick={() => nodeClicked(nodeDatum)}
        />
      ) : nodeDatum.shape === 'square' ? (
        <rect
          width="30"
          height="30"
          fill="red"
          x="-15"
          y="-15"
          stroke={nodeDatum.isPath ? 'blue' : 'none'}
          strokeWidth={nodeDatum.isPath ? '3' : '0'}
          onClick={() => nodeClicked(nodeDatum)}
        />
      ) : nodeDatum.shape === 'rectangle' ? (
        <>
          <rect
            width="80"
            height="30"
            fill="blue"
            x="-40"
            y="-15"
            stroke={nodeDatum.isPath ? 'blue' : 'none'}
            strokeWidth={nodeDatum.isPath ? '3' : '0'}
            onClick={() => nodeClicked(nodeDatum)}
          />
          <text fill="white" strokeWidth="0.5" textAnchor="middle" dominantBaseline="middle" x="0" y="0">
            {nodeDatum.name} {nodeDatum.active !== undefined ? nodeDatum.active.toString() : "false"}
          </text>
        </>
      ) : (
        <polygon
          points="0,-15 15,15 -15,15"
          fill="green"
          stroke={nodeDatum.isPath ? 'blue' : 'none'}
          strokeWidth={nodeDatum.isPath ? '3' : '0'}
          onClick={() => nodeClicked(nodeDatum)}
        />
      )}
      {nodeDatum.shape === 'square' && (
        <text fill="black" strokeWidth="0.5" x="20" y="20">
          {nodeDatum.name}
          <tspan x="20" dy="1.2em">Value: {nodeDatum.value.toFixed(2)}</tspan>
        </text>
      )}
      {nodeDatum.shape === 'circle' && (
        <text fill="black" strokeWidth="0.5" x="20" y="20">
          {nodeDatum.name}
          <tspan x="20" dy="1.2em">Percentage: {nodeDatum.percentage * 100}%</tspan>
          <tspan x="20" dy="1.2em">Value: {nodeDatum.value.toFixed(2)}</tspan>
        </text>
      )}
      {nodeDatum.shape === 'triangle' && (
        <text fill="black" strokeWidth="0.5" x="20" y="20">
          {nodeDatum.name}
          <tspan x="20" dy="1.2em">Percentage: {nodeDatum.percentage * 100}%</tspan>
          <tspan x="20" dy="1.2em">Value: {nodeDatum.value.toFixed(2)}</tspan>
        </text>
      )}
    </g>
  );

  function downloadData() {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'treePodatki.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const jsonData = JSON.parse(event.target.result);
        calculateNodeValues(jsonData); 
        setData(jsonData);
        console.log('Data loaded');
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ width: '100%', height: '800px', position: 'relative' }}>
      <Tree
        data={data}
        orientation="vertical"
        translate={{ x: 50, y: 400 }}
        renderCustomNodeElement={renderRectSvgNode}
      />
      {selectedNode && (
        <div style={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', background: 'teal', padding: '20px', border: '1px solid black' }}>
          <h3>Node settings</h3>
          <div>
            <label>
              Node ime:
              <input type="text" value={nodeName} onChange={e => setNodeName(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Node:
              <select value={nodeType} onChange={e => setNodeType(e.target.value)}>
                <option value="circle">Moznost node</option>
                <option value="square">Odlocitev node</option>
                <option value="triangle">Koncni node</option>
              </select>
            </label>
          </div>
          {nodeType !== 'square' && (
            <div>
              <label>
                Vrednost: ($):
                <input type="text" value={nodeValue} onChange={e => setNodeValue(e.target.value)} />
              </label>
            </div>
          )}
          {nodeType !== 'square' && (
            <div>
              <label>
                Verjetnost: (%):
                <input type="text" value={nodePercentage} onChange={e => setNodePercentage(e.target.value)} />
              </label>
            </div>
          )}
          <button onClick={handleDodajNode}>Dodaj node</button>
          <button onClick={deleteNode}>Izbrisi Node</button>
          <button onClick={setPathToRootActive}>Izberi node kot aktiven</button>
          <button onClick={() => setSelectedNode(null)}>Cancel</button>
          <div>
            <button onClick={downloadData}>Download Data</button>
            <input type="file" onChange={handleFileUpload} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OdlocitvenoDrevo;
