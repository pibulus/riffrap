import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Generate a short random ID for snippets
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Load initial state from localStorage if available
const loadFromStorage = () => {
  if (browser) {
    const storedSnippets = localStorage.getItem('lyrics-snippets');
    return storedSnippets ? JSON.parse(storedSnippets) : [];
  }
  return [];
};

// Create the writable store
const createSnippetStore = () => {
  const { subscribe, set, update } = writable(loadFromStorage());

  return {
    subscribe,
    
    // Add a new snippet to the collection
    addSnippet: (text) => {
      console.log('Adding snippet:', text);
      update(snippets => {
        const newSnippet = {
          id: generateId(),
          text,
          timestamp: Date.now(),
          order: snippets.length // Add to the end by default
        };
        
        const updatedSnippets = [...snippets, newSnippet];
        console.log('Updated snippets:', updatedSnippets);
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('lyrics-snippets', JSON.stringify(updatedSnippets));
        }
        
        return updatedSnippets;
      });
    },
    
    // Remove a snippet by ID
    removeSnippet: (id) => {
      update(snippets => {
        const filteredSnippets = snippets.filter(snippet => snippet.id !== id);
        
        // Reindex order values to keep them sequential
        const reorderedSnippets = filteredSnippets.map((snippet, index) => ({
          ...snippet,
          order: index
        }));
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('lyrics-snippets', JSON.stringify(reorderedSnippets));
        }
        
        return reorderedSnippets;
      });
    },
    
    // Reorder a snippet by changing its order value
    reorderSnippet: (id, newOrder) => {
      update(snippets => {
        // Get the snippet to move
        const snippetToMove = snippets.find(snippet => snippet.id === id);
        if (!snippetToMove) return snippets;
        
        const oldOrder = snippetToMove.order;
        
        // Ensure newOrder is within valid bounds
        const maxOrder = snippets.length - 1;
        const boundedNewOrder = Math.max(0, Math.min(newOrder, maxOrder));
        
        // Update orders for all affected snippets
        const updatedSnippets = snippets.map(snippet => {
          if (snippet.id === id) {
            // This is the snippet being moved
            return { ...snippet, order: boundedNewOrder };
          } else if (
            (oldOrder < boundedNewOrder && snippet.order > oldOrder && snippet.order <= boundedNewOrder) ||
            (oldOrder > boundedNewOrder && snippet.order < oldOrder && snippet.order >= boundedNewOrder)
          ) {
            // These snippets need to be shifted
            return {
              ...snippet,
              order: oldOrder < boundedNewOrder ? snippet.order - 1 : snippet.order + 1
            };
          }
          return snippet;
        });
        
        // Sort by order to ensure proper sequence
        const sortedSnippets = [...updatedSnippets].sort((a, b) => a.order - b.order);
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('lyrics-snippets', JSON.stringify(sortedSnippets));
        }
        
        return sortedSnippets;
      });
    },
    
    // Move a snippet up in the order
    moveUp: (id) => {
      update(snippets => {
        const snippet = snippets.find(s => s.id === id);
        if (!snippet || snippet.order === 0) return snippets;
        
        const updatedSnippets = snippets.map(s => {
          if (s.id === id) {
            return { ...s, order: s.order - 1 };
          } else if (s.order === snippet.order - 1) {
            return { ...s, order: s.order + 1 };
          }
          return s;
        }).sort((a, b) => a.order - b.order);
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('lyrics-snippets', JSON.stringify(updatedSnippets));
        }
        
        return updatedSnippets;
      });
    },
    
    // Move a snippet down in the order
    moveDown: (id) => {
      update(snippets => {
        const snippet = snippets.find(s => s.id === id);
        if (!snippet || snippet.order === snippets.length - 1) return snippets;
        
        const updatedSnippets = snippets.map(s => {
          if (s.id === id) {
            return { ...s, order: s.order + 1 };
          } else if (s.order === snippet.order + 1) {
            return { ...s, order: s.order - 1 };
          }
          return s;
        }).sort((a, b) => a.order - b.order);
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('lyrics-snippets', JSON.stringify(updatedSnippets));
        }
        
        return updatedSnippets;
      });
    },
    
    // Clear all snippets
    clearSnippets: () => {
      set([]);
      if (browser) {
        localStorage.removeItem('lyrics-snippets');
      }
    },
    
    // Get all snippets as plain text
    getPlainText: () => {
      let result = '';
      update(snippets => {
        result = snippets
          .sort((a, b) => a.order - b.order)
          .map(snippet => snippet.text.trim())
          .join('\n');
        return snippets;
      });
      return result;
    }
  };
};

// Create the store instance
const snippetStore = createSnippetStore();

// For direct debugging
if (typeof window !== 'undefined') {
  window.debugSnippetStore = snippetStore;
}

// Export the store
export { snippetStore };