function startScheduler(mode) {
  document.getElementById("queues").innerHTML = "";
  document.getElementById("currentProcess").textContent =
    "Ningún proceso en ejecución";

  if (mode === 1) {
    // Modo automático
    const queueNames = ["V", "M", "J"]; // Nombres predefinidos para las colas
    const numColas = 3;
    const processCounts = [2, 2, 2]; // Asumiendo 2 procesos por cola para simplificar
    const processQuantums = [2, 2, 2];// Quantums iniciales fijos para todos los procesos
    const quantumPerQueue = [2, 2, 2]; // Cantidad de procesos por cola que se ejecutarán antes de cambiar

    // Aquí, se pasa el nuevo parámetro quantumPerQueue a initQueues
    initQueues(numColas, processCounts, processQuantums, quantumPerQueue, queueNames);
  }

  renderQueues();
  runScheduler();
}


function generateProcessInputs() {
  const numColas = parseInt(document.getElementById("numColas").value);
  const queueContainer = document.getElementById("queueNameInputs");
  const processContainer = document.getElementById("processInputs");
  const quantumContainer = document.getElementById("quantumInputs");
  const processQuantumContainer = document.getElementById("processQuantumContainer");

  queueContainer.innerHTML = "";  // Limpiar cualquier entrada previa
  processContainer.innerHTML = "";
  quantumContainer.innerHTML = "";
  processQuantumContainer.innerHTML = "";

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
    const processInput = document.createElement("input");
    processInput.type = "number";
    processInput.id = `cola${i + 1}`;
    processInput.name = `cola${i + 1}`;
    processInput.min = "1";
    processInput.max = "8";
    processInput.required = true;
    processInput.placeholder = `Procesos en Cola ${i + 1}`;
    processContainer.appendChild(processInput);
    processContainer.appendChild(document.createElement("br"));

    // Crear entrada para el quantum por cola
    const quantumInput = document.createElement("input");
    quantumInput.type = "number";
    quantumInput.id = `quantumPerQueue${i + 1}`;
    quantumInput.name = `quantumPerQueue${i + 1}`;
    quantumInput.min = "1";
    quantumInput.required = true;
    quantumInput.placeholder = `Quantum por Cola ${i + 1}`;
    quantumContainer.appendChild(quantumInput);
    quantumContainer.appendChild(document.createElement("br"));

    // Crear entrada para el quantum de tiempo por proceso
    const processQuantumInput = document.createElement("input");
    processQuantumInput.type = "number";
    processQuantumInput.id = `processQuantum${i + 1}`;
    processQuantumInput.name = `processQuantum${i + 1}`;
    processQuantumInput.min = "1";
    processQuantumInput.required = true;
    processQuantumInput.placeholder = `Quantum de Tiempo para procesos en Cola ${i + 1}`;
    processQuantumContainer.appendChild(processQuantumInput);
    processQuantumContainer.appendChild(document.createElement("br"));
  }
}



function manualSetup() {
  const numColas = parseInt(document.getElementById("numColas").value);
  const processCounts = [];
  const queueNames = [];
  const quantumPerQueue = [];
  const processQuantums = []; // Aquí almacenaremos los quantums de tiempo para cada cola

  for (let i = 0; i < numColas; i++) {
    processCounts.push(parseInt(document.getElementById(`cola${i + 1}`).value));
    queueNames.push(document.getElementById(`queueName${i + 1}`).value.trim());
    quantumPerQueue.push(parseInt(document.getElementById(`quantumPerQueue${i + 1}`).value));
    processQuantums.push(parseInt(document.getElementById(`processQuantum${i + 1}`).value)); // Recolectamos el quantum de tiempo para cada cola
  }

  if (
    numColas > 0 &&
    !processCounts.some(isNaN) &&
    queueNames.every(name => name !== "") &&
    !quantumPerQueue.some(isNaN) &&
    !processQuantums.some(isNaN) // Asegurarnos de que todos los quantums de tiempo sean válidos
  ) {
    initQueues(numColas, processCounts, processQuantums, quantumPerQueue, queueNames);
    renderQueues();
    return true; // Devuelve true indicando que todo está correctamente configurado
  } else {
    alert("Por favor, asegúrese de llenar todos los campos correctamente.");
    return false; // Devuelve false si la configuración no es válida
  }
}



