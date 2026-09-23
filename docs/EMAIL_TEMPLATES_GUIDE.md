# 🇳🇵 Navigo Nepal — Official Email Templates & Sending Guide

This document provides a comprehensive guide for using, customizing, and sending the official email templates for **Navigo Nepal** (`Where Conventionality Ends and Practicality Starts`).

---

## 🎨 Visual Identity & Logo Standards

All templates feature the official **Navigo Nepal** logo (`png_new_logo.png`) hosted on CDN / official server, ensuring it renders across all web and mobile email clients:

| Element | Specification | Value / URL |
| :--- | :--- | :--- |
| **Hosted Logo Image** | Transparent HD PNG | `https://navigonepal.org/assets/png_new_logo.png` |
| **Local Fallback** | Repository relative asset | `assets/png_new_logo.png` |
| **Primary Header & Footer** | Primary Dark Navy | `#0A2342` / `#06172F` |
| **Primary Accent Color** | Elite Blue | `#2563EB` |
| **Secondary Accent** | Luxury Blue | `#4F9CF9` |
| **Success / Action Accent** | Emerald Green | `#10B981` |
| **4-Color Brand Bar** | Multi-Accent Gradient | `linear-gradient(90deg, #2563EB, #10B981, #F4A261, #E63946)` |
| **Background Tint** | Soft Sky / Luxury BG | `#F8FBFF` |
| **Width Container** | Standard Email Width | `600px` (Fully responsive on mobile) |

---

## 🖥️ Interactive Studio App

An interactive web application is available for real-time template editing, live device preview, variable injection, and 1-click HTML code copying.

*   **Studio File**: [`email-templates.html`](file:///d:/navigonepal/email-templates.html)
*   **Features**:
    *   🖼️ Embedded Navigo Nepal Logo header preview.
    *   ⚡ Live desktop (`650px`) & mobile (`375px`) view toggles.
    *   🎛️ Dynamic form fields for live variable substitution (`{{Recipient_Name}}`, `{{Event_Date}}`, etc.).
    *   📋 1-Click **Copy HTML Code** and **Copy Plain Text**.

---

## 📩 How to Send These HTML Emails

Depending on your workflow (sending a quick personal email vs sending mass newsletters vs automated form responses), follow one of the 4 methods below:

### Method 1: Sending via Free Email Platforms (Mailchimp, Brevo, MailerLite)
*Best for: Sending mass newsletters, event announcements, or donor updates to hundreds of subscribers.*

1.  Sign up or log in to **Mailchimp** (free up to 500 contacts) or **Brevo** (free 300 emails/day).
2.  Go to **Campaigns** ➔ **Create Email Campaign**.
3.  In the email builder, select **Paste in HTML Code** or **Import HTML**.
4.  Open [`email-templates.html`](file:///d:/navigonepal/email-templates.html), choose your template, customize your variables, and click **Copy HTML Code**.
5.  Paste the HTML into Mailchimp/Brevo and send a test email to yourself!

---

### Method 2: Sending directly from Gmail or Outlook (No Code Required)
*Best for: Sending 1-on-1 official emails, welcome letters, or single certificate releases.*

#### Approach A: Direct Rich Text Copy-Paste (Easiest)
1. Open [`email-templates.html`](file:///d:/navigonepal/email-templates.html) in your browser.
2. Select your desired template and customize your recipient details in the left sidebar.
3. In the **Visual Preview** canvas, highlight the rendered email using your mouse (or click inside the preview iframe and press `Ctrl+A`).
4. Press `Ctrl+C` to copy the rendered visual layout.
5. Open **Gmail** ➔ Click **Compose**.
6. Press `Ctrl+V` to paste directly into the Gmail compose body. The logo, styled buttons, colors, and layout will paste as rich text!

#### Approach B: Gmail Free Chrome Extension ("HTML Inserter for Gmail")
1. Install a free Chrome extension like **"HTML Inserter for Gmail"** or **"Email on Acid HTML Inserter"**.
2. Click **Compose** in Gmail.
3. Click the new `HTML` icon in your Gmail toolbar, paste the raw HTML code copied from `email-templates.html`, and click **Insert**.

---

### Method 3: Automated Form Responses (Formspree / Resend / EmailJS)
*Best for: Automatically emailing students or volunteers when they fill out forms on `volunteer.html` or `join.html`.*

1. In your **Formspree** or **EmailJS** dashboard, navigate to **Form Settings** ➔ **Autoresponder Settings**.
2. Select **Custom HTML Email**.
3. Paste the HTML template (e.g. [`1-welcome-onboarding.html`](file:///d:/navigonepal/templates/email/1-welcome-onboarding.html)).
4. Map Formspree template tags like `{{name}}` and `{{district}}` to match your form field names.

---

### Method 4: Automated Code Sending (Node.js / Python)
*Best for: Custom backend integration, automated server scripts, or automated batch email dispatch.*

#### Node.js (Nodemailer)
```javascript
const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'navigonepal@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
  }
});

let template = fs.readFileSync('./templates/email/1-welcome-onboarding.html', 'utf8');

// Replace dynamic variables
template = template
  .replace(/{{Recipient_Name}}/g, 'Aarav Sharma')
  .replace(/{{Role_Title}}/g, 'District Ambassador')
  .replace(/{{District_Name}}/g, 'Kathmandu')
  .replace(/{{Portal_Link}}/g, 'https://navigonepal.org/join.html');

transporter.sendMail({
  from: '"Navigo Nepal" <navigonepal@gmail.com>',
  to: 'student@example.com',
  subject: 'Welcome to Navigo Nepal! 🇳🇵 Empowering your future journey',
  html: template
});
```

#### Python (`smtplib`)
```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

with open('templates/email/2-workshop-event-invitation.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

html_content = html_content.replace('{{Recipient_Name}}', 'Sujata Adhikari') \
                           .replace('{{Event_Title}}', "What's Next? Career Guidance Summit") \
                           .replace('{{Event_Date}}', 'August 25, 2026') \
                           .replace('{{Event_Time}}', '11:00 AM NPT') \
                           .replace('{{Venue_Location}}', 'Kathmandu Model College') \
                           .replace('{{RSVP_Link}}', 'https://navigonepal.org/programs.html')

msg = MIMEMultipart('alternative')
msg['Subject'] = "Invitation: Join the Navigo Nepal Career Guidance Summit 🚀"
msg['From'] = "navigonepal@gmail.com"
msg['To'] = "sujata@example.com"
msg.attach(MIMEText(html_content, 'html'))

server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
server.login('navigonepal@gmail.com', 'your-app-password')
server.sendmail('navigonepal@gmail.com', 'sujata@example.com', msg.as_string())
server.quit()
```

---

## 📦 Saved Standalone Template Files

*   **1. Welcome & Onboarding**: [`templates/email/1-welcome-onboarding.html`](file:///d:/navigonepal/templates/email/1-welcome-onboarding.html)
*   **2. Event Invitation**: [`templates/email/2-workshop-event-invitation.html`](file:///d:/navigonepal/templates/email/2-workshop-event-invitation.html)
*   **3. Certificate Recognition**: [`templates/email/3-certificate-recognition.html`](file:///d:/navigonepal/templates/email/3-certificate-recognition.html)
*   **4. Donation Receipt**: [`templates/email/4-donation-partner-receipt.html`](file:///d:/navigonepal/templates/email/4-donation-partner-receipt.html)
*   **5. Impact Newsletter**: [`templates/email/5-impact-newsletter.html`](file:///d:/navigonepal/templates/email/5-impact-newsletter.html)
