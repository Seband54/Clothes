let modelo = null;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let resultado = document.getElementById("resultado");
let grosorInput = document.getElementById("grosor");

// Configurar grosor inicial
ctx.lineWidth = grosorInput.value;
ctx.lineCap = "round"; // Para que el trazo sea más suave

// Actualizar grosor al mover la barra
grosorInput.addEventListener("input", function () {
    ctx.lineWidth = this.value;
});

// Cargar el modelo preentrenado
(async () => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel('model.json');
    modelo.build([null, 28, 28, 1]);
    console.log("Modelo cargado.");
})();

// Función para limpiar el canvas
function limpiarCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resultado.innerHTML = '';
}

// Función para dibujar en el canvas
let dibujando = false;

canvas.addEventListener("mousedown", function (e) {
    dibujando = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", function (e) {
    if (dibujando) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener("mouseup", function () {
    dibujando = false;
});

canvas.addEventListener("touchstart", function (e) {
    e.preventDefault(); // Evitar scroll al tocar
    dibujando = true;
    let rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (dibujando) {
        let rect = canvas.getBoundingClientRect();
        let touch = e.touches[0];
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    }
});

canvas.addEventListener("touchend", function (e) {
    dibujando = false;
});

// Función para predecir la prenda
async function predecir() {
    if (modelo !== null) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let tensor = tf.browser.fromPixels(imageData).mean(2).toFloat().expandDims(0).expandDims(-1);
        tensor = tensor.div(255.0);

        let prediccion = await modelo.predict(tensor).data();
        let clase = prediccion.indexOf(Math.max(...prediccion));

        resultado.innerHTML = `Predicción: ${clase}`;
    } else {
        resultado.innerHTML = "Cargando el modelo, intenta de nuevo...";
    }
}

