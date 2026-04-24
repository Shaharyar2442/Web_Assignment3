import { Resend } from "resend";

// Resend initialization
const resend = new Resend(process.env.RESEND_API_KEY);
// We use a dummy testing email since Resend free tier only allows sending to the verified domain's email
// In a real production scenario, this would be the agent's or admin's email.
// Alternatively, since you are testing, it's safer to use a placeholder from address if the domain isn't verified.
const fromEmail = "onboarding@resend.dev"; 

export const sendNewLeadEmail = async (adminEmail, lead) => {
  if (!process.env.RESEND_API_KEY) return;
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail, // In development, Resend only allows sending to the email registered with your account
      subject: `New Lead Created: ${lead.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Lead Alert!</h2>
          <p>A new lead has been captured on the CRM platform.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Phone:</strong> +${lead.phone}</p>
            <p><strong>Property Interest:</strong> ${lead.propertyInterest}</p>
            <p><strong>Budget:</strong> Rs. ${lead.budget.toLocaleString()}</p>
            <p><strong>Priority Score:</strong> <span style="color: red;">${lead.score}</span></p>
          </div>
          <p>Please review and assign this lead to an agent via the dashboard.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending new lead email:", error);
  }
};

export const sendLeadAssignmentEmail = async (agentEmail, agentName, lead) => {
  if (!process.env.RESEND_API_KEY) return;
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: agentEmail, // Ensure the agentEmail is the one verified on Resend during testing
      subject: `New Lead Assigned to You: ${lead.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello ${agentName},</h2>
          <p>A new lead has been assigned to you by the Admin.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px;">
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Phone:</strong> +${lead.phone}</p>
            <p><strong>Property Interest:</strong> ${lead.propertyInterest}</p>
          </div>
          <p>Please log in to your dashboard to view the full details and contact the client.</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard/leads" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending assignment email:", error);
  }
};
