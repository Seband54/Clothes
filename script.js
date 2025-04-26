let modelo;
const clases = [
  "Camiseta/top", "Pantalón", "Suéter", "Vestido", "Abrigo",
  "Sandalia", "Camisa", "Zapatilla", "Bolso", "Botín"
];

// Cargar el modelo
(async () => {
  modelo = await tf.loadLayersModel('model.json');
  console.log('Modelo cargado');
})();

// Subir imagen
document.getElementById('file-input').addEventListener('change', (e) => {
  const archivo = e.target.files[0];
  if (archivo) {
    const img = document.getElementById('imagen');
    img.src = URL.createObjectURL(archivo);
    img.onload = () => {
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

// Capturar imagen desde cámara
document.getElementById('capturar-btn').addEventListener('click', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0, 28, 28);

  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = () => {
    predecirImagen(img);
  };
});

// Función para predecir una imagen
async function predecirImagen(imagen) {
  if (!modelo) {
    console.error("El modelo no está cargado aún.");
    return;
  }

  // Crear un canvas temporal
  let canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 28;
  let ctx = canvas.getContext('2d');

  // Dibujar la imagen y convertir a escala de grises
  ctx.drawImage(imagen, 0, 0, 28, 28);

  let imgData = ctx.getImageData(0, 0, 28, 28);
  let grayData = new Uint8ClampedArray(28 * 28);

  for (let i = 0; i < imgData.data.length; i += 4) {
    // Promedio de R, G y B para gris
    let avg = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
    grayData[i / 4] = avg;
  }

  // Crear tensor con dimensiones correctas (28, 28, 1) y normalizar
  let tensor = tf.tensor(grayData, [28, 28, 1])
    .toFloat()
    .div(255.0)
    .expandDims(0); // Añadir el batch size

  // Predecir
  try {
    const pred = await modelo.predict(tensor);
    const predArray = await pred.array();
    const idx = predArray[0].indexOf(Math.max(...predArray[0]));
    document.getElementById('resultado').innerText = `Predicción: ${clases[idx]}`;
  } catch (error) {
    console.error("Error al predecir:", error);
  }
}
