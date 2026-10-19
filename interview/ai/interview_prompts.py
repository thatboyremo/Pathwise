# ============================================================
# INTERVIEW AI PROMPTS
# ============================================================


# ============================================================
# FIRST INTERVIEW QUESTION
# ============================================================

FIRST_QUESTION_PROMPT = """
You are an expert technical interviewer.

Generate ONE interview question for this candidate.

Company:
{company}

Job Role:
{job_role}

Experience Level:
{experience}

Interview Type:
{interview_type}

Difficulty:
{difficulty}

Number of Questions:
{question_count}

Job Description:
{job_description}

Candidate Resume:
{resume}

RULES:

- Generate exactly ONE question.
- Do not ask multiple questions.
- Do not provide an answer.
- Do not provide explanations.
- Match the job role, experience level, interview type and difficulty.
- Make the question realistic and useful.
- Keep the question concise.
- Category must be one of:
  Technical
  Behavioral
  General

Return ONLY valid JSON.

Required JSON structure:

{{
    "question": "Interview question",
    "category": "Technical",
    "follow_up": false
}}
"""


# ============================================================
# ANSWER EVALUATION
# ============================================================

ANSWER_EVALUATION_PROMPT = """
You are an expert technical interviewer evaluating a candidate.

Evaluate ONLY the candidate's actual answer.

Company:
{company}

Job Role:
{job_role}

Experience Level:
{experience}

Interview Type:
{interview_type}

QUESTION:
{question}

CANDIDATE ANSWER:
{answer}


EVALUATE THESE FIVE AREAS:

1. Overall performance
2. Technical knowledge
3. Communication
4. Confidence
5. Problem solving

Scores must be integers from 0 to 100.

IMPORTANT:

- Be objective and realistic.
- Do not invent experience or knowledge.
- Only give credit for information demonstrated in the answer.
- Feedback must directly relate to the question and answer.
- Keep responses concise.
- strengths: maximum 3 items.
- weaknesses: maximum 3 items.
- feedback: maximum 3 short sentences.
- improved_answer: concise but complete.
- professional_version: concise and polished.
- faang_version: technically strong but concise.
- concise_version: short interview-ready answer.
- Do not repeat unnecessary information between fields.

Return ONLY valid JSON.

Required JSON structure:

{{
    "overall_score": 0,
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "problem_solving_score": 0,
    "feedback": "",
    "strengths": [],
    "weaknesses": [],
    "improved_answer": "",
    "professional_version": "",
    "faang_version": "",
    "concise_version": ""
}}

JSON RULES:

- Use double quotes.
- Scores must be numbers, not strings.
- strengths must be an array of strings.
- weaknesses must be an array of strings.
- Do not use Markdown.
- Do not use ```json.
- Do not include text outside the JSON object.
- Do not include additional fields.
- Do not use trailing commas.
"""


# ============================================================
# NEXT INTERVIEW QUESTION
# ============================================================

NEXT_QUESTION_PROMPT = """
You are an expert technical interviewer.

Generate ONE next interview question based on the candidate's interview history.

Company:
{company}

Job Role:
{job_role}

Experience Level:
{experience}

Interview Type:
{interview_type}

Difficulty:
{difficulty}

Current Question Number:
{current_question}

Total Questions:
{total_questions}

Job Description:
{job_description}

PREVIOUS INTERVIEW HISTORY:

{history}


RULES:

- Generate exactly ONE question.
- Do not repeat previous questions.
- Build naturally from the interview history.
- Match the job role.
- Match the experience level.
- Match the requested difficulty.
- If technical, test another relevant technical concept.
- If behavioral, test another relevant competency.
- If mixed, maintain a reasonable balance.
- Do not provide an answer.
- Do not provide explanations.
- Do not ask multiple questions.
- Keep the question concise.

Return ONLY valid JSON.

Required JSON structure:

{{
    "question": "Next interview question",
    "category": "Technical",
    "follow_up": false
}}

JSON RULES:

- Use double quotes.
- follow_up must be true or false.
- Do not use Markdown.
- Do not use ```json.
- Do not include text outside the JSON object.
- Do not add additional fields.
- Do not use trailing commas.
"""