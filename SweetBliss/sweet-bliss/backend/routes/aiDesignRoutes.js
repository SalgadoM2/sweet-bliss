import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
    apiKey: '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'
});

router.post('/generate', async (req, res) => {
    try {
        const { eventNature, baseType, toppings, writingsOnTop } = req.body;

        // Log the received data
        console.log('Received request data:', {
            eventNature,
            baseType,
            toppings,
            writingsOnTop
        });

        if (!eventNature || !baseType || !toppings) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: eventNature, baseType, or toppings'
            });
        }

        // Sanitize and format the input
        const sanitizedEvent = eventNature.replace(/[^\w\s]/gi, '');
        const sanitizedBase = baseType.replace(/[^\w\s]/gi, '');
        const sanitizedToppings = toppings.replace(/[^\w\s]/gi, '');
        const sanitizedWritings = writingsOnTop ? writingsOnTop.replace(/[^\w\s]/gi, '') : '';

        // Construct a more specific and structured prompt
        const prompt = `Create a photorealistic image of a beautiful ${sanitizedBase} cake. The cake is decorated with ${sanitizedToppings} and designed for a ${sanitizedEvent} celebration${sanitizedWritings ? `. The cake has "${sanitizedWritings}" written on it` : ''}. The cake should be centered in the image, well-lit, and photographed from a slightly elevated angle. The background should be clean and neutral. The cake should look professional and appetizing.`;

        console.log('Generated prompt:', prompt);

        try {
            const response = await openai.images.generate({
                prompt: prompt,
                model: "dall-e-3",
                n: 1,
                size: "1024x1024"
            });

            console.log('OpenAI API Response:', JSON.stringify(response, null, 2));

            if (response && response.data && response.data.length > 0) {
                res.json({
                    success: true,
                    images: response.data.map(img => img.url)
                });
            } else {
                throw new Error('No images generated in the response');
            }

        } catch (openaiError) {
            console.error('OpenAI API Error Details:', {
                error: openaiError.error,
                message: openaiError.message,
                type: openaiError.type,
                code: openaiError.code,
                param: openaiError.param
            });

            let errorMessage = 'Failed to generate image';
            if (openaiError.status === 400) {
                errorMessage = 'Invalid request parameters';
            } else if (openaiError.status === 429) {
                errorMessage = 'Rate limit exceeded';
            } else if (openaiError.status === 500) {
                errorMessage = 'OpenAI service error';
            }

            res.status(openaiError.status || 500).json({
                success: false,
                message: 'OpenAI API Error',
                error: errorMessage,
                details: openaiError.message
            });
        }

    } catch (error) {
        console.error('General Error:', {
            error: error,
            message: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            message: 'Failed to generate cake designs',
            error: error.message
        });
    }
});

export default router;