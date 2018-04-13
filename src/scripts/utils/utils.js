var Trivia = (() => {
    const API_URL = 'https://opentdb.com/api.php';
    const TOKEN_URL = 'https://opentdb.com/api_token.php';
    let token = '';


    let getSessionQuestions = (options) => {
        if (token) {
            console.info('Token found, using existing token.');
            options.token = token;
            return getQuestions(options);
        } else {
            console.info('No token found, obtaining new one.');
            return getToken().then(token => {
                options.token = token;
                return getQuestions(options);
            })
        }
    };
    let getQuestions = (options) => {
        return $.ajax(API_URL, {
                "method": "GET",
                "data": options
            })
            .then(response => {
                if (response.response_code !== 0) {
                    throw 'Error: response returned status of ' + response.status;
                    return;
                }
                return response.results;
            })
            .catch(error => console.error(error));
    };
    let getToken = () => {
        return $.ajax(TOKEN_URL, {
            "method": "GET",
            "data": { "command": "request" }
        })

        .then(response => {
                if (response.response_code !== 0) {
                    throw 'Error: failed to get token ' + response.response_message;
                }
                token = response.token;
                return response.token;
            })
            .catch(error => console.error(error))
    };
    let transform = triviaQuestion => {
        return triviaQuestion.map((question, i) => {
            let output = {
                    id: new Date().getTime() + '_' + i,
                    category: question.category,
                    correctAnswer: question.correct_answer,
                    difficulty: question.difficulty,
                    answers: question.incorrect_answers,
                    text: question.question,
                    type: question.type
                }
                // Generate random index to push correct answer into
            if (output.type === 'multiple') {
                let index = Math.floor(Math.random() * (question.incorrect + 1));
                output.answers.splice(index, 0, question.correct_answer);
            } else if (output.type === 'boolean') {
                output.answers = ['True', 'False'];
            }

            return output;
        });
    };
    let decodeText = triviaQuestions => {
        // NOTE: This is assumed "transform" function has been called further up the chain already
        return triviaQuestions.map(item => {
            let parser = new DOMParser();
            item.text = parser.parseFromString(item.text, 'text/html').body.textContent;
            item.correctAnswer = parser.parseFromString(item.correctAnswer, 'text/html').body.textContent;
            item.answers = item.answers.map(answer => parser.parseFromString(answer, 'text/html').body.textContent);

            return item;
        })
    };
    let clearForm = data => {
        $('.trivia-questions ul').empty();

        // Pass data straight through
        return data;
    };
    let buildForm = triviaQuestions => {
        // NOTE: This is assumed "transform" function has been called further up the chain already

        console.info('Will generate form for questions:', triviaQuestions);
        triviaQuestions.forEach(item => {
            let li = $('<li></li>').text(item.text);
            $('.trivia-questions ul').append(li);
        });
    };

    return {
        getSessionQuestions,
        getQuestions,
        getToken,
        transform,
        decodeText,
        clearForm,
        buildForm
    }
})();