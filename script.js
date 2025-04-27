let modelo = null;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let resultado = document.getElementById("resultado");
let grosorInput = document.getElementById("grosor");

ctx.lineWidth = grosorInput.value;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

grosorInput.addEventListener("input", () => {
    ctx.lineWidth = grosorInput.value;
});

(async () => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel('model.json');
    modelo.build([null, 28, 28, 1]);
})();

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

function limpiarCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resultado.innerHTML = '';
}

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


