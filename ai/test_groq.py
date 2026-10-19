from ai.providers.groq import GroqProvider

groq = GroqProvider()

print(

    groq.generate(

        "Say hello."

    )

)