import nodemailer from "nodemailer";

interface SendEmailProps {
    to: string;
    subject: string;
    html: string;
}

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html }: SendEmailProps) {
    try {
        const info = await transporter.sendMail({
            from: `"Minha Loja" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email enviado rapidamente: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Erro critico interno no Nodemailer:", error);
        return { success: false, error };
    }
}

export async function sendVerificationEmail(email: string, token: string) {
    // A URL que o cliente vai clicar no e-mail:
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/verify-email?token=${token}`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Verifique sua Conta</h1>
            </div>
            <div style="padding: 30px; background-color: #fafafa; color: #333;">
                <p style="font-size: 16px;">Olá,</p>
                <p style="font-size: 16px;">Obrigado por se cadastrar na nossa loja! Para liberar o seu acesso às compras, clique no botão abaixo para ativar a sua conta.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmLink}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Ativar Minha Conta Segura</a>
                </div>

                <p style="font-size: 14px; color: #888;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                <p style="font-size: 12px; color: #666; word-break: break-all;"><a href="${confirmLink}">${confirmLink}</a></p>
                
                <p style="font-size: 14px; color: #888; margin-top: 30px;">Este link de segurança expira automaticamente em 2 horas.</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "Ative sua nova conta 🎉",
        html: htmlContent,
    });
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Recuperação de Senha</h1>
            </div>
            <div style="padding: 30px; background-color: #fafafa; color: #333;">
                <p style="font-size: 16px;">Você solicitou a alteração de sua senha.</p>
                <p style="font-size: 16px;">Sua segurança é nossa prioridade. Para criar uma nova senha, por favor clique no botão seguro abaixo.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Redefinir Minha Senha</a>
                </div>

                <p style="font-size: 14px; color: #888;">Se você não solicitou essa alteração, nenhuma ação é necessária e sua senha continuará a mesma.</p>
                
                <p style="font-size: 14px; color: #888; margin-top: 30px;">Este link de segurança expira automaticamente em 1 hora.</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "Redefinição de Senha 🔒",
        html: htmlContent,
    });
}
