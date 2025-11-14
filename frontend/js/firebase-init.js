// Importa las funciones que necesitas del SDK (usando las URL de los módulos)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Tu configuración web de Firebase (la que has copiado)
const firebaseConfig = {
  apiKey: "AIzaSyDWsnabf45cwAMKdcctBv-0Nmka6cg39qU",
  authDomain: "controlflow-pro.firebaseapp.com",
  projectId: "controlflow-pro",
  storageBucket: "controlflow-pro.firebasestorage.app",
  messagingSenderId: "9591197476",
  appId: "1:9591197476:web:787c0644399b8f3a4f6db1",
  measurementId: "G-S4Z12RB0FN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar el servicio de autenticación para que otros módulos lo usen
// (Usamos getAuth para manejar el login y registro)
export const auth = getAuth(app);