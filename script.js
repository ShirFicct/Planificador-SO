function startScheduler(mode) {
  document.getElementById("queues").innerHTML = "";
  document.getElementById("currentProcess").textContent =
    "Ningún proceso en ejecución";

  if (mode === 1) {
    // Modo automático
    const queueNames = ["V", "M", "J"]; // Nombres predefinidos para las colas
    const numColas = 3;
    const processCounts = [2, 2, 2]; // Asumiendo 2 procesos por cola para simplificar
    const quantums = 2; // Quantums iniciales fijos para todos los procesos
    initQueues(numColas, processCounts, quantums, queueNames);
  }

  renderQueues();
  runScheduler();
}

function generateProcessInputs() {
  const numColas = parseInt(document.getElementById("numColas").value);
  const queueContainer = document.getElementById("queueNameInputs");
  const processContainer = document.getElementById("processInputs");
  queueContainer.innerHTML = ""; // Limpiar cualquier entrada previa
  processContainer.innerHTML = "";

  for (let i = 0; i < numColas; i++) {
    // Crear entrada para el nombre de la cola
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `queueName${i + 1}`;
    nameInput.name = `queueName${i + 1}`;
    nameInput.required = true;
    nameInput.placeholder = `Nombre de Cola ${i + 1}`;
    queueContainer.appendChild(nameInput);
    queueContainer.appendChild(document.createElement("br"));

    // Crear entrada para el número de procesos
    const input = document.createElement("input");
    input.type = "number";
    input.id = `cola${i + 1}`;
    input.name = `cola${i + 1}`;
    input.min = "1";
    input.max = "8";
    input.required = true;
    input.placeholder = `Procesos en Cola ${i + 1}`;
    processContainer.appendChild(input);
    processContainer.appendChild(document.createElement("br"));
  }
}

function manualSetup() {
  const numColas = parseInt(document.getElementById("numColas").value);
  const quantums = parseInt(document.getElementById("quantums").value);
  const processCounts = [];
  const queueNames = [];

  for (let i = 0; i < numColas; i++) {
    processCounts.push(parseInt(document.getElementById(`cola${i + 1}`).value));
    queueNames.push(document.getElementById(`queueName${i + 1}`).value.trim());
  }

  if (
    numColas > 0 &&
    quantums > 0 &&
    !processCounts.some(isNaN) &&
    queueNames.every((name) => name !== "")
  ) {
    initQueues(numColas, processCounts, quantums, queueNames);
    renderQueues();
    return true; // Devuelve true indicando que todo está correctamente configurado
  } else {
    alert("Por favor, asegúrese de llenar todos los campos correctamente.");
    return false; // Devuelve false si la configuración no es válida
  }
}

function initQueues(numColas, processCounts, quantums, queueNames) {
  queues = []; // Limpiar las colas existentes
  for (let i = 0; i < numColas; i++) {
    let queue = [];
    for (let j = 0; j < processCounts[i]; j++) {
      queue.push({
        id: `${queueNames[i]}${j + 1}`,
        lives: 3,
        quantum: quantums,
      });
    }
    queues.push(queue);
  }
  currentIndex = 0; // Resetear el índice para la ejecución del planificador
}

function adjustQuantum(queueIndex, processIndex) {
  let newQuantum = parseInt(
    prompt("Ingrese el nuevo quantum para el proceso:"),
    10
  );
  if (!isNaN(newQuantum) && newQuantum > 0) {
    queues[queueIndex][processIndex].quantum = newQuantum;
    renderQueues();
  } else {
    alert("Por favor, ingrese un número válido para el quantum.");
  }
}

//  iniciar el planificador en el modo manual
function startManualScheduler() {
  // Verificar que todas las configuraciones necesarias están completas
  if (!manualSetup()) {
    alert(
      "Por favor, complete la configuración antes de iniciar el planificador."
    );
    return;
  }

  document.getElementById("pauseButton").textContent =
    "Planificador en ejecución";

  // Iniciar el planificador
  runScheduler();
}

let currentIndex = 0; // Índice para rastrear la cola actual

function runScheduler() {
  if (currentIndex < queues.length && queues[currentIndex].length > 0) {
    let process = queues[currentIndex].shift();
    document.getElementById("currentProcess").textContent = `Ejecutando ${
      process.id
    } de la Cola ${currentIndex + 1}`;

    let timequantum = process.quantum *1000;
    setTimeout(() => {
      processCloning(process, currentIndex);
      currentIndex = (currentIndex + 1) % queues.length;
      runScheduler();
    }, timequantum);
  } else {
    currentIndex = (currentIndex + 1) % queues.length;
    if (queues.some((queue) => queue.length > 0)) {
      runScheduler();
    } else {
      document.getElementById("currentProcess").textContent =
        "No hay más procesos en ejecución.";
    }
  }
}

function processCloning(process, index) {
  let message = "";
  let isclone = process.id.endsWith('c');

  if (!isclone) {
    if (process.lives > 1) {
      process.lives--; // Reduce las vidas del proceso
      queues[index].push(process); // Reencola el proceso nativo al final de su cola
      message += `Proceso ${process.id} reencolado en cola ${index + 1}. `;

      // Manejo de clonación en la cola inferior
      if (index + 1 < queues.length) {
        handleCloning(process, index);
      }
    } else {
      // Eliminar el proceso nativo y todos los clones cuando las vidas llegan a 0
      message += `Proceso ${process.id} ha finalizado y junto con todos sus clones serán eliminados. `;
      removeAllInstances(process.id);
    }
  } else {
    if (index + 1 < queues.length) {
      queues[index + 1].push(process);
      message += `Clon ${process.id} reencolado en la cola ${index + 2}. `;
    } else {
      // Eliminar el clon cuando llega a la última cola
      message += `Clon ${process.id} eliminado al no haber más colas. `;
    }
  }
console.log(message);
    document.getElementById("currentProcess").textContent = message;
    setTimeout(renderQueues, 500); // Actualiza la visualización de las colas
  
}




function handleCloning(process, index) {
  let cloneId = `${process.id}c`;
  let cloneIndex = queues[index + 1].findIndex((p) => p.id === cloneId);

  if (cloneIndex > -1) {
    queues[index + 1][cloneIndex] = { ...process, id: cloneId }; // Reemplaza el clon existente
  } else {
    queues[index + 1].push({ ...process, id: cloneId }); // Encola un nuevo clon si no existe
  }
}

function removeAllInstances(processId) {
  // Elimina el proceso nativo y todos los clones de todas las colas
  queues = queues.map((queue) =>
    queue.filter((p) => !p.id.startsWith(processId))
  );
}

function renderQueues() {
  const queuesContainer = document.getElementById("queues");
  queuesContainer.innerHTML = "";
  queues.forEach((queue, queueIndex) => {
    let queueDiv = document.createElement("div");
    queueDiv.className = "queue";
    queueDiv.innerHTML = `<h3>Cola ${queueIndex + 1}</h3>`;
    queue.forEach((process, processIndex) => {
      let processDiv = document.createElement("div");
      processDiv.className = "process";
      processDiv.innerHTML = `${process.id} - Vidas: ${process.lives}, Quantum: ${process.quantum} <button onclick="adjustQuantum(${queueIndex}, ${processIndex})">Ajustar Quantum</button>`;
      queueDiv.appendChild(processDiv);
    });
    queuesContainer.appendChild(queueDiv);
  });
}
