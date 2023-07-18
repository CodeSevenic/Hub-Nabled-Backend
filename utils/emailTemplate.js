const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }

        .email-body {
            color: #666;
            font-size: 16px;
            margin-top: 20px;
        }

        .email-footer {
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            Welcome to Our Service
        </div>
        <div class="email-body">
            Dear User,<br><br>
            We're excited to have you onboard. Our team is always here to support you. If you have any questions, please do not hesitate to reach out.<br><br>
            Best,<br>
            The Team
        </div>
        <div class="email-footer">
            You're receiving this email because you have an account with Our Service. If you did not request this email, please let us know.
        </div>
    </div>
</body>
</html>
`;

module.exports = {
  welcomeHtml,
};
