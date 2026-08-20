export default async function handler(req, res) {

    /* =========================
       CORS
    ========================= */

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    if (req.method === "OPTIONS") {

        return res.status(200).end();

    }


    if (req.method !== "POST") {

        return res.status(405).json({

            error:
                "Method not allowed"

        });

    }


    /* =========================
       CHECK API KEY
    ========================= */

    const apiKey =
        process.env.OPENAI_API_KEY;


    if (!apiKey) {

        return res.status(500).json({

            error:
                "OPENAI_API_KEY is not configured."

        });

    }


    /* =========================
       GET MESSAGE
    ========================= */

    const {
        message
    } = req.body || {};


    if (
        typeof message !== "string" ||
        !message.trim()
    ) {

        return res.status(400).json({

            error:
                "Message is required."

        });

    }


    /* =========================
       OPENAI REQUEST
    ========================= */

    try {

        const response =
            await fetch(
                "https://api.openai.com/v1/responses",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiKey}`

                    },

                    body: JSON.stringify({

                        model:
                            "gpt-5.6-luna",

                        instructions:
                            "You are JARVIS, a helpful personal AI assistant. Speak clearly, naturally, and concisely. Do not claim to have access to private information or devices unless that information has actually been provided to you.",

                        input:
                            message

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "OpenAI error:",
                data
            );


            return res.status(
                response.status
            ).json({

                error:
                    "The AI service returned an error."

            });

        }


        /* =========================
           GET RESPONSE TEXT
        ========================= */

        const reply =
            data.output_text;


        if (!reply) {

            return res.status(500).json({

                error:
                    "The AI returned no text."

            });

        }


        return res.status(200).json({

            reply: reply

        });


    } catch(error) {

        console.error(
            "Server error:",
            error
        );


        return res.status(500).json({

            error:
                "Unable to connect to the AI service."

        });

    }

}
