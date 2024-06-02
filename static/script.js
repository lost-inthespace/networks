let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let answers = {};  // To store answers to prevent changing them
let totalQuestions = 0;

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname === '/multiple_choice') {
    fetch('/static/multiple_choice_questions.JSON')
      .then(response => response.json())
      .then(data => {
        totalQuestions = data.length;
        questions = data; // Store the questions data
        document.getElementById('total-questions').textContent = totalQuestions;
        document.getElementById('start-container').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
      });
  } else if (window.location.pathname === '/acronym') {
    fetch('/static/acronym_questions.JSON')
      .then(response => response.json())
      .then(data => {
        questions = data;
        displayAcronymQuestion();
      });
  }
});

function startQuiz() {
  const numQuestions = document.getElementById('num-questions').value;
  if (numQuestions < 1 || numQuestions > totalQuestions) {
    alert(`Please enter a number between 1 and ${totalQuestions}.`);
    return;
  }

  // Slice the questions array to get the desired number of questions
  questions = questions.slice(0, numQuestions);

  document.getElementById('start-container').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  displayQuestion();
}

function displayQuestion() {
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  const progressElement = document.getElementById('progress');
  const feedbackElement = document.getElementById('feedback');
  const submitButton = document.getElementById('submit');
  const backButton = document.getElementById('back');
  const nextButton = document.getElementById('next');

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  optionsElement.innerHTML = '';

  if (currentQuestion.type === 'multiple_choice') {
    currentQuestion.options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.innerHTML = `<input type="radio" name="option" value="${option}"> ${option}`;
      optionsElement.appendChild(optionElement);
    });
  } else if (currentQuestion.type === 'true_false') {
    const trueOption = document.createElement('div');
    trueOption.innerHTML = `<input type="radio" name="option" value="True"> True`;
    optionsElement.appendChild(trueOption);

    const falseOption = document.createElement('div');
    falseOption.innerHTML = `<input type="radio" name="option" value="False"> False`;
    optionsElement.appendChild(falseOption);
  }

  progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  feedbackElement.textContent = '';

  if (answers[currentQuestionIndex] !== undefined) {
    feedbackElement.textContent = answers[currentQuestionIndex].is_correct ? 'Correct!' : `Incorrect! The correct answer is: ${answers[currentQuestionIndex].correct_answer}`;
    feedbackElement.style.color = answers[currentQuestionIndex].is_correct ? 'green' : 'red';
    submitButton.style.display = 'none';
    nextButton.style.display = 'inline';
  } else {
    submitButton.style.display = 'inline';
    nextButton.style.display = 'none';
  }

  backButton.style.display = currentQuestionIndex > 0 ? 'inline' : 'none';
}

function submitAnswer() {
  const selectedOption = document.querySelector('input[name="option"]:checked');
  if (!selectedOption) {
    alert('Please select an option.');
    return;
  }

  const selectedAnswer = selectedOption.value;
  fetch('/submit_answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_index: currentQuestionIndex,
      selected_answer: selectedAnswer
    })
  })
    .then(response => response.json())
    .then(data => {
      const feedbackElement = document.getElementById('feedback');
      feedbackElement.textContent = data.is_correct ? 'Correct!' : `Incorrect! The correct answer is: ${data.correct_answer}`;
      feedbackElement.style.color = data.is_correct ? 'green' : 'red';
      answers[currentQuestionIndex] = data;
      if (data.is_correct) score++;
      document.getElementById('submit').style.display = 'none';
      document.getElementById('next').style.display = 'inline';
    });
}

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = `Quiz completed! Your score is ${score} out of ${questions.length}.`;
    feedbackElement.style.color = 'blue';
    document.getElementById('submit').style.display = 'none';
    document.getElementById('next').style.display = 'none';
    localStorage.setItem('multipleChoiceScore', `${score} / ${questions.length}`);
    setTimeout(() => {
      window.location.href = '/';
    }, 3000); // Redirect to the main menu after 3 seconds
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

function displayAcronymQuestion() {
  const questionElement = document.getElementById('question');
  const feedbackElement = document.getElementById('feedback');
  const progressElement = document.getElementById('progress');
  const submitButton = document.getElementById('submit');
  const nextButton = document.getElementById('next');

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = `What does ${currentQuestion.acronym} stand for?`;
  progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  feedbackElement.textContent = '';
  submitButton.style.display = 'inline';
  nextButton.style.display = 'none';

  // Clear the answer field
  document.getElementById('answer').value = '';
}

function submitAcronymAnswer() {
  const answerInput = document.getElementById('answer');
  const userAnswer = answerInput.value.trim();
  if (!userAnswer) {
    alert('Please enter an answer.');
    return;
  }

  fetch('/submit_acronym_answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_index: currentQuestionIndex,
      user_answer: userAnswer
    })
  })
    .then(response => response.json())
    .then(data => {
      const feedbackElement = document.getElementById('feedback');
      if (data.is_correct) {
        feedbackElement.textContent = 'Correct!';
        feedbackElement.style.color = 'green';
        score++;
      } else {
        feedbackElement.textContent = `Incorrect! The correct answer is: ${data.correct_answer}`;
        feedbackElement.style.color = 'red';
      }
      document.getElementById('submit').style.display = 'none';
      document.getElementById('next').style.display = 'inline';
    });
}

function nextAcronymQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayAcronymQuestion();
  } else {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = `Quiz completed! Your score is ${score} out of ${questions.length}.`;
    feedbackElement.style.color = 'blue';
    document.getElementById('submit').style.display = 'none';
    document.getElementById('next').style.display = 'none';
    localStorage.setItem('acronymScore', `${score} / ${questions.length}`);
    setTimeout(() => {
      window.location.href = '/';
    }, 3000); // Redirect to the main menu after 3 seconds
  }
}

// Function to calculate the similarity between two strings
function similarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// Display marks
const multipleChoiceScore = localStorage.getItem('multipleChoiceScore');
const acronymScore = localStorage.getItem('acronymScore');
let marksText = 'Your marks:';
if (multipleChoiceScore) {
  marksText += ` Multiple Choice: ${multipleChoiceScore}`;
}
if (acronymScore) {
  marksText += ` | Acronym: ${acronymScore}`;
}
if (multipleChoiceScore || acronymScore) {
  document.getElementById('marks').innerText = marksText;
}
