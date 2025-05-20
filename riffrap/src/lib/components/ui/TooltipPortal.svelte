<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Track all active tooltips
  let tooltips = [];
  let portalElement;
  
  onMount(() => {
    // Create a portal element in document body for tooltips
    portalElement = document.createElement('div');
    portalElement.id = 'tooltip-portal';
    portalElement.style.position = 'fixed';
    portalElement.style.top = '0';
    portalElement.style.left = '0';
    portalElement.style.width = '100%';
    portalElement.style.height = '100%';
    portalElement.style.pointerEvents = 'none';
    portalElement.style.zIndex = '9999';
    document.body.appendChild(portalElement);
    
    // Observer to find tooltip containers and relocate tooltips
    const observer = new MutationObserver(() => {
      relocateTooltips();
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial relocation
    relocateTooltips();
    
    return () => {
      observer.disconnect();
      if (portalElement && document.body.contains(portalElement)) {
        document.body.removeChild(portalElement);
      }
    };
  });
  
  function relocateTooltips() {
    // Find all tooltip containers
    const tooltipContainers = document.querySelectorAll('.has-tooltip');
    
    // Process each tooltip container
    tooltipContainers.forEach(container => {
      const tooltip = container.querySelector('.tooltip');
      if (!tooltip || tooltip.dataset.relocated === 'true') return;
      
      // Clone the tooltip
      const clone = tooltip.cloneNode(true);
      clone.dataset.relocated = 'true';
      
      // Set absolute positioning based on original tooltip position
      const rect = tooltip.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      clone.style.position = 'fixed';
      clone.style.top = `${containerRect.top - 30}px`;
      clone.style.left = `${containerRect.left + containerRect.width / 2}px`;
      clone.style.transform = 'translateX(-50%)';
      clone.style.zIndex = '9999';
      clone.style.opacity = '0';
      clone.style.pointerEvents = 'none';
      
      // Create a connection between the container and its tooltip
      const id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      container.dataset.tooltipId = id;
      clone.dataset.tooltipId = id;
      
      // Add event listeners to show/hide tooltip
      container.addEventListener('mouseenter', () => {
        const tooltipEl = document.querySelector(`[data-tooltip-id="${id}"]`);
        if (tooltipEl) tooltipEl.style.opacity = '1';
      });
      
      container.addEventListener('mouseleave', () => {
        const tooltipEl = document.querySelector(`[data-tooltip-id="${id}"]`);
        if (tooltipEl) tooltipEl.style.opacity = '0';
      });
      
      // Add to portal
      portalElement.appendChild(clone);
      
      // Hide original
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      
      // Track for cleanup
      tooltips.push({
        id,
        element: clone,
        container
      });
    });
  }
  
  onDestroy(() => {
    // Clean up all tooltips
    tooltips.forEach(tooltip => {
      if (tooltip.element && portalElement.contains(tooltip.element)) {
        portalElement.removeChild(tooltip.element);
      }
    });
    
    // Remove the portal
    if (portalElement && document.body.contains(portalElement)) {
      document.body.removeChild(portalElement);
    }
  });
</script>

<!-- The portal is rendered in the body, nothing to render here -->