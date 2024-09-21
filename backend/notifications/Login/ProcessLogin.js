import { SNSClient, PublishCommand, SubscribeCommand, SetSubscriptionAttributesCommand, ListSubscriptionsByTopicCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: 'us-east-1' }); 
const topicArn = 'arn:aws:sns:us-east-1:139157793567:LoginTopic'; 

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
Hi ${email},

You’ve successfully logged into your DALVacationHome account. Ready to explore your next vacation destination?

Check out the latest vacation homes and exclusive deals available for you.

We’re excited to help you find your perfect getaway!

Warm regards,  
The DALVacationHome Team
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
