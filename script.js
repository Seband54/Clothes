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

async function predecirImagen(imagen) {
    // Crear un canvas para adaptar la imagen
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 28;
    canvas.height = 28;
    
    // Dibujar la imagen en el tamaño correcto
    ctx.drawImage(imagen, 0, 0, 28, 28);
    
    // Obtener los pixeles en escala de grises
    let imageData = ctx.getImageData(0, 0, 28, 28);
    let data = tf.browser.fromPixels(imageData, 1);
    
    // Normalizar
    data = data.toFloat().div(tf.scalar(255.0)).expandDims(0);
    
    // Predecir
    const prediccion = modelo.predict(data);
    const prediccionArray = await prediccion.array();
    
    const indice = prediccionArray[0].indexOf(Math.max(...prediccionArray[0]));

    const nombresClases = [
      "T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
      "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"
    ];

    // Mostrar el resultado
    document.getElementById('resultado').innerText = "Predicción: " + nombresClases[indice];
}
