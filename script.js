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
      await predecirImagen(img);
    };
    img.style.display = "block";
    document.getElementById('video').style.display = "none"; // Ocultar video si estaba activo
  }
});

// Activar cámara
document.getElementById('camara-btn').addEventListener('click', () => {
  const video = document.getElementById('video');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.style.display = "block";
      document.getElementById('imagen').style.display = "none"; // Ocultar imagen si había
      document.getElementById('capturar-btn').style.display = "inline-block";
    })
    .catch(err => {
      console.error('Error accediendo a la cámara', err);
    });
});

// Capturar imagen de la cámara
document.getElementById('capturar-btn').addEventListener('click', async () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  
  // Capturar de video a 200x200 (mayor calidad), luego reducimos
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = async () => {
    await predecirImagen(img);
  };
});

// Función principal para predecir
async function predecirImagen(imagen) {
  if (!modelo) {
    console.log('Modelo aún no cargado.');
    return;
  }

  // Redibujar en 28x28 internamente
  let tmpCanvas = document.createElement('canvas');
  let tmpCtx = tmpCanvas.getContext('2d');
  tmpCanvas.width = 28;
  tmpCanvas.height = 28;
  tmpCtx.drawImage(imagen, 0, 0, 28, 28);

  let imageData = tmpCtx.getImageData(0, 0, 28, 28);
  let tensor = tf.browser.fromPixels(imageData, 1) // Escala de grises
    .toFloat()
    .div(255.0)
    .expandDims(0);

  const pred = modelo.predict(tensor);
  const predArray = await pred.array();
  const idx = predArray[0].indexOf(Math.max(...predArray[0]));

  document.getElementById('resultado').innerText = `Predicción: ${clases[idx]}`;
}
