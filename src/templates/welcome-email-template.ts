const createEmailTemplate = (userName:string, confirmationUrl:string, serviceName =process.env.SERVICE_NAME ) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    margin: 0 auto;
                    width: 600px;
                    padding: 20px;
                    text-align: center;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin: 20px 0;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to ${serviceName}!</h1>
                <p>Thank you for signing up, ${userName}. Please confirm your email address to get started.</p>
                <a href="${confirmationUrl}" class="button">Confirm Email</a>
                <p>If you didn't sign up for ${serviceName}, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;
};

export default createEmailTemplate;