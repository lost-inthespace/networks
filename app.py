from flask import Flask, render_template, jsonify

app = Flask(__name__)


@app.route('/')
def index():
  return render_template('index.html')


@app.route('/acronym')
def acronym():
  return render_template('acronym.html')


@app.route('/multiple_choice')
def multiple_choice():
  return render_template('multiple_choice.html')


@app.route('/acronym_questions')
def get_acronym_questions():
  with open('acronym_questions.json', 'r') as f:
    data = f.read()
  return data


@app.route('/multiple_choice_questions')
def get_multiple_choice_questions():
  with open('multiple_choice_questions.json', 'r') as f:
    data = f.read()
  return data


if __name__ == '__main__':
  app.run(debug=True)
