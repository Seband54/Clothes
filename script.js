let modelo;
const clases = [
  "Camiseta/top", "Pantalón", "Suéter", "Vestido", "Abrigo",
  "Sandalia", "Camisa", "Zapatilla", "Bolso", "Botín"
];

// Cargar modelo al iniciar
(async () => {
  modelo = await tf.loadLayersModel('model.json');
  console.log('Modelo cargado');
})();

// Detectar cuando suben imagen
document.getElementById('file-input').addEventListener('change', (e) => {
  const archivo = e.target.files[0];
  if (archivo) {
    const img = document.getElementById('imagen');
    img.src = URL.createObjectURL(archivo);
    img.onload = async () => {
      predecirImagen(img);
    };
    img.style.display = "block";
  }
});

// Activar cámara
document.getElementById('camara-btn').addEventListener('click', () => {
  const video = document.getElementById('video');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.style.display = "block";
      document.getElementById('capturar-btn').style.display = "inline-block";
    })
    .catch(err => {
      console.error('Error accediendo a la cámara', err);
    });
});

// Capturar imagen de la cámara
document.getElementById('capturar-btn').addEventListener('click', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(video, 0, 0, 28, 28);
  
  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = async () => {
    predecirImagen(img);
  };
});

// Función principal para predecir
async function predecirImagen(img) {
  let tensor = tf.browser.fromPixels(img, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    .expandDims(0);

  const pred = modelo.predict(tensor);
  const idx = pred.argMax(1).dataSync()[0];

  document.getElementById('resultado').innerText = `Predicción: ${clases[idx]}`;
}
