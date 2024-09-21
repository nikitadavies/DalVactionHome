import { SNSClient, PublishCommand, SubscribeCommand, SetSubscriptionAttributesCommand, ListSubscriptionsByTopicCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: 'us-east-1' }); // Replace 'us-east-1' with your actual region

const topicArn = 'arn:aws:sns:us-east-1:139157793567:UserCreatedTopic'; // Replace with your actual SNS Topic ARN

export const handler = async (event) => {
    const { Records } = event;

    for (const record of Records) {
        const { email } = JSON.parse(record.body);

        try {
            // List current subscriptions
            const listSubscriptionsParams = {
                TopicArn: topicArn
            };
            const listSubscriptionsCommand = new ListSubscriptionsByTopicCommand(listSubscriptionsParams);
            const listSubscriptionsResponse = await snsClient.send(listSubscriptionsCommand);

            // Check if email is already subscribed
            const subscription = listSubscriptionsResponse.Subscriptions.find(subscription => subscription.Endpoint === email);

            if (!subscription) {
                // Subscribe the email address to the SNS topic
                const subscribeParams = {
                    Protocol: 'email',
                    TopicArn: topicArn,
                    Endpoint: email
                };

                const subscribeCommand = new SubscribeCommand(subscribeParams);
                const subscribeResponse = await snsClient.send(subscribeCommand);
                const subscriptionArn = subscribeResponse.SubscriptionArn;

                if (!subscriptionArn) {
                    console.error('Failed to retrieve SubscriptionArn from the response. The subscription might still be pending confirmation.');
                    continue;
                }

                console.log('Subscription ARN:', subscriptionArn);
                console.log(`Subscription confirmation needed for email: ${email}`);
            } else {
                if (subscription.SubscriptionArn === "PendingConfirmation") {
                    console.log(`Subscription is pending confirmation for email: ${email}`);
                    continue;
                } else {
                    console.log(`Email ${email} is already subscribed with ARN: ${subscription.SubscriptionArn}`);

                    // Set the filter policy to include only this email and exclude others
                    const filterPolicy = {
                        email: [email]
                    };

                    const setAttributesParams = {
                        SubscriptionArn: subscription.SubscriptionArn,
                        AttributeName: 'FilterPolicy',
                        AttributeValue: JSON.stringify(filterPolicy)
                    };

                    const setAttributesCommand = new SetSubscriptionAttributesCommand(setAttributesParams);
                    await snsClient.send(setAttributesCommand);
                    console.log(`Filter policy updated to include only ${email}`);

                    // Plain text email body
                    const emailBody = `
Welcome to DALVacationHome!

Dear Valued Guest,

We're thrilled to welcome you to DALVacationHome! Thank you for joining our community.

To help you get started, here are some essential links:
- Your Profile: https://www.dalvacationhome.com/profile
- Make a Reservation: https://www.dalvacationhome.com/reservations
- Customer Support: https://www.dalvacationhome.com/support

At DALVacationHome, we're dedicated to providing you with the best vacation experience. Explore our website to discover amazing vacation homes, exclusive deals, and more!

If you need any assistance, don't hesitate to contact us. Our team is always here to help.

Happy vacationing!

Best Regards,
The DALVacationHome Team

You received this email because you registered on DALVacationHome. If you didn't register, please ignore this email.
                    `;

                    // Send plain text content
                    const publishParams = {
                        Message: JSON.stringify({
                            default: 'This is a default message in case specific protocols are not available.',
                            email: emailBody,
                        }),
                        Subject: 'Welcome to DALVacationHome',
                        TopicArn: topicArn,
                        MessageStructure: 'json',
                        MessageAttributes: {
                            'email': {
                                DataType: 'String',
                                StringValue: email
                            }
                        }
                    };

                    const publishCommand = new PublishCommand(publishParams);
                    await snsClient.send(publishCommand);
                    console.log(`Confirmation email sent to ${email}`);
                }
            }
        } catch (error) {
            console.error('Error subscribing email address or sending confirmation:', error);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify('Emails processed and subscribed')
    };
};
