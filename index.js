class Proceso {
    constructor(id, tiempoEjecucion, prioridad) {
        this.id = id;
        this.tiempoEjecucion = tiempoEjecucion;
        this.tiempoRestante = tiempoEjecucion;
        this.prioridad = prioridad;
    }

    reducirTiempo(quantum) {
        this.tiempoRestante -= quantum;
        if (this.tiempoRestante < 0) {
            this.tiempoRestante = 0;
        }
    }

    incrementarPrioridad() {
        this.prioridad++;
    }
}

class PlanificadorPorEnvejecimiento {
    constructor(quantum, incrementoPrioridad) {
        this.quantum = quantum;
        this.incrementoPrioridad = incrementoPrioridad;
        this.procesos = [];
    }

    agregarProceso(proceso) {
        this.procesos.push(proceso);
    }

    ejecutar() {
        const interval = setInterval(() => {
            // Incrementar la prioridad de todos los procesos en espera
            this.procesos.forEach(proceso => proceso.incrementarPrioridad());

            // Ordenar los procesos por prioridad (descendente)
            this.procesos.sort((a, b) => b.prioridad - a.prioridad);

            // Obtener el proceso con mayor prioridad
            const proceso = this.procesos.shift();
            if (!proceso) {
                clearInterval(interval);
                return;
            }

            console.log(`Ejecutando proceso: ${proceso.id}`);
            proceso.reducirTiempo(this.quantum);

            if (proceso.tiempoRestante > 0) {
                this.procesos.push(proceso);
            } else {
                console.log(`Proceso ${proceso.id} completado.`);
            }

            this.actualizarVista();
        }, 1000);
    }

    actualizarVista() {
        const processList = document.getElementById('process-list');
        processList.innerHTML = '';
        this.procesos.forEach(proceso => {
            const processDiv = document.createElement('div');
            processDiv.className = 'process';
            processDiv.textContent = `Proceso ID: ${proceso.id}, Tiempo Restante: ${proceso.tiempoRestante}, Prioridad: ${proceso.prioridad}`;
            processList.appendChild(processDiv);
        });
    }
}

const planificador = new PlanificadorPorEnvejecimiento(4, 1);

planificador.agregarProceso(new Proceso(1, 10, 1));
planificador.agregarProceso(new Proceso(2, 4, 2));
planificador.agregarProceso(new Proceso(3, 7, 1));

function startScheduling() {
    planificador.ejecutar();
    planificador.actualizarVista();
}
