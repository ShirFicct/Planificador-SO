function startScheduler(mode) {
    document.getElementById('queues').innerHTML = '';
    document.getElementById('currentProcess').textContent = 'Ningún proceso en ejecución';

    let numQueues = mode === 1 ? 3 : parseInt(prompt("Ingrese el número de colas (hasta 8):"), 10);
    let numProcesses = mode === 1 ? 2 : parseInt(prompt("Ingrese el número de procesos por cola (hasta 8):"), 10);
    let queueNames = mode === 1 ? ['V', 'M', 'J'] : prompt("Ingrese nombres de colas separados por comas").split(',');

    if (numQueues > 0 && numProcesses > 0 && queueNames.length === numQueues) {
        initQueues(queueNames, numProcesses, mode);
        renderQueues();
        runScheduler();
    } else {
        alert("Número de colas, procesos o nombres no válido");
    }
}

function initQueues(queueNames, numProcesses, mode) {
    let initialQuantum = mode === 2 ? parseInt(prompt("Ingrese los quantum iniciales para todos los procesos:"), 10) : 2;
    queues = queueNames.map((name) => {
        return Array.from({length: numProcesses}, (_, j) => ({
            id: `${name}${j + 1}`,
            lives: 3,
            quantum: initialQuantum
        }));
    });
}

function adjustQuantum(queueIndex, processIndex) {
    let newQuantum = parseInt(prompt("Ingrese el nuevo quantum para el proceso:"), 10);
    if (!isNaN(newQuantum) && newQuantum > 0) {
        queues[queueIndex][processIndex].quantum = newQuantum;
        renderQueues();
    } else {
        alert("Por favor, ingrese un número válido para el quantum.");
    }
}

let isPaused = false;  // Estado inicial no pausado

function togglePause() {
    isPaused = !isPaused;  // Cambia el estado de pausa
    document.getElementById('pauseButton').textContent = isPaused ? "Continuar" : "Pausar";  // Actualiza el texto del botón
    if (!isPaused) {
        runScheduler();  // Si se está continuando, reinicia el planificador
    }
}

let currentIndex = 0;  // Índice para rastrear la cola actual en la ejecución secuencial

function runScheduler() {
    if (isPaused) return;  // No hacer nada si el planificador está pausado

    if (currentIndex < queues.length && queues[currentIndex].length > 0) {
        let process = queues[currentIndex].shift();
        document.getElementById('currentProcess').textContent = `Ejecutando ${process.id} de la Cola ${currentIndex + 1}`;
        setTimeout(() => {
            if (isPaused) return;  // Verificar de nuevo si está pausado antes de continuar
            processCloning(process, currentIndex);
            currentIndex = (currentIndex + 1) % queues.length;
            runScheduler();
        }, 5000);
    } else {
        currentIndex = (currentIndex + 1) % queues.length;
        if (queues.some(queue => queue.length > 0)) {
            runScheduler();
        } else {
            document.getElementById('currentProcess').textContent = "No hay más procesos en ejecución.";
        }
    }
}



function processCloning(process, index) {
    let message = "";
    if (process.lives > 1) {
        process.lives--;
        queues[index].push(process); // Reencola el proceso nativo
        message += `Proceso ${process.id} reencolado en cola ${index + 1}. `;

        if (index + 1 < queues.length) {
            let clone = {...process, id: `${process.id}c`}; // Crea un clon
            queues[index + 1].push(clone); // Encola el clon en la cola siguiente
            message += `Clon ${clone.id} insertado en cola ${index + 2}.`;
        }
    } else {
        message += `Proceso ${process.id} ha finalizado y no será reencolado.`;
    }
    
    document.getElementById('currentProcess').textContent = message;
    setTimeout(renderQueues, 10000); // Actualizar visualización de las colas
}


function renderQueues() {
    const queuesContainer = document.getElementById('queues');
    queuesContainer.innerHTML = '';
    queues.forEach((queue, queueIndex) => {
        let queueDiv = document.createElement('div');
        queueDiv.className = 'queue';
        queueDiv.innerHTML = `<h3>Cola ${queueIndex + 1}</h3>`;
        queue.forEach((process, processIndex) => {
            let processDiv = document.createElement('div');
            processDiv.className = 'process';
            processDiv.innerHTML = `${process.id} - Vidas: ${process.lives}, Quantum: ${process.quantum} <button onclick="adjustQuantum(${queueIndex}, ${processIndex})">Ajustar Quantum</button>`;
            queueDiv.appendChild(processDiv);
        });
        queuesContainer.appendChild(queueDiv);
    });
}


