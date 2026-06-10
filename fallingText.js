document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.footer-cta');
  if (!container || typeof Matter === 'undefined') return;

  const textElem = container.querySelector('.cta-text');
  if (!textElem) return;

  // Set up container
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.cursor = 'pointer';
  // Increase minimum height so there's plenty of room to fall
  container.style.minHeight = '80vh'; 
  
  // create canvas container
  const canvasContainer = document.createElement('div');
  canvasContainer.style.position = 'absolute';
  canvasContainer.style.top = '0';
  canvasContainer.style.left = '0';
  canvasContainer.style.width = '100%';
  canvasContainer.style.height = '100%';
  canvasContainer.style.zIndex = '0';
  canvasContainer.style.pointerEvents = 'none'; // so we can drag through if we want
  container.appendChild(canvasContainer);

  let effectStarted = false;

  container.addEventListener('click', () => {
    if (!effectStarted) {
      effectStarted = true;
      startFalling();
    }
  });

  function startFalling() {
    const rawText = textElem.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<span[^>]*>_<\/span>/i, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const words = rawText.split(' ');
    textElem.innerHTML = words.map(word => {
      return `<span class="word" style="display: inline-block; margin: 0 10px; user-select: none;">${word}</span>`;
    }).join(' ');

    textElem.style.display = 'inline-block';
    textElem.style.position = 'relative';
    textElem.style.zIndex = '2';

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = 0.56;

    const render = Render.create({
      element: canvasContainer,
      engine: engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false
      }
    });

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    };
    const floor = Bodies.rectangle(width / 2, height + 500, width + 200, 1000, boundaryOptions);
    const leftWall = Bodies.rectangle(-500, height / 2, 1000, height * 2, boundaryOptions);
    const rightWall = Bodies.rectangle(width + 500, height / 2, 1000, height * 2, boundaryOptions);
    const ceiling = Bodies.rectangle(width / 2, -500, width + 200, 1000, boundaryOptions);

    const wordSpans = textElem.querySelectorAll('.word');
    const wordBodies = Array.from(wordSpans).map(elem => {
      const eRect = elem.getBoundingClientRect();
      const x = eRect.left - rect.left + eRect.width / 2;
      const y = eRect.top - rect.top + eRect.height / 2;

      const body = Bodies.rectangle(x, y, eRect.width, eRect.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 1) * 10
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
      return { elem, body };
    });

    wordBodies.forEach(({ elem }) => {
      elem.style.position = 'absolute';
      elem.style.margin = '0';
    });

    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.9,
        render: { visible: false }
      }
    });
    render.mouse = mouse;
    // Fix mouse offset for scroll
    Mouse.setOffset(mouse, { x: 0, y: 0 });

    World.add(engine.world, [floor, leftWall, rightWall, ceiling, mouseConstraint, ...wordBodies.map(wb => wb.body)]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const updateLoop = () => {
      wordBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      Matter.Engine.update(engine);
      requestAnimationFrame(updateLoop);
    };
    updateLoop();
    
    // allow clicking and dragging
    canvasContainer.style.pointerEvents = 'auto';
  }
});