function initQueues(numColas, processCounts, processQuantums, quantumPerQueue, queueNames) {
  queues = [];
  for (let i = 0; i < numColas; i++) {
    let queue = [];
    for (let j = 0; j < processCounts[i]; j++) {
      queue.push({
        id: `${queueNames[i]}${j + 1}`,
        lives: 3,
        quantum: processQuantums[i], // Quantum de tiempo para cada proceso
      });
    }
    queues.push({
      processes: queue,
      quantumCount: quantumPerQueue[i], // Quantum de procesos por cola
      currentCount: 0
    });
  }
  currentIndex = 0;
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
  if (currentIndex < queues.length && queues[currentIndex].processes.length > 0) {
    if (queues[currentIndex].currentCount < queues[currentIndex].quantumCount) {
      let process = queues[currentIndex].processes.shift();
      document.getElementById("currentProcess").textContent = `Ejecutando ${process.id} de la Cola ${currentIndex + 1}`;

      setTimeout(() => {
        processCloning(process, currentIndex);
        queues[currentIndex].currentCount++;
        runScheduler();
      }, process.quantum * 1000);  // Tiempo de ejecución basado en el quantum del proceso
    } else {
      queues[currentIndex].currentCount = 0; // Reiniciar el contador para la próxima ronda
      currentIndex = (currentIndex + 1) % queues.length;
      runScheduler();
    }
  } else {
    currentIndex = (currentIndex + 1) % queues.length;
    if (queues.some(queue => queue.processes.length > 0)) {
      runScheduler();
    } else {
      document.getElementById("currentProcess").textContent = "No hay más procesos en ejecución.";
    }
  }
}


function processCloning(process, index) {
  let message = "";
  let isclone = process.id.endsWith('c');

  if (!isclone) {
      if (process.lives > 1) {
          process.lives--;  // Reduce las vidas del proceso
          queues[index].processes.push(process);  // Reencola el proceso nativo al final de su cola
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
          queues[index + 1].processes.push(process);
          message += `Clon ${process.id} reencolado en la cola ${index + 2}. `;
      } else {
          // Eliminar el clon cuando llega a la última cola
          message += `Clon ${process.id} eliminado al no haber más colas. `;
      }
  }
  document.getElementById("currentProcess").textContent = message;
  setTimeout(renderQueues, 500);  // Actualiza la visualización de las colas
}





function handleCloning(process, index) {
  let cloneId = `${process.id}c`;
  let cloneIndex = queues[index + 1].processes.findIndex(p => p.id === cloneId);

  if (cloneIndex > -1) {
      queues[index + 1].processes[cloneIndex] = {...process, id: cloneId};  // Reemplaza el clon existente
  } else {
      queues[index + 1].processes.push({...process, id: cloneId});  // Encola un nuevo clon si no existe
  }
}

function removeAllInstances(processId) {
  // Recorre cada cola y filtra los procesos que no comiencen con el processId
  queues.forEach(queue => {
      queue.processes = queue.processes.filter(p => !p.id.startsWith(processId));
  });
}



function renderQueues() {
  const queuesContainer = document.getElementById("queues");
  queuesContainer.innerHTML = "";
  queues.forEach((queueObject, queueIndex) => {
      let queueDiv = document.createElement("div");
      queueDiv.className = "queue";
      queueDiv.innerHTML = `<h3>Cola ${queueIndex + 1} - Quantum por Cola: ${queueObject.quantumCount}, Procesos Ejecutados: ${queueObject.currentCount}</h3>`;
      queueObject.processes.forEach((process, processIndex) => {
          let processDiv = document.createElement("div");
          processDiv.className = "process";
          processDiv.innerHTML = `${process.id} - Vidas: ${process.lives}, Quantum de Tiempo: ${process.quantum} segundos <button onclick="adjustQuantum(${queueIndex}, ${processIndex})">Ajustar Quantum</button>`;
          queueDiv.appendChild(processDiv);
      });
      queuesContainer.appendChild(queueDiv);
  });
}

