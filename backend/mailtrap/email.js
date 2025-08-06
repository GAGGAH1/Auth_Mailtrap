const { mailtrapClient, sender} = require('./mailtrap');
const { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} = require('./emailTemplates');


const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
      const response = await mailtrapClient.send({
        from: sender,
        to: recipient,
        subject: 'Email Verification',
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        category: 'Email Verification'
      })
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error(`Error sending verification email: ${error}`);
        
    }
}

const sendWelcomeEmail = async (email, username) => {
    const recipient = [{ email }];
    try {
      const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "e65925d1-a9d1-4a40-ae7c-d92b37d593df",
			template_variables: {
				company_info_name: "Auth Company",
				username: username,
			},
		});

		console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.error(`Error sending welcome email`, error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
}

const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Reset your password',
            html:   PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: 'Password Reset'
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
}

const sendResetSuccessEmail = async (email) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Password Reset Successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: 'Password Reset Success'
        });

        console.log('Password reset success email sent successfully:', response);
    } catch (error) {
        console.error('Error sending password reset success email:', error);
        throw new Error(`Error sending password reset success email: ${error}`);
    }
}


module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail };