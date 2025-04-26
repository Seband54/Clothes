let modelo;
const clases = [
  "Camiseta/top", "Pantalón", "Suéter", "Vestido", "Abrigo",
  "Sandalia", "Camisa", "Zapatilla", "Bolso", "Botín"
];

// Cargar el modelo
(async () => {
  modelo = await tf.loadLayersModel('tfjs_target_dir/model.json');  // Asegúrate de que el modelo esté en la ruta correcta
  console.log('Modelo cargado');
})();

// Subir imagen
document.getElementById('file-input').addEventListener('change', (e) => {
  const archivo = e.target.files[0];
  if (archivo) {
    const img = document.getElementById('imagen');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = async () => {
        const imagenTensor = tf.browser.fromPixels(img).resizeNearestNeighbor([28, 28]).toFloat().expandDims(0).mean(2);
        const predicciones = await modelo.predict(imagenTensor);
        const prediccion = predicciones.argMax(-1).dataSync()[0];
        document.getElementById('resultado').innerText = `Predicción: ${clases[prediccion]}`;
      };
    };
    reader.readAsDataURL(archivo);
  }
});

// Usar la cámara
document.getElementById('camara-btn').addEventListener('click', async () => {
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  document.getElementById('capturar-btn').style.display = 'block';
});

// Capturar imagen desde la cámara
document.getElementById('capturar-btn').addEventListener('click', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, 28, 28);
  const imagenTensor = tf.browser.fromPixels(canvas).toFloat().expandDims(0).mean(2);  // Convertir a escala de grises
  modelo.predict(imagenTensor).then(predicciones => {
    const prediccion = predicciones.argMax(-1).dataSync()[0];
    document.getElementById('resultado').innerText = `Predicción: ${clases[prediccion]}`;
  });
});
