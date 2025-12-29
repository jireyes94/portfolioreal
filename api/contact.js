// Usaremos 'resend' o 'nodemailer' para el envío. 
// Para este ejemplo usamos un webhook o fetch hacia un servicio de mail.
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, contact } = JSON.parse(req.body);

    // AQUÍ VA TU LÓGICA DE BACKEND:
    // 1. Podrías enviarte un mail usando la API de Resend.com (muy profesional)
    // 2. O guardar en una base de datos de Supabase.
    
    console.log(`Nuevo Lead: ${name} - Contacto: ${contact}`);

    // Respuesta al frontend
    return res.status(200).json({ 
        status: 'success', 
        message: 'Protocolo registrado en el servidor central.' 
    });
}