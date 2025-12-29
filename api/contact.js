import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    try {
        const { name, contact } = JSON.parse(req.body);

        // Envío de email profesional
        await resend.emails.send({
            from: 'DCVDEV <onboarding@resend.dev>', // Luego puedes configurar tu propio dominio
            to: ['ignacioreyeslima@gmail.com'], // <-- TU CORREO AQUÍ
            subject: '🚨 NUEVO LEAD DETECTADO: ' + name,
            html: `<strong>Nombre:</strong> ${name}<br><strong>Contacto:</strong> ${contact}`
        });

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}