// Check for token first

Trivia.getSessionQuestions({ 'amount': 10 })
    .then(Trivia.clearForm)
    .then(Trivia.transform)
    .then(Trivia.decodeText)
    .then(Trivia.buildForm)
    .catch(error => console.error(error))