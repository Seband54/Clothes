let modelo;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let dibujando = false;

// Inicializar fondo blanco
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Eventos para dibujar
canvas.addEventListener('mousedown', () => dibujando = true);
canvas.addEventListener('mouseup', () => dibujando = false);
canvas.addEventListener('mouseout', () => dibujando = false);
canvas.addEventListener('mousemove', dibujar);

function dibujar(evento) {
    if (!dibujando) return;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(evento.offsetX, evento.offsetY, 8, 0, Math.PI * 2);
    ctx.fill();
}

function limpiarCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('resultado').innerText = '';
}

async function cargarModelo() {
    modelo = await tf.loadLayersModel('model.json');
    console.log("Modelo cargado");
}

async function predecir() {
    if (!modelo) {
        alert("El modelo aún no está cargado.");
        return;
    }

    // Procesar la imagen del canvas
    let img = tf.browser.fromPixels(canvas, 1); // 1 canal (gris)
    img = tf.image.resizeBilinear(img, [28, 28]);
    img = tf.cast(img, 'float32').div(255.0);
    img = img.expandDims(0); // (1, 28, 28, 1)

    const prediccion = modelo.predict(img);
    const predArray = await prediccion.array();
    const indice = predArray[0].indexOf(Math.max(...predArray[0]));
    
    const nombres_clases = [
        "Camiseta/Top", "Pantalón", "Suéter", "Vestido", "Abrigo",
        "Sandalia", "Camisa", "Zapatilla", "Bolso", "Botín"
    ];

    document.getElementById('resultado').innerText = 
        `Predicción: ${nombres_clases[indice]}`;

    img.dispose();
    prediccion.dispose();
}

// Cargar modelo al abrir la página
cargarModelo();

