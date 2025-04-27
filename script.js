let modelo = null;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let resultado = document.getElementById("resultado");

// Cargar el modelo preentrenado
(async () => {
    console.log("Cargando modelo...");
    const model = await tf.loadLayersModel('model.json');
    model.build([null, 28, 28, 1]); 
})();

// Función para limpiar el canvas
function limpiarCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resultado.innerHTML = '';
}

// Función para dibujar en el canvas
canvas.addEventListener("mousedown", function (e) {
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    canvas.addEventListener("mousemove", dibujar);
});
canvas.addEventListener("mouseup", function () {
    canvas.removeEventListener("mousemove", dibujar);
});
function dibujar(e) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

// Función para predecir la prenda
async function predecir() {
    if (modelo !== null) {
        // Preprocesar el canvas para que sea adecuado para el modelo
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let tensor = tf.browser.fromPixels(imageData).mean(2).toFloat().expandDims(0).expandDims(-1);
        tensor = tensor.div(255.0); // Normaliza los valores de los píxeles

        // Realizar la predicción
        let prediccion = await modelo.predict(tensor).data();
        let clase = prediccion.indexOf(Math.max(...prediccion));

        // Mostrar el resultado
        resultado.innerHTML = `Predicción: ${clase}`;
    } else {
        resultado.innerHTML = "Cargando el modelo, intenta de nuevo...";
    }
}

