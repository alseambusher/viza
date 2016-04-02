import json
from flask import Flask
from flask import render_template
from flask.json import jsonify

app = Flask(__name__)

_file = open("data.csv")

data = map(lambda x: x[:-1].replace("'","").split(","), _file.readlines())
	

def message(m, e):
	return m, e, {'Access-Control-Allow-Origin': '*'}

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/data")
def getdata():
	return message(jsonify({"data": data}), 200)


if __name__ == "__main__":
	app.run(host='0.0.0.0',port=5000,debug=True)
